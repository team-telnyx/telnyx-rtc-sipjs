const EventEmitter = require('events');

import TelnyxCall from './telnyx-call';

export class TelnyxDevice extends EventEmitter {

  constructor(host, port) {
    super();
    this.host = host;
    this.port = port;
    this._userAgent = null;
  }

  authorize(accountName, authName, authPassword) {
    let uri = new SIP.URI("sip", accountName, this.host, this.port).toString();

    this._userAgent = new SIP.UA({
      uri: uri,
      wsServers: ['wss://sip-ws.example.com'],
      authorizationUser: authName,
      password: authPassword
    });
    this.emit('Authorized');
  }

  startup() {
    this.emit('Ready');
  }

  shutdown() {}

  connection() {}

  initiateCall(phoneNumber) {
    this._activeCall = new TelnyxCall(this._userAgent, phoneNumber);
    return this._activeCall;
  }

  activeCall() { return this._activeCall; }

  status() {}

  isReady() {
    return (this.userAgent) ? true : false;
  }
}