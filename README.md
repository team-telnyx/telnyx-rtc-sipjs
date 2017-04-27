# @telnyx/rtc

A stand alone JS API for Telnyx's WebRTC offering.
Our goal is to provide an API for Telnyx WebRTC that is as simple as possible, but no simpler.
We hide as much of the gorey, low level SIP and auth details as we can, while still providing enough detail
to build a beautiful and responsive phone UI.

Under the covers we use [SIP.JS](https://sipjs.com/), but that is merely an implementation detail. It is bundled in the distributed file.



## Installation

You'll need to get set up to use the [@telnyx npm registry](https://github.com/team-telnyx/documentation/blob/master/languages/javascript/node/registry.md) before you start.

```shell
$ npm install --save @telnyx/rtc
```

or

```shell
$ yarn add @telnyx/rtc
```


## Usage

In Telnyx webpack built projects you'll need to require the library:

```javascript
require("script!../../node_modules/@telnyx/rtc/dist/telnyx-rtc.js");
```


Then import [TelnyxDevice](https://github.com/team-telnyx/telnyx-rtc/blob/master/docs/TelnyxDevice.md) in the module where you need it.

```javascript
import { TelnyxDevice } from "@telnyx/rtc";
```


### Example Config and initiation

```javascript
let config = {
  host: "sip.telnyx.com",
  port: "7443",
  wsServers: "wss://sip.telnyx.com:7443",
  displayName: "Phone User",
  username: "testuser",
  password: "testuserPassword",
  stunServers: "stun:stun.telnyx.com:3843",
  turnServers: {
    urls: ["turn:turn.telnyx.com:3478?transport=tcp"],
    username: "turnuser",
    password: "turnpassword"
  },
  registrarServer: "sip:sip.telnyx.com:7443"
};

let device = new TelnyxDevice(config);
```

### Example Phone Call

```javascript
let activeCall = device.initiateCall("1235556789");

activeCall.on("connecting", () => {console.log("it's connecting!")});
activeCall.on("accepted", () => {console.log("We're on a phone call!")});
```

See the [TelnyxDevice](https://github.com/team-telnyx/telnyx-rtc/blob/master/docs/TelnyxDevice.md) and [TelnyxCall](https://github.com/team-telnyx/telnyx-rtc/blob/master/docs/TelnyxCall.md) for more details.

## Testing your UI

Sometimes you need to test your UI without making phone calls all the time. See [@telnyx/rtc-mocks](https://github.com/team-telnyx/telnyx-rtc-mocks).



## Building the package

When working on the package directly, please use [yarn](https://github.com/yarnpkg/yarn) instead of npm.

```shell
$ yarn run build
```

Use [@telnyx/npm-release](https://github.com/team-telnyx/npm-release) to manage versions.

### Running tests

```shell
$ yarn run test
```

### Generating Docs

We use [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown) to generate github friendly docs.

```shell
$ yarn run docs
```

