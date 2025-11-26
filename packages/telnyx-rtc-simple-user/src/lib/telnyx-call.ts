import EventEmitter from 'es6-event-emitter';
import { CallEvent } from './constants';
import { SimpleUser } from 'sip.js/lib/platform/web';

type CallStatus = 'starting' | 'initiating' | 'connected' | 'ended';
type CallType = 'incoming' | 'outgoing' | '';

export class TelnyxCall extends EventEmitter {
  private _mute = false;
  private _status: CallStatus = 'starting';
  private _callType: CallType = '';

  public readonly simpleUser: SimpleUser;

  constructor(simpleUser: SimpleUser) {
    super();
    this.simpleUser = simpleUser;
  }

  /**
   * Register an event listener
   * @param event - The event name to listen to
   * @param handler - The callback function to execute when the event is triggered
   * @returns The call instance for method chaining
   */
  public on(event: CallEvent | string, handler: (...args: any[]) => void): this {
    return super.on(event, handler);
  }

  /**
   * Remove an event listener
   * @param event - The event name to stop listening to
   * @param handler - The callback function to remove
   * @returns The call instance for method chaining
   */
  public off(event: CallEvent | string, handler?: (...args: any[]) => void): this {
    return super.off(event, handler);
  }

  async makeCall(destination: string): Promise<void> {
    this._callType = 'outgoing';
    this._status = 'initiating';
    this.trigger(CallEvent.Connecting);
    try {
      await this.simpleUser.call(destination);
    } catch (error) {
      this._status = 'ended';
      this.trigger(CallEvent.Failed, error);
      throw error;
    }
  }

  markIncoming(): void {
    this._callType = 'incoming';
    this._status = 'initiating';
  }

  async accept(): Promise<void> {
    if (this._callType !== 'incoming') {
      console.error('accept() method is only valid on incoming calls');
      return;
    }
    try {
      await this.simpleUser.answer();
    } catch (error) {
      this._status = 'ended';
      this.trigger(CallEvent.Failed, error);
    }
  }

  async reject(): Promise<void> {
    if (this._callType !== 'incoming') {
      console.error('reject() method is only valid on incoming calls');
      return;
    }
    try {
      await this.simpleUser.decline();
      this._status = 'ended';
      this.trigger(CallEvent.Rejected);
    } catch (error) {
      this.trigger(CallEvent.Failed, error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.simpleUser.hangup();
    } catch (error) {
      this.trigger(CallEvent.Failed, error);
    }
  }

  shutdown(): Promise<void> {
    return this.simpleUser.disconnect();
  }

  mute(isMute: boolean): void {
    this._mute = isMute;
    if (isMute) {
      this.simpleUser.mute();
      this.trigger(CallEvent.Muted);
    } else {
      this.simpleUser.unmute();
      this.trigger(CallEvent.Unmuted);
    }
  }

  isMuted(): boolean {
    return this._mute;
  }

  async sendDigits(digits: string): Promise<void> {
    if (!digits) {
      return;
    }
    try {
      await this.simpleUser.sendDTMF(digits);
      this.trigger(CallEvent.Dtmf, undefined, digits);
    } catch (error) {
      this.trigger(CallEvent.Failed, error);
    }
  }

  handleCallCreated(): void {
    if (this._status !== 'connected') {
      this._status = 'initiating';
      this.trigger(CallEvent.Connecting);
    }
  }

  handleCallAnswered(): void {
    this._status = 'connected';
    this.trigger(CallEvent.Accepted);
  }

  handleCallHangup(): void {
    this._status = 'ended';
    this.trigger(CallEvent.Terminated);
  }

  handleHoldChange(held: boolean): void {
    this.trigger(held ? CallEvent.Held : CallEvent.Resumed);
  }

  handleDtmf(tone: string, duration: number): void {
    this.trigger(CallEvent.Dtmf, { tone, duration }, tone);
  }

  handleNotification(notification: unknown): void {
    this.trigger(CallEvent.Notification, notification);
  }

  isInitiating(): boolean {
    return this._status === 'initiating';
  }

  isConnected(): boolean {
    return this._status === 'connected';
  }

  isEnded(): boolean {
    return this._status === 'ended';
  }

  isIncoming(): boolean {
    return this._callType === 'incoming';
  }

  isOutgoing(): boolean {
    return this._callType === 'outgoing';
  }

  get request(): false {
    return false;
  }

  status(): CallStatus {
    return this._status;
  }
}
