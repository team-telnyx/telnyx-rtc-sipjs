# @telnyx/rtc-sipjs-user-agent

`@telnyx/rtc-sipjs-user-agent` exposes the classic `TelnyxDevice`/`TelnyxCall` helpers built directly on top of the SIP.js [`UserAgent`](https://sipjs.com/api/classes/api_useragent.UserAgent.html) surface. Use this package if you need low-level access to SIP.js sessions but still want the familiar Telnyx event wrapper.

> **Heads up:** the legacy [`@telnyx/rtc-sipjs`](https://www.npmjs.com/package/@telnyx/rtc-sipjs) bundle is being split into this package and [`@telnyx/rtc-sipjs-simple-user`](../telnyx-rtc-simple-user/README.md). Teams that depended on `@telnyx/rtc-sipjs` for `UserAgent` workflows should move to `@telnyx/rtc-sipjs-user-agent`.

## Installation

```bash
yarn add @telnyx/rtc-sipjs-user-agent
# or
npm install @telnyx/rtc-sipjs-user-agent
```

## Usage

```ts
import { TelnyxDevice } from '@telnyx/rtc-sipjs-user-agent';

const device = new TelnyxDevice({
  host: 'sip.telnyx.com',
  port: 7443,
  wsServers: 'wss://sip.telnyx.com:7443',
  username: 'alice',
  password: 'supersecure',
});

await device.startWS();
await device.register();

const call = device.initiateCall('15551234567');
call.on('telnyx.sipjs.accepted', () => console.log('call connected!'));
```

See [`src/lib/telnyx-device.ts`](src/lib/telnyx-device.ts) for all configuration options.

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
| `telnyx.sipjs.registrationFailed` | `DeviceEvent.RegistrationFailed` | `{ cause: Error \| string }` | Fired when registration fails |
| `telnyx.sipjs.incomingInvite` | `DeviceEvent.IncomingInvite` | `{ activeCall: TelnyxCall }` | Fired when receiving an incoming call |
| `telnyx.sipjs.message` | `DeviceEvent.Message` | `{ body: unknown }` | Fired when receiving a SIP message |

**Example:**
```ts
import { TelnyxDevice, DeviceEvent } from '@telnyx/rtc-sipjs-user-agent';

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
| `telnyx.sipjs.failed` | `CallEvent.Failed` | `Error \| string` | Fired when a call operation fails |
| `telnyx.sipjs.rejected` | `CallEvent.Rejected` | None | Fired when an incoming call is rejected |
| `telnyx.sipjs.muted` | `CallEvent.Muted` | None | Fired when the call is muted |
| `telnyx.sipjs.unmuted` | `CallEvent.Unmuted` | None | Fired when the call is unmuted |
| `telnyx.sipjs.dtmf` | `CallEvent.Dtmf` | `{ tone: string, duration?: number }` or `undefined, digits: string` | Fired when DTMF tones are sent or received |
| `telnyx.sipjs.info` | `CallEvent.Info` | `Info` | Fired when a SIP INFO message is received |
| `telnyx.sipjs.notification` | `CallEvent.Notification` | `unknown` | Fired for other SIP notifications |

**Example:**
```ts
import { CallEvent } from '@telnyx/rtc-sipjs-user-agent';

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

## Scripts

- `yarn build` – builds the UMD bundles and TypeScript declarations
- `yarn test` – placeholder that keeps the workspace pipeline green
- `yarn typecheck` – runs TypeScript against the sources
