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

/**
* Class represeting an ongoing phone call.
*/
export class TelnyxCall extends EventEmitter {

  /**
  * Create a TelnyxCall. Normally created by TelnyxDevice.
  *
  * @param {UA} UA - A SIP.js User Agent
  * @param {String} inviteUri - A Properly formatted SIP.js invite URI (create with SIP.URI)
  *
  * @emits TelnyxCall#connecting
  *
  */
  constructor(UA, inviteUri) {
    super();
    this._mute = false;
    this._status = 'starting';
    this.UA = UA;

    this.UA.start();
    this._session = UA.invite(inviteUri, inviteOptions);

    /**
    * Connecting event
    *
    * @event TelnyCall#connecting
    */
    this._session.on("connecting", () => {this.trigger("connecting"); this._status = 'initiating';});

    /**
    * progress event
    *
    * Usually fired twice during call intialization
    *
    * @event TelnyCall#progress
    * @property {object} response - Details of the response
    */
    this._session.on("progress", (response) => this.trigger("progress", response));

    /**
    * accepted event
    *
    * @event TelnyCall#accepted
    * @property {object} data - Details of the response
    */
    this._session.on("accepted", (data) => {this.trigger("accepted", data),  this._status = 'connected';});

    /**
    * dtmf event
    *
    * @event TelnyCall#dtmf
    * @property {object} request - Details of the request
    * @property {string} dtmf - the key(s) that were submitted
    */
    this._session.on("dtmf", (request, dtmf) => this.trigger("dtmf", request, dtmf));

    /**
    * muted event
    *
    * @event TelnyCall#muted
    * @property {object} data - Details of the response
    */
    this._session.on("muted", (data) => this.trigger("muted", data));

    /**
    * unmuted event
    *
    * @event TelnyCall#unmuted
    * @property {object} data - Details of the response
    */
    this._session.on("unmuted", (data) => this.trigger("unmuted", data));

    /**
    * cancel event
    *
    * @event TelnyCall#cancel
    */
    this._session.on("cancel", ()  => {this.trigger("cancel"); this._status = 'ended'});

    /**
    * cancel event
    *
    * @event TelnyCall#refer
    * @property {function} callback
    * @property {object} response
    * @property {object} newSession
    */
    this._session.on("refer", (callback, response, newSession)  => {this.trigger("rejected");});

    /**
    * replaced event
    *
    * @event TelnyCall#replaced
    * @property {object} newSession
    */
    this._session.on("replaced", (newSession)  => {this.trigger("rejected", newSession);});

    /**
    * rejected event
    *
    * @event TelnyCall#rejected
    * @property {object} response
    * @property {object} cause
    */
    this._session.on("rejected", (response, cause)  => {this.trigger("rejected", response, cause); this._status = 'ended'});

    /**
    * failed event
    *
    * @event TelnyCall#failed
    * @property {object} response
    * @property {object} cause
    */
    this._session.on("failed", (response, cause)    => {this.trigger("failed", response, cause); this._status = 'ended'});

    /**
    * terminated event
    *
    * @event TelnyCall#terminated
    * @property {object} response
    * @property {object} cause
    */
    this._session.on("terminated", (message, cause) => {this.trigger("terminated", message, cause); this._status = 'ended';});

    /**
    * bye event
    *
    * @event TelnyCall#bye
    */
    this._session.on("bye", () => {this.trigger("bye"); this._status = 'ended'});

    /**
    * userMediaRequest event
    *
    * @event TelnyCall#userMediaRequest
    * @property {object} constraints
    */
    this._session.mediaHandler.on("userMediaRequest", (constraints) => {this.trigger("userMediaRequest", constraints);});

    /**
    * userMedia event
    *
    * @event TelnyCall#userMedia
    * @property {object} stream
    */
    this._session.mediaHandler.on("userMedia", (stream) => {this.trigger("userMedia", stream);});

    /**
    * userMediaFailed event
    *
    * @event TelnyCall#userMediaFailed
    * @property {object} error
    */
    this._session.mediaHandler.on("userMediaFailed", (error) => {this.trigger("userMediaFailed", error);});

    /**
    * iceGathering event
    *
    * @event TelnyCall#iceGathering
    */
    this._session.mediaHandler.on("iceGathering", () => {this.trigger("iceGathering");});

    /**
    * iceCandidate event
    *
    * @event TelnyCall#iceCandidate
    * @property {object} candidate
    */
    this._session.mediaHandler.on("iceCandidate", (candidate) => {this.trigger("iceCandidate", candidate);});

    /**
    * iceGatheringComplete event
    *
    * @event TelnyCall#iceGatheringComplete
    */
    this._session.mediaHandler.on("iceGatheringComplete", () => {this.trigger("iceGatheringComplete");});

    /**
    * iceConnection event
    *
    * @event TelnyCall#iceConnection
    */
    this._session.mediaHandler.on("iceConnection", () => {this.trigger("iceConnection");});

    /**
    * iceConnectionChecking event
    *
    * @event TelnyCall#iceConnectionChecking
    */
    this._session.mediaHandler.on("iceConnectionChecking", () => {this.trigger("iceConnectionChecking");});

    /**
    * iceConnectionConnected event
    *
    * @event TelnyCall#iceConnectionConnected
    */
    this._session.mediaHandler.on("iceConnectionConnected", () => {this.trigger("iceConnectionConnected");});

    /**
    * iceConnectionCompleted event
    *
    * @event TelnyCall#iceConnectionCompleted
    */
    this._session.mediaHandler.on("iceConnectionCompleted", () => {this.trigger("iceConnectionCompleted");});

    /**
    * iceConnectionFailed event
    *
    * @event TelnyCall#iceConnectionFailed
    */
    this._session.mediaHandler.on("iceConnectionFailed", () => {this.trigger("iceConnectionFailed");});

    /**
    * iceConnectionDisconnected event
    *
    * @event TelnyCall#iceConnectionDisconnected
    */
    this._session.mediaHandler.on("iceConnectionDisconnected", () => {this.trigger("iceConnectionDisconnected");});

    /**
    * iceConnectionClosed event
    *
    * @event TelnyCall#iceConnectionClosed
    */
    this._session.mediaHandler.on("iceConnectionClosed", () => {this.trigger("iceConnectionClosed");});

    /**
    * getDescription event
    *
    * @event TelnyCall#getDescription
    * @property {object} sdpWrapper
    */
    this._session.mediaHandler.on("getDescription", (sdpWrapper) => {this.trigger("getDescription", sdpWrapper);});

    /**
    * setDescription event
    *
    * @event TelnyCall#setDescription
    * @property {object} sdpWrapper
    */
    this._session.mediaHandler.on("setDescription", (sdpWrapper) => {this.trigger("setDescription", sdpWrapper);});

    /**
    * dataChannel event
    *
    * @event TelnyCall#dataChannel
    * @property {object} dataChannel
    */
    this._session.mediaHandler.on("dataChannel", (dataChannel) => {this.trigger("dataChannel", dataChannel);});

    /**
    * addStream event
    *
    * @event TelnyCall#addStream
    * @property {object} stream
    */
    this._session.mediaHandler.on("addStream", (stream) => {this.trigger("addStream", stream);});

  }
  // accept() {}
  // reject() {}
  // ignore() {}

  isInitiating() {
    return this._status === 'initiating';
  }
  isConnected() {
    return this._status === 'connected';
  }
  isEnded() {
    return this._status === 'ended';
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
  * The "simple" status
  *
  * @return {string} one of initiating, connected, ended
  */
  status() {
    return this._status;
  }
}
