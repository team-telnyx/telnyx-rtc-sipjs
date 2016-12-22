const EventEmitter = require('events');

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

  constructor(UA, phoneNumber, host, port) {
    super();
    this.host = host;
    this.port = port;
    this._mute = false;
    this._status = 'starting';
    this.UA = UA;

    this.UA.start();
    // scheme, user, host, port, parameters, headers
    this._session = UA.invite(new SIP.URI("sip", phoneNumber, this.host, this.port).toString(), inviteOptions);
    // listen to SIP.js events, use our own
    // EventEmitter to emit custom events
    this._session.on("connecting", () => {this.emit("connecting"); this._status = 'initiating';});
    this._session.on("progress", (response) => this.emit("progress", response));
    this._session.on("accepted", (data) => {this.emit("accepted", data),  this._status = 'connected';});


    this._session.on("dtmf", (request, dtmf) => this.emit("dtmf", request, dtmf));
    this._session.on("muted", (data) => this.emit("muted", data));
    this._session.on("unmuted", (data) => this.emit("unmuted", data));

    this._session.on("rejected", (response, cause)  => {this.emit("rejected", response, cause); this._status = 'ended'});
    this._session.on("failed", (response, cause)    => {this.emit("failed", response, cause); this._status = 'ended'});
    this._session.on("terminated", (message, cause) => {this.emit("terminated", message, cause); this._status = 'ended'});
    this._session.on("bye", () => {this.emit("bye"); this._status = 'ended'});
  }
  // accept() {}
  // reject() {}
  // ignore() {}

  disconnect() {
    if(this._status === 'connected') {
      this._session.bye();
    } else if (this._status === 'initiating') {
      this._session.cancel();
    }
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
