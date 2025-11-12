# Telnyx WebRTC SIP JavaScript library

![npm (scoped)](https://img.shields.io/npm/v/@telnyx/rtc-sipjs)

The Telnyx SIP-based WebRTC JS library powers up your web application with the ability to make and receive phone calls directly in the browser.

Check out the library in action in [this web dialer demo](https://webrtc.telnyx.com/).

_Looking for more WebRTC features, JSON-RPC support or need to quickly get spun up with a React app? Telnyx also has a robust [WebRTC SDK](https://github.com/team-telnyx/webrtc) available as a separate npm module._

## Installation

Install this package with [npm](https://www.npmjs.com/):

```shell
$ npm install --save @telnyx/rtc-sipjs
```

or using [yarn](https://yarnpkg.com/lang/en/):

```shell
$ yarn add @telnyx/rtc-sipjs
```

## Usage

This package now builds directly on top of the SIP.js [`SimpleUser`](https://sipjs.com/guides/simple-user/) helper. You provide configuration and your own DOM/audio wiring, the library keeps the original `TelnyxDevice`/`TelnyxCall` event‑driven API layered on top of SimpleUser.

Import [TelnyxDevice](https://github.com/team-telnyx/telnyx-rtc-sipjs/blob/master/docs/TelnyxDevice.md) where you need it:

```ts
import { TelnyxDevice } from '@telnyx/rtc-sipjs';
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
call.on('connecting', () => console.log('dialing…'));
call.on('accepted', () => console.log('call connected'));

device.on('incomingInvite', ({ activeCall }) => {
  activeCall.on('accepted', () => console.log('incoming call answered'));
  // decide when to answer or reject
  activeCall.accept();
});
```

Because TelnyxDevice is powered by SimpleUser, you can follow the SIP.js [SimpleUser guide](https://sipjs.com/guides/simple-user/) for expectations around media streams, registration, and delegate callbacks—the library simply re-exposes those behaviours through the existing Telnyx event surface so your legacy integrations continue to function.

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
