// import * as SIP from '../node_modules/sip.js/src/SIP.js';
const EventEmitter = require('events');

import { TelnyxCall } from './lib/telnyx-call';

class TelnyxDevice extends EventEmitter {

  constructor(ServerConfig, client) {
    super();
    this.ServerConfig = ServerConfig;
    this.client = client;
    this.host = ServerConfig.host;
    this.port = ServerConfig.port;
    this._userAgent = null;
  }

  authorize(accountName, authName, authPassword) {
    let uri = new SIP.URI("sip", this.client.username, this.host, this.port).toString();

    this._userAgent = new SIP.UA({
      uri: uri,
      wsServers: [this.ServerConfig.wsServer],
      authorizationUser: this.client.username,
      password: this.client.password,
      displayName: this.client.nickname,
      stunServers: [this.ServerConfig.stunServer],
      turnServers: [this.ServerConfig.turnServer],
      registrarServer: this.ServerConfig.registrarServer
    });
    this.emit('Authorized');
  }

  startup() {
    this._userAgent.start();
    this.emit('Ready');
  }

  shutdown() {
    this._userAgent.stop();
  }

  // connection() {}

  initiateCall(phoneNumber) {
    this._activeCall = new TelnyxCall(this._userAgent, phoneNumber, this.host, this.port);
    return this._activeCall;
  }

  activeCall() { return this._activeCall; }

  status() {}

  isReady() {
    return (this.userAgent) ? true : false;
  }
}

export { TelnyxDevice, TelnyxCall };