<a name="TelnyxCall"></a>

## TelnyxCall
**Kind**: global class  
**Emits**: <code>[connecting](#TelnyxCall+event_connecting)</code>  

* [TelnyxCall](#TelnyxCall)
    * [new TelnyxCall(UA, inviteUri)](#new_TelnyxCall_new)
    * [.request](#TelnyxCall+request) ⇒ <code>object</code>
    * [.makeCall(inviteUri)](#TelnyxCall+makeCall)
    * [.incomingCall(session)](#TelnyxCall+incomingCall)
    * [.accept()](#TelnyxCall+accept)
    * [.reject()](#TelnyxCall+reject)
    * [.isInitiating()](#TelnyxCall+isInitiating) ⇒ <code>Boolean</code>
    * [.isConnected()](#TelnyxCall+isConnected) ⇒ <code>Boolean</code>
    * [.isEnded()](#TelnyxCall+isEnded) ⇒ <code>Boolean</code>
    * [.isIncoming()](#TelnyxCall+isIncoming) ⇒ <code>Boolean</code>
    * [.isOutgoing()](#TelnyxCall+isOutgoing) ⇒ <code>Boolean</code>
    * [.disconnect()](#TelnyxCall+disconnect)
    * ~~[.shutdown()](#TelnyxCall+shutdown)~~
    * [.mute(isMute)](#TelnyxCall+mute)
    * [.isMuted()](#TelnyxCall+isMuted) ⇒ <code>boolean</code>
    * [.sendDigits(digits)](#TelnyxCall+sendDigits)
    * [.status()](#TelnyxCall+status) ⇒ <code>string</code>
    * ["connecting"](#TelnyxCall+event_connecting)
    * ["progress"](#TelnyxCall+event_progress)
    * ["accepted"](#TelnyxCall+event_accepted)
    * ["dtmf"](#TelnyxCall+event_dtmf)
    * ["muted"](#TelnyxCall+event_muted)
    * ["unmuted"](#TelnyxCall+event_unmuted)
    * ["cancel"](#TelnyxCall+event_cancel)
    * ["refer"](#TelnyxCall+event_refer)
    * ["replaced"](#TelnyxCall+event_replaced)
    * ["rejected"](#TelnyxCall+event_rejected)
    * ["failed"](#TelnyxCall+event_failed)
    * ["terminated"](#TelnyxCall+event_terminated)
    * ["bye"](#TelnyxCall+event_bye)
    * ["userMediaRequest"](#TelnyxCall+event_userMediaRequest)
    * ["userMedia"](#TelnyxCall+event_userMedia)
    * ["userMediaFailed"](#TelnyxCall+event_userMediaFailed)
    * ["iceGathering"](#TelnyxCall+event_iceGathering)
    * ["iceCandidate"](#TelnyxCall+event_iceCandidate)
    * ["iceGatheringComplete"](#TelnyxCall+event_iceGatheringComplete)
    * ["iceConnection"](#TelnyxCall+event_iceConnection)
    * ["iceConnectionChecking"](#TelnyxCall+event_iceConnectionChecking)
    * ["iceConnectionConnected"](#TelnyxCall+event_iceConnectionConnected)
    * ["iceConnectionCompleted"](#TelnyxCall+event_iceConnectionCompleted)
    * ["iceConnectionFailed"](#TelnyxCall+event_iceConnectionFailed)
    * ["iceConnectionDisconnected"](#TelnyxCall+event_iceConnectionDisconnected)
    * ["iceConnectionClosed"](#TelnyxCall+event_iceConnectionClosed)
    * ["getDescription"](#TelnyxCall+event_getDescription)
    * ["setDescription"](#TelnyxCall+event_setDescription)
    * ["dataChannel"](#TelnyxCall+event_dataChannel)
    * ["addStream"](#TelnyxCall+event_addStream)

<a name="new_TelnyxCall_new"></a>

### new TelnyxCall(UA, inviteUri)
Create a TelnyxCall. Normally created by TelnyxDevice.

Once a call is created, you can either make a call with `makeCall()`
or set yourself up to recieve an incoming call with `incomingCall()`


| Param | Type | Description |
| --- | --- | --- |
| UA | <code>UA</code> | A SIP.js User Agent |
| inviteUri | <code>String</code> | A Properly formatted SIP.js invite URI (create with SIP.URI) |

<a name="TelnyxCall+request"></a>

### telnyxCall.request ⇒ <code>object</code>
The request object contains metadata about the current session,
including the who the call is going `to` and in the case of incoming calls,
who the call is coming `from`.

**Kind**: instance property of <code>[TelnyxCall](#TelnyxCall)</code>  
**Returns**: <code>object</code> - request  
<a name="TelnyxCall+makeCall"></a>

### telnyxCall.makeCall(inviteUri)
Make a call to a phone number

**Kind**: instance method of <code>[TelnyxCall](#TelnyxCall)</code>  

| Param | Type | Description |
| --- | --- | --- |
| inviteUri | <code>URI</code> | A SIP.js URI that includes the phone number to connect to |

<a name="TelnyxCall+incomingCall"></a>

### telnyxCall.incomingCall(session)
Set up to handle an incoming call.
The calling function will then be able to accept or reject the call.

**Kind**: instance method of <code>[TelnyxCall](#TelnyxCall)</code>  

| Param | Type | Description |
| --- | --- | --- |
| session | <code>Session</code> | A SIP.js Session, specifically of the SIP.ServerContext type |

<a name="TelnyxCall+accept"></a>

### telnyxCall.accept()
Accept an incoming call.
When a call is received `TelnyxDevice` will create a new `TelnyxCall` for the session
and emit a `incomingInvite` event.
The new `TelnyxCall` is passed along with the event. Call `accept()` to accept the call.

**Kind**: instance method of <code>[TelnyxCall](#TelnyxCall)</code>  
<a name="TelnyxCall+reject"></a>

### telnyxCall.reject()
Reject an incoming call.
When a call is received `TelnyxDevice` will create a new `TelnyxCall` for the session
and emit a `incomingInvite` event.
The new `TelnyxCall` is passed along with the event. Call `reject()` to reject the call.

**Kind**: instance method of <code>[TelnyxCall](#TelnyxCall)</code>  
<a name="TelnyxCall+isInitiating"></a>

### telnyxCall.isInitiating() ⇒ <code>Boolean</code>
Is the call still initiating?

**Kind**: instance method of <code>[TelnyxCall](#TelnyxCall)</code>  
**Returns**: <code>Boolean</code> - isInitiating  
<a name="TelnyxCall+isConnected"></a>

### telnyxCall.isConnected() ⇒ <code>Boolean</code>
Has the call connected?

**Kind**: instance method of <code>[TelnyxCall](#TelnyxCall)</code>  
**Returns**: <code>Boolean</code> - isConnected  
<a name="TelnyxCall+isEnded"></a>

### telnyxCall.isEnded() ⇒ <code>Boolean</code>
Has the call ended?

**Kind**: instance method of <code>[TelnyxCall](#TelnyxCall)</code>  
**Returns**: <code>Boolean</code> - isEnded  
<a name="TelnyxCall+isIncoming"></a>

### telnyxCall.isIncoming() ⇒ <code>Boolean</code>
Is this an incoming call?

**Kind**: instance method of <code>[TelnyxCall](#TelnyxCall)</code>  
**Returns**: <code>Boolean</code> - isIncoming  
<a name="TelnyxCall+isOutgoing"></a>

### telnyxCall.isOutgoing() ⇒ <code>Boolean</code>
Is this an outgoing call?

**Kind**: instance method of <code>[TelnyxCall](#TelnyxCall)</code>  
**Returns**: <code>Boolean</code> - isOutgoing  
<a name="TelnyxCall+disconnect"></a>

### telnyxCall.disconnect()
End the session

**Kind**: instance method of <code>[TelnyxCall](#TelnyxCall)</code>  
**Emits**: <code>[terminated](#TelnyxCall+event_terminated)</code>  
<a name="TelnyxCall+shutdown"></a>

### ~~telnyxCall.shutdown()~~
***Deprecated***

Shutdown the connection to the WebRTC servers

**Kind**: instance method of <code>[TelnyxCall](#TelnyxCall)</code>  
<a name="TelnyxCall+mute"></a>

### telnyxCall.mute(isMute)
Toggle mute

**Kind**: instance method of <code>[TelnyxCall](#TelnyxCall)</code>  

| Param | Type | Description |
| --- | --- | --- |
| isMute | <code>boolean</code> | if true you want mute to be ON |

<a name="TelnyxCall+isMuted"></a>

### telnyxCall.isMuted() ⇒ <code>boolean</code>
Current mute state

**Kind**: instance method of <code>[TelnyxCall](#TelnyxCall)</code>  
**Returns**: <code>boolean</code> - true if call is on mute  
<a name="TelnyxCall+sendDigits"></a>

### telnyxCall.sendDigits(digits)
Send phone keypad presses (DTMF tones)

Used after the call is in progress.

**Kind**: instance method of <code>[TelnyxCall](#TelnyxCall)</code>  
**Emits**: <code>[dtmf](#TelnyxCall+event_dtmf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| digits | <code>string</code> | a string containg digits 0-9, *, # |

<a name="TelnyxCall+status"></a>

### telnyxCall.status() ⇒ <code>string</code>
The "simple" status.

All of the many phases of the call boiled down into 3 states: Initiating, Connected and Ended.

**Kind**: instance method of <code>[TelnyxCall](#TelnyxCall)</code>  
**Returns**: <code>string</code> - one of initiating, connected, ended  
<a name="TelnyxCall+event_connecting"></a>

### "connecting"
connecting event:

Fired as the system starts to make the connection.
This is after the userMedia (microphone) has been aquired.

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
<a name="TelnyxCall+event_progress"></a>

### "progress"
progress event:

Usually fired twice during call intialization, once for TRYING and once for RINGING.

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| response | <code>object</code> | Details of the response |

<a name="TelnyxCall+event_accepted"></a>

### "accepted"
accepted event:

Fired when the call was accepted by the callee. The call is now connected.

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Details of the response |

<a name="TelnyxCall+event_dtmf"></a>

### "dtmf"
dtmf event:

Sent when the user has successfully sent a DTMF (keypad) signal.

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| request | <code>object</code> | Details of the request |
| dtmf | <code>string</code> | the key(s) that were submitted |

<a name="TelnyxCall+event_muted"></a>

### "muted"
muted event:

Fired when the system has successfully responded to a mute request.

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Details of the response |

<a name="TelnyxCall+event_unmuted"></a>

### "unmuted"
unmuted event

Fired when the system has successfully responded to an unmute request.

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Details of the response |

<a name="TelnyxCall+event_cancel"></a>

### "cancel"
cancel event:

Fired when the call was terminated before end to end connection was established,
usually by the user's request.

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
<a name="TelnyxCall+event_refer"></a>

### "refer"
refer event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type |
| --- | --- |
| callback | <code>function</code> | 
| response | <code>object</code> | 
| newSession | <code>object</code> | 

<a name="TelnyxCall+event_replaced"></a>

### "replaced"
replaced event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type |
| --- | --- |
| newSession | <code>object</code> | 

<a name="TelnyxCall+event_rejected"></a>

### "rejected"
rejected event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type |
| --- | --- |
| response | <code>object</code> | 
| cause | <code>object</code> | 

<a name="TelnyxCall+event_failed"></a>

### "failed"
failed event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type |
| --- | --- |
| response | <code>object</code> | 
| cause | <code>object</code> | 

<a name="TelnyxCall+event_terminated"></a>

### "terminated"
terminated event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type |
| --- | --- |
| response | <code>object</code> | 
| cause | <code>object</code> | 

<a name="TelnyxCall+event_bye"></a>

### "bye"
bye event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
<a name="TelnyxCall+event_userMediaRequest"></a>

### "userMediaRequest"
userMediaRequest event:

Fired when the every time the system checks to see if it has microphone permission from the user.
You can use this to detect when the browser's "Allow website to use microphone" dialog is open,
but you will need to be somewhat careful. This event will fire even if the user already has
given permission, then will be immediately followed by a [TelnyxCall#userMedia](TelnyxCall#userMedia) event.
If you wish to have your UI display some sort of "asking for permission" element, you may need to
debounce this event; listening for [TelnyxCall#userMedia](TelnyxCall#userMedia) to cancel your UI update.

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type |
| --- | --- |
| constraints | <code>object</code> | 

<a name="TelnyxCall+event_userMedia"></a>

### "userMedia"
userMedia event:

Fired when the system has aquired permission to use the microphone. This will happen either
immediately after [TelnyxCall#userMediaRequest](TelnyxCall#userMediaRequest) if the user has previously given permission
or after the user approves the request.

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type |
| --- | --- |
| stream | <code>object</code> | 

<a name="TelnyxCall+event_userMediaFailed"></a>

### "userMediaFailed"
userMediaFailed event:

Fired when the user refuses permission to use the microphone. There is no way back from this
except for the user to go into browser settings and remove the exception for your site.

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type |
| --- | --- |
| error | <code>object</code> | 

<a name="TelnyxCall+event_iceGathering"></a>

### "iceGathering"
iceGathering event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
<a name="TelnyxCall+event_iceCandidate"></a>

### "iceCandidate"
iceCandidate event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type |
| --- | --- |
| candidate | <code>object</code> | 

<a name="TelnyxCall+event_iceGatheringComplete"></a>

### "iceGatheringComplete"
iceGatheringComplete event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
<a name="TelnyxCall+event_iceConnection"></a>

### "iceConnection"
iceConnection event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
<a name="TelnyxCall+event_iceConnectionChecking"></a>

### "iceConnectionChecking"
iceConnectionChecking event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
<a name="TelnyxCall+event_iceConnectionConnected"></a>

### "iceConnectionConnected"
iceConnectionConnected event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
<a name="TelnyxCall+event_iceConnectionCompleted"></a>

### "iceConnectionCompleted"
iceConnectionCompleted event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
<a name="TelnyxCall+event_iceConnectionFailed"></a>

### "iceConnectionFailed"
iceConnectionFailed event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
<a name="TelnyxCall+event_iceConnectionDisconnected"></a>

### "iceConnectionDisconnected"
iceConnectionDisconnected event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
<a name="TelnyxCall+event_iceConnectionClosed"></a>

### "iceConnectionClosed"
iceConnectionClosed event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
<a name="TelnyxCall+event_getDescription"></a>

### "getDescription"
getDescription event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type |
| --- | --- |
| sdpWrapper | <code>object</code> | 

<a name="TelnyxCall+event_setDescription"></a>

### "setDescription"
setDescription event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type |
| --- | --- |
| sdpWrapper | <code>object</code> | 

<a name="TelnyxCall+event_dataChannel"></a>

### "dataChannel"
dataChannel event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type |
| --- | --- |
| dataChannel | <code>object</code> | 

<a name="TelnyxCall+event_addStream"></a>

### "addStream"
addStream event

**Kind**: event emitted by <code>[TelnyxCall](#TelnyxCall)</code>  
**Properties**

| Name | Type |
| --- | --- |
| stream | <code>object</code> | 

