import EventEmitter from 'es6-event-emitter';

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

class UA extends EventEmitter {
  start(): void {}
  stop(): void {}
  register(): void {}
  unregister(): void {}
  isRegistered(): boolean {
    return true;
  }
  isConnected(): boolean {
    return true;
  }
  invite(): EventEmitter {
    const session = new EventEmitter() as EventEmitter & { mediaHandler: EventEmitter };
    session.mediaHandler = new EventEmitter();
    return session;
  }
}

const SIP = {
  URI,
  UA,
};

export { URI, UA };
export default SIP;
