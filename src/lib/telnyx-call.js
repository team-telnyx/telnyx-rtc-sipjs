import { Invitation, Inviter, SessionState } from 'sip.js';
import EventEmitter from 'es6-event-emitter';

/**
* Represents a single inbound or outbound SIP call driven by SIP.js Session objects.
*
* @class
*/
export class TelnyxCall extends EventEmitter {

  /**
  * Create a TelnyxCall. Normally created by TelnyxDevice.
  *
  * @param {Inviter|Invitation} session SIP.js Session (Inviter for outgoing calls, Invitation for incoming calls).
  * @throws {TypeError} If a session instance is not provided.
  */
  constructor(session) {
    super();
    if (!session) {
      throw new TypeError("TelnyxCall requires a SIP.js session");
    }

    this._session = session;
    this._sessionDescriptionHandler = null;
    this._mute = false;
    this._status = 'starting';
    this._callType = session instanceof Invitation ? 'incoming' : 'outgoing';
    this._docBody = typeof document !== 'undefined'
      ? (document.body || document.getElementsByTagName('body')[0])
      : null;
    this.audioElement = false;

    this._setupStateListener();
    this._setSessionDelegate();
    this._wireExistingSessionDescriptionHandler();
  }

  /**
   * Make an outbound call using the underlying Inviter session.
   *
   * @fires TelnyxCall#trying
   * @fires TelnyxCall#progress
   * @fires TelnyxCall#accepted
   * @fires TelnyxCall#failed
   * @return {Promise<void>} Resolves when the INVITE has been generated.
   */
  makeCall() {
    if (!(this._session instanceof Inviter)) {
      console.error("makeCall() method is only valid on outgoing calls");
      return Promise.reject(new Error("TelnyxCall: Invalid session for makeCall"));
    }
    this._callType = 'outgoing';
    return this._session.invite({
      requestDelegate: this._buildRequestDelegate()
    }).catch((error) => {
      this._status = 'ended';
      this.trigger("failed", {cause: error});
      throw error;
    });
  }

  /**
   * Prepare to handle an incoming call.
   *
   * @param {Invitation} session Optional replacement session (used when reusing an instance).
   * @return {TelnyxCall} Reference to self for chaining.
   */
  incomingCall(session) {
    if (session) {
      this._session = session;
    }
    this._callType = 'incoming';
    return this;
  }

  _getAudioElement() {
    if (!this._docBody) {
      return null;
    }
    if (!this.audioElement) {
      const audio = document.createElement('audio');
      audio.autoplay = true;
      audio.playsInline = true;
      audio.className = 'telnyx-rtc-sipjs-remote-audio';
      audio.style.display = 'none';
      this._docBody.appendChild(audio);
      this.audioElement = audio;
    }
    return this.audioElement;
  }

  _setupStateListener() {
    if (!this._session || !this._session.stateChange || !this._session.stateChange.addListener) {
      return;
    }
    this._session.stateChange.addListener((newState) => {
      switch (newState) {
        case SessionState.Establishing:
          this._status = 'initiating';
          this.trigger("connecting");
          break;
        case SessionState.Established:
          this._status = 'connected';
          this.trigger("accepted");
          this._attachRemoteAudioFromHandler();
          break;
        case SessionState.Terminating:
          this.trigger("terminating");
          break;
        case SessionState.Terminated:
          this._status = 'ended';
          this.trigger("terminated");
          break;
        default:
          break;
      }
    });
  }

  _setSessionDelegate() {
    if (!this._session) {
      return;
    }
    this._session.delegate = {
      onBye: (bye) => {
        this._status = 'ended';
        this.trigger("bye", bye);
      },
      onCancel: (cancel) => {
        this._status = 'ended';
        this.trigger("cancel", cancel);
      },
      onInfo: (info) => this._handleInfo(info),
      onNotify: (notification) => this.trigger("notify", notification),
      onRefer: (referral) => this.trigger("refer", referral),
      onSessionDescriptionHandler: (sdh) => this._handleSessionDescriptionHandler(sdh)
    };
  }

  _handleSessionDescriptionHandler(handler) {
    if (!handler) {
      return;
    }
    this._sessionDescriptionHandler = handler;
    this._wrapMediaStreamFactory(handler);
    handler.peerConnectionDelegate = this._createPeerConnectionDelegate();
    this._attachRemoteAudio(handler.remoteMediaStream);
  }

  _wrapMediaStreamFactory(handler) {
    if (!handler || handler._telnyxMediaFactoryWrapped) {
      return;
    }
    const originalFactory = handler.mediaStreamFactory;
    if (typeof originalFactory !== 'function') {
      return;
    }
    handler.mediaStreamFactory = (constraints) => {
      this.trigger("userMediaRequest", constraints);
      return Promise.resolve(originalFactory(constraints)).then((stream) => {
        this.trigger("userMedia", stream);
        return stream;
      }).catch((error) => {
        this.trigger("userMediaFailed", error);
        throw error;
      });
    };
    handler._telnyxMediaFactoryWrapped = true;
  }

  _wireExistingSessionDescriptionHandler() {
    if (this._session && this._session.sessionDescriptionHandler) {
      this._handleSessionDescriptionHandler(this._session.sessionDescriptionHandler);
    }
  }

  _attachRemoteAudioFromHandler() {
    if (this._sessionDescriptionHandler) {
      this._attachRemoteAudio(this._sessionDescriptionHandler.remoteMediaStream);
    }
  }

  _attachRemoteAudio(stream) {
    if (!stream) {
      return;
    }
    const audio = this._getAudioElement();
    if (!audio) {
      return;
    }
    try {
      if ('srcObject' in audio) {
        audio.srcObject = stream;
      } else if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
        audio.src = window.URL.createObjectURL(stream);
      }
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    } catch (error) {
      console.warn("Failed to attach remote audio", error);
    }
    if (stream && typeof stream.addEventListener === 'function') {
      stream.addEventListener('addtrack', () => this.trigger("addStream", stream));
    }
    this.trigger("addStream", stream);
  }

  _createPeerConnectionDelegate() {
    return {
      ondatachannel: (event) => this.trigger("dataChannel", event.channel || event),
      onicecandidate: (event) => this.trigger("iceCandidate", event.candidate),
      onicecandidateerror: (event) => this.trigger("iceCandidateError", event),
      oniceconnectionstatechange: (event) => {
        const state = event && event.target ? event.target.iceConnectionState : null;
        this._handleIceConnectionState(state);
      },
      onicegatheringstatechange: (event) => {
        const state = event && event.target ? event.target.iceGatheringState : null;
        this._handleIceGatheringState(state);
      },
      ontrack: (event) => {
        const stream = (event && event.streams && event.streams[0])
          ? event.streams[0]
          : (this._sessionDescriptionHandler && this._sessionDescriptionHandler.remoteMediaStream);
        this._attachRemoteAudio(stream);
      }
    };
  }

  _handleIceConnectionState(state) {
    if (!state) {
      return;
    }
    const mapping = {
      checking: "iceConnectionChecking",
      connected: "iceConnectionConnected",
      completed: "iceConnectionCompleted",
      failed: "iceConnectionFailed",
      disconnected: "iceConnectionDisconnected",
      closed: "iceConnectionClosed",
      new: "iceConnection"
    };
    this.trigger("iceConnection", state);
    if (mapping[state]) {
      this.trigger(mapping[state]);
    }
  }

  _handleIceGatheringState(state) {
    if (!state) {
      return;
    }
    const mapping = {
      gathering: "iceGathering",
      complete: "iceGatheringComplete"
    };
    if (mapping[state]) {
      this.trigger(mapping[state]);
    }
  }

  _handleInfo(info) {
    if (!info || !info.request) {
      return;
    }
    if (typeof info.accept === 'function') {
      try {
        info.accept();
      } catch (e) {
        // ignore
      }
    }
    const contentType = info.request.getHeader && info.request.getHeader("Content-Type");
    if (contentType && contentType.toLowerCase().indexOf('application/dtmf-relay') !== -1) {
      const tone = this._parseDtmf(info.request.body);
      if (tone) {
        this.trigger("dtmf", info, tone);
      }
    } else {
      this.trigger("info", info);
    }
  }

  _parseDtmf(body) {
    if (!body) {
      return null;
    }
    const match = body.match(/Signal\s*=\s*([0-9A-D#*])/i);
    return match ? match[1] : null;
  }

  _buildRequestDelegate() {
    return {
      onTrying: (response) => this.trigger("trying", response),
      onProgress: (response) => this.trigger("progress", response),
      onRedirect: (response) => this.trigger("redirect", response),
      onAccept: (response) => {
        this._status = 'connected';
        this.trigger("accepted", response);
      },
      onReject: (response) => {
        this._status = 'ended';
        this.trigger("rejected", response);
      },
      onCancel: () => {
        this._status = 'ended';
        this.trigger("cancel");
      }
    };
  }

  /**
   * Accept an incoming call.
   *
   * @fires TelnyxCall#accepted
   * @return {Promise<void>} Resolves when the underlying Invitation is accepted.
   */
  accept() {
    if (!(this._session instanceof Invitation)) {
      console.error("accept() method is only valid on incoming calls");
      return Promise.resolve();
    }
    return this._session.accept({
      sessionDescriptionHandlerOptions: {constraints: {audio: true, video: false}}
    }).then(() => {
      this._status = 'connected';
    }).catch((error) => {
      this._status = 'ended';
      this.trigger("failed", {cause: error});
      throw error;
    });
  }

  /**
   * Reject an incoming call.
   *
   * @fires TelnyxCall#rejected
   * @return {Promise<void>} Resolves once the rejection has been sent.
   */
  reject() {
    if (!(this._session instanceof Invitation)) {
      console.error("reject() method is only valid on incoming calls");
      return Promise.resolve();
    }
    return this._session.reject().then(() => {
      this._status = 'ended';
      this.trigger("rejected");
    });
  }

  /**
   * The request object contains metadata about the current session.
   *
   * @return {Object|false} SIP.js request metadata for the current session, or `false` if unavailable.
   */
  get request() {
    if (!this._session) {
      return false;
    }
    return this._session.request || false;
  }

  isInitiating() {
    return this._status === 'initiating';
  }

  isConnected() {
    return this._status === 'connected';
  }

  isEnded() {
    return this._status === 'ended';
  }

  isIncoming() {
    return this._callType === 'incoming';
  }

  isOutgoing() {
    return this._callType === 'outgoing';
  }

  /**
  * End the current SIP session.
  *
  * @fires TelnyxCall#terminated
  * @return {Promise<void>} Resolves once BYE/dispose is complete.
  */
  disconnect() {
    if (!this._session) {
      return Promise.resolve();
    }
    if (this._session.state === SessionState.Established && typeof this._session.bye === 'function') {
      return this._session.bye().then(() => {
        this._status = 'ended';
      });
    }
    if (typeof this._session.dispose === 'function') {
      return this._session.dispose().then(() => {
        this._status = 'ended';
      });
    }
    this._status = 'ended';
    return Promise.resolve();
  }

  /**
  * Shutdown the underlying SIP UserAgent (legacy helper).
  *
  * @return {Promise<void>} Resolves when the UserAgent stops, or immediately if none present.
  */
  shutdown() {
    if (this._session && this._session.userAgent && typeof this._session.userAgent.stop === 'function') {
      return this._session.userAgent.stop();
    }
    return Promise.resolve();
  }

  /**
  * Toggle the outbound audio tracks.
  *
  * @param {boolean} isMute Whether mute should be enabled.
  * @fires TelnyxCall#muted
  * @fires TelnyxCall#unmuted
  */
  mute(isMute) {
    this._mute = !!isMute;
    const handler = this._session && this._session.sessionDescriptionHandler
      ? this._session.sessionDescriptionHandler
      : this._sessionDescriptionHandler;
    if (handler && handler.localMediaStream) {
      handler.localMediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !this._mute;
      });
    }
    this.trigger(this._mute ? "muted" : "unmuted");
  }

  /**
  * Current mute state.
  *
  * @return {boolean} `true` if mute is active.
  */
  isMuted() {
    return this._mute;
  }

  /**
  * Send phone keypad presses (DTMF tones) on the active session.
  *
  * @param {string} digits String containing digits 0-9, *, or #.
  * @fires TelnyxCall#dtmf
  */
  sendDigits(digits) {
    if (!digits || !this._session) {
      return;
    }
    const handler = this._session.sessionDescriptionHandler || this._sessionDescriptionHandler;
    if (handler && typeof handler.sendDtmf === 'function' && handler.sendDtmf(digits)) {
      this.trigger("dtmf", null, digits);
      return;
    }
    if (typeof this._session.info !== 'function') {
      return;
    }
    const body = `Signal=${digits}\r\nDuration=160\r\n`;
    this._session.info({
      requestOptions: {
        body: {
          contentDisposition: "session",
          contentType: "application/dtmf-relay",
          body: body
        }
      }
    }).then(() => {
      this.trigger("dtmf", null, digits);
    }).catch(() => {});
  }

  /**
  * The "simple" call status.
  *
  * @return {string} One of `starting`, `initiating`, `connected`, or `ended`.
  */
  status() {
    return this._status;
  }

  /**
  * connecting event
  *
  * Fired when media acquisition succeeds and the session is establishing.
  *
  * @event TelnyxCall#connecting
  */

  /**
  * accepted event
  *
  * Fired when the remote party answers and the session becomes established.
  *
  * @event TelnyxCall#accepted
  * @type {Object}
  * @property {Object} response SIP.js response data.
  */

  /**
  * terminated event
  *
  * Fired when the call has fully ended, regardless of which side hung up.
  *
  * @event TelnyxCall#terminated
  */

  /**
  * failed event
  *
  * Fired when the call fails before connecting (transport errors, rejects, etc).
  *
  * @event TelnyxCall#failed
  * @type {Object}
  * @property {Object|Error} cause SIP.js response or Error explaining the failure.
  */

  /**
  * rejected event
  *
  * Fired when the call is rejected either locally (`reject()`) or by the far end.
  *
  * @event TelnyxCall#rejected
  * @type {Object}
  * @property {?Object} response SIP.js response payload when available.
  */

  /**
  * dtmf event
  *
  * Fired when DTMF digits are detected or sent.
  *
  * @event TelnyxCall#dtmf
  * @type {Object}
  * @property {?Object} info SIP.js INFO request object when received.
  * @property {string} digits Digits that were sent or received.
  */

  /**
  * muted event
  *
  * Fired when `mute(true)` successfully disables audio tracks.
  *
  * @event TelnyxCall#muted
  */

  /**
  * unmuted event
  *
  * Fired when `mute(false)` re-enables audio tracks.
  *
  * @event TelnyxCall#unmuted
  */

  /**
  * userMedia event
  *
  * Fired when the SIP.js SessionDescriptionHandler obtains a local media stream.
  *
  * @event TelnyxCall#userMedia
  * @type {Object}
  * @property {MediaStream} stream Local microphone stream.
  */

  /**
  * addStream event
  *
  * Fired when a remote media stream (or new track) is attached.
  *
  * @event TelnyxCall#addStream
  * @type {Object}
  * @property {MediaStream} stream Remote audio stream.
  */

  /**
  * dataChannel event
  *
  * Fired when a datachannel is negotiated on the peer connection.
  *
  * @event TelnyxCall#dataChannel
  * @type {RTCDataChannelEvent|RTCDataChannel}
  */

  /**
  * iceCandidate event
  *
  * Fired whenever a new ICE candidate is gathered.
  *
  * @event TelnyxCall#iceCandidate
  * @type {RTCIceCandidate}
  */

  /**
  * iceConnection event
  *
  * Fired with the current ICE connection state along with more granular helpers (`iceConnectionConnected`, etc).
  *
  * @event TelnyxCall#iceConnection
  * @type {string}
  */

  /**
  * iceGathering event
  *
  * Fired when ICE gathering begins, followed by `iceGatheringComplete` when done.
  *
  * @event TelnyxCall#iceGathering
  */

  /**
  * notify event
  *
  * Fired when an in-dialog SIP NOTIFY is received.
  *
  * @event TelnyxCall#notify
  * @type {Object}
  * @property {Object} notification SIP.js notification wrapper.
  */

  /**
  * refer event
  *
  * Fired when an in-dialog SIP REFER is received.
  *
  * @event TelnyxCall#refer
  * @type {Object}
  * @property {Object} referral SIP.js referral wrapper.
  */

  /**
  * cancel event
  *
  * Fired when an outbound call is canceled before being answered.
  *
  * @event TelnyxCall#cancel
  */

  /**
  * bye event
  *
  * Fired when the remote party hangs up.
  *
  * @event TelnyxCall#bye
  * @type {Object}
  * @property {Object} bye SIP.js Bye message.
  */
}
