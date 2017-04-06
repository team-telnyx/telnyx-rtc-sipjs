<a name="TelnyxDevice"></a>

## TelnyxDevice
Represents the software phone running in a web browser or other context.

**Kind**: global class  

* [TelnyxDevice](#TelnyxDevice)
    * [new TelnyxDevice(config)](#new_TelnyxDevice_new)
    * [.startWS()](#TelnyxDevice+startWS)
    * [.stopWS()](#TelnyxDevice+stopWS)
    * [.isWSConnected()](#TelnyxDevice+isWSConnected) ⇒ <code>Boolean</code>
    * [.register(options)](#TelnyxDevice+register)
    * [.unregister(options)](#TelnyxDevice+unregister)
    * [.isRegistered()](#TelnyxDevice+isRegistered) ⇒ <code>Boolean</code>
    * [.initiateCall(phoneNumber)](#TelnyxDevice+initiateCall) ⇒ <code>TelnyxCall</code>
    * [.activeCall()](#TelnyxDevice+activeCall) ⇒ <code>TelnyxCall</code>
    * ["wsConnecting"](#TelnyxDevice+event_wsConnecting)
    * ["wsConnected"](#TelnyxDevice+event_wsConnected)
    * ["wsDisconnected"](#TelnyxDevice+event_wsDisconnected)
    * ["registered"](#TelnyxDevice+event_registered)
    * ["unregistered"](#TelnyxDevice+event_unregistered)
    * ["registrationFailed"](#TelnyxDevice+event_registrationFailed)
    * ["invite"](#TelnyxDevice+event_invite)
    * ["message"](#TelnyxDevice+event_message)

<a name="new_TelnyxDevice_new"></a>

### new TelnyxDevice(config)
Create a new TelnyxDevice.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | Configuration Object |
| config.host | <code>String</code> | The host name or IP address of the SIP server |
| config.port | <code>String</code> | The port of the SIP server |
| config.wsServers | <code>String</code> | URI(s) of the WebSocket Servers. Format `ws://123.0.0.0:5066`. An array of strings is also accepted. |
| config.username | <code>String</code> | The username for the SIP server |
| config.password | <code>String</code> | The passweord for the SIP server |
| config.displayName | <code>String</code> | The human readable name passed in the from field. Will be used for Caller ID |
| config.stunServers | <code>String</code> | URI(s) for how to connect to the STUN servers. Format `stun:stun.telnyx.com:8000`. An array of strings is also accepted. |
| config.turnServers | <code>Object</code> | Details for how to connect to the TURN servers. An array of objects is also accepted. |
| config.turnServers.urls | <code>String</code> | URI(s) for the TURN server(s). Format `turn:123.0.0.0:8000?transport=tcp`. An array of strings is also accepted. |
| config.turnServers.username | <code>String</code> | Username to authenticate on TURN server(s) |
| config.turnServers.password | <code>String</code> | Password to authenticate on TURN server(s) |
| config.registrarServer | <code>String</code> | URI for the registrar Server. Format `sip:123.0.0.0:5066` |

<a name="TelnyxDevice+startWS"></a>

### telnyxDevice.startWS()
Start the connection to the WebSocket server, and restore the previous state if stopped.
You need to start the WebSocket connection before you can send or recieve calls. If you
try to `initiateCall` without first starting the connection, it will be started for you,
but it will not be stopped when the call is terminated.

**Kind**: instance method of <code>[TelnyxDevice](#TelnyxDevice)</code>  
<a name="TelnyxDevice+stopWS"></a>

### telnyxDevice.stopWS()
Stop the connection to the WebSocket server, saving the state so it can be restored later
(by `start`).

**Kind**: instance method of <code>[TelnyxDevice](#TelnyxDevice)</code>  
<a name="TelnyxDevice+isWSConnected"></a>

### telnyxDevice.isWSConnected() ⇒ <code>Boolean</code>
Status of the WebSocket connection

**Kind**: instance method of <code>[TelnyxDevice](#TelnyxDevice)</code>  
**Returns**: <code>Boolean</code> - isConnected `true` if the device is connected to the WebSocket server, `false` otherwise  
<a name="TelnyxDevice+register"></a>

### telnyxDevice.register(options)
Register the device with the SIP server so that it can receive incoming calls.

**Kind**: instance method of <code>[TelnyxDevice](#TelnyxDevice)</code>  
**Emits**: <code>[registered](#TelnyxDevice+event_registered)</code>  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.extraHeaders | <code>Array.&lt;String&gt;</code> | SIP headers that will be added to each REGISTER request. Each header is string in the format `"X-Header-Name: Header-value"`. |

<a name="TelnyxDevice+unregister"></a>

### telnyxDevice.unregister(options)
Unregister the device from the SIP server; it will no longer recieve incoming calls.

**Kind**: instance method of <code>[TelnyxDevice](#TelnyxDevice)</code>  
**Emits**: <code>[unregistered](#TelnyxDevice+event_unregistered)</code>  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.all | <code>Boolean</code> | [Optional] - if set & `true` it will unregister *all* bindings for the SIP user. |
| options.extraHeaders | <code>Array.&lt;String&gt;</code> | SIP headers that will be added to each REGISTER request. Each header is string in the format `"X-Header-Name: Header-value"`. |

<a name="TelnyxDevice+isRegistered"></a>

### telnyxDevice.isRegistered() ⇒ <code>Boolean</code>
Status of SIP registration

**Kind**: instance method of <code>[TelnyxDevice](#TelnyxDevice)</code>  
**Returns**: <code>Boolean</code> - isRegistered `true` if the device is registered with the SIP Server, `false` otherwise  
<a name="TelnyxDevice+initiateCall"></a>

### telnyxDevice.initiateCall(phoneNumber) ⇒ <code>TelnyxCall</code>
Make a phone call

**Kind**: instance method of <code>[TelnyxDevice](#TelnyxDevice)</code>  
**Returns**: <code>TelnyxCall</code> - activeCall Keep an eye on the call's state by listening to events emitted by activeCall  

| Param | Type | Description |
| --- | --- | --- |
| phoneNumber | <code>String</code> | The desination phone number to connect to. Just digits, no punctuation. Example `"12065551111"`. |

<a name="TelnyxDevice+activeCall"></a>

### telnyxDevice.activeCall() ⇒ <code>TelnyxCall</code>
Get a reference to the call currently in progress

**Kind**: instance method of <code>[TelnyxDevice](#TelnyxDevice)</code>  
**Returns**: <code>TelnyxCall</code> - activeCall Keep an eye on the call's state by listening to events emitted by activeCall  
<a name="TelnyxDevice+event_wsConnecting"></a>

### "wsConnecting"
wsConnecting event

Fired when the device attempts to connect to the WebSocket server.
If the connection drops, the device will try to reconnect and this event will fire again.

**Kind**: event emitted by <code>[TelnyxDevice](#TelnyxDevice)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| attempts | <code>number</code> | the number of connection attempts that have been made |

<a name="TelnyxDevice+event_wsConnected"></a>

### "wsConnected"
wsConnected event

Fired when the WebSocket connection has been established.

**Kind**: event emitted by <code>[TelnyxDevice](#TelnyxDevice)</code>  
<a name="TelnyxDevice+event_wsDisconnected"></a>

### "wsDisconnected"
wsDisconnected event

Fried when the WebSocket connection attempt fails.

**Kind**: event emitted by <code>[TelnyxDevice](#TelnyxDevice)</code>  
<a name="TelnyxDevice+event_registered"></a>

### "registered"
registered event

Fired when a the device has been successfully registered to recieve calls.

**Kind**: event emitted by <code>[TelnyxDevice](#TelnyxDevice)</code>  
<a name="TelnyxDevice+event_unregistered"></a>

### "unregistered"
unregistered event

Fired as the result of a call to `unregister()` or if a periodic re-registration fails.

**Kind**: event emitted by <code>[TelnyxDevice](#TelnyxDevice)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| cause | <code>object</code> | null if `unregister()` was called, otherwise see [SIPjs causes](http://sipjs.com/api/0.7.0/causes/) |
| response | <code>object</code> | The SIP message which caused the failure, if it exists. |

<a name="TelnyxDevice+event_registrationFailed"></a>

### "registrationFailed"
registrationFailed event

Fired when a registration attepmt fails.

**Kind**: event emitted by <code>[TelnyxDevice](#TelnyxDevice)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| cause | <code>object</code> | see [SIPjs causes](http://sipjs.com/api/0.7.0/causes/) |
| response | <code>object</code> | The SIP message which caused the failure, if it exists. |

<a name="TelnyxDevice+event_invite"></a>

### "invite"
incomingInvite event

Fired when the device recieves an INVITE request

**Kind**: event emitted by <code>[TelnyxDevice](#TelnyxDevice)</code>  
<a name="TelnyxDevice+event_message"></a>

### "message"
message event

**Kind**: event emitted by <code>[TelnyxDevice](#TelnyxDevice)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | Contains the SIP message sent and server context necessary to receive and send replies. |

