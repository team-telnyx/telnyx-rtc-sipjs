declare module 'es6-event-emitter' {
  type Listener = (...args: any[]) => void;

  export default class EventEmitter {
    on(event: string, listener: Listener): this;
    once(event: string, listener: Listener): this;
    off(event: string, listener?: Listener): this;
    trigger(event: string, ...args: any[]): this;
  }
}
