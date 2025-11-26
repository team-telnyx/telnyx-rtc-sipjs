import EventEmitter from 'es6-event-emitter';
import { CallEvent } from './constants';
import {
  SimpleUser,
  SessionDescriptionHandler as WebSessionDescriptionHandler,
} from 'sip.js/lib/platform/web';
import { Session } from 'sip.js';
// @ts-ignore - no type declarations available
import { WebRTCStats } from '@peermetrics/webrtc-stats';

type CallStatus = 'starting' | 'initiating' | 'connected' | 'ended';
type CallType = 'incoming' | 'outgoing' | '';

interface WebRTCStatsInstance {
  on(event: string, callback: (data: unknown) => void): void;
  addConnection(options: { pc: RTCPeerConnection; peerId: string; connectionId: string }): void;
  removeAllPeers(): void;
  destroy(): void;
}

const STATS_POLL_INTERVAL = 1000;

/**
 * Retrieves the active session from SimpleUser instance.
 *
 * SimpleUser internally stores the current session in a private `_session` property.
 * This property is set when a call is made or received and cleared on hangup.
 *
 * @see https://github.com/onsip/SIP.js/blob/main/src/platform/web/simple-user/simple-user.ts#L57
 * @see https://github.com/onsip/SIP.js/blob/main/src/platform/web/simple-user/simple-user.ts#L256
 */
function getSessionFromSimpleUser(simpleUser: SimpleUser): Session | undefined {
  return (simpleUser as unknown as { _session?: Session })._session;
}

export class TelnyxCall extends EventEmitter {
  private _mute = false;
  private _status: CallStatus = 'starting';
  private _callType: CallType = '';
  private _webRTCStats: WebRTCStatsInstance | null = null;

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

  toggleMute(isMute: boolean): void {
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
    this._startStats();
    this.trigger(CallEvent.Accepted);
  }

  handleCallHangup(): void {
    this._status = 'ended';
    this._stopStats();
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

  /**
   * Gets the active SIP.js session if available
   * @returns The active Session or undefined
   */
  getSession(): Session | undefined {
    return getSessionFromSimpleUser(this.simpleUser);
  }

  /**
   * Gets the RTCPeerConnection from the active session if available
   * @returns The RTCPeerConnection or undefined
   */
  getPeerConnection(): RTCPeerConnection | undefined {
    const session = this.getSession();
    if (!session) {
      return undefined;
    }
    const handler = session.sessionDescriptionHandler;
    if (handler instanceof WebSessionDescriptionHandler) {
      return handler.peerConnection;
    }
    return undefined;
  }

  private _startStats(): void {
    const peerConnection = this.getPeerConnection();
    if (!peerConnection) {
      console.error(
        '[TelnyxCall] Unable to collect WebRTC stats: no peer connection available. ' +
          'SimpleUser does not expose the session publicly. ' +
          'For full WebRTC stats support, use @telnyx/rtc-sipjs-user-agent instead: ' +
          'https://www.npmjs.com/package/@telnyx/rtc-sipjs-user-agent'
      );
      return;
    }

    const stats: WebRTCStatsInstance = new WebRTCStats({
      getStatsInterval: STATS_POLL_INTERVAL,
      rawStats: false,
      statsObject: true,
      filteredStats: false,
      remote: true,
    });

    stats.on('stats', (event: unknown) => {
      this.trigger(CallEvent.Stats, event);
    });

    stats.addConnection({
      pc: peerConnection,
      peerId: 'call',
      connectionId: 'call',
    });

    this._webRTCStats = stats;
  }

  private _stopStats(): void {
    if (this._webRTCStats) {
      this._webRTCStats.removeAllPeers();
      this._webRTCStats.destroy();
      this._webRTCStats = null;
    }
  }
}
