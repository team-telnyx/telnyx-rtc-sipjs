import SIP, { Session as SipSession, UA as SipUA } from 'sip.js';
import type { MediaHandler } from 'sip.js';
import EventEmitter from 'es6-event-emitter';

type CallStatus = 'starting' | 'initiating' | 'connected' | 'ended';
type CallType = 'incoming' | 'outgoing' | '';

export interface SessionWithMedia extends SipSession {
  mediaHandler: MediaHandler & {
    on(event: string, listener: (...args: any[]) => void): void;
  };
  accept(options?: Record<string, unknown>): void;
  reject(options?: Record<string, unknown>): void;
  terminate(options?: Record<string, unknown>): void;
  mute(): void;
  unmute(): void;
  dtmf(digits: string): void;
}

export class TelnyxCall extends EventEmitter {
  private _mute = false;
  private _status: CallStatus = 'starting';
  private _callType: CallType = '';
  private _session!: SessionWithMedia;
  private readonly _docBody: HTMLElement;
  private audioElement?: HTMLAudioElement;

  constructor(private readonly UA: SipUA) {
    super();
    this._docBody = document.getElementsByTagName('body')[0];
    this.UA.start();
  }

  /**
   * Make a call to a phone number
   *
   * @param {URI} inviteUri - A SIP.js URI that includes the phone number to connect to
   */
  makeCall(inviteUri: string): void {
    this._callType = 'outgoing';
    this._session = this.UA.invite(inviteUri, this._getAudioElement()) as SessionWithMedia;
    this._attachSessionEvents();
  }

  /**
   * Set up to handle an incoming call.
   * The calling function will then be able to accept or reject the call.
   *
   * @param {Session} session - A SIP.js Session, specifically of the SIP.ServerContext type
   */
  incomingCall(session: SessionWithMedia): void {
    this._callType = 'incoming';
    this._session = session;
    this._attachSessionEvents();
  }

  private _getAudioElement(): HTMLAudioElement {
    if (!this.audioElement) {
      this.audioElement = document.createElement('audio');
      this.audioElement.className = 'telnyx-rtc-sipjs-remote-audio';
      this._docBody.appendChild(this.audioElement);
    }
    return this.audioElement;
  }

  private _attachSessionEvents(): void {
    if (!this._session) {
      return;
    }

    this._session.on('connecting', () => {
      this.trigger('connecting');
      this._status = 'initiating';
    });

    this._session.on('progress', (response: unknown) => this.trigger('progress', response));

    this._session.on('accepted', (data: unknown) => {
      this.trigger('accepted', data);
      this._status = 'connected';
    });

    this._session.on('dtmf', (request: unknown, dtmf: string) => this.trigger('dtmf', request, dtmf));

    this._session.on('muted', (data: unknown) => this.trigger('muted', data));
    this._session.on('unmuted', (data: unknown) => this.trigger('unmuted', data));

    this._session.on('cancel', () => {
      this.trigger('cancel');
      this._status = 'ended';
    });

    this._session.on('refer', () => {
      this.trigger('rejected');
    });

    this._session.on('replaced', (newSession: unknown) => {
      this.trigger('rejected', newSession);
    });

    this._session.on('rejected', (response: unknown, cause: unknown) => {
      this.trigger('rejected', response, cause);
      this._status = 'ended';
    });

    this._session.on('failed', (response: unknown, cause: unknown) => {
      this.trigger('failed', response, cause);
      this._status = 'ended';
    });

    this._session.on('terminated', (message: unknown, cause: unknown) => {
      this.trigger('terminated', message, cause);
      this._status = 'ended';
    });

    this._session.on('bye', () => {
      this.trigger('bye');
      this._status = 'ended';
    });

    const mediaHandler = this._session.mediaHandler;

    mediaHandler.on('userMediaRequest', (constraints: unknown) => {
      this.trigger('userMediaRequest', constraints);
    });

    mediaHandler.on('userMedia', (stream: MediaStream) => {
      this.trigger('userMedia', stream);
    });

    mediaHandler.on('userMediaFailed', (error: unknown) => {
      this.trigger('userMediaFailed', error);
    });

    mediaHandler.on('iceGathering', () => this.trigger('iceGathering'));
    mediaHandler.on('iceCandidate', (candidate: unknown) => this.trigger('iceCandidate', candidate));
    mediaHandler.on('iceGatheringComplete', () => this.trigger('iceGatheringComplete'));
    mediaHandler.on('iceConnection', () => this.trigger('iceConnection'));
    mediaHandler.on('iceConnectionChecking', () => this.trigger('iceConnectionChecking'));
    mediaHandler.on('iceConnectionConnected', () => this.trigger('iceConnectionConnected'));
    mediaHandler.on('iceConnectionCompleted', () => this.trigger('iceConnectionCompleted'));
    mediaHandler.on('iceConnectionFailed', () => this.trigger('iceConnectionFailed'));
    mediaHandler.on('iceConnectionDisconnected', () => this.trigger('iceConnectionDisconnected'));
    mediaHandler.on('iceConnectionClosed', () => this.trigger('iceConnectionClosed'));
    mediaHandler.on('getDescription', (sdpWrapper: unknown) => this.trigger('getDescription', sdpWrapper));
    mediaHandler.on('setDescription', (sdpWrapper: unknown) => this.trigger('setDescription', sdpWrapper));
    mediaHandler.on('dataChannel', (dataChannel: unknown) => this.trigger('dataChannel', dataChannel));
    mediaHandler.on('addStream', (stream: MediaStream) => this.trigger('addStream', stream));
  }

  accept(): void {
    if (this._callType !== 'incoming' || !this._session) {
      console.error('accept() method is only valid on incoming calls');
      return;
    }

    this._session.accept({
      media: {
        constraints: { audio: true, video: false },
        render: { remote: this._getAudioElement() },
      },
    });
  }

  reject(): void {
    if (this._callType !== 'incoming' || !this._session) {
      console.error('reject() method is only valid on incoming calls');
      return;
    }
    this._session.reject();
  }

  get request(): Record<string, unknown> | false {
    if (!this._session) {
      return false;
    }

    if (this._callType === 'incoming') {
      return this._session.transaction?.request ?? false;
    }

    if (this._callType === 'outgoing') {
      return this._session.request ?? false;
    }

    return false;
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

  disconnect(): void {
    if (this._session) {
      this._session.terminate();
    }
  }

  shutdown(): void {
    this.UA.stop();
  }

  mute(isMute: boolean): void {
    this._mute = isMute;
    if (!this._session) {
      return;
    }

    if (this._mute) {
      this._session.mute();
    } else {
      this._session.unmute();
    }
  }

  isMuted(): boolean {
    return this._mute;
  }

  sendDigits(digits: string): void {
    if (!this._session) {
      return;
    }
    this._session.dtmf(digits);
  }

  status(): CallStatus {
    return this._status;
  }
}
