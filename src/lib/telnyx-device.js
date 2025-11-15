import { Inviter, Registerer, RegistererState, UserAgent, Web } from 'sip.js';
import EventEmitter from 'es6-event-emitter';
import { TelnyxCall } from './telnyx-call';

/**
* Represents the software phone running in a web browser or other context.
*
* @class
*/
class TelnyxDevice extends EventEmitter {

  /**
  * Create a new TelnyxDevice.
  *
  * @param {Object} config Configuration Object
  * @param {String} config.host The host name or IP address of the SIP server
  * @param {String} config.port The port of the SIP server
  * @param {String} config.wsServers URI(s) of the WebSocket Servers. Format `wss://123.0.0.0:5066`. An array of strings is also accepted.
  * @param {String} config.username The username for the SIP server
  * @param {String} config.password The passweord for the SIP server
  * @param {String} config.displayName The human readable name passed in the from field. Will be used for Caller ID
  * @param {String} config.stunServers URI(s) for how to connect to the STUN servers. Format `stun:stun.telnyx.com:8000`. An array of strings is also accepted.
  * @param {Object} config.turnServers Details for how to connect to the TURN servers. An array of objects is also accepted.
  * @param {String} config.turnServers.urls URI(s) for the TURN server(s). Format `turn:turn.telnyx.com:8000?transport=tcp`. An array of strings is also accepted.
  * @param {String} config.turnServers.username Username to authenticate on TURN server(s)
  * @param {String} config.turnServers.password Password to authenticate on TURN server(s)
  * @param {String} config.registrarServer URI for the registrar Server. Format `sip:123.0.0.0:5066`
  * @param {Boolean} config.traceSip If true, SIP traces will be logged to the dev console.
  * @param {String} config.logLevel One of "debug", "log", "warn", "error", "off".  default is "log"

  */
  constructor(config, dependencies = {}) {
    super();
    if (!config || typeof(config) !== 'object') { throw new TypeError("TelnyxDevice: Missing config"); }
    if (!config.host) { throw new TypeError("TelnyxDevice: Missing 'host' parameter"); }
    if (!config.port) { throw new TypeError("TelnyxDevice: Missing 'port' parameter"); }

    this.config = config;

    // Allow dependency injection for testing
    this._UserAgent = dependencies.UserAgent || UserAgent;
    this._Registerer = dependencies.Registerer || Registerer;
    this._Inviter = dependencies.Inviter || Inviter;
    this._Web = dependencies.Web || Web;

    this.host = config.host;
    this.port = config.port;
    this.wsServers = arrayify(config.wsServers).filter(Boolean);
    this._transportServers = this._buildTransportServerList();
    this._currentTransportIndex = 0;
    this._activeTransportServer = this._transportServers[0];
    this.username = config.username;
    this.password = config.password;
    this.displayName = config.displayName || config.username;
    this.stunServers = arrayify(config.stunServers).filter(Boolean);
    this.turnServers = config.turnServers;
    this.registrarServer = config.registrarServer;

    this._wsAttempts = 0;
    this._startPromise = null;
    this._userAgent = null;
    this._registerer = null;
    this._activeCall = null;

    this._ensureConnectivityWithSipServer();

    const userUri = this._buildUserUri();
    const transportOptions = this._buildTransportOptions(config);
    const sdhFactoryOptions = this._buildSessionDescriptionHandlerOptions();
    const userAgentOptions = {
      uri: userUri,
      authorizationPassword: this.password,
      authorizationUsername: this.username,
      displayName: this.displayName,
      sessionDescriptionHandlerFactory: this._Web.defaultSessionDescriptionHandlerFactory(),
      sessionDescriptionHandlerFactoryOptions: sdhFactoryOptions,
      transportOptions: transportOptions,
      reconnectionAttempts: this._resolveReconnectionAttempts(config),
      reconnectionDelay: this._resolveReconnectionDelay(config)
    };

    if (config.logLevel) {
      if (config.logLevel === "off") {
        userAgentOptions.logBuiltinEnabled = false;
      } else {
        userAgentOptions.logLevel = config.logLevel;
      }
    }

    this._userAgent = new this._UserAgent(userAgentOptions);
    this._setActiveTransportServer(this._activeTransportServer);
    this._userAgent.delegate = this._createUserAgentDelegate();

    const registererOptions = this._buildRegistererOptions();
    this._registerer = new this._Registerer(this._userAgent, registererOptions);
    this._registerer.stateChange.addListener((state) => this._handleRegistererState(state));
  }

  /**
  * Start the connection to the WebSocket server, and restore the previous state if stopped.
  * You need to start the WebSocket connection before you can send or receive calls. If you
  * try to `initiateCall` without first starting the connection, it will be started for you,
  * but it will not be stopped when the call is terminated.
  *
  * @fires TelnyxDevice#wsConnecting
  * @return {Promise<void>} Resolves when the underlying UserAgent transport is running.
  */
  startWS() {
    return this._startTransport(false);
  }

  /**
  * Stop the connection to the WebSocket server, saving the state so it can be restored later
  * (by `start`).
  *
  * @return {Promise<void>} Resolves when the transport has been torn down.
  */
  stopWS() {
    return this._userAgent.stop();
  }

  /**
  * Status of the WebSocket connection
  *
  * @return {Boolean} isConnected `true` if the device is connected to the WebSocket server, `false` otherwise
  */
  isWSConnected() {
    return this._userAgent.isConnected();
  }

  /**
  * Register the device with the SIP server so that it can receive incoming calls.
  *
  * @param {Object} options
  * @param {String[]} options.extraHeaders SIP headers that will be added to each REGISTER request. Each header is string in the format `"X-Header-Name: Header-value"`.
  * @emits TelnyxDevice#registered
  * @return {Promise<void>} Resolves after the REGISTER transaction is sent.
  */
  register(options = {}) {
   const normalizedOptions = this._prepareRegisterOptions(options);
   return this._ensureTransportIsStarted().then(() => {
     return this._registerer.register(normalizedOptions);
   }).catch((error) => {
     this._emitRegistrationFailure(error, null);
     throw error;
   });
  }

  /**
  * Unregister the device from the SIP server; it will no longer recieve incoming calls.
  *
  * @param {Object} options
  * @param {Boolean} options.all [Optional] - if set & `true` it will unregister *all* bindings for the SIP user.
  * @param {String[]} options.extraHeaders SIP headers that will be added to each REGISTER request. Each header is string in the format `"X-Header-Name: Header-value"`.
  * @emits TelnyxDevice#unregistered
  * @return {Promise<void>} Resolves when the REGISTER request has been sent.
  */
  unregister(options = {}) {
   const normalizedOptions = this._normalizeRegisterOptions(options);
   return this._ensureTransportIsStarted().then(() => this._registerer.unregister(normalizedOptions));
  }

  /**
  * Status of SIP registration
  *
  * @return {Boolean} isRegistered `true` if the device is registered with the SIP Server, `false` otherwise
  */
  isRegistered() {
   return !!this._registerer && this._registerer.state === RegistererState.Registered;
  }

  /**
  * Make a phone call
  *
  * @param {String} phoneNumber The desination phone number to connect to. Just digits, no punctuation. Example `"12065551111"`.
  * @return {TelnyxCall} activeCall Keep an eye on the call's state by listening to events emitted by activeCall
  * @throws {TypeError} If the destination cannot be converted into a SIP URI.
  */
  initiateCall(phoneNumber) {
    const targetUri = this._buildTargetUri(phoneNumber);
    if (!targetUri) {
      throw new TypeError("TelnyxDevice: Invalid destination");
    }
    const inviter = new this._Inviter(this._userAgent, targetUri, {
      sessionDescriptionHandlerOptions: this._buildSessionDescriptionHandlerMediaConstraints()
    });
    this._activeCall = new TelnyxCall(inviter);
    const activeCall = this._activeCall;
    this._ensureTransportIsStarted().then(() => {
      return activeCall.makeCall();
    }).catch((error) => {
      if (activeCall) {
        activeCall.trigger("failed", {cause: error});
      }
    });
    return this._activeCall;
  }

  /**
  * Get a reference to the call currently in progress
  *
  * @return {?TelnyxCall} activeCall Keep an eye on the call's state by listening to events emitted by activeCall
  */
  activeCall() { return this._activeCall; }

  /**
  * wsConnecting event
  *
  * Fired when the device attempts to connect to the WebSocket server.
  * If the connection drops, TelnyxDevice will try to reconnect and this event will fire again.
  *
  * @event TelnyxDevice#wsConnecting
  * @type {Object}
  * @property {number} attempts Total number of connection attempts made so far.
  */

  /**
  * wsConnected event
  *
  * Fired when the WebSocket connection has been established.
  *
  * @event TelnyxDevice#wsConnected
  */

  /**
  * wsDisconnected event
  *
  * Fired when the WebSocket connection drops unexpectedly.
  *
  * @event TelnyxDevice#wsDisconnected
  * @type {Object}
  * @property {?Error} error Transport error, if the disconnect was caused by one.
  */

  /**
  * registered event
  *
  * Fired when the device has been successfully registered to receive calls.
  *
  * @event TelnyxDevice#registered
  */

  /**
  * unregistered event
  *
  * Fired as the result of a call to `unregister()` or when a periodic re-registration fails.
  *
  * @event TelnyxDevice#unregistered
  * @type {Object}
  * @property {?Object} cause `null` if `unregister()` was called, otherwise the failure cause object.
  * @property {?Object} response The SIP response that caused the unregistration, if available.
  */

  /**
  * registrationFailed event
  *
  * Fired when a registration attempt fails permanently (for example the Registerer enters the `Terminated` state).
  *
  * @event TelnyxDevice#registrationFailed
  * @type {Object}
  * @property {Object|Error} cause Details about the failure cause.
  * @property {?Object} response Underlying SIP response, when available.
  */

  /**
  * incomingInvite event
  *
  * Fired when an INVITE is received. A TelnyxCall instance is supplied so the caller can accept or reject the call.
  *
  * @event TelnyxDevice#incomingInvite
  * @type {Object}
  * @property {TelnyxCall} activeCall The TelnyxCall wrapping the incoming SIP session.
  */

  /**
  * message event
  *
  * Fired when the device receives an out-of-dialog SIP MESSAGE.
  *
  * @event TelnyxDevice#message
  * @type {Object}
  * @property {Object} message SIP.js message wrapper including a request/response handle.
  */
  _createUserAgentDelegate() {
    return {
      onConnect: () => { this.trigger("wsConnected"); },
      onDisconnect: (error) => {
        this.trigger("wsDisconnected", {error: error || null});
        this._handleTransportDisconnect(error);
      },
      onInvite: (invitation) => { this._handleIncomingInvitation(invitation); },
      onMessage: (message) => { this.trigger("message", {message: message}); }
    };
  }

  _handleRegistererState(state) {
    if (state === RegistererState.Registered) {
      this.trigger("registered");
    } else if (state === RegistererState.Unregistered) {
      this.trigger("unregistered", {cause: null, response: null});
    } else if (state === RegistererState.Terminated) {
      this.trigger("unregistered", {cause: "terminated", response: null});
    }
  }

  _handleIncomingInvitation(invitation) {
    this._activeCall = new TelnyxCall(invitation);
    this._activeCall.incomingCall();
    this.trigger("incomingInvite", {activeCall: this._activeCall});
  }

  _buildUserUri() {
    const uri = this._UserAgent.makeURI(`sip:${this.username}@${this.host}:${this.port}`);
    if (!uri) {
      throw new TypeError("TelnyxDevice: Unable to create SIP URI");
    }
    return uri;
  }

  _buildTargetUri(destination) {
    if (!destination) {
      return null;
    }
    return this._UserAgent.makeURI(`sip:${destination}@${this.host}:${this.port}`);
  }

  _buildTransportOptions(config) {
    const options = { server: this._activeTransportServer };
    if (config.traceSip) {
      options.traceSip = true;
    }
    return options;
  }

  _buildSessionDescriptionHandlerOptions() {
    const iceServers = [];
    this.stunServers.forEach((server) => {
      iceServers.push({urls: server});
    });
    if (this.turnServers) {
      const turnEntries = arrayify(this.turnServers);
      turnEntries.forEach((turn) => {
        if (!turn) {
          return;
        }
        if (typeof turn === "string") {
          iceServers.push({urls: turn});
          return;
        }
        if (!turn.urls) {
          return;
        }
        iceServers.push({
          urls: turn.urls,
          username: turn.username,
          credential: turn.password
        });
      });
    }
    return {peerConnectionConfiguration: {iceServers: iceServers}};
  }

  _buildSessionDescriptionHandlerMediaConstraints() {
    return {constraints: {audio: true, video: false}};
  }

  _buildRegistererOptions() {
    const options = {};
    if (this.registrarServer) {
      const registrarUri = this._UserAgent.makeURI(this.registrarServer);
      if (registrarUri) {
        options.registrar = registrarUri;
      }
    }
    return options;
  }

  _normalizeRegisterOptions(options = {}) {
    const normalized = Object.assign({}, options);
    if (options.requestOptions) {
      normalized.requestOptions = Object.assign({}, options.requestOptions);
    }
    if (options.requestDelegate) {
      normalized.requestDelegate = Object.assign({}, options.requestDelegate);
    }
    if (options.extraHeaders) {
      normalized.requestOptions = normalized.requestOptions || {};
      normalized.requestOptions.extraHeaders = options.extraHeaders;
      delete normalized.extraHeaders;
    }
    return normalized;
  }

  _prepareRegisterOptions(options = {}) {
    const normalized = this._normalizeRegisterOptions(options);
    return this._attachRegisterRequestDelegate(normalized);
  }

  _attachRegisterRequestDelegate(options = {}) {
    const normalized = Object.assign({}, options);
    const userDelegate = normalized.requestDelegate ? Object.assign({}, normalized.requestDelegate) : {};
    const failureHandler = (response) => {
      const sipResponse = response && response.message ? response.message : null;
      this._emitRegistrationFailure(response || null, sipResponse);
    };
    normalized.requestDelegate = normalized.requestDelegate ? Object.assign({}, normalized.requestDelegate) : {};
    normalized.requestDelegate.onReject = this._chainCallbacks(failureHandler, userDelegate.onReject);
    normalized.requestDelegate.onRedirect = this._chainCallbacks(failureHandler, userDelegate.onRedirect);
    return normalized;
  }

  _chainCallbacks(first, second) {
    if (!first && !second) {
      return undefined;
    }
    return (...args) => {
      if (typeof first === "function") {
        first(...args);
      }
      if (typeof second === "function") {
        return second(...args);
      }
      return undefined;
    };
  }

  _emitRegistrationFailure(cause, response) {
    this.trigger("registrationFailed", {cause: cause, response: response});
  }

  _ensureTransportIsStarted() {
    return this._startTransport(true);
  }

  _startTransport(autoTriggered) {
    if (!this._userAgent) {
      return Promise.resolve();
    }
    if (this._userAgent.isConnected()) {
      return Promise.resolve();
    }
    if (!this._startPromise) {
      this._wsAttempts += 1;
      this.trigger("wsConnecting", {attempts: this._wsAttempts});
      this._startPromise = this._userAgent.start().catch((error) => {
        this._handleTransportFailure(error);
        throw error;
      }).finally(() => {
        this._startPromise = null;
      });
    }
    return this._startPromise;
  }

  _handleTransportFailure(error) {
    if (!error) {
      return;
    }
    this._cycleTransportServer();
  }

  _handleTransportDisconnect(error) {
    if (!error) {
      return;
    }
    this._cycleTransportServer();
  }

  _cycleTransportServer() {
    if (!this._transportServers || this._transportServers.length <= 1) {
      return;
    }
    this._currentTransportIndex = (this._currentTransportIndex + 1) % this._transportServers.length;
    const nextServer = this._transportServers[this._currentTransportIndex];
    this._setActiveTransportServer(nextServer);
  }

  _setActiveTransportServer(server) {
    if (!server) {
      return;
    }
    this._activeTransportServer = server;
    if (this._userAgent && this._userAgent.options) {
      this._userAgent.options.transportOptions = this._userAgent.options.transportOptions || {};
      this._userAgent.options.transportOptions.server = server;
    }
    if (this._userAgent && this._userAgent.transport && this._userAgent.transport.configuration) {
      this._userAgent.transport.configuration.server = server;
    }
  }

  _buildTransportServerList() {
    const normalized = [];
    for (let i = 0; i < this.wsServers.length; i += 1) {
      const server = this._extractTransportServer(this.wsServers[i]);
      if (server) {
        normalized.push(server);
      }
    }
    if (!normalized.length) {
      normalized.push(`wss://${this.host}:${this.port}`);
    }
    return normalized;
  }

  _extractTransportServer(entry) {
    if (typeof entry === "string" && entry.length) {
      return entry;
    }
    if (entry && typeof entry === "object") {
      return entry.wsUri || entry.ws_uri || entry.server || entry.uri || entry.url || null;
    }
    return null;
  }

  _resolveReconnectionAttempts(config) {
    if (typeof config.reconnectionAttempts === "number") {
      return config.reconnectionAttempts;
    }
    if (this._transportServers && this._transportServers.length > 1) {
      return this._transportServers.length;
    }
    return 3;
  }

  _resolveReconnectionDelay(config) {
    if (typeof config.reconnectionDelay === "number") {
      return config.reconnectionDelay;
    }
    return 4;
  }


  // Ensure that we can connect to the SIP server.
  // Due to a bug in chrome, we need to open an http connection to the SIP server
  // before trying to connect via Web Socket.
  //
  //  https://bugs.chromium.org/p/chromium/issues/detail?id=329884
  _ensureConnectivityWithSipServer() {
    try {
      var xhr = new XMLHttpRequest();
      xhr.addEventListener("error", () => {
        console.info("Failed http connection to SIP server is expected. It is related to a chrome bug.");
      });
      xhr.open("GET", `https://${this.host}:${this.port}`, true);
      xhr.send();
    } catch(e) {
      // do nothing. If an error occurs, it's not going to matter here.
    }
  }
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


export { TelnyxDevice };
