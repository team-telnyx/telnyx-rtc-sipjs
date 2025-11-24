import {
  Registerer,
  RegistererOptions,
  RegistererRegisterOptions,
  RegistererState,
  RegistererUnregisterOptions,
  URI,
  UserAgent,
  UserAgentDelegate,
  UserAgentOptions,
} from "sip.js";
import type { RequestOptions } from "sip.js/lib/core/messages/outgoing-request.js";
import EventEmitter from "es6-event-emitter";
import { TelnyxCall } from "./telnyx-call";
import { DeviceEvent } from "./constants";
import { OutgoingRegisterRequest } from "sip.js/lib/core";

export type LogLevel = "debug" | "log" | "warn" | "error" | "off";

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

export interface RegisterOptions {
  extraHeaders?: string[];
}

export const DEFAULT_STUN_SERVERS = [
  "stun:stun.telnyx.com:3478",
  "stun:stun.l.google.com:19302",
];

export const DEFAULT_TURN_SERVERS: ReadonlyArray<TurnServerConfig> = [
  {
    urls: "turn:turn.telnyx.com:3478?transport=tcp",
    username: "testuser",
    password: "testpassword",
  },
];

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

  private readonly userAgent: UserAgent;
  private readonly iceServers: RTCIceServer[];
  private readonly remoteAudioElement?: HTMLAudioElement;
  private registerer?: Registerer;
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

    if (!config || typeof config !== "object") {
      throw new TypeError("TelnyxDevice: Missing config");
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
    const configuredStunServers = arrayify(config.stunServers);
    this.stunServers = configuredStunServers
      ? configuredStunServers
      : DEFAULT_STUN_SERVERS.slice();
    if (typeof config.turnServers === "undefined") {
      this.turnServers = DEFAULT_TURN_SERVERS.map((server) => ({
        urls: Array.isArray(server.urls) ? server.urls.slice() : server.urls,
        username: server.username,
        password: server.password,
      }));
    } else {
      this.turnServers = config.turnServers;
    }
    this.registrarServer = config.registrarServer;
    this.remoteAudioElement = config.remoteAudioElement;

    this.iceServers = this.buildIceServers();
    const userAgentOptions = this.buildUserAgentOptions();
    this.userAgent = new UserAgent(userAgentOptions);
  }

  startWS(): Promise<void> {
    this._connectionAttempts += 1;
    this.trigger(DeviceEvent.WsConnecting, {
      attempts: this._connectionAttempts,
    });
    return this.userAgent.start();
  }

  stopWS(): Promise<void> {
    return this.userAgent.stop();
  }

  isWSConnected(): boolean {
    return this.userAgent.isConnected();
  }

  register(options?: RegisterOptions): Promise<OutgoingRegisterRequest> {
    const registerer = this.getOrCreateRegisterer();
    return registerer
      .register(this.buildRegistererRequestOptions(options))
      .catch((error) => {
        this.trigger(DeviceEvent.RegistrationFailed, { cause: error });
        throw error;
      });
  }

  unregister(options?: RegisterOptions): Promise<OutgoingRegisterRequest> {
    const registerer = this.getOrCreateRegisterer();
    return registerer
      .unregister(this.buildRegistererRequestOptions(options))
      .catch((error) => {
        this.trigger(DeviceEvent.RegistrationFailed, { cause: error });
        throw error;
      });
  }

  isRegistered(): boolean {
    return this._isRegistered;
  }

  initiateCall(phoneNumber: string): TelnyxCall {
    const destination = this.buildTargetUri(phoneNumber);
    const call = this.createCall();
    void call.makeCall(destination);
    return call;
  }

  activeCall(): TelnyxCall | undefined {
    return this._activeCall;
  }

  private createCall(): TelnyxCall {
    const call = new TelnyxCall(this.userAgent, {
      remoteAudioElement: this.remoteAudioElement,
    });
    this._activeCall = call;
    const cleanup = (): void => {
      if (this._activeCall === call) {
        this._activeCall = undefined;
      }
    };
    call.on("terminated", cleanup);
    call.on("failed", cleanup);
    call.on("rejected", cleanup);
    return call;
  }

  private getOrCreateRegisterer(): Registerer {
    if (this.registerer) {
      return this.registerer;
    }
    const options = this.buildRegistererOptions();
    this.registerer = new Registerer(this.userAgent, options);
    this.registerer.stateChange.addListener((state) =>
      this.handleRegistererStateChange(state)
    );
    return this.registerer;
  }

  private handleRegistererStateChange(state: RegistererState): void {
    if (state === RegistererState.Registered) {
      this._isRegistered = true;
      this.trigger(DeviceEvent.Registered);
      return;
    }
    if (state === RegistererState.Unregistered) {
      this._isRegistered = false;
      this.trigger(DeviceEvent.Unregistered, { cause: null, response: null });
      return;
    }
    if (state === RegistererState.Terminated) {
      this._isRegistered = false;
      this.trigger(DeviceEvent.RegistrationFailed, { cause: "terminated" });
    }
  }

  private buildRegistererOptions(): RegistererOptions {
    return {
      registrar: this.registrarServer
        ? this.parseUriString(this.registrarServer)
        : undefined,
    };
  }

  private buildRegistererRequestOptions(
    options?: RegisterOptions
  ): RegistererRegisterOptions | RegistererUnregisterOptions | undefined {
    if (!options?.extraHeaders || options.extraHeaders.length === 0) {
      return undefined;
    }
    const requestOptions: RequestOptions = {
      extraHeaders: options.extraHeaders,
    };
    return { requestOptions };
  }

  private buildUserAgentOptions(): UserAgentOptions {
    return {
      uri: this.buildUserUri(this.username),
      delegate: this.buildDelegate(),
      displayName: this.displayName,
      authorizationUsername: this.username,
      authorizationPassword: this.password,
      transportOptions: {
        server: this.resolveTransportServer(),
        traceSip: this.config.traceSip,
      },
      sessionDescriptionHandlerFactoryOptions:
        this.iceServers.length > 0
          ? { peerConnectionConfiguration: { iceServers: this.iceServers } }
          : undefined,
      logBuiltinEnabled: this.config.logLevel !== "off",
      logLevel:
        this.config.logLevel && this.config.logLevel !== "off"
          ? this.config.logLevel
          : undefined,
    };
  }

  private buildDelegate(): UserAgentDelegate {
    return {
      onConnect: () => {
        this._connectionAttempts = 0;
        this.trigger(DeviceEvent.WsConnected);
      },
      onDisconnect: () => {
        this.trigger(DeviceEvent.WsDisconnected);
      },
      onInvite: (invitation) => {
        const call = this.createCall();
        call.incomingCall(invitation);
        this.trigger(DeviceEvent.IncomingInvite, { activeCall: call });
      },
      onMessage: (message) => {
        this.trigger(DeviceEvent.Message, { body: message });
      },
    };
  }

  private buildUserUri(user: string): URI {
    const port =
      typeof this.port === "string" ? parseInt(this.port, 10) : this.port;
    return new URI(
      "sip",
      user,
      this.host,
      Number.isFinite(port) ? (port as number) : undefined
    );
  }

  private parseUriString(value: string): URI | undefined {
    const match = /^sip:([^@]+)@([^:]+)(?::(\d+))?/i.exec(value);
    if (!match) {
      return undefined;
    }
    const port = match[3] ? parseInt(match[3], 10) : undefined;
    return new URI(
      "sip",
      match[1],
      match[2],
      Number.isNaN(port) ? undefined : port
    );
  }

  private buildTargetUri(phoneNumber: string): string {
    return this.buildUserUri(phoneNumber).toString();
  }

  private resolveTransportServer(): string {
    if (this.wsServers && this.wsServers.length > 0) {
      return this.wsServers[0];
    }
    return `wss://${this.host}${this.port ? `:${this.port}` : ""}`;
  }

  private buildIceServers(): RTCIceServer[] {
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
  if (typeof item === "undefined" || item === null) {
    return undefined;
  }

  if (Array.isArray(item)) {
    return item.slice(0);
  }

  return [item];
}

export { TelnyxDevice };
