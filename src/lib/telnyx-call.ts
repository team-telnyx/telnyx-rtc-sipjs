import { Invitation, Inviter, Session, SessionState, URI, UserAgent } from 'sip.js';
import type { Body } from 'sip.js/lib/core/messages/body.js';
import type { SessionDescriptionHandler as WebSessionDescriptionHandler } from 'sip.js/lib/platform/web/session-description-handler/session-description-handler.js';
import type { SessionDescriptionHandlerOptions } from 'sip.js/lib/api/session-description-handler.js';
import EventEmitter from 'es6-event-emitter';

type CallStatus = 'starting' | 'initiating' | 'connected' | 'ended';
type CallType = 'incoming' | 'outgoing' | '';

type SessionLike = Invitation | Inviter;

const AUDIO_CONSTRAINTS: MediaStreamConstraints = { audio: true, video: false };
const DTMF_CONTENT_TYPE = 'application/dtmf-relay';

export class TelnyxCall extends EventEmitter {
  private _mute = false;
  private _status: CallStatus = 'starting';
  private _callType: CallType = '';
  private _session?: SessionLike;
  private readonly _docBody: HTMLElement;
  private audioElement?: HTMLAudioElement;
  private _remoteTrackCleanup?: () => void;
  private readonly _sessionStateListener = (state: SessionState) => this._handleSessionStateChange(state);

  constructor(private readonly userAgent: UserAgent) {
    super();
    this._docBody = document.getElementsByTagName('body')[0];
  }

  makeCall(inviteUri: string): void {
    const targetUri = this._parseUri(inviteUri);
    const inviter = new Inviter(this.userAgent, targetUri, {
      sessionDescriptionHandlerOptions: this._sessionDescriptionOptions(),
    });

    this._callType = 'outgoing';
    this._setSession(inviter);
    this.trigger('connecting');
    this._status = 'initiating';

    inviter
      .invite({
        requestDelegate: {
          onProgress: (response) => this.trigger('progress', response),
          onReject: (response) => {
            this._status = 'ended';
            this.trigger('rejected', response);
          },
          onRedirect: (response) => {
            this._status = 'ended';
            this.trigger('rejected', response);
          },
        },
      })
      .catch((error) => {
        this._status = 'ended';
        this.trigger('failed', error);
      });
  }

  incomingCall(session: Invitation): void {
    this._callType = 'incoming';
    session.sessionDescriptionHandlerOptions = this._sessionDescriptionOptions();
    this._setSession(session);
  }

  accept(): void {
    if (!(this._session instanceof Invitation)) {
      console.error('accept() method is only valid on incoming calls');
      return;
    }

    this._session
      .accept({
        sessionDescriptionHandlerOptions: this._sessionDescriptionOptions(),
      })
      .catch((error) => {
        this._status = 'ended';
        this.trigger('failed', error);
      });
  }

  reject(): void {
    if (!(this._session instanceof Invitation)) {
      console.error('reject() method is only valid on incoming calls');
      return;
    }
    this._session.reject().then(() => {
      this._status = 'ended';
      this.trigger('rejected');
    });
  }

  get request(): Record<string, unknown> | false {
    if (!this._session) {
      return false;
    }

    if (this._callType === 'incoming' && this._session instanceof Invitation) {
      return this._session.request as unknown as Record<string, unknown>;
    }

    if (this._callType === 'outgoing' && this._session instanceof Inviter) {
      return this._session.request as unknown as Record<string, unknown>;
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
    if (!this._session) {
      return;
    }
    this._session.bye().catch(() => {
      // ignore; call might already be terminated
    });
  }

  shutdown(): void {
    void this.userAgent.stop();
  }

  mute(isMute: boolean): void {
    this._mute = isMute;
    const handler = this._getWebSessionHandler();
    handler?.localMediaStream.getAudioTracks().forEach((track) => {
      track.enabled = !isMute;
    });
    this.trigger(isMute ? 'muted' : 'unmuted');
  }

  isMuted(): boolean {
    return this._mute;
  }

  sendDigits(digits: string): void {
    if (!digits) {
      return;
    }
    const handler = this._getWebSessionHandler();
    if (handler && handler.sendDtmf(digits)) {
      this.trigger('dtmf', undefined, digits);
      return;
    }
    if (!this._session) {
      return;
    }
    const body: Body = {
      contentDisposition: 'render',
      contentType: DTMF_CONTENT_TYPE,
      content: `Signal=${digits}\r\nDuration=160`,
    };
    this._session
      .info({ requestOptions: { body } })
      .then(() => this.trigger('dtmf', undefined, digits))
      .catch((error) => this.trigger('failed', error));
  }

  status(): CallStatus {
    return this._status;
  }

  private _parseUri(uri: string): URI {
    const parsed = UserAgent.makeURI(uri);
    if (!parsed) {
      throw new Error(`Invalid SIP URI: ${uri}`);
    }
    return parsed;
  }

  private _sessionDescriptionOptions(): SessionDescriptionHandlerOptions {
    return {
      constraints: AUDIO_CONSTRAINTS,
    };
  }

  private _setSession(session: SessionLike): void {
    this._cleanupSession();
    this._session = session;
    session.stateChange.addListener(this._sessionStateListener);
    session.delegate = Object.assign({}, session.delegate, {
      onBye: () => {
        this._status = 'ended';
        this.trigger('bye');
      },
      onCancel: () => {
        this._status = 'ended';
        this.trigger('cancel');
      },
      onInfo: (info: { request: { body?: Body } }) => {
        const payload = info.request.body;
        if (payload && payload.contentType === DTMF_CONTENT_TYPE) {
          const toneMatch = /Signal=([0-9A-D#*])/i.exec(payload.content);
          if (toneMatch) {
            this.trigger('dtmf', info.request, toneMatch[1]);
          }
        }
      },
      onNotify: (notification: unknown) => {
        this.trigger('notification', notification);
      },
    });
  }

  private _handleSessionStateChange(state: SessionState): void {
    switch (state) {
      case SessionState.Initial:
      case SessionState.Establishing:
        if (this._status !== 'connected') {
          this._status = 'initiating';
          this.trigger('connecting');
        }
        break;
      case SessionState.Established:
        this._status = 'connected';
        this._attachRemoteMedia();
        this.trigger('accepted');
        break;
      case SessionState.Terminated:
        this._status = 'ended';
        this.trigger('terminated');
        this._cleanupSession();
        break;
      default:
        break;
    }
  }

  private _attachRemoteMedia(): void {
    const handler = this._getWebSessionHandler();
    if (!handler) {
      return;
    }

    const remoteStream = handler.remoteMediaStream;
    const attach = () => {
      const audio = this._getAudioElement();
      if (audio.srcObject !== remoteStream) {
        audio.srcObject = remoteStream;
        void audio.play().catch(() => undefined);
      }
    };
    attach();

    const addTrackHandler = () => attach();
    remoteStream.addEventListener('addtrack', addTrackHandler);

    this._remoteTrackCleanup = () => {
      remoteStream.removeEventListener('addtrack', addTrackHandler);
    };
  }

  private _getAudioElement(): HTMLAudioElement {
    if (!this.audioElement) {
      this.audioElement = document.createElement('audio');
      this.audioElement.className = 'telnyx-rtc-sipjs-remote-audio';
      this.audioElement.autoplay = true;
      (this.audioElement as HTMLMediaElement & { playsInline?: boolean }).playsInline = true;
      this._docBody.appendChild(this.audioElement);
    }
    return this.audioElement;
  }

  private _cleanupSession(): void {
    if (this._session) {
      this._session.stateChange.removeListener(this._sessionStateListener);
      this._session = undefined;
    }
    if (this._remoteTrackCleanup) {
      this._remoteTrackCleanup();
      this._remoteTrackCleanup = undefined;
    }
  }

  private _getWebSessionHandler(): WebSessionDescriptionHandler | undefined {
    return this._session?.sessionDescriptionHandler as WebSessionDescriptionHandler | undefined;
  }
}
