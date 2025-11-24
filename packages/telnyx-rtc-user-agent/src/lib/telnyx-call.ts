import { Info, Invitation, Inviter, Session, SessionDescriptionHandlerOptions, SessionState, UserAgent } from 'sip.js';
import type { SessionDescriptionHandler as WebSessionDescriptionHandler } from 'sip.js/lib/platform/web/session-description-handler/session-description-handler.js';
import EventEmitter from 'es6-event-emitter';
import { CallEvent } from './constants';

export type CallStatus = 'starting' | 'initiating' | 'connected' | 'ended';
export type CallType = 'incoming' | 'outgoing' | '';

interface TelnyxCallOptions {
  remoteAudioElement?: HTMLAudioElement;
}

interface DtmfPayload {
  tone: string;
  duration?: number;
}

export class TelnyxCall extends EventEmitter {
  private readonly userAgent: UserAgent;
  private readonly options: TelnyxCallOptions;
  private session?: Session;
  private _callType: CallType = '';
  private _status: CallStatus = 'starting';
  private _mute = false;
  private readonly docBody: HTMLElement;
  private audioElement?: HTMLAudioElement;

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

  constructor(userAgent: UserAgent, options: TelnyxCallOptions = {}) {
    super();
    this.userAgent = userAgent;
    this.options = options;
    this.audioElement = options.remoteAudioElement;
    this.docBody = document.getElementsByTagName('body')[0];
  }

  async makeCall(destination: string): Promise<void> {
    const target = UserAgent.makeURI(destination);
    if (!target) {
      throw new TypeError('Invalid SIP URI');
    }
    const inviter = new Inviter(this.userAgent, target, {
      sessionDescriptionHandlerOptions: this.buildSessionDescriptionHandlerOptions(),
    });
    this._callType = 'outgoing';
    this.attachSession(inviter);
    this._status = 'initiating';
    this.trigger(CallEvent.Connecting);
    try {
      await inviter.invite();
    } catch (error) {
      this._status = 'ended';
      this.trigger(CallEvent.Failed, error);
      throw error;
    }
  }

  incomingCall(invitation: Invitation): void {
    this._callType = 'incoming';
    this.attachSession(invitation);
  }

  async accept(): Promise<void> {
    const session = this.session;
    if (this._callType !== 'incoming' || !(session instanceof Invitation)) {
      console.error('accept() method is only valid on incoming calls');
      return;
    }
    try {
      await session.accept({ sessionDescriptionHandlerOptions: this.buildSessionDescriptionHandlerOptions() });
    } catch (error) {
      this._status = 'ended';
      this.trigger(CallEvent.Failed, error);
    }
  }

  async reject(): Promise<void> {
    const session = this.session;
    if (this._callType !== 'incoming' || !(session instanceof Invitation)) {
      console.error('reject() method is only valid on incoming calls');
      return;
    }
    try {
      await session.reject();
      this._status = 'ended';
      this.trigger(CallEvent.Rejected);
    } catch (error) {
      this.trigger(CallEvent.Failed, error);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.session) {
      return;
    }
    try {
      if (this.session instanceof Inviter && this.session.state === SessionState.Establishing) {
        await this.session.cancel();
      } else {
        await this.session.bye();
      }
    } catch (error) {
      this.trigger(CallEvent.Failed, error);
    }
  }

  shutdown(): Promise<void> {
    return this.userAgent.stop();
  }

  mute(isMute: boolean): void {
    this._mute = isMute;
    const handler = this.getWebSessionDescriptionHandler();
    if (!handler) {
      return;
    }
    handler.enableSenderTracks(!isMute);
    this.trigger(isMute ? CallEvent.Muted : CallEvent.Unmuted);
  }

  isMuted(): boolean {
    return this._mute;
  }

  async sendDigits(digits: string): Promise<void> {
    if (!digits) {
      return;
    }
    const handler = this.getWebSessionDescriptionHandler();
    if (!handler) {
      return;
    }
    const success = handler.sendDtmf(digits);
    if (!success) {
      this.trigger(CallEvent.Failed, new Error('Failed to send DTMF'));
      return;
    }
    this.trigger(CallEvent.Dtmf, undefined, digits);
  }

  get request(): false {
    return false;
  }

  status(): CallStatus {
    return this._status;
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

  private attachSession(session: Session): void {
    this.session = session;
    this._status = 'initiating';
    session.delegate = {
      onBye: () => this.handleTerminated(),
      onCancel: () => this.handleFailed('cancelled'),
      onInfo: (info: Info) => this.handleInfo(info),
      onNotify: (notification) => this.trigger(CallEvent.Notification, notification),
      onSessionDescriptionHandler: (handler) => this.attachRemoteMedia(handler as WebSessionDescriptionHandler),
    };
    session.stateChange.addListener((state) => {
      if (state === SessionState.Establishing) {
        this.trigger(CallEvent.Connecting);
      }
      if (state === SessionState.Established) {
        this._status = 'connected';
        this.trigger(CallEvent.Accepted);
        this.attachRemoteMedia();
      }
      if (state === SessionState.Terminated) {
        this.handleTerminated();
      }
    });
  }

  private handleTerminated(): void {
    if (this._status !== 'ended') {
      this._status = 'ended';
    }
    this.trigger(CallEvent.Terminated);
  }

  private handleFailed(reason: string): void {
    this._status = 'ended';
    this.trigger(CallEvent.Failed, reason);
  }

  private handleInfo(info: Info): void {
    const contentType = info.request.getHeader('Content-Type');
    if (contentType && contentType.toLowerCase() === 'application/dtmf-relay' && typeof info.request.body === 'string') {
      const payload = this.parseDtmf(info.request.body);
      if (payload) {
        this.trigger(CallEvent.Dtmf, payload, payload.tone);
        return;
      }
    }
    this.trigger(CallEvent.Info, info);
  }

  private parseDtmf(body: string): DtmfPayload | undefined {
    const toneMatch = /signal\s*=\s*([^\r\n]+)/i.exec(body);
    if (!toneMatch) {
      return undefined;
    }
    const durationMatch = /duration\s*=\s*(\d+)/i.exec(body);
    const duration = durationMatch ? parseInt(durationMatch[1], 10) : undefined;
    return {
      tone: toneMatch[1].trim(),
      duration,
    };
  }

  private buildSessionDescriptionHandlerOptions(): SessionDescriptionHandlerOptions {
    return {
      constraints: { audio: true, video: false },
    };
  }

  private attachRemoteMedia(handler?: WebSessionDescriptionHandler): void {
    const session = this.session;
    const resolvedHandler = handler ?? (session?.sessionDescriptionHandler as WebSessionDescriptionHandler | undefined);
    if (!resolvedHandler) {
      return;
    }
    const audioElement = this.getOrCreateAudioElement();
    if (!audioElement) {
      return;
    }
    audioElement.srcObject = resolvedHandler.remoteMediaStream;
    audioElement.autoplay = true;
    void audioElement.play().catch(() => undefined);
  }

  private getOrCreateAudioElement(): HTMLAudioElement | undefined {
    if (this.audioElement) {
      return this.audioElement;
    }
    const audio = document.createElement('audio');
    audio.className = 'telnyx-rtc-sipjs-remote-audio';
    this.docBody.appendChild(audio);
    this.audioElement = audio;
    return audio;
  }

  private getWebSessionDescriptionHandler(): WebSessionDescriptionHandler | undefined {
    return this.session?.sessionDescriptionHandler as WebSessionDescriptionHandler | undefined;
  }
}
