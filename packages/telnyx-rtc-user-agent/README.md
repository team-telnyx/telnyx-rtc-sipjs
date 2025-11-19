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
device.register();

const call = device.initiateCall('15551234567');
call.on('accepted', () => console.log('call connected!'));
```

See [`src/lib/telnyx-device.ts`](src/lib/telnyx-device.ts) for all configuration options.

## Scripts

- `yarn build` – builds the UMD bundles and TypeScript declarations
- `yarn test` – placeholder that keeps the workspace pipeline green
- `yarn typecheck` – runs TypeScript against the sources
