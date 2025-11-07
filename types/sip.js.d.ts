declare module 'sip.js' {
  export interface RegisterOptions {
    all?: boolean;
    extraHeaders?: string[];
  }

  export interface MediaHandler {
    on(event: string, listener: (...args: any[]) => void): void;
  }

  export interface Session {
    on(event: string, listener: (...args: any[]) => void): void;
    accept(options?: Record<string, unknown>): void;
    reject(options?: Record<string, unknown>): void;
    terminate(options?: Record<string, unknown>): void;
    dtmf(digits: string): void;
    mute(): void;
    unmute(): void;
    invite?(target: string, options?: Record<string, unknown>): Session;
    mediaHandler: MediaHandler;
    request?: Record<string, unknown>;
    transaction?: {
      request?: Record<string, unknown>;
    };
  }

  export class URI {
    constructor(scheme: string, user: string, host: string, port?: number | string);
    toString(): string;
  }

  export interface UserAgentConfiguration {
    [key: string]: unknown;
  }

  export class UA {
    constructor(configuration: UserAgentConfiguration);
    on(event: string, listener: (...args: any[]) => void): void;
    start(): void;
    stop(): void;
    register(options?: RegisterOptions): void;
    unregister(options?: RegisterOptions): void;
    isRegistered(): boolean;
    isConnected(): boolean;
    invite(target: string, options?: unknown): Session;
  }

  const SIP: {
    URI: typeof URI;
    UA: typeof UA;
  };

  export default SIP;
}
