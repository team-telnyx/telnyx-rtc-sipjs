import EventEmitter from 'es6-event-emitter';

class SimpleEmitter<T> {
  private listeners: Array<(value: T) => void> = [];

  addListener(listener: (value: T) => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: (value: T) => void): void {
    this.listeners = this.listeners.filter((existing) => existing !== listener);
  }

  emit(value: T): void {
    this.listeners.slice().forEach((listener) => listener(value));
  }
}

export enum TransportState {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Disconnecting = 'Disconnecting',
}

export enum SessionState {
  Initial = 'Initial',
  Establishing = 'Establishing',
  Established = 'Established',
  Terminated = 'Terminated',
}

export enum RegistererState {
  Initial = 'Initial',
  Registered = 'Registered',
  Unregistered = 'Unregistered',
  Terminated = 'Terminated',
}

class URI {
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

class MockTransport {
  public state = TransportState.Disconnected;
  public stateChange = new SimpleEmitter<TransportState>();

  connect(): Promise<void> {
    this.state = TransportState.Connecting;
    this.stateChange.emit(this.state);
    this.state = TransportState.Connected;
    this.stateChange.emit(this.state);
    return Promise.resolve();
  }

  disconnect(): Promise<void> {
    this.state = TransportState.Disconnecting;
    this.stateChange.emit(this.state);
    this.state = TransportState.Disconnected;
    this.stateChange.emit(this.state);
    return Promise.resolve();
  }

  isConnected(): boolean {
    return this.state === TransportState.Connected;
  }
}

class MockSessionDescriptionHandler {
  public remoteMediaStream = new MediaStream();
  public localMediaStream = new MediaStream();

  sendDtmf(): boolean {
    return true;
  }
}

class Session extends EventEmitter {
  public state = SessionState.Initial;
  public stateChange = new SimpleEmitter<SessionState>();
  public delegate: Record<string, (...args: unknown[]) => void> = {};
  public sessionDescriptionHandler = new MockSessionDescriptionHandler();
  public sessionDescriptionHandlerOptions?: unknown;

  constructor(public userAgent: UserAgent) {
    super();
  }

  protected transition(state: SessionState): void {
    this.state = state;
    this.stateChange.emit(state);
  }

  bye(): Promise<void> {
    this.transition(SessionState.Terminated);
    this.delegate.onBye?.({});
    return Promise.resolve();
  }

  info(): Promise<void> {
    return Promise.resolve();
  }
}

class Inviter extends Session {
  public request = {};

  invite(): Promise<void> {
    this.transition(SessionState.Establishing);
    this.transition(SessionState.Established);
    this.delegate.onAck?.({});
    return Promise.resolve();
  }
}

class Invitation extends Session {
  public request = {};

  accept(): Promise<void> {
    this.transition(SessionState.Established);
    return Promise.resolve();
  }

  reject(): Promise<void> {
    this.transition(SessionState.Terminated);
    this.delegate.onCancel?.({});
    return Promise.resolve();
  }
}

class Registerer {
  public state = RegistererState.Initial;
  public stateChange = new SimpleEmitter<RegistererState>();

  constructor(public userAgent: UserAgent) {}

  register(): Promise<void> {
    this.state = RegistererState.Registered;
    this.stateChange.emit(this.state);
    return Promise.resolve();
  }

  unregister(): Promise<void> {
    this.state = RegistererState.Unregistered;
    this.stateChange.emit(this.state);
    return Promise.resolve();
  }
}

class UserAgent {
  public delegate?: Record<string, (...args: unknown[]) => void>;
  public transport = new MockTransport();
  public configuration: { uri: URI };

  constructor(public options?: Partial<{ uri: URI }>) {
    this.configuration = { uri: options?.uri ?? UserAgent.makeURI('sip:mock@example.com')! };
  }

  static makeURI(uri: string): URI | undefined {
    const match = /sip:([^@]+)@([^:]+)(?::(\d+))?/.exec(uri);
    if (!match) {
      return undefined;
    }
    return new URI('sip', match[1], match[2], match[3]);
  }

  start(): Promise<void> {
    return this.transport.connect().then(() => {
      this.delegate?.onConnect?.();
    });
  }

  stop(): Promise<void> {
    return this.transport.disconnect().then(() => {
      this.delegate?.onDisconnect?.();
    });
  }

  isConnected(): boolean {
    return this.transport.isConnected();
  }
}

export { Invitation, Inviter, Registerer, URI, UserAgent };

export default {
  Invitation,
  Inviter,
  Registerer,
  RegistererState,
  SessionState,
  TransportState,
  URI,
  UserAgent,
};
