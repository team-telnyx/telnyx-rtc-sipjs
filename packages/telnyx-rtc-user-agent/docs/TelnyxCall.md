A `TelnyxCall` represents an audio call between your application and
a remote caller. The call object is created whenever a new call is initiated,
either by you (outbound) or by a remote caller (inbound).

This package provides direct access to the underlying SIP.js session, giving you
full control over call handling and WebRTC operations.

**`Examples`**

Making an outbound call:

```ts
const call = device.initiateCall('18005551234');

call.on('telnyx.sipjs.connecting', () => {
  console.log('Dialing...');
});

call.on('telnyx.sipjs.accepted', () => {
  console.log('Call connected!');
});

call.on('telnyx.sipjs.terminated', () => {
  console.log('Call ended');
});
```

Handling an incoming call:

```ts
device.on('telnyx.sipjs.incomingInvite', ({ activeCall }) => {
  // Answer the call
  activeCall.accept();

  // Or reject it
  // activeCall.reject();
});
```

## Table of contents

### Methods

- [makeCall](#makecall)
- [accept](#accept)
- [reject](#reject)
- [disconnect](#disconnect)
- [shutdown](#shutdown)
- [toggleMute](#togglemute)
- [isMuted](#ismuted)
- [sendDigits](#senddigits)
- [status](#status)
- [isInitiating](#isinitiating)
- [isConnected](#isconnected)
- [isEnded](#isended)
- [isIncoming](#isincoming)
- [isOutgoing](#isoutgoing)
- [on](#on)
- [off](#off)

## Methods

### makeCall

▸ **makeCall**(`destination`): `Promise<void>`

Initiates an outbound call to the specified destination.
This is called internally by `TelnyxDevice.initiateCall()`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `destination` | `string` | SIP URI of the destination |

#### Returns

`Promise<void>`

**Throws**

`TypeError` if the destination is not a valid SIP URI

___

### incomingCall

▸ **incomingCall**(`invitation`): `void`

Attaches an incoming SIP.js Invitation to this call.
This is called internally by `TelnyxDevice` when handling incoming calls.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `invitation` | `Invitation` | The SIP.js Invitation object |

#### Returns

`void`

___

### accept

▸ **accept**(): `Promise<void>`

Answers an incoming call.
Only valid for incoming calls (`isIncoming() === true`).

#### Returns

`Promise<void>`

**`Examples`**

```ts
device.on('telnyx.sipjs.incomingInvite', ({ activeCall }) => {
  activeCall.accept();
});
```

___

### reject

▸ **reject**(): `Promise<void>`

Rejects an incoming call.
Only valid for incoming calls (`isIncoming() === true`).

#### Returns

`Promise<void>`

**`Examples`**

```ts
device.on('telnyx.sipjs.incomingInvite', ({ activeCall }) => {
  activeCall.reject();
});
```

___

### disconnect

▸ **disconnect**(): `Promise<void>`

Ends the current call (hangup).

For outbound calls that are still establishing, this cancels the call.
For established calls, this sends a BYE request.

#### Returns

`Promise<void>`

**`Examples`**

```ts
await call.disconnect();
console.log('Call ended');
```

___

### shutdown

▸ **shutdown**(): `Promise<void>`

Stops the underlying UserAgent, terminating all calls.

#### Returns

`Promise<void>`

___

### toggleMute

▸ **toggleMute**(`isMute`): `void`

Mutes or unmutes the local audio.
When muted, the remote party cannot hear you.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `isMute` | `boolean` | `true` to mute, `false` to unmute |

#### Returns

`void`

**`Examples`**

```ts
// Mute
call.toggleMute(true);

// Unmute
call.toggleMute(false);
```

___

### isMuted

▸ **isMuted**(): `boolean`

Returns the current mute state.

#### Returns

`boolean`

`true` if muted, `false` otherwise

**`Examples`**

```ts
if (call.isMuted()) {
  console.log('Call is muted');
}
```

___

### sendDigits

▸ **sendDigits**(`digits`): `Promise<void>`

Sends DTMF tones (dial pad digits) during a call.

Uses the WebRTC DTMF sender for reliable tone transmission.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `digits` | `string` | The DTMF digits to send (0-9, *, #) |

#### Returns

`Promise<void>`

**`Examples`**

```ts
// Send a single digit
await call.sendDigits('1');

// Send multiple digits (e.g., for IVR navigation)
await call.sendDigits('1234#');
```

___

### status

▸ **status**(): `CallStatus`

Returns the current status of the call.

#### Returns

`CallStatus`

One of: `'starting'`, `'initiating'`, `'connected'`, `'ended'`

**`Examples`**

```ts
const status = call.status();
console.log('Call status:', status);
```

___

### isInitiating

▸ **isInitiating**(): `boolean`

Returns whether the call is currently being initiated (ringing).

#### Returns

`boolean`

`true` if the call is initiating

___

### isConnected

▸ **isConnected**(): `boolean`

Returns whether the call is currently connected (active).

#### Returns

`boolean`

`true` if the call is connected

**`Examples`**

```ts
if (call.isConnected()) {
  console.log('Call is active');
}
```

___

### isEnded

▸ **isEnded**(): `boolean`

Returns whether the call has ended.

#### Returns

`boolean`

`true` if the call has ended

___

### isIncoming

▸ **isIncoming**(): `boolean`

Returns whether this is an incoming call.

#### Returns

`boolean`

`true` if the call is incoming

___

### isOutgoing

▸ **isOutgoing**(): `boolean`

Returns whether this is an outgoing call.

#### Returns

`boolean`

`true` if the call is outgoing

___

### on

▸ **on**(`event`, `handler`): `this`

Attaches an event handler for a specific event type.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `CallEvent \| string` | Event name to listen for |
| `handler` | `Function` | Callback function to execute when the event fires |

#### Returns

`this`

The call instance for method chaining

**`Examples`**

Using string event names:

```ts
call.on('telnyx.sipjs.accepted', () => {
  console.log('Call accepted!');
});
```

Using enum constants (recommended):

```ts
import { CallEvent } from '@telnyx/rtc-sipjs-user-agent';

call.on(CallEvent.Accepted, () => {
  console.log('Call accepted!');
});
```

___

### off

▸ **off**(`event`, `handler?`): `this`

Removes an event handler.
If no handler is provided, all listeners for that event are removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `CallEvent \| string` | Event name |
| `handler` | `Function` | Optional specific handler to remove |

#### Returns

`this`

The call instance for method chaining

## Events

Both string event names and enum constants can be used. Using enum constants is recommended for type safety.

```ts
import { CallEvent } from '@telnyx/rtc-sipjs-user-agent';
```

| Event Name | Enum | Payload | Description |
|------------|------|---------|-------------|
| `telnyx.sipjs.connecting` | `CallEvent.Connecting` | None | Fired when the call is being established |
| `telnyx.sipjs.accepted` | `CallEvent.Accepted` | None | Fired when the call is answered/accepted |
| `telnyx.sipjs.terminated` | `CallEvent.Terminated` | None | Fired when the call ends |
| `telnyx.sipjs.failed` | `CallEvent.Failed` | `Error \| string` | Fired when a call operation fails |
| `telnyx.sipjs.rejected` | `CallEvent.Rejected` | None | Fired when an incoming call is rejected |
| `telnyx.sipjs.muted` | `CallEvent.Muted` | None | Fired when the call is muted |
| `telnyx.sipjs.unmuted` | `CallEvent.Unmuted` | None | Fired when the call is unmuted |
| `telnyx.sipjs.dtmf` | `CallEvent.Dtmf` | `{ tone: string, duration?: number }` or `undefined, digits: string` | Fired when DTMF tones are sent or received |
| `telnyx.sipjs.info` | `CallEvent.Info` | `Info` | Fired when a SIP INFO message is received |
| `telnyx.sipjs.notification` | `CallEvent.Notification` | `unknown` | Fired for other SIP notifications |

**`Examples`**

Tracking call lifecycle:

```ts
const call = device.initiateCall('18005551234');

call.on(CallEvent.Connecting, () => {
  console.log('Ringing...');
});

call.on(CallEvent.Accepted, () => {
  console.log('Call connected!');
});

call.on(CallEvent.Terminated, () => {
  console.log('Call ended');
});

call.on(CallEvent.Failed, (error) => {
  console.error('Call failed:', error);
});
```

Handling mute state:

```ts
call.on(CallEvent.Muted, () => {
  console.log('Microphone muted');
});

call.on(CallEvent.Unmuted, () => {
  console.log('Microphone unmuted');
});
```

Handling DTMF:

```ts
// Sending DTMF
call.sendDigits('1234');

// Receiving DTMF events (via SIP INFO)
call.on(CallEvent.Dtmf, (data, digits) => {
  console.log('DTMF:', data || digits);
});
```

Handling SIP INFO messages:

```ts
call.on(CallEvent.Info, (info) => {
  const contentType = info.request.getHeader('Content-Type');
  console.log('Received SIP INFO:', contentType);
});
```

## Call States

The call progresses through the following states:

| State | Description |
|-------|-------------|
| `starting` | Initial state when the call object is created |
| `initiating` | Call is being set up (outbound: dialing, inbound: ringing) |
| `connected` | Call is active and media is flowing |
| `ended` | Call has terminated |

```
starting → initiating → connected → ended
                    ↘              ↗
                      → ended (failed/rejected)
```

## SIP.js Session Access

Unlike the SimpleUser package, this package provides methods that work directly
with the SIP.js Session object. The session is managed internally but its state
changes are exposed through events.

### Session State Mapping

| SIP.js SessionState | TelnyxCall Event |
|---------------------|------------------|
| `Establishing` | `CallEvent.Connecting` |
| `Established` | `CallEvent.Accepted` |
| `Terminated` | `CallEvent.Terminated` |

### Session Delegate Events

The call automatically handles the following SIP.js session delegate callbacks:

| Delegate Callback | TelnyxCall Event |
|-------------------|------------------|
| `onBye` | `CallEvent.Terminated` |
| `onCancel` | `CallEvent.Failed` |
| `onInfo` | `CallEvent.Info` (or `CallEvent.Dtmf` for DTMF relay) |
| `onNotify` | `CallEvent.Notification` |

## Audio Handling

Remote audio is automatically attached to an HTML audio element. You can:

1. **Provide your own element** via `TelnyxDeviceConfig.remoteAudioElement`:
   ```ts
   const device = new TelnyxDevice({
     // ...
     remoteAudioElement: document.getElementById('audio') as HTMLAudioElement,
   });
   ```

2. **Let the library create one**: If no element is provided, one is automatically
   created and appended to the document body with class `telnyx-rtc-sipjs-remote-audio`.

## Comparison with SimpleUser Package

| Feature | `@telnyx/rtc-sipjs-user-agent` | `@telnyx/rtc-sipjs-simple-user` |
|---------|--------------------------------|----------------------------------|
| SIP INFO handling | Full support via `CallEvent.Info` | Not supported |
| DTMF relay parsing | Automatic | Not supported |
| Session access | Internal (managed) | Internal (limited) |
| Media constraints | Configurable per call | Configurable per call |
