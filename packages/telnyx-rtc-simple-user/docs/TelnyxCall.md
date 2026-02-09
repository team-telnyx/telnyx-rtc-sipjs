A `TelnyxCall` represents an audio call between your application and
a remote caller. The call object is created whenever a new call is initiated,
either by you (outbound) or by a remote caller (inbound).

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

### Properties

- [simpleUser](#simpleuser)

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
- [getSession](#getsession)
- [getPeerConnection](#getpeerconnection)
- [on](#on)
- [off](#off)

## Properties

### simpleUser

" `readonly` **simpleUser**: `SimpleUser`

The underlying SIP.js SimpleUser instance.

## Methods

### makeCall

¸ **makeCall**(`destination`): `Promise<void>`

Initiates an outbound call to the specified destination.
This is called internally by `TelnyxDevice.initiateCall()`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `destination` | `string` | SIP URI of the destination |

#### Returns

`Promise<void>`

___

### accept

¸ **accept**(): `Promise<void>`

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

¸ **reject**(): `Promise<void>`

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

¸ **disconnect**(): `Promise<void>`

Ends the current call (hangup).

#### Returns

`Promise<void>`

**`Examples`**

```ts
await call.disconnect();
console.log('Call ended');
```

___

### shutdown

¸ **shutdown**(): `Promise<void>`

Disconnects the underlying SimpleUser from the SIP server.

#### Returns

`Promise<void>`

___

### toggleMute

¸ **toggleMute**(`isMute`): `void`

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

¸ **isMuted**(): `boolean`

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

¸ **sendDigits**(`digits`): `Promise<void>`

Sends DTMF tones (dial pad digits) during a call.

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

// Send multiple digits
await call.sendDigits('1234#');
```

___

### status

¸ **status**(): `CallStatus`

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

¸ **isInitiating**(): `boolean`

Returns whether the call is currently being initiated (ringing).

#### Returns

`boolean`

`true` if the call is initiating

___

### isConnected

¸ **isConnected**(): `boolean`

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

¸ **isEnded**(): `boolean`

Returns whether the call has ended.

#### Returns

`boolean`

`true` if the call has ended

___

### isIncoming

¸ **isIncoming**(): `boolean`

Returns whether this is an incoming call.

#### Returns

`boolean`

`true` if the call is incoming

___

### isOutgoing

¸ **isOutgoing**(): `boolean`

Returns whether this is an outgoing call.

#### Returns

`boolean`

`true` if the call is outgoing

___

### getSession

¸ **getSession**(): `Session | undefined`

Gets the underlying SIP.js Session if available.

> **Note:** SimpleUser does not publicly expose the session, so this
> method uses internal access. For reliable session access, consider
> using `@telnyx/rtc-sipjs-user-agent` instead.

#### Returns

`Session | undefined`

The SIP.js Session or `undefined`

___

### getPeerConnection

¸ **getPeerConnection**(): `RTCPeerConnection | undefined`

Gets the WebRTC peer connection from the active session.

> **Note:** SimpleUser does not publicly expose the session, so this
> method uses internal access. For reliable peer connection access,
> consider using `@telnyx/rtc-sipjs-user-agent` instead.

#### Returns

`RTCPeerConnection | undefined`

The RTCPeerConnection or `undefined`

___

### on

¸ **on**(`event`, `handler`): `this`

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
import { CallEvent } from '@telnyx/rtc-sipjs-simple-user';

call.on(CallEvent.Accepted, () => {
  console.log('Call accepted!');
});
```

___

### off

¸ **off**(`event`, `handler?`): `this`

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
import { CallEvent } from '@telnyx/rtc-sipjs-simple-user';
```

| Event Name | Enum | Payload | Description |
|------------|------|---------|-------------|
| `telnyx.sipjs.connecting` | `CallEvent.Connecting` | None | Fired when the call is being established |
| `telnyx.sipjs.accepted` | `CallEvent.Accepted` | None | Fired when the call is answered/accepted |
| `telnyx.sipjs.terminated` | `CallEvent.Terminated` | None | Fired when the call ends |
| `telnyx.sipjs.failed` | `CallEvent.Failed` | `Error` | Fired when a call operation fails |
| `telnyx.sipjs.rejected` | `CallEvent.Rejected` | None | Fired when an incoming call is rejected |
| `telnyx.sipjs.muted` | `CallEvent.Muted` | None | Fired when the call is muted |
| `telnyx.sipjs.unmuted` | `CallEvent.Unmuted` | None | Fired when the call is unmuted |
| `telnyx.sipjs.held` | `CallEvent.Held` | None | Fired when the call is put on hold |
| `telnyx.sipjs.resumed` | `CallEvent.Resumed` | None | Fired when the call is resumed from hold |
| `telnyx.sipjs.dtmf` | `CallEvent.Dtmf` | `{ tone: string, duration: number }` or `undefined, digits: string` | Fired when DTMF tones are sent or received |
| `telnyx.sipjs.notification` | `CallEvent.Notification` | `unknown` | Fired for other SIP notifications |
| `telnyx.sipjs.stats` | `CallEvent.Stats` | `unknown` | Fired periodically with WebRTC statistics |

> **Note on WebRTC Stats:** The `CallEvent.Stats` event relies on accessing the underlying
> SIP.js session, which `SimpleUser` does not publicly expose. Stats collection may not work
> reliably in all scenarios. For full WebRTC stats support, use
> [`@telnyx/rtc-sipjs-user-agent`](https://www.npmjs.com/package/@telnyx/rtc-sipjs-user-agent) instead.

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

// Receiving DTMF events
call.on(CallEvent.Dtmf, (data, digits) => {
  console.log('DTMF:', data || digits);
});
```

Collecting WebRTC stats:

```ts
call.on(CallEvent.Stats, (stats) => {
  console.log('WebRTC stats:', stats);
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
starting ’ initiating ’ connected ’ ended
                    ˜              —
                      ’ ended (failed/rejected)
```
