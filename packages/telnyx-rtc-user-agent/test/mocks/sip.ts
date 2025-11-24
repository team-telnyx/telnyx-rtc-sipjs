export interface UserAgentDelegate {
  onConnect?(): void;
  onDisconnect?(): void;
  onInvite?(invitation: unknown): void;
  onMessage?(message: unknown): void;
}

export interface UserAgentOptions {
  uri?: URI;
  delegate?: UserAgentDelegate;
  displayName?: string;
  authorizationUsername?: string;
  authorizationPassword?: string;
  transportOptions?: {
    server?: string;
    traceSip?: boolean;
  };
  sessionDescriptionHandlerFactoryOptions?: Record<string, unknown>;
  logBuiltinEnabled?: boolean;
  logLevel?: string;
}

export interface RegistererOptions {
  registrar?: URI;
}

export interface RegistererRegisterOptions {
  requestOptions?: {
    extraHeaders?: string[];
  };
}

export type RegistererUnregisterOptions = RegistererRegisterOptions;

export enum RegistererState {
  Initial = 'Initial',
  Registered = 'Registered',
  Unregistered = 'Unregistered',
  Terminated = 'Terminated',
}

export class URI {
  constructor(
    public scheme: string,
    public user: string,
    public host: string,
    public port?: number | string
  ) {}

  toString(): string {
    return `${this.scheme}:${this.user}@${this.host}${this.port ? `:${this.port}` : ''}`;
  }
}

export class UserAgent {
  private connected = false;
  public delegate?: UserAgentDelegate;

  static makeURI(uri: string): URI | undefined {
    // Simple mock implementation
    const match = /^sip:([^@]+)@([^:]+)(?::(\d+))?/.exec(uri);
    if (!match) {
      return undefined;
    }
    return new URI('sip', match[1], match[2], match[3]);
  }

  constructor(options: UserAgentOptions = {}) {
    this.delegate = options.delegate;
  }

  start(): Promise<void> {
    this.connected = true;
    this.delegate?.onConnect?.();
    return Promise.resolve();
  }

  stop(): Promise<void> {
    this.connected = false;
    this.delegate?.onDisconnect?.();
    return Promise.resolve();
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export class Registerer {
  public stateChange = {
    addListener: jest.fn(),
  };

  constructor(public userAgent: UserAgent, public options?: RegistererOptions) {}

  register(options?: RegistererRegisterOptions): Promise<void> {
    return Promise.resolve();
  }

  unregister(options?: RegistererUnregisterOptions): Promise<void> {
    return Promise.resolve();
  }
}

export enum SessionState {
  Initial = 'Initial',
  Establishing = 'Establishing',
  Established = 'Established',
  Terminating = 'Terminating',
  Terminated = 'Terminated',
}

export class Session {
  public stateChange = {
    addListener: jest.fn(),
  };
  public delegate: unknown;
  public sessionDescriptionHandler: unknown;
}

export class Inviter extends Session {
  constructor(
    public userAgent: UserAgent,
    public target: URI,
    public options?: unknown
  ) {
    super();
  }

  invite(): Promise<void> {
    return Promise.resolve();
  }

  cancel(): Promise<void> {
    return Promise.resolve();
  }

  bye(): Promise<void> {
    return Promise.resolve();
  }
}

export class Invitation extends Session {
  accept(options?: unknown): Promise<void> {
    return Promise.resolve();
  }

  reject(): Promise<void> {
    return Promise.resolve();
  }
}

export class Info {
  public request = {
    getHeader: jest.fn(),
    body: '',
  };
}

export default {
  UserAgent,
  Registerer,
  RegistererState,
  URI,
  Session,
  SessionState,
  Inviter,
  Invitation,
  Info,
};
