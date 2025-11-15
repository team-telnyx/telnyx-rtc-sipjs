<a name="TelnyxCall"></a>

## TelnyxCall
Create a TelnyxCall. Normally created by TelnyxDevice.

**Kind**: global class  
**Throws**:

- <code>TypeError</code> If a session instance is not provided.


| Param | Type | Description |
| --- | --- | --- |
| session | <code>Inviter</code> \| <code>Invitation</code> | SIP.js Session (Inviter for outgoing calls, Invitation for incoming calls). |


* [TelnyxCall](#TelnyxCall)
    * [.makeCall()](#TelnyxCall+makeCall) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.incomingCall(session)](#TelnyxCall+incomingCall) ⇒ [<code>TelnyxCall</code>](#TelnyxCall)
    * [.accept()](#TelnyxCall+accept) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.reject()](#TelnyxCall+reject) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.request](#TelnyxCall+request) ⇒ <code>Object</code> \| <code>false</code>
    * [.disconnect()](#TelnyxCall+disconnect) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.shutdown()](#TelnyxCall+shutdown) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.mute(isMute)](#TelnyxCall+mute)
    * [.isMuted()](#TelnyxCall+isMuted) ⇒ <code>boolean</code>
    * [.sendDigits(digits)](#TelnyxCall+sendDigits)
    * [.status()](#TelnyxCall+status) ⇒ <code>string</code>

<a name="TelnyxCall+makeCall"></a>

### telnyxCall.makeCall() ⇒ <code>Promise.&lt;void&gt;</code>
Make an outbound call using the underlying Inviter session.

**Kind**: instance method of [<code>TelnyxCall</code>](#TelnyxCall)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves when the INVITE has been generated.  
**Emits**: <code>TelnyxCall#event:trying</code>, <code>TelnyxCall#event:progress</code>, <code>TelnyxCall#event:accepted</code>, <code>TelnyxCall#event:failed</code>  
<a name="TelnyxCall+incomingCall"></a>

### telnyxCall.incomingCall(session) ⇒ [<code>TelnyxCall</code>](#TelnyxCall)
Prepare to handle an incoming call.

**Kind**: instance method of [<code>TelnyxCall</code>](#TelnyxCall)  
**Returns**: [<code>TelnyxCall</code>](#TelnyxCall) - Reference to self for chaining.  

| Param | Type | Description |
| --- | --- | --- |
| session | <code>Invitation</code> | Optional replacement session (used when reusing an instance). |

<a name="TelnyxCall+accept"></a>

### telnyxCall.accept() ⇒ <code>Promise.&lt;void&gt;</code>
Accept an incoming call.

**Kind**: instance method of [<code>TelnyxCall</code>](#TelnyxCall)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves when the underlying Invitation is accepted.  
**Emits**: <code>TelnyxCall#event:accepted</code>  
<a name="TelnyxCall+reject"></a>

### telnyxCall.reject() ⇒ <code>Promise.&lt;void&gt;</code>
Reject an incoming call.

**Kind**: instance method of [<code>TelnyxCall</code>](#TelnyxCall)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves once the rejection has been sent.  
**Emits**: <code>TelnyxCall#event:rejected</code>  
<a name="TelnyxCall+request"></a>

### telnyxCall.request ⇒ <code>Object</code> \| <code>false</code>
The request object contains metadata about the current session.

**Kind**: instance property of [<code>TelnyxCall</code>](#TelnyxCall)  
**Returns**: <code>Object</code> \| <code>false</code> - SIP.js request metadata for the current session, or `false` if unavailable.  
<a name="TelnyxCall+disconnect"></a>

### telnyxCall.disconnect() ⇒ <code>Promise.&lt;void&gt;</code>
End the current SIP session.

**Kind**: instance method of [<code>TelnyxCall</code>](#TelnyxCall)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves once BYE/dispose is complete.  
**Emits**: <code>TelnyxCall#event:terminated</code>  
<a name="TelnyxCall+shutdown"></a>

### telnyxCall.shutdown() ⇒ <code>Promise.&lt;void&gt;</code>
Shutdown the underlying SIP UserAgent (legacy helper).

**Kind**: instance method of [<code>TelnyxCall</code>](#TelnyxCall)  
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves when the UserAgent stops, or immediately if none present.  
<a name="TelnyxCall+mute"></a>

### telnyxCall.mute(isMute)
Toggle the outbound audio tracks.

**Kind**: instance method of [<code>TelnyxCall</code>](#TelnyxCall)  
**Emits**: <code>TelnyxCall#event:muted</code>, <code>TelnyxCall#event:unmuted</code>  

| Param | Type | Description |
| --- | --- | --- |
| isMute | <code>boolean</code> | Whether mute should be enabled. |

<a name="TelnyxCall+isMuted"></a>

### telnyxCall.isMuted() ⇒ <code>boolean</code>
Current mute state.

**Kind**: instance method of [<code>TelnyxCall</code>](#TelnyxCall)  
**Returns**: <code>boolean</code> - `true` if mute is active.  
<a name="TelnyxCall+sendDigits"></a>

### telnyxCall.sendDigits(digits)
Send phone keypad presses (DTMF tones) on the active session.

**Kind**: instance method of [<code>TelnyxCall</code>](#TelnyxCall)  
**Emits**: <code>TelnyxCall#event:dtmf</code>  

| Param | Type | Description |
| --- | --- | --- |
| digits | <code>string</code> | String containing digits 0-9, *, or #. |

<a name="TelnyxCall+status"></a>

### telnyxCall.status() ⇒ <code>string</code>
The "simple" call status.

**Kind**: instance method of [<code>TelnyxCall</code>](#TelnyxCall)  
**Returns**: <code>string</code> - One of `starting`, `initiating`, `connected`, or `ended`.  
