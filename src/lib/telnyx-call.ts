import { SimpleUser } from 'sip.js/lib/platform/web/simple-user/simple-user.js';
import EventEmitter from 'es6-event-emitter';

type CallStatus = 'starting' | 'initiating' | 'connected' | 'ended';
type CallType = 'incoming' | 'outgoing' | '';

export class TelnyxCall extends EventEmitter {
  private _mute = false;
  private _status: CallStatus = 'starting';
  private _callType: CallType = '';

  constructor(private readonly simpleUser: SimpleUser) {
    super();
  }

  async makeCall(destination: string): Promise<void> {
    this._callType = 'outgoing';
    this._status = 'initiating';
    this.trigger('connecting');
    try {
      await this.simpleUser.call(destination);
    } catch (error) {
      this._status = 'ended';
      this.trigger('failed', error);
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
      this.trigger('failed', error);
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
      this.trigger('rejected');
    } catch (error) {
      this.trigger('failed', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.simpleUser.hangup();
    } catch (error) {
      this.trigger('failed', error);
    }
  }

  shutdown(): void {
    void this.simpleUser.disconnect();
  }

  mute(isMute: boolean): void {
    this._mute = isMute;
    if (isMute) {
      this.simpleUser.mute();
      this.trigger('muted');
    } else {
      this.simpleUser.unmute();
      this.trigger('unmuted');
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
      this.trigger('dtmf', undefined, digits);
    } catch (error) {
      this.trigger('failed', error);
    }
  }

  handleCallCreated(): void {
    if (this._status !== 'connected') {
      this._status = 'initiating';
      this.trigger('connecting');
    }
  }

  handleCallAnswered(): void {
    this._status = 'connected';
    this.trigger('accepted');
  }

  handleCallHangup(): void {
    this._status = 'ended';
    this.trigger('terminated');
  }

  handleHoldChange(held: boolean): void {
    this.trigger(held ? 'held' : 'resumed');
  }

  handleDtmf(tone: string, duration: number): void {
    this.trigger('dtmf', { tone, duration }, tone);
  }

  handleNotification(notification: unknown): void {
    this.trigger('notification', notification);
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
