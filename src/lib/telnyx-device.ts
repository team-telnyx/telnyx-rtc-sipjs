import {
  Invitation,
  Registerer,
  RegistererOptions,
  RegistererState,
  TransportState,
  URI,
  UserAgent,
  UserAgentOptions,
} from 'sip.js';
import EventEmitter from 'es6-event-emitter';
import { TelnyxCall } from './telnyx-call';

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
}

export interface RegisterOptions {
  extraHeaders?: string[];
}

interface ExtendedTransportOptions {
  server: string;
  traceSip?: boolean;
  wsServers?: string[] | string;
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
  public _userAgent: UserAgent;
  private _activeCall?: TelnyxCall;
  private _registerer?: Registerer;
  private _connectionAttempts = 0;

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

    this.config = config;
    this.host = config.host;
    this.port = config.port;
    this.wsServers = arrayify(config.wsServers);
    this.username = config.username;
    this.password = config.password;
    this.displayName = config.displayName || config.username;
    this.stunServers = arrayify(config.stunServers);
    this.turnServers = config.turnServers;
    this.registrarServer = config.registrarServer;

    this._ensureConnectivityWithSipServer();

    const userUri = this._buildUserUri(this.username);
    const iceServers = this._buildIceServers();
    const transportServer = this._resolveTransportServer();
    const transportOptions: ExtendedTransportOptions = {
      server: transportServer,
      traceSip: Boolean(config.traceSip),
    };
    if (this.wsServers && this.wsServers.length > 0) {
      transportOptions.wsServers = this.wsServers;
    }

    const userAgentOptions: Partial<UserAgentOptions> = {
      uri: userUri,
      authorizationUsername: this.username,
      authorizationPassword: this.password,
      displayName: this.displayName,
      transportOptions,
      delegate: {
        onConnect: () => {
          this._connectionAttempts = 0;
          this.trigger('wsConnected');
        },
        onDisconnect: () => {
          this.trigger('wsDisconnected');
        },
        onInvite: (invitation: Invitation) => this._handleIncomingInvite(invitation),
        onMessage: (message: unknown) => this.trigger('message', { message }),
      },
    };

    if (iceServers.length > 0) {
      userAgentOptions.sessionDescriptionHandlerFactoryOptions = {
        peerConnectionConfiguration: { iceServers },
      };
    }

    if (config.logLevel === 'off') {
      userAgentOptions.logBuiltinEnabled = false;
    } else if (config.logLevel) {
      userAgentOptions.logLevel = config.logLevel;
    }

    this._userAgent = new UserAgent(userAgentOptions);

    const transport = this._userAgent.transport;
    transport.stateChange.addListener((state) => {
      if (state === TransportState.Connecting) {
        this._connectionAttempts += 1;
        this.trigger('wsConnecting', { attempts: this._connectionAttempts });
      }
    });
  }

  startWS(): Promise<void> {
    return this._userAgent.start();
  }

  stopWS(): Promise<void> {
    return this._userAgent.stop();
  }

  isWSConnected(): boolean {
    return this._userAgent.isConnected();
  }

  register(options?: RegisterOptions): void {
    const registerer = this._ensureRegisterer();
    registerer
      .register({
        requestOptions: options?.extraHeaders ? { extraHeaders: options.extraHeaders } : undefined,
        requestDelegate: {
          onReject: (response) => {
            this.trigger('registrationFailed', { cause: response.message.reasonPhrase, response });
          },
        },
      })
      .catch((error) => this.trigger('registrationFailed', { cause: error }));
  }

  unregister(options?: RegisterOptions): void {
    if (!this._registerer) {
      return;
    }
    this._registerer
      .unregister({
        requestOptions: options?.extraHeaders ? { extraHeaders: options.extraHeaders } : undefined,
      })
      .catch((error) => this.trigger('registrationFailed', { cause: error }));
  }

  isRegistered(): boolean {
    return this._registerer?.state === RegistererState.Registered;
  }

  initiateCall(phoneNumber: string): TelnyxCall {
    const uri = this._buildUserUri(phoneNumber);
    this._activeCall = new TelnyxCall(this._userAgent);
    this._activeCall.makeCall(uri.toString());
    return this._activeCall;
  }

  activeCall(): TelnyxCall | undefined {
    return this._activeCall;
  }

  private _handleIncomingInvite(invitation: Invitation): void {
    this._activeCall = new TelnyxCall(this._userAgent);
    this._activeCall.incomingCall(invitation);
    this.trigger('incomingInvite', { activeCall: this._activeCall });
  }

  private _ensureRegisterer(): Registerer {
    if (!this._registerer) {
      const options: RegistererOptions = {};
      if (this.registrarServer) {
        const registrarUri = UserAgent.makeURI(this.registrarServer);
        if (registrarUri) {
          options.registrar = registrarUri;
        }
      }
      this._registerer = new Registerer(this._userAgent, options);
      this._registerer.stateChange.addListener((state) => {
        if (state === RegistererState.Registered) {
          this.trigger('registered');
        } else if (state === RegistererState.Unregistered) {
          this.trigger('unregistered', { cause: null, response: null });
        } else if (state === RegistererState.Terminated) {
          this.trigger('registrationFailed', { cause: 'terminated' });
        }
      });
    }
    return this._registerer;
  }

  private _buildUserUri(user: string): URI {
    const portSuffix = this.port ? `:${this.port}` : '';
    const uriString = `sip:${user}@${this.host}${portSuffix}`;
    const uri = UserAgent.makeURI(uriString);
    if (!uri) {
      throw new Error(`Invalid SIP URI: ${uriString}`);
    }
    return uri;
  }

  private _resolveTransportServer(): string {
    if (this.wsServers && this.wsServers.length > 0) {
      return this.wsServers[0];
    }
    const scheme = 'wss';
    return `${scheme}://${this.host}${this.port ? `:${this.port}` : ''}`;
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

  private _ensureConnectivityWithSipServer(): void {
    try {
      const xhr = new XMLHttpRequest();
      xhr.addEventListener('error', () => {
        console.info('Failed http connection to SIP server is expected. It is related to a chrome bug.');
      });
      xhr.open('GET', `https://${this.host}:${this.port}`, true);
      xhr.send();
    } catch (error) {
      console.debug('Connectivity preflight failed', error);
    }
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
