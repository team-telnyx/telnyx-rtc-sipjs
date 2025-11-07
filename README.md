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

Import [TelnyxDevice](https://github.com/team-telnyx/telnyx-rtc-sipjs/blob/master/docs/TelnyxDevice.md) in the module where you need it.

```javascript
import { TelnyxDevice } from '@telnyx/rtc-sipjs';
```

### Example config and initiation

```javascript
let config = {
  host: 'sip.telnyx.com',
  port: '7443',
  wsServers: 'wss://sip.telnyx.com:7443',
  displayName: 'Phone User',
  username: 'testuser',
  password: 'testuserPassword',
  stunServers: 'stun:stun.telnyx.com:3478',
  turnServers: {
    urls: ['turn:turn.telnyx.com:3478?transport=tcp'],
    username: 'turnuser',
    password: 'turnpassword',
  },
  registrarServer: 'sip:sip.telnyx.com:7443',
};

let device = new TelnyxDevice(config);
```

### Example phone call

```javascript
let activeCall = device.initiateCall('1235556789');

activeCall.on('connecting', () => {
  console.log("it's connecting!");
});
activeCall.on('accepted', () => {
  console.log("We're on a phone call!");
});
```

See the [TelnyxDevice](https://github.com/team-telnyx/telnyx-rtc-sipjs/blob/master/docs/TelnyxDevice.md) and [TelnyxCall](https://github.com/team-telnyx/telnyx-rtc-sipjs/blob/master/docs/TelnyxCall.md) for more details.

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
