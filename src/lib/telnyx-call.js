import EventEmitter from 'es6-event-emitter';

const inviteOptions = {
  media: {
    constraints: {
      audio: true,
      video: false
    },
    render: {}
  }
};

export class TelnyxCall extends EventEmitter {

  /**
  * Create a TelnyxCall. Normally created by TelnyxDevice.
  *
  * Once a call is created, you can either make a call with `makeCall()`
  * or set yourself up to recieve an incoming call with `incomingCall()`
  *
  * @param {UA} UA - A SIP.js User Agent
  * @param {String} inviteUri - A Properly formatted SIP.js invite URI (create with SIP.URI)
  *
  * @emits TelnyxCall#connecting
  */
  constructor(UA) {
    super();
    this._mute = false;
    this._status = 'starting';
    this._callType = '';
    this.UA = UA;

    this.UA.start();
  }

  /**
  * Make a call to a phone number
  *
  * @param {URI} inviteUri - A SIP.js URI that includes the phone number to connect to
  */
  makeCall(inviteUri) {
    this._callType = 'outgoing';
    this._session = this.UA.invite(inviteUri, inviteOptions);
    this._attatchSessionEvents();
  }

  /**
  * Set up to handle an incoming call.
  * The calling function will then be able to accept or reject the call.
  *
  * @param {Session} session - A SIP.js Session, specifically of the SIP.ServerContext type
  */
  incomingCall(session) {
    this._callType = 'incoming';
    this._session = session;
    this._attatchSessionEvents();
  }


  _attatchSessionEvents() {
    /**
    * connecting event:
    *
    * Fired as the system starts to make the connection.
    * This is after the userMedia (microphone) has been aquired.
    *
    * @event TelnyxCall#connecting
    * @type {object}
    */
    this._session.on("connecting", () => {this.trigger("connecting"); this._status = 'initiating';});

    /**
    * progress event:
    *
    * Usually fired twice during call intialization, once for TRYING and once for RINGING.
    *
    * @event TelnyxCall#progress
    * @type {object}
    * @property {object} response - Details of the response
    */
    this._session.on("progress", (response) => this.trigger("progress", response));

    /**
    * accepted event:
    *
    * Fired when the call was accepted by the callee. The call is now connected.
    *
    * @event TelnyxCall#accepted
    * @type {object}
    * @property {object} data - Details of the response
    */
    this._session.on("accepted", (data) => {this.trigger("accepted", data),  this._status = 'connected';});

    /**
    * dtmf event:
    *
    * Sent when the user has successfully sent a DTMF (keypad) signal.
    *
    * @event TelnyxCall#dtmf
    * @type {object}
    * @property {object} request - Details of the request
    * @property {string} dtmf - the key(s) that were submitted
    */
    this._session.on("dtmf", (request, dtmf) => this.trigger("dtmf", request, dtmf));

    /**
    * muted event:
    *
    * Fired when the system has successfully responded to a mute request.
    *
    * @event TelnyxCall#muted
    * @type {object}
    * @property {object} data - Details of the response
    */
    this._session.on("muted", (data) => this.trigger("muted", data));

    /**
    * unmuted event
    *
    * Fired when the system has successfully responded to an unmute request.
    *
    * @event TelnyxCall#unmuted
    * @type {object}
    * @property {object} data - Details of the response
    */
    this._session.on("unmuted", (data) => this.trigger("unmuted", data));

    /**
    * cancel event:
    *
    * Fired when the call was terminated before end to end connection was established,
    * usually by the user's request.
    *
    * @event TelnyxCall#cancel
    */
    this._session.on("cancel", ()  => {this.trigger("cancel"); this._status = 'ended'});

    /**
    * refer event
    *
    * @event TelnyxCall#refer
    * @property {function} callback
    * @property {object} response
    * @property {object} newSession
    */
    this._session.on("refer", (callback, response, newSession)  => {this.trigger("rejected");});

    /**
    * replaced event
    *
    * @event TelnyxCall#replaced
    * @property {object} newSession
    */
    this._session.on("replaced", (newSession)  => {this.trigger("rejected", newSession);});

    /**
    * rejected event
    *
    * @event TelnyxCall#rejected
    * @property {object} response
    * @property {object} cause
    */
    this._session.on("rejected", (response, cause)  => {this.trigger("rejected", response, cause); this._status = 'ended'});

    /**
    * failed event
    *
    * @event TelnyxCall#failed
    * @property {object} response
    * @property {object} cause
    */
    this._session.on("failed", (response, cause)    => {this.trigger("failed", response, cause); this._status = 'ended'});

    /**
    * terminated event
    *
    * @event TelnyxCall#terminated
    * @property {object} response
    * @property {object} cause
    */
    this._session.on("terminated", (message, cause) => {this.trigger("terminated", message, cause); this._status = 'ended';});

    /**
    * bye event
    *
    * @event TelnyxCall#bye
    */
    this._session.on("bye", () => {this.trigger("bye"); this._status = 'ended'});

    /**
    * userMediaRequest event:
    *
    * Fired when the every time the system checks to see if it has microphone permission from the user.
    * You can use this to detect when the browser's "Allow website to use microphone" dialog is open,
    * but you will need to be somewhat careful. This event will fire even if the user already has
    * given permission, then will be immediately followed by a {@link TelnyxCall#userMedia} event.
    * If you wish to have your UI display some sort of "asking for permission" element, you may need to
    * debounce this event; listening for {@link TelnyxCall#userMedia} to cancel your UI update.
    *
    * @event TelnyxCall#userMediaRequest
    * @property {object} constraints
    */
    this._session.mediaHandler.on("userMediaRequest", (constraints) => {this.trigger("userMediaRequest", constraints);});

    /**
    * userMedia event:
    *
    * Fired when the system has aquired permission to use the microphone. This will happen either
    * immediately after {@link TelnyxCall#userMediaRequest} if the user has previously given permission
    * or after the user approves the request.
    *
    * @event TelnyxCall#userMedia
    * @property {object} stream
    */
    this._session.mediaHandler.on("userMedia", (stream) => {this.trigger("userMedia", stream);});

    /**
    * userMediaFailed event:
    *
    * Fired when the user refuses permission to use the microphone. There is no way back from this
    * except for the user to go into browser settings and remove the exception for your site.
    *
    * @event TelnyxCall#userMediaFailed
    * @property {object} error
    */
    this._session.mediaHandler.on("userMediaFailed", (error) => {this.trigger("userMediaFailed", error);});

    /**
    * iceGathering event
    *
    * @event TelnyxCall#iceGathering
    */
    this._session.mediaHandler.on("iceGathering", () => {this.trigger("iceGathering");});

    /**
    * iceCandidate event
    *
    * @event TelnyxCall#iceCandidate
    * @property {object} candidate
    */
    this._session.mediaHandler.on("iceCandidate", (candidate) => {this.trigger("iceCandidate", candidate);});

    /**
    * iceGatheringComplete event
    *
    * @event TelnyxCall#iceGatheringComplete
    */
    this._session.mediaHandler.on("iceGatheringComplete", () => {this.trigger("iceGatheringComplete");});

    /**
    * iceConnection event
    *
    * @event TelnyxCall#iceConnection
    */
    this._session.mediaHandler.on("iceConnection", () => {this.trigger("iceConnection");});

    /**
    * iceConnectionChecking event
    *
    * @event TelnyxCall#iceConnectionChecking
    */
    this._session.mediaHandler.on("iceConnectionChecking", () => {this.trigger("iceConnectionChecking");});

    /**
    * iceConnectionConnected event
    *
    * @event TelnyxCall#iceConnectionConnected
    */
    this._session.mediaHandler.on("iceConnectionConnected", () => {this.trigger("iceConnectionConnected");});

    /**
    * iceConnectionCompleted event
    *
    * @event TelnyxCall#iceConnectionCompleted
    */
    this._session.mediaHandler.on("iceConnectionCompleted", () => {this.trigger("iceConnectionCompleted");});

    /**
    * iceConnectionFailed event
    *
    * @event TelnyxCall#iceConnectionFailed
    */
    this._session.mediaHandler.on("iceConnectionFailed", () => {this.trigger("iceConnectionFailed");});

    /**
    * iceConnectionDisconnected event
    *
    * @event TelnyxCall#iceConnectionDisconnected
    */
    this._session.mediaHandler.on("iceConnectionDisconnected", () => {this.trigger("iceConnectionDisconnected");});

    /**
    * iceConnectionClosed event
    *
    * @event TelnyxCall#iceConnectionClosed
    */
    this._session.mediaHandler.on("iceConnectionClosed", () => {this.trigger("iceConnectionClosed");});

    /**
    * getDescription event
    *
    * @event TelnyxCall#getDescription
    * @property {object} sdpWrapper
    */
    this._session.mediaHandler.on("getDescription", (sdpWrapper) => {this.trigger("getDescription", sdpWrapper);});

    /**
    * setDescription event
    *
    * @event TelnyxCall#setDescription
    * @property {object} sdpWrapper
    */
    this._session.mediaHandler.on("setDescription", (sdpWrapper) => {this.trigger("setDescription", sdpWrapper);});

    /**
    * dataChannel event
    *
    * @event TelnyxCall#dataChannel
    * @property {object} dataChannel
    */
    this._session.mediaHandler.on("dataChannel", (dataChannel) => {this.trigger("dataChannel", dataChannel);});

    /**
    * addStream event
    *
    * @event TelnyxCall#addStream
    * @property {object} stream
    */
    this._session.mediaHandler.on("addStream", (stream) => {this.trigger("addStream", stream);});

  }


  accept() {
    if (this._callType !== 'incoming') {
      console.error("accept() method is only valid on incoming calls");
      return;
    }
    this._session.accept();
  }

  reject() {
    if (this._callType !== 'incoming') {
      console.error("accept() method is only valid on incoming calls");
      return;
    }
    this._session.reject();
  }

  /**
  * Is the call still initiating?
  *
  * @return {Boolean} isInitiating
  */
  isInitiating() {
    return this._status === 'initiating';
  }

  /**
  * Has the call connected?
  *
  * @return {Boolean} isConnected
  */
  isConnected() {
    return this._status === 'connected';
  }

  /**
  * Has the call ended?
  *
  * @return {Boolean} isEnded
  */
  isEnded() {
    return this._status === 'ended';
  }

  /**
  * Is this an incoming call?
  *
  * @return {Boolean} isIncoming
  */
  isIncoming() {
    return this._callType === 'incoming';
  }

  /**
  * Is this an outgoing call?
  *
  * @return {Boolean} isOutgoing
  */
  isOutgoing() {
    return this._callType === 'outgoing';
  }

  /**
  * End the session
  *
  * @emits TelnyxCall#terminated
  */
  disconnect() {
    this._session.terminate();
  }

  /**
  * Shutdown the connection to the WebRTC servers
  * @deprecated Please use TelnyxDevice.stopWS instead.
  */
  shutdown() {
    this.UA.stop();
  }

  /**
  * Toggle mute
  *
  * @param {boolean} isMute - if true you want mute to be ON
  */
  mute(isMute /*bool*/) {
    this._mute = isMute;
    if(this._mute) {
      this._session.mute();
    } else {
      this._session.unmute();
    }
  }

  /**
  * Current mute state
  *
  * @return {boolean} true if call is on mute
  */
  isMuted() {
    return this._mute;
  }

  /**
  * Send phone keypad presses (DTMF tones)
  *
  * Used after the call is in progress.
  *
  * @param {string} digits - a string containg digits 0-9, *, #
  * @emits TelnyxCall#dtmf
  */
  sendDigits(digits) {
    this._session.dtmf(digits);
  }

  /**
  * The "simple" status.
  *
  * All of the many phases of the call boiled down into 3 states: Initiating, Connected and Ended.
  *
  * @return {string} one of initiating, connected, ended
  */
  status() {
    return this._status;
  }
}
