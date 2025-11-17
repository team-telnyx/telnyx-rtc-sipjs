export interface SimpleUserDelegate {
  onServerConnect?(): void;
  onServerDisconnect?(): void;
  onRegistered?(): void;
  onUnregistered?(): void;
  onCallCreated?(): void;
  onCallAnswered?(): void;
  onCallHangup?(): void;
  onCallHold?(held: boolean): void;
  onCallDTMFReceived?(tone: string, duration: number): void;
  onCallReceived?(): void;
  onMessageReceived?(message: string): void;
}

export interface SimpleUserOptions {
  delegate?: SimpleUserDelegate;
  media?: {
    constraints?: {
      audio: boolean;
      video: boolean;
    };
    remote?: {
      audio?: HTMLAudioElement;
    };
  };
  userAgentOptions?: Record<string, unknown>;
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

class SimpleUser {
  public delegate?: SimpleUserDelegate;
  private connected = false;
  private muted = false;

  constructor(public server: string, options: SimpleUserOptions = {}) {
    this.delegate = options.delegate;
  }

  connect(): Promise<void> {
    this.connected = true;
    this.delegate?.onServerConnect?.();
    return Promise.resolve();
  }

  disconnect(): Promise<void> {
    this.connected = false;
    this.delegate?.onServerDisconnect?.();
    return Promise.resolve();
  }

  isConnected(): boolean {
    return this.connected;
  }

  register(): Promise<void> {
    this.delegate?.onRegistered?.();
    return Promise.resolve();
  }

  unregister(): Promise<void> {
    this.delegate?.onUnregistered?.();
    return Promise.resolve();
  }

  call(): Promise<void> {
    this.delegate?.onCallCreated?.();
    return Promise.resolve();
  }

  hangup(): Promise<void> {
    this.delegate?.onCallHangup?.();
    return Promise.resolve();
  }

  answer(): Promise<void> {
    this.delegate?.onCallAnswered?.();
    return Promise.resolve();
  }

  decline(): Promise<void> {
    this.delegate?.onCallHangup?.();
    return Promise.resolve();
  }

  hold(): Promise<void> {
    this.delegate?.onCallHold?.(true);
    return Promise.resolve();
  }

  unhold(): Promise<void> {
    this.delegate?.onCallHold?.(false);
    return Promise.resolve();
  }

  mute(): void {
    this.muted = true;
  }

  unmute(): void {
    this.muted = false;
  }

  isMuted(): boolean {
    return this.muted;
  }

  sendDTMF(tone: string): Promise<void> {
    this.delegate?.onCallDTMFReceived?.(tone, 160);
    return Promise.resolve();
  }

  message(): Promise<void> {
    this.delegate?.onMessageReceived?.('mock');
    return Promise.resolve();
  }
}

export { SimpleUser, URI };

export default {
  SimpleUser,
  URI,
};
