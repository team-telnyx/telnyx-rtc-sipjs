The `TelnyxDevice` client connects your application to the Telnyx SIP backend,
enabling you to make outgoing calls and handle incoming calls using the SIP.js UserAgent API directly.

This package provides low-level access to SIP.js sessions while maintaining the familiar
Telnyx event wrapper. Use this package if you need full control over SIP.js behavior.

**`Examples`**

```ts
import { TelnyxDevice } from '@telnyx/rtc-sipjs-user-agent';

// Initialize the device
const device = new TelnyxDevice({
  host: 'sip.telnyx.com',
  port: 7443,
  wsServers: 'wss://sip.telnyx.com:7443',
  username: 'your-sip-username',
  password: 'your-sip-password',
  displayName: 'Phone User',
});

// Connect to WebSocket and register
await device.startWS();
await device.register();

// Listen for events
device.on('telnyx.sipjs.registered', () => {
  console.log('Ready to make calls!');
});

device.on('telnyx.sipjs.incomingInvite', ({ activeCall }) => {
  console.log('Incoming call!');
  activeCall.accept();
});
```

## Table of contents

### Constructors

- [constructor](#constructor)

### Properties

- [config](#config)
- [host](#host)
- [port](#port)
- [wsServers](#wsservers)
- [username](#username)
- [password](#password)
- [displayName](#displayname)
- [stunServers](#stunservers)
- [turnServers](#turnservers)
- [registrarServer](#registrarserver)

### Methods

- [startWS](#startws)
- [stopWS](#stopws)
- [isWSConnected](#iswsconnected)
- [register](#register)
- [unregister](#unregister)
- [isRegistered](#isregistered)
- [initiateCall](#initiatecall)
- [activeCall](#activecall)
- [on](#on)
- [off](#off)

## Constructors

### constructor

• **new TelnyxDevice**(`config`)

Creates a new `TelnyxDevice` instance with the provided configuration.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`TelnyxDeviceConfig`](#telnyxdeviceconfig) | Configuration object for the device |

**`Examples`**

Basic configuration:

```ts
const device = new TelnyxDevice({
  host: 'sip.telnyx.com',
  port: 7443,
  username: 'your-username',
  password: 'your-password',
});
```

Full configuration with ICE servers and audio element:

```ts
const device = new TelnyxDevice({
  host: 'sip.telnyx.com',
  port: 7443,
  wsServers: 'wss://sip.telnyx.com:7443',
  username: 'your-username',
  password: 'your-password',
  displayName: 'John Doe',
  stunServers: ['stun:stun.telnyx.com:3478', 'stun:stun.l.google.com:19302'],
  turnServers: [{
    urls: 'turn:turn.telnyx.com:3478?transport=tcp',
    username: 'turnuser',
    password: 'turnpassword',
  }],
  registrarServer: 'sip:sip.telnyx.com:7443',
  remoteAudioElement: document.getElementById('remoteAudio') as HTMLAudioElement,
  traceSip: true,
  logLevel: 'debug',
});
```

## TelnyxDeviceConfig

Configuration interface for TelnyxDevice.

| Name | Type | Required | Description |
| :------ | :------ | :------ | :------ |
| `host` | `string` | Yes | The hostname or IP address of the SIP server |
| `port` | `string \| number` | Yes | The port of the SIP server |
| `wsServers` | `string \| string[]` | No | WebSocket server URI(s). Format: `wss://sip.telnyx.com:7443`. Defaults to `wss://{host}:{port}` |
| `username` | `string` | Yes | SIP authentication username |
| `password` | `string` | Yes | SIP authentication password |
| `displayName` | `string` | No | Display name for Caller ID. Defaults to username |
| `stunServers` | `string \| string[]` | No | STUN server URI(s). Defaults to Telnyx and Google STUN servers |
| `turnServers` | `TurnServerConfig \| TurnServerConfig[]` | No | TURN server configuration(s). Defaults to Telnyx TURN servers |
| `registrarServer` | `string` | No | SIP registrar server URI. Format: `sip:sip.telnyx.com:7443` |
| `traceSip` | `boolean` | No | Enable SIP message tracing in console |
| `logLevel` | `'debug' \| 'log' \| 'warn' \| 'error' \| 'off'` | No | Log verbosity level |
| `remoteAudioElement` | `HTMLAudioElement` | No | HTML audio element to attach remote media |

### TurnServerConfig

| Name | Type | Required | Description |
| :------ | :------ | :------ | :------ |
| `urls` | `string \| string[]` | Yes | TURN server URI(s). Format: `turn:turn.telnyx.com:3478?transport=tcp` |
| `username` | `string` | No | TURN authentication username |
| `password` | `string` | No | TURN authentication password |

### Default ICE Servers

If not specified, the following defaults are used:

**STUN Servers:**
- `stun:stun.telnyx.com:3478`
- `stun:stun.l.google.com:19302`

**TURN Servers:**
- `turn:turn.telnyx.com:3478?transport=tcp` (with default credentials)

## Methods

### startWS

▸ **startWS**(): `Promise<void>`

Starts the WebSocket connection to the SIP server.
You must call this before making or receiving calls.

#### Returns

`Promise<void>`

**`Examples`**

```ts
await device.startWS();
console.log('WebSocket connected!');
```

___

### stopWS

▸ **stopWS**(): `Promise<void>`

Stops the WebSocket connection to the SIP server.
This also terminates any active calls.

#### Returns

`Promise<void>`

**`Examples`**

```ts
await device.stopWS();
console.log('WebSocket disconnected');
```

___

### isWSConnected

▸ **isWSConnected**(): `boolean`

Returns the current WebSocket connection status.

#### Returns

`boolean`

`true` if connected, `false` otherwise

**`Examples`**

```ts
if (device.isWSConnected()) {
  console.log('WebSocket is connected');
}
```

___

### register

▸ **register**(`options?`): `Promise<OutgoingRegisterRequest>`

Registers the device with the SIP server to receive incoming calls.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `RegisterOptions` | Optional registration options |
| `options.extraHeaders` | `string[]` | Additional SIP headers to include in the REGISTER request |

#### Returns

`Promise<OutgoingRegisterRequest>`

The outgoing REGISTER request

**`Examples`**

Basic registration:

```ts
await device.register();
```

Registration with custom headers:

```ts
await device.register({
  extraHeaders: ['X-Custom-Header: custom-value']
});
```

___

### unregister

▸ **unregister**(`options?`): `Promise<OutgoingRegisterRequest>`

Unregisters the device from the SIP server.
The device will no longer receive incoming calls.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `RegisterOptions` | Optional unregistration options |
| `options.extraHeaders` | `string[]` | Additional SIP headers to include in the REGISTER request |

#### Returns

`Promise<OutgoingRegisterRequest>`

The outgoing REGISTER request

**`Examples`**

```ts
await device.unregister();
```

___

### isRegistered

▸ **isRegistered**(): `boolean`

Returns the current SIP registration status.

#### Returns

`boolean`

`true` if registered, `false` otherwise

**`Examples`**

```ts
if (device.isRegistered()) {
  console.log('Device is registered and can receive calls');
}
```

___

### initiateCall

▸ **initiateCall**(`phoneNumber`): [`TelnyxCall`](TelnyxCall.md)

Initiates an outbound call to the specified phone number or SIP URI.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `phoneNumber` | `string` | The destination phone number (digits only) or SIP URI |

#### Returns

[`TelnyxCall`](TelnyxCall.md)

A new `TelnyxCall` instance representing the outbound call

**`Examples`**

Calling a phone number:

```ts
const call = device.initiateCall('18005551234');
call.on('telnyx.sipjs.accepted', () => {
  console.log('Call connected!');
});
```

Calling a SIP URI:

```ts
const call = device.initiateCall('sip:user@example.com');
```

___

### activeCall

▸ **activeCall**(): `TelnyxCall | undefined`

Returns the currently active call, if any.

#### Returns

[`TelnyxCall`](TelnyxCall.md) | `undefined`

The active `TelnyxCall` instance or `undefined`

**`Examples`**

```ts
const call = device.activeCall();
if (call) {
  console.log('Call status:', call.status());
}
```

___

### on

▸ **on**(`event`, `handler`): `this`

Attaches an event handler for a specific event type.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `DeviceEvent \| string` | Event name to listen for |
| `handler` | `Function` | Callback function to execute when the event fires |

#### Returns

`this`

The device instance for method chaining

**`Examples`**

Using string event names:

```ts
device.on('telnyx.sipjs.registered', () => {
  console.log('Registered!');
});
```

Using enum constants (recommended):

```ts
import { DeviceEvent } from '@telnyx/rtc-sipjs-user-agent';

device.on(DeviceEvent.Registered, () => {
  console.log('Registered!');
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
| `event` | `DeviceEvent \| string` | Event name |
| `handler` | `Function` | Optional specific handler to remove |

#### Returns

`this`

The device instance for method chaining

**`Examples`**

```ts
const handler = () => console.log('Registered!');
device.on('telnyx.sipjs.registered', handler);

// Later...
device.off('telnyx.sipjs.registered', handler);
```

## Events

Both string event names and enum constants can be used. Using enum constants is recommended for type safety.

```ts
import { DeviceEvent } from '@telnyx/rtc-sipjs-user-agent';
```

| Event Name | Enum | Payload | Description |
|------------|------|---------|-------------|
| `telnyx.sipjs.wsConnecting` | `DeviceEvent.WsConnecting` | `{ attempts: number }` | Fired when attempting to connect to WebSocket |
| `telnyx.sipjs.wsConnected` | `DeviceEvent.WsConnected` | None | Fired when WebSocket connection is established |
| `telnyx.sipjs.wsDisconnected` | `DeviceEvent.WsDisconnected` | None | Fired when WebSocket connection is closed |
| `telnyx.sipjs.registered` | `DeviceEvent.Registered` | None | Fired when successfully registered with SIP server |
| `telnyx.sipjs.unregistered` | `DeviceEvent.Unregistered` | `{ cause: null, response: null }` | Fired when unregistered from SIP server |
| `telnyx.sipjs.registrationFailed` | `DeviceEvent.RegistrationFailed` | `{ cause: Error \| string }` | Fired when registration fails |
| `telnyx.sipjs.incomingInvite` | `DeviceEvent.IncomingInvite` | `{ activeCall: TelnyxCall }` | Fired when receiving an incoming call |
| `telnyx.sipjs.message` | `DeviceEvent.Message` | `{ body: unknown }` | Fired when receiving a SIP MESSAGE |

**`Examples`**

Handling incoming calls:

```ts
device.on(DeviceEvent.IncomingInvite, ({ activeCall }) => {
  console.log('Incoming call received!');

  // Auto-answer
  activeCall.accept();

  // Or reject
  // activeCall.reject();
});
```

Handling registration events:

```ts
device.on(DeviceEvent.Registered, () => {
  console.log('Ready to make and receive calls!');
});

device.on(DeviceEvent.RegistrationFailed, ({ cause }) => {
  console.error('Registration failed:', cause);
});
```

Handling connection events:

```ts
device.on(DeviceEvent.WsConnecting, ({ attempts }) => {
  console.log(`Connection attempt ${attempts}...`);
});

device.on(DeviceEvent.WsConnected, () => {
  console.log('WebSocket connected!');
});

device.on(DeviceEvent.WsDisconnected, () => {
  console.log('WebSocket disconnected');
});
```

## Comparison with SimpleUser Package

| Feature | `@telnyx/rtc-sipjs-user-agent` | `@telnyx/rtc-sipjs-simple-user` |
|---------|--------------------------------|----------------------------------|
| SIP.js API | UserAgent (low-level) | SimpleUser (high-level) |
| Session access | Direct access via `TelnyxCall` | Limited (internal only) |
| WebRTC stats | Full support | Limited |
| SIP INFO events | Supported | Not supported |
| Complexity | More control, more complex | Simpler, less control |

Use `@telnyx/rtc-sipjs-user-agent` when you need:
- Direct access to SIP.js sessions
- Full WebRTC statistics collection
- SIP INFO message handling
- Custom session management

Use `@telnyx/rtc-sipjs-simple-user` when you want:
- A simpler API with less boilerplate
- Standard calling functionality
- Automatic media handling
