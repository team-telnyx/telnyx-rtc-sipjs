# @telnyx/rtc-sipjs-simple-user

![npm (scoped)](https://img.shields.io/npm/v/@telnyx/rtc-sipjs-simple-user)

This package lives inside the Telnyx SIP.js monorepo and delivers the modern SimpleUser-backed implementation of `TelnyxDevice`/`TelnyxCall`. It powers up your web application with the ability to make and receive phone calls directly in the browser.

> **Heads up:** the legacy [`@telnyx/rtc-sipjs`](https://www.npmjs.com/package/@telnyx/rtc-sipjs) package is being split into this SimpleUser helper and [`@telnyx/rtc-sipjs-user-agent`](../telnyx-rtc-user-agent/README.md). If your project relies on `@telnyx/rtc-sipjs` and you expect SimpleUser semantics, install `@telnyx/rtc-sipjs-simple-user` directly going forward.

Check out the library in action in [this web dialer demo](https://webrtc.telnyx.com/).

_Looking for more WebRTC features, JSON-RPC support or need to quickly get spun up with a React app? Telnyx also has a robust [WebRTC SDK](https://github.com/team-telnyx/webrtc) available as a separate npm module._

## Installation

Install this package with [npm](https://www.npmjs.com/):

```shell
$ npm install --save @telnyx/rtc-sipjs-simple-user
```

or using [yarn](https://yarnpkg.com/lang/en/):

```shell
$ yarn add @telnyx/rtc-sipjs-simple-user
```

## Usage

This package now builds directly on top of the SIP.js [`SimpleUser`](https://sipjs.com/guides/simple-user/) helper. You provide configuration and your own DOM/audio wiring, the library keeps the original `TelnyxDevice`/`TelnyxCall` event‑driven API layered on top of SimpleUser.

Import [TelnyxDevice](https://github.com/team-telnyx/telnyx-rtc-sipjs/blob/master/packages/telnyx-rtc-simple-user/docs/TelnyxDevice.md) where you need it:

```ts
import { TelnyxDevice } from '@telnyx/rtc-sipjs-simple-user';
```

### Creating a device

```ts
const device = new TelnyxDevice({
  host: 'sip.telnyx.com',
  port: '7443',
  wsServers: 'wss://sip.telnyx.com:7443',
  username: 'testuser',
  password: 'testuserPassword',
  displayName: 'Phone User',
  stunServers: ['stun:stun.telnyx.com:3478', 'stun:stun.l.google.com:19302'],
  turnServers: [
    {
      urls: 'turn:turn.telnyx.com:3478?transport=tcp',
      username: 'testuser',
      password: 'testpassword',
    },
  ],
  registrarServer: 'sip:sip.telnyx.com:7443',
  // supply your own audio element if you want TelnyxCall to attach media automatically
  remoteAudioElement: document.getElementById('remoteAudio') as HTMLAudioElement,
});

await device.startWS();
device.register();
```

`stunServers` and `turnServers` now default to the same Telnyx-managed ICE infrastructure that powers the [`@telnyx/webrtc`](https://github.com/team-telnyx/webrtc) SDK, so you can omit those fields unless you need to override them.

### Placing and handling calls

```ts
const call = device.initiateCall('1235556789');
call.on('telnyx.sipjs.connecting', () => console.log('dialing…'));
call.on('telnyx.sipjs.accepted', () => console.log('call connected'));

device.on('telnyx.sipjs.incomingInvite', ({ activeCall }) => {
  activeCall.on('telnyx.sipjs.accepted', () => console.log('incoming call answered'));
  // decide when to answer or reject
  activeCall.accept();
});
```

Because TelnyxDevice is powered by SimpleUser, you can follow the SIP.js [SimpleUser guide](https://sipjs.com/guides/simple-user/) for expectations around media streams, registration, and delegate callbacks—the library simply re-exposes those behaviours through the existing Telnyx event surface so your legacy integrations continue to function.

## Events

Both `TelnyxDevice` and `TelnyxCall` extend `EventEmitter` and emit events with the `telnyx.sipjs.` prefix. You can listen to these events using the `.on()` method.

Event names are defined as enums for type safety:
- `DeviceEvent` - Events for `TelnyxDevice`
- `CallEvent` - Events for `TelnyxCall`

### TelnyxDevice Events

| Event Name | Enum | Payload | Description |
|------------|------|---------|-------------|
| `telnyx.sipjs.wsConnecting` | `DeviceEvent.WsConnecting` | `{ attempts: number }` | Fired when attempting to connect to the WebSocket server |
| `telnyx.sipjs.wsConnected` | `DeviceEvent.WsConnected` | None | Fired when successfully connected to the WebSocket server |
| `telnyx.sipjs.wsDisconnected` | `DeviceEvent.WsDisconnected` | None | Fired when disconnected from the WebSocket server |
| `telnyx.sipjs.registered` | `DeviceEvent.Registered` | None | Fired when successfully registered with the SIP server |
| `telnyx.sipjs.unregistered` | `DeviceEvent.Unregistered` | `{ cause: null, response: null }` | Fired when unregistered from the SIP server |
| `telnyx.sipjs.registrationFailed` | `DeviceEvent.RegistrationFailed` | `{ cause: Error }` | Fired when registration fails |
| `telnyx.sipjs.incomingInvite` | `DeviceEvent.IncomingInvite` | `{ activeCall: TelnyxCall }` | Fired when receiving an incoming call |
| `telnyx.sipjs.message` | `DeviceEvent.Message` | `{ body: string }` | Fired when receiving a SIP message |

**Example:**
```ts
import { TelnyxDevice, DeviceEvent } from '@telnyx/rtc-sipjs-simple-user';

// Using string event names
device.on('telnyx.sipjs.registered', () => {
  console.log('Successfully registered!');
});

// Or using enum constants (recommended for type safety)
device.on(DeviceEvent.Registered, () => {
  console.log('Successfully registered!');
});

device.on(DeviceEvent.IncomingInvite, ({ activeCall }) => {
  console.log('Incoming call received');
  activeCall.accept(); // or activeCall.reject()
});

device.on(DeviceEvent.RegistrationFailed, ({ cause }) => {
  console.error('Registration failed:', cause);
});
```

### TelnyxCall Events

| Event Name | Enum | Payload | Description |
|------------|------|---------|-------------|
| `telnyx.sipjs.connecting` | `CallEvent.Connecting` | None | Fired when a call is being established |
| `telnyx.sipjs.accepted` | `CallEvent.Accepted` | None | Fired when a call is answered/accepted |
| `telnyx.sipjs.terminated` | `CallEvent.Terminated` | None | Fired when a call ends |
| `telnyx.sipjs.failed` | `CallEvent.Failed` | `Error` | Fired when a call operation fails |
| `telnyx.sipjs.rejected` | `CallEvent.Rejected` | None | Fired when an incoming call is rejected |
| `telnyx.sipjs.muted` | `CallEvent.Muted` | None | Fired when the call is muted |
| `telnyx.sipjs.unmuted` | `CallEvent.Unmuted` | None | Fired when the call is unmuted |
| `telnyx.sipjs.held` | `CallEvent.Held` | None | Fired when the call is put on hold |
| `telnyx.sipjs.resumed` | `CallEvent.Resumed` | None | Fired when the call is resumed from hold |
| `telnyx.sipjs.dtmf` | `CallEvent.Dtmf` | `{ tone: string, duration: number }` or `undefined, digits: string` | Fired when DTMF tones are sent or received |
| `telnyx.sipjs.notification` | `CallEvent.Notification` | `unknown` | Fired for other SIP notifications |

**Example:**
```ts
import { CallEvent } from '@telnyx/rtc-sipjs-simple-user';

const call = device.initiateCall('1235556789');

// Using string event names
call.on('telnyx.sipjs.connecting', () => {
  console.log('Call is connecting...');
});

// Or using enum constants (recommended for type safety)
call.on(CallEvent.Connecting, () => {
  console.log('Call is connecting...');
});

call.on(CallEvent.Accepted, () => {
  console.log('Call answered!');
});

call.on(CallEvent.Terminated, () => {
  console.log('Call ended');
});

call.on(CallEvent.Failed, (error) => {
  console.error('Call failed:', error);
});

call.on(CallEvent.Muted, () => {
  console.log('Call muted');
});

call.on(CallEvent.Dtmf, (data, digits) => {
  console.log('DTMF received:', data || digits);
});
```

## Development

This project targets Node.js 20+ and uses Yarn 4 (Berry). If you have Corepack enabled, running any `yarn` command will automatically install the correct release.

### Building the package

When working on the package directly, please use [yarn](https://github.com/yarnpkg/yarn) instead of npm.

```shell
$ yarn build
# Or to watch for changes to files:
$ yarn start
```

### Running tests

```shell
$ yarn test
```

### Generating Docs

We use [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown) to generate GitHub friendly docs.

```shell
$ yarn docs
```
