<a name="TelnyxDevice"></a>

## TelnyxDevice
Create a new TelnyxDevice.

**Kind**: global class  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | Configuration Object |
| config.host | <code>String</code> | The host name or IP address of the SIP server |
| config.port | <code>String</code> | The port of the SIP server |
| config.wsServers | <code>String</code> | URI(s) of the WebSocket Servers. Format `wss://123.0.0.0:5066`. An array of strings is also accepted. |
| config.username | <code>String</code> | The username for the SIP server |
| config.password | <code>String</code> | The passweord for the SIP server |
| config.displayName | <code>String</code> | The human readable name passed in the from field. Will be used for Caller ID |
| config.stunServers | <code>String</code> | URI(s) for how to connect to the STUN servers. Format `stun:stun.telnyx.com:8000`. An array of strings is also accepted. |
| config.turnServers | <code>Object</code> | Details for how to connect to the TURN servers. An array of objects is also accepted. |
| config.turnServers.urls | <code>String</code> | URI(s) for the TURN server(s). Format `turn:turn.telnyx.com:8000?transport=tcp`. An array of strings is also accepted. |
| config.turnServers.username | <code>String</code> | Username to authenticate on TURN server(s) |
| config.turnServers.password | <code>String</code> | Password to authenticate on TURN server(s) |
| config.registrarServer | <code>String</code> | URI for the registrar Server. Format `sip:123.0.0.0:5066` |
| config.traceSip | <code>Boolean</code> | If true, SIP traces will be logged to the dev console. |
| config.logLevel | <code>String</code> | One of "debug", "log", "warn", "error", "off".  default is "log" |


* [TelnyxDevice](#TelnyxDevice)
    * [.startWS()](#TelnyxDevice+startWS) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.stopWS()](#TelnyxDevice+stopWS) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.isWSConnected()](#TelnyxDevice+isWSConnected) ⇒ <code>Boolean</code>
    * [.register(options)](#TelnyxDevice+register) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.unregister(options)](#TelnyxDevice+unregister) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.isRegistered()](#TelnyxDevice+isRegistered) ⇒ <code>Boolean</code>
    * [.initiateCall(phoneNumber)](#TelnyxDevice+initiateCall) ⇒ <code>TelnyxCall</code>
    * [.activeCall()](#TelnyxDevice+activeCall) ⇒ <code>TelnyxCall</code>
    * ["wsConnecting"](#TelnyxDevice+event_wsConnecting)
    * ["wsConnected"](#TelnyxDevice+event_wsConnected)
    * ["wsDisconnected"](#TelnyxDevice+event_wsDisconnected)
    * ["registered"](#TelnyxDevice+event_registered)
    * ["unregistered"](#TelnyxDevice+event_unregistered)
    * ["registrationFailed"](#TelnyxDevice+event_registrationFailed)
    * ["incomingInvite"](#TelnyxDevice+event_incomingInvite)
    * ["message"](#TelnyxDevice+event_message)

<a name="TelnyxDevice+startWS"></a>

### telnyxDevice.startWS() ⇒ <code>Promise.&lt;void&gt;</code>
Start the connection to the WebSocket server, and restore the previous state if stopped.
You need to start the WebSocket connection before you can send or receive calls. If you
try to `initiateCall` without first starting the connection, it will be started for you,
but it will not be stopped when the call is terminated.

**Kind**: instance method of [<code>TelnyxDevice</code>](#TelnyxDevice)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves when the underlying UserAgent transport is running.  
**Emits**: [<code>wsConnecting</code>](#TelnyxDevice+event_wsConnecting)  
<a name="TelnyxDevice+stopWS"></a>

### telnyxDevice.stopWS() ⇒ <code>Promise.&lt;void&gt;</code>
Stop the connection to the WebSocket server, saving the state so it can be restored later
(by `start`).

**Kind**: instance method of [<code>TelnyxDevice</code>](#TelnyxDevice)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves when the transport has been torn down.  
<a name="TelnyxDevice+isWSConnected"></a>

### telnyxDevice.isWSConnected() ⇒ <code>Boolean</code>
Status of the WebSocket connection

**Kind**: instance method of [<code>TelnyxDevice</code>](#TelnyxDevice)  
**Returns**: <code>Boolean</code> - isConnected `true` if the device is connected to the WebSocket server, `false` otherwise  
<a name="TelnyxDevice+register"></a>

### telnyxDevice.register(options) ⇒ <code>Promise.&lt;void&gt;</code>
Register the device with the SIP server so that it can receive incoming calls.

**Kind**: instance method of [<code>TelnyxDevice</code>](#TelnyxDevice)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves after the REGISTER transaction is sent.  
**Emits**: [<code>registered</code>](#TelnyxDevice+event_registered)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.extraHeaders | <code>Array.&lt;String&gt;</code> | SIP headers that will be added to each REGISTER request. Each header is string in the format `"X-Header-Name: Header-value"`. |

<a name="TelnyxDevice+unregister"></a>

### telnyxDevice.unregister(options) ⇒ <code>Promise.&lt;void&gt;</code>
Unregister the device from the SIP server; it will no longer recieve incoming calls.

**Kind**: instance method of [<code>TelnyxDevice</code>](#TelnyxDevice)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves when the REGISTER request has been sent.  
**Emits**: [<code>unregistered</code>](#TelnyxDevice+event_unregistered)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.all | <code>Boolean</code> | [Optional] - if set & `true` it will unregister *all* bindings for the SIP user. |
| options.extraHeaders | <code>Array.&lt;String&gt;</code> | SIP headers that will be added to each REGISTER request. Each header is string in the format `"X-Header-Name: Header-value"`. |

<a name="TelnyxDevice+isRegistered"></a>

### telnyxDevice.isRegistered() ⇒ <code>Boolean</code>
Status of SIP registration

**Kind**: instance method of [<code>TelnyxDevice</code>](#TelnyxDevice)  
**Returns**: <code>Boolean</code> - isRegistered `true` if the device is registered with the SIP Server, `false` otherwise  
<a name="TelnyxDevice+initiateCall"></a>

### telnyxDevice.initiateCall(phoneNumber) ⇒ <code>TelnyxCall</code>
Make a phone call

**Kind**: instance method of [<code>TelnyxDevice</code>](#TelnyxDevice)  
**Returns**: <code>TelnyxCall</code> - activeCall Keep an eye on the call's state by listening to events emitted by activeCall  
**Throws**:

- <code>TypeError</code> If the destination cannot be converted into a SIP URI.


| Param | Type | Description |
| --- | --- | --- |
| phoneNumber | <code>String</code> | The desination phone number to connect to. Just digits, no punctuation. Example `"12065551111"`. |

<a name="TelnyxDevice+activeCall"></a>

### telnyxDevice.activeCall() ⇒ <code>TelnyxCall</code>
Get a reference to the call currently in progress

**Kind**: instance method of [<code>TelnyxDevice</code>](#TelnyxDevice)  
**Returns**: <code>TelnyxCall</code> - activeCall Keep an eye on the call's state by listening to events emitted by activeCall  
<a name="TelnyxDevice+event_wsConnecting"></a>

### "wsConnecting"
wsConnecting event

Fired when the device attempts to connect to the WebSocket server.
If the connection drops, TelnyxDevice will try to reconnect and this event will fire again.

**Kind**: event emitted by [<code>TelnyxDevice</code>](#TelnyxDevice)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| attempts | <code>number</code> | Total number of connection attempts made so far. |

<a name="TelnyxDevice+event_wsConnected"></a>

### "wsConnected"
wsConnected event

Fired when the WebSocket connection has been established.

**Kind**: event emitted by [<code>TelnyxDevice</code>](#TelnyxDevice)  
<a name="TelnyxDevice+event_wsDisconnected"></a>

### "wsDisconnected"
wsDisconnected event

Fired when the WebSocket connection drops unexpectedly.

**Kind**: event emitted by [<code>TelnyxDevice</code>](#TelnyxDevice)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | Transport error, if the disconnect was caused by one. |

<a name="TelnyxDevice+event_registered"></a>

### "registered"
registered event

Fired when the device has been successfully registered to receive calls.

**Kind**: event emitted by [<code>TelnyxDevice</code>](#TelnyxDevice)  
<a name="TelnyxDevice+event_unregistered"></a>

### "unregistered"
unregistered event

Fired as the result of a call to `unregister()` or when a periodic re-registration fails.

**Kind**: event emitted by [<code>TelnyxDevice</code>](#TelnyxDevice)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| cause | <code>Object</code> | `null` if `unregister()` was called, otherwise the failure cause object. |
| response | <code>Object</code> | The SIP response that caused the unregistration, if available. |

<a name="TelnyxDevice+event_registrationFailed"></a>

### "registrationFailed"
registrationFailed event

Fired when a registration attempt fails permanently (for example the Registerer enters the `Terminated` state).

**Kind**: event emitted by [<code>TelnyxDevice</code>](#TelnyxDevice)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| cause | <code>Object</code> \| <code>Error</code> | Details about the failure cause. |
| response | <code>Object</code> | Underlying SIP response, when available. |

<a name="TelnyxDevice+event_incomingInvite"></a>

### "incomingInvite"
incomingInvite event

Fired when an INVITE is received. A TelnyxCall instance is supplied so the caller can accept or reject the call.

**Kind**: event emitted by [<code>TelnyxDevice</code>](#TelnyxDevice)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| activeCall | <code>TelnyxCall</code> | The TelnyxCall wrapping the incoming SIP session. |

<a name="TelnyxDevice+event_message"></a>

### "message"
message event

Fired when the device receives an out-of-dialog SIP MESSAGE.

**Kind**: event emitted by [<code>TelnyxDevice</code>](#TelnyxDevice)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| message | <code>Object</code> | SIP.js message wrapper including a request/response handle. |

