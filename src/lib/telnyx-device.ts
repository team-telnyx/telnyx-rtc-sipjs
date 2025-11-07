import SIP, { RegisterOptions } from 'sip.js';
import type { Session as SipSession, UserAgentConfiguration, UA as SipUA } from 'sip.js';
import EventEmitter from 'es6-event-emitter';
import { TelnyxCall } from './telnyx-call';
import type { SessionWithMedia } from './telnyx-call';

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
  public _userAgent: SipUA;
  private _activeCall?: TelnyxCall;

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

    const uri = new SIP.URI('sip', this.username, this.host, this.port).toString();

    const sipUAConfig: UserAgentConfiguration = {
      uri,
      wsServers: this.wsServers,
      authorizationUser: this.username,
      password: this.password,
      displayName: this.displayName,
      stunServers: this.stunServers,
      turnServers: this.turnServers,
      registrarServer: this.registrarServer,
    };

    if (config.traceSip) {
      sipUAConfig.traceSip = true;
    }
    if (config.logLevel) {
      if (config.logLevel === 'off') {
        sipUAConfig.log = { builtinEnabled: false };
      } else {
        sipUAConfig.log = { level: config.logLevel };
      }
    }

    this._userAgent = new SIP.UA(sipUAConfig);

    this._userAgent.on('connecting', (args: { attempts?: number } = {}) => {
      this.trigger('wsConnecting', { attempts: args.attempts ?? 0 });
    });

    this._userAgent.on('connected', () => {
      this.trigger('wsConnected');
    });

    this._userAgent.on('disconnected', () => {
      this.trigger('wsDisconnected');
    });

    this._userAgent.on('registered', () => {
      this.trigger('registered');
    });

    this._userAgent.on('unregistered', (response: unknown, cause: unknown) => {
      this.trigger('unregistered', { cause, response });
    });

    this._userAgent.on('registrationFailed', (cause: unknown, response: unknown) => {
      this.trigger('registrationFailed', { cause, response });
    });

    this._userAgent.on('invite', (session: SipSession) => {
      this._activeCall = new TelnyxCall(this._userAgent);
      this._activeCall.incomingCall(session as SessionWithMedia);
      this.trigger('incomingInvite', { activeCall: this._activeCall });
    });

    this._userAgent.on('message', (message: unknown) => {
      this.trigger('message', { message });
    });
  }

  startWS(): void {
    this._userAgent.start();
  }

  stopWS(): void {
    this._userAgent.stop();
  }

  isWSConnected(): boolean {
    return this._userAgent.isConnected();
  }

  register(options?: RegisterOptions): void {
    this._userAgent.register(options);
  }

  unregister(options?: RegisterOptions): void {
    this._userAgent.unregister(options);
  }

  isRegistered(): boolean {
    return this._userAgent.isRegistered();
  }

  initiateCall(phoneNumber: string): TelnyxCall {
    const uri = new SIP.URI('sip', phoneNumber, this.host, this.port).toString();
    this._activeCall = new TelnyxCall(this._userAgent);
    this._activeCall.makeCall(uri);
    return this._activeCall;
  }

  activeCall(): TelnyxCall | undefined {
    return this._activeCall;
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
