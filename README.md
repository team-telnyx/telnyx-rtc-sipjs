# @telnyx/rtc

A stand alone JS API for WebRTC. Essentially a fork of https://github.com/team-telnyx/js-dial without the UI components in it, and following the new API described in https://telnyx.atlassian.net/wiki/display/TT/WebRTC+Core+API.

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


Then import `TelnyxDevice` in the module where you need it.

```javascript
import { TelnyxDevice } from "@telnyx/rtc";
```


### Example Config and initiation

```javascript
let config = {
  host: "123.0.0.0",
  port: "5066",
  wsServers: "ws://123.0.0.0:5066",
  displayName: "Phone User",
  username: "testuser",
  password: "testuserPassword",
  stunServers: "stun:stun.example.com:3843",
  turnServers: {
    urls: ["turn:123.0.0.0:3478?transport=tcp"],
    username: "turnuser",
    password: "turnpassword"
  },
  registrarServer: "sip:123.0.0.0:5066"
};

let device = new TelnyxDevice(config);
device.authorize();
```

### Example Phone Call

```javascript
let activeCall = device.initiateCall("1235556789");

activeCall.on("connecting", () => {console.log("it's connecting!")});
```

See the [TelnyxDevice](https://github.com/team-telnyx/telnyx-rtc/blob/master/docs/TelnyxDevice.md) and [TelnyxCall](https://github.com/team-telnyx/telnyx-rtc/blob/master/docs/TelnyxCall.md) for more details.

## Testing your UI

Sometimes you need to test your UI without making phone calls all the time. See [@telnyx/rtc-mocks](https://github.com/team-telnyx/telnyx-rtc-mocks).



## Building the package

When working on the package directly, please use [yarn](https://github.com/yarnpkg/yarn) instead of npm.

```
$ yarn run build
```

Use [@telnyx/npm-release](https://github.com/team-telnyx/npm-release) to manage versions.

### Generating Docs

We use [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown) to generate github friendly docs. 

```
$ yarn run docs
```

