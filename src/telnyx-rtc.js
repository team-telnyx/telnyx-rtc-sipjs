import SIP  from 'sip.js';
import EventEmitter from 'es6-event-emitter';
import { TelnyxCall } from './lib/telnyx-call';

/**
* Represents the software phone running in a web browser or other context.
*/
class TelnyxDevice extends EventEmitter {

  /**
  * Create a new TelnyxDevice.
  *
  * @param {Object} config Configuration Object
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
    this.turnServers = config.turnServers;
    this.registrarServer = config.registrarServer;

    this._userAgent = null;
  }

  /**
  * Connect to SIP server
  */
  authorize() {
    let uri = new SIP.URI("sip", this.username, this.host, this.port).toString();

    this._userAgent = new SIP.UA({
      uri: uri,
      wsServers: this.wsServers,
      authorizationUser: this.username,
      password: this.password,
      displayName: this.displayName,
      stunServers: this.stunServers,
      turnServers: this.turnServers,
      registrarServer: this.registrarServer
    });
    this.trigger('Authorized');
  }

  /**
  * Make a phone call
  *
  * @param {String} phoneNumber The desination phone number to connect to
  * @return {Object} TelnyxCall
  */
  initiateCall(phoneNumber) {
    let uri = new SIP.URI("sip", phoneNumber, this.host, this.port).toString();
    this._activeCall = new TelnyxCall(this._userAgent, uri);
    return this._activeCall;
  }


  activeCall() { return this._activeCall; }

  // status() {}

  // isReady() {
  //   return (this.userAgent) ? true : false;
  // }
}

function arrayify(item) {
  if (Array.isArray(item)) {
    return item.slice(0); // Shallow Copy
  } else {
    let arr = [];
    arr.push(item);
    return arr;
  }
}


export { TelnyxDevice, TelnyxCall };
