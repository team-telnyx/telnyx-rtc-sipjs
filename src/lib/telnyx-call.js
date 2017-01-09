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

  constructor(UA, inviteUri) {
    super();
    this._mute = false;
    this._status = 'starting';
    this.UA = UA;

    this.UA.start();
    this._session = UA.invite(inviteUri, inviteOptions);

    // listen to SIP.js events, use our own
    // EventEmitter to emit custom events
    this._session.on("connecting", () => {this.trigger("connecting"); this._status = 'initiating';});
    this._session.on("progress", (response) => this.trigger("progress", response));
    this._session.on("accepted", (data) => {this.trigger("accepted", data),  this._status = 'connected';});


    this._session.on("dtmf", (request, dtmf) => this.trigger("dtmf", request, dtmf));
    this._session.on("muted", (data) => this.trigger("muted", data));
    this._session.on("unmuted", (data) => this.trigger("unmuted", data));

    this._session.on("cancel", ()  => {this.trigger("cancel"); this._status = 'ended'});
    this._session.on("refer", (callback, response, newSession)  => {this.trigger("rejected");});
    this._session.on("replaced", (newSession)  => {this.trigger("rejected", newSession);});

    this._session.on("rejected", (response, cause)  => {this.trigger("rejected", response, cause); this._status = 'ended'});
    this._session.on("failed", (response, cause)    => {this.trigger("failed", response, cause); this._status = 'ended'});
    this._session.on("terminated", (message, cause) => {this.trigger("terminated", message, cause); this._status = 'ended';});
    this._session.on("bye", () => {this.trigger("bye"); this._status = 'ended'});

    this._session.mediaHandler.on("userMediaRequest", (constraints) => {this.trigger("userMediaRequest", constraints);});
    this._session.mediaHandler.on("userMedia", (stream) => {this.trigger("userMedia", stream);});
    this._session.mediaHandler.on("userMediaFailed", (error) => {this.trigger("userMediaFailed", error);});
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

  disconnect() {
    this._session.terminate();
  }

  shutdown() {
    this.UA.stop();
  }

  mute(isMute /*bool*/) {
    this._mute = isMute;
    if(this._mute) {
      this._session.mute();
    } else {
      this._session.unmute();
    }
  }

  isMuted() {
    return this._mute;
  }

  sendDigits(digits) {
    this._session.dtmf(digits);
  }

  status() {
    return this._status;
  }
}
