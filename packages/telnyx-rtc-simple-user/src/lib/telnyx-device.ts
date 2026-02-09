import { URI } from 'sip.js';
import { UserAgentCore } from 'sip.js/lib/core';
import { SimpleUser, SimpleUserDelegate, SimpleUserOptions } from 'sip.js/lib/platform/web';
import EventEmitter from 'es6-event-emitter';
import { TelnyxCall } from './telnyx-call';
import { DeviceEvent } from './constants';

/**
 * SDP modifier that injects a=rtcp-mux attribute into remote SDP.
 *
 * Modern browsers require rtcpMuxPolicy: "require" by default, but some
 * SIP servers (including Telnyx) may not include a=rtcp-mux in their SDP.
 * This modifier ensures compatibility by adding the attribute when missing.
 */
function addRtcpMuxModifier(description: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
  if (description.sdp && !description.sdp.includes('a=rtcp-mux')) {
    console.log('[TelnyxDevice] Adding a=rtcp-mux to SDP');
    description.sdp = description.sdp
      .replace(/(m=audio[^\r\n]*)/g, '$1\r\na=rtcp-mux')
      .replace(/(m=video[^\r\n]*)/g, '$1\r\na=rtcp-mux');
  }
  return Promise.resolve(description);
}

/**
 * Patches SIP.js UserAgentCore to accept incoming requests regardless of Request-URI.
 *
 * By default, SIP.js validates that incoming INVITE Request-URI matches the
 * registered AOR (Address of Record). However, Telnyx routes calls to phone
 * numbers (e.g., sip:14843068733@...) while the client registers with a username
 * (e.g., sip:sipjsproject@...). This mismatch causes 404 rejection per RFC 3261.
 *
 * This patch bypasses that validation to allow Telnyx-style call routing.
 */
let userAgentCorePatched = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UserAgentCoreType = typeof UserAgentCore & { prototype: any };

function patchUserAgentCoreForTelnyx(): void {
  if (userAgentCorePatched) {
    return;
  }

  try {
    const CoreClass = UserAgentCore as UserAgentCoreType;

    if (!CoreClass || !CoreClass.prototype) {
      console.warn('[TelnyxDevice] Unable to patch UserAgentCore: class not found');
      return;
    }

    const originalReceiveRequest = CoreClass.prototype.receiveRequest;

    CoreClass.prototype.receiveRequest = function (message: unknown) {
      // Store original configuration temporarily
      const originalAor = this.configuration.aor;

      // For incoming INVITE requests, temporarily set AOR to match the Request-URI
      // This bypasses the "Request-URI does not point to us" validation
      const msg = message as { method?: string; ruri?: { user?: string }; };
      if (msg.method === 'INVITE' && msg.ruri?.user) {
        const ruriUser = msg.ruri.user;
        console.log('[TelnyxDevice] Accepting incoming INVITE for:', ruriUser);

        // Temporarily modify AOR to match the incoming Request-URI
        if (this.configuration.aor && typeof this.configuration.aor === 'object') {
          this.configuration.aor = { ...this.configuration.aor, user: ruriUser };
        }
      }

      try {
        return originalReceiveRequest.call(this, message);
      } finally {
        // Restore original AOR
        this.configuration.aor = originalAor;
      }
    };

    userAgentCorePatched = true;
    console.log('[TelnyxDevice] UserAgentCore patched for Telnyx compatibility');
  } catch (error) {
    console.warn('[TelnyxDevice] Failed to patch UserAgentCore:', error);
  }
}

export type LogLevel = 'debug' | 'log' | 'warn' | 'error' | 'off';

export interface TurnServerConfig {
  urls: string | string[];
  username?: string;
  password?: string;
}

export interface TelnyxDeviceConfig {
  host: string;
  port: string | number;
  wsServers?: string | string[];
  username: string;
  password: string;
  displayName?: string;
  stunServers?: string | string[];
  turnServers?: TurnServerConfig | TurnServerConfig[];
  registrarServer?: string;
  traceSip?: boolean;
  logLevel?: LogLevel;
  remoteAudioElement?: HTMLAudioElement;
}

export const DEFAULT_STUN_SERVERS = ['stun:stun.telnyx.com:3478', 'stun:stun.l.google.com:19302'];

export const DEFAULT_TURN_SERVERS: ReadonlyArray<TurnServerConfig> = [
  {
    urls: 'turn:turn.telnyx.com:3478?transport=tcp',
    username: 'testuser',
    password: 'testpassword',
  },
];

export interface RegisterOptions {
  extraHeaders?: string[];
}

class TelnyxDevice extends EventEmitter {
  public readonly config: TelnyxDeviceConfig;
  public readonly host: string;
  public readonly port: string | number;
  public readonly wsServers?: string[];
  public readonly username: string;
  public readonly password: string;
  public readonly displayName: string;
  public readonly stunServers?: string[];
  public readonly turnServers?: TurnServerConfig | TurnServerConfig[];
  public readonly registrarServer?: string;

  private readonly _simpleUser: SimpleUser;
  private _activeCall?: TelnyxCall;
  private _connectionAttempts = 0;
  private _isRegistered = false;

  /**
   * Register an event listener
   * @param event - The event name to listen to
   * @param handler - The callback function to execute when the event is triggered
   * @returns The device instance for method chaining
   */
  public on(event: DeviceEvent | string, handler: (...args: any[]) => void): this {
    return super.on(event, handler);
  }

  /**
   * Remove an event listener
   * @param event - The event name to stop listening to
   * @param handler - The callback function to remove
   * @returns The device instance for method chaining
   */
  public off(event: DeviceEvent | string, handler?: (...args: any[]) => void): this {
    return super.off(event, handler);
  }

  constructor(config: TelnyxDeviceConfig) {
    super();

    if (!config || typeof config !== 'object') {
      throw new TypeError('TelnyxDevice: Missing config');
    }
    if (!config.host) {
      throw new TypeError("TelnyxDevice: Missing 'host' parameter");
    }
    if (!config.port) {
      throw new TypeError("TelnyxDevice: Missing 'port' parameter");
    }

    // Apply SIP.js core patch for Telnyx compatibility
    patchUserAgentCoreForTelnyx();

    this.config = config;
    this.host = config.host;
    this.port = config.port;
    this.wsServers = arrayify(config.wsServers);
    this.username = config.username;
    this.password = config.password;
    this.displayName = config.displayName || config.username;
    const configuredStunServers = arrayify(config.stunServers);
    this.stunServers = configuredStunServers ? configuredStunServers : DEFAULT_STUN_SERVERS.slice();

    if (typeof config.turnServers === 'undefined') {
      this.turnServers = DEFAULT_TURN_SERVERS.map((server) => ({
        urls: Array.isArray(server.urls) ? server.urls.slice() : server.urls,
        username: server.username,
        password: server.password,
      }));
    } else {
      this.turnServers = config.turnServers;
    }
    this.registrarServer = config.registrarServer;

    const simpleUserOptions = this._buildSimpleUserOptions();
    this._simpleUser = new SimpleUser(this._resolveTransportServer(), simpleUserOptions);
  }

  startWS(): Promise<void> {
    this._connectionAttempts += 1;
    this.trigger(DeviceEvent.WsConnecting, { attempts: this._connectionAttempts });
    return this._simpleUser.connect();
  }

  stopWS(): Promise<void> {
    return this._simpleUser.disconnect();
  }

  isWSConnected(): boolean {
    return this._simpleUser.isConnected();
  }

  register(options?: RegisterOptions): Promise<void> {
    return this._simpleUser
      .register({
        requestOptions: options?.extraHeaders ? { extraHeaders: options.extraHeaders } : undefined,
      })
      .catch((error) => {
        this.trigger(DeviceEvent.RegistrationFailed, { cause: error });
        throw error;
      });
  }

  unregister(options?: RegisterOptions): Promise<void> {
    return this._simpleUser
      .unregister({
        requestOptions: options?.extraHeaders ? { extraHeaders: options.extraHeaders } : undefined,
      })
      .catch((error) => {
        this.trigger(DeviceEvent.RegistrationFailed, { cause: error });
        throw error;
      });
  }

  isRegistered(): boolean {
    return this._isRegistered;
  }

  initiateCall(phoneNumber: string): TelnyxCall {
    const destination = this._buildTargetUri(phoneNumber);
    const call = this._createCall();
    void call.makeCall(destination);
    return call;
  }

  activeCall(): TelnyxCall | undefined {
    return this._activeCall;
  }

  private _createCall(): TelnyxCall {
    this._activeCall = new TelnyxCall(this._simpleUser);
    return this._activeCall;
  }

  private _buildSimpleUserOptions(): SimpleUserOptions {
    const delegate = this._buildDelegate();
    const iceServers = this._buildIceServers();
    const aor = this._buildUserUri(this.username).toString();

    const options: SimpleUserOptions = {
      aor,
      delegate,
      media: {
        constraints: { audio: true, video: false },
        remote: this.config.remoteAudioElement ? { audio: this.config.remoteAudioElement } : undefined,
      },
      userAgentOptions: {
        displayName: this.displayName,
        authorizationUsername: this.username,
        authorizationPassword: this.password,
        sessionDescriptionHandlerFactoryOptions:
          iceServers.length > 0 ? { peerConnectionConfiguration: { iceServers } } : undefined,
        logBuiltinEnabled: this.config.logLevel !== 'off',
        logLevel: this.config.logLevel && this.config.logLevel !== 'off' ? this.config.logLevel : undefined,
      },
      registererOptions: this._buildRegistererOptions(),
      reconnectionDelay: undefined,
      // Add RTCP-MUX modifier for Telnyx SDP compatibility
      sessionDescriptionHandlerModifiersAddition: [addRtcpMuxModifier],
    };

    return options;
  }

  private _buildRegistererOptions() {
    if (!this.registrarServer) {
      return undefined;
    }
    const registrarUri = this._parseUriString(this.registrarServer);
    return registrarUri ? { registrar: registrarUri } : undefined;
  }

  private _buildDelegate(): SimpleUserDelegate {
    return {
      onServerConnect: () => {
        this._connectionAttempts = 0;
        this.trigger(DeviceEvent.WsConnected);
      },
      onServerDisconnect: () => {
        this.trigger(DeviceEvent.WsDisconnected);
      },
      onRegistered: () => {
        this._isRegistered = true;
        this.trigger(DeviceEvent.Registered);
      },
      onUnregistered: () => {
        this._isRegistered = false;
        this.trigger(DeviceEvent.Unregistered, { cause: null, response: null });
      },
      onMessageReceived: (message) => {
        this.trigger(DeviceEvent.Message, { body: message });
      },
      onCallCreated: () => {
        if (!this._activeCall) {
          const call = this._createCall();
          call.markIncoming();
        }
        this._activeCall?.handleCallCreated();
      },
      onCallAnswered: () => {
        this._activeCall?.handleCallAnswered();
      },
      onCallHangup: () => {
        this._activeCall?.handleCallHangup();
        this._activeCall = undefined;
      },
      onCallHold: (held) => {
        this._activeCall?.handleHoldChange(held);
      },
      onCallDTMFReceived: (tone, duration) => {
        this._activeCall?.handleDtmf(tone, duration);
      },
      onCallReceived: () => {
        if (!this._activeCall) {
          const call = this._createCall();
          call.markIncoming();
        } else {
          this._activeCall.markIncoming();
        }
        this.trigger(DeviceEvent.IncomingInvite, { activeCall: this._activeCall });
      },
    };
  }

  private _buildUserUri(user: string): URI {
    const port = typeof this.port === 'string' ? parseInt(this.port, 10) : this.port;
    return new URI('sip', user, this.host, Number.isFinite(port) ? (port as number) : undefined);
  }

  private _parseUriString(value: string): URI | undefined {
    const match = /^sip:([^@]+)@([^:]+)(?::(\d+))?/i.exec(value);
    if (!match) {
      return undefined;
    }
    const port = match[3] ? parseInt(match[3], 10) : undefined;
    return new URI('sip', match[1], match[2], Number.isNaN(port) ? undefined : port);
  }

  private _buildTargetUri(phoneNumber: string): string {
    return this._buildUserUri(phoneNumber).toString();
  }

  private _resolveTransportServer(): string {
    if (this.wsServers && this.wsServers.length > 0) {
      return this.wsServers[0];
    }
    return `wss://${this.host}${this.port ? `:${this.port}` : ''}`;
  }

  private _buildIceServers(): RTCIceServer[] {
    const servers: RTCIceServer[] = [];
    if (this.stunServers) {
      this.stunServers.forEach((server) => {
        if (server) {
          servers.push({ urls: server });
        }
      });
    }

    const turnConfigs = this.turnServers
      ? Array.isArray(this.turnServers)
        ? this.turnServers
        : [this.turnServers]
      : [];

    turnConfigs.forEach((config) => {
      if (!config) {
        return;
      }
      servers.push({
        urls: config.urls,
        username: config.username,
        credential: config.password,
      });
    });

    return servers;
  }
}

function arrayify<T>(item?: T | T[]): T[] | undefined {
  if (typeof item === 'undefined' || item === null) {
    return undefined;
  }

  if (Array.isArray(item)) {
    return item.slice(0);
  }

  return [item];
}

export { TelnyxDevice };
