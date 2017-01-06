import SIP  from 'sip.js';
import EventEmitter from 'es6-event-emitter';
import { TelnyxCall } from './lib/telnyx-call';

class TelnyxDevice extends EventEmitter {

  /**
  *
  */
  constructor(config) {
    super();
    if (!config || typeof(config) !== 'object') { throw new TypeError("TelnyxDevice: Missing config"); }
    if (!config.host) { throw new TypeError("TelnyxDevice: Missing 'host' parameter"); }
    if (!config.port) { throw new TypeError("TelnyxDevice: Missing 'port' parameter"); }

    this.config = config;

    this.host = config.host;
    this.port = config.port;
    this.wsServers = arrayify(config.wsServers);
    this.username = config.username;
    this.password = config.password;
    this.displayName = config.displayName || config.username;
    this.stunServers = arrayify(config.stunServers);
    this.turnServers = arrayify(config.turnServers);
    this.registrarServer = config.registrarServer;

    this._userAgent = null;
    this._getSIP();
  }

  authorize() {
    let uri = new this.SIP.URI("sip", this.username, this.host, this.port).toString();

    this._userAgent = new this.SIP.UA({
      uri: uri,
      wsServers: [this.wsServer],
      authorizationUser: this.username,
      password: this.password,
      displayName: this.displayName,
      stunServers: this.stunServers,
      turnServers: this.turnServers,
      registrarServer: this.registrarServer
    });
    this.trigger('Authorized');
  }

  initiateCall(phoneNumber) {
    let uri = new this.SIP.URI("sip", phoneNumber, this.host, this.port).toString();
    this._activeCall = new TelnyxCall(this._userAgent, uri);
    return this._activeCall;
  }

  activeCall() { return this._activeCall; }

  status() {}

  isReady() {
    return (this.userAgent) ? true : false;
  }

  // store a local reference to SIP library for manual dependency injection in tests
  _getSIP() {
    this.SIP = SIP;
  }

}

function arrayify(item) {
  if (Array.isArray(item)) {
    return item.slice(0); // Shallow Copy
  } else if (typeof(item) === 'string') {
    let arr = [];
    arr.push(item);
    return arr;
  } else {
    throw new TypeError (`TelnyxDevice: item should be an array or a string, it was ${typeof(item)}`);
  }
}


export { TelnyxDevice, TelnyxCall };
