# Changelog

This changelog tracks changes across the Telnyx RTC SIP.js monorepo.

---

## Packages

### @telnyx/rtc-sipjs-simple-user

#### 0.0.8

##### Documentation Changes

* **docs:** Added comprehensive API documentation following the webrtc SDK documentation format:
  * Updated `TelnyxDevice.md` with full API reference, configuration options (`TelnyxDeviceConfig`, `TurnServerConfig`), events, and usage examples.
  * Created `TelnyxCall.md` with full API reference, methods, events with enum constants, and call state diagrams.
* **docs:** Added comparison tables between `@telnyx/rtc-sipjs-simple-user` and `@telnyx/rtc-sipjs-user-agent` to help users choose the right package.

#### 0.0.7

##### New Features

* **TelnyxDevice:** Accept an optional `remoteAudioElement` so the remote media stream can be auto-attached by the library when calls connect.
* **TelnyxDevice:** Support passing SIP headers via `register({ extraHeaders })` and `unregister({ extraHeaders })`.
* **TelnyxDevice:** Default STUN/TURN servers to the same configuration used by [`@telnyx/webrtc`](https://github.com/team-telnyx/webrtc).
* **TelnyxDevice/TelnyxCall:** Typed `on()` and `off()` event listener methods with proper TypeScript signatures.
* **Constants:** New `DeviceEvent` and `CallEvent` enums for type-safe event subscription.
* **TelnyxCall:** WebRTC stats collection via `@peermetrics/webrtc-stats` with `Stats` event emission.
* **TelnyxCall:** `getSession()` and `getPeerConnection()` methods to access the underlying SIP.js session and WebRTC peer connection.
* **TelnyxCall:** `Held` and `Resumed` events for call hold state changes.

##### Breaking Changes

* **Core:** Rebuilt `TelnyxDevice`/`TelnyxCall` on top of SIP.js [`SimpleUser`](https://sipjs.com/guides/simple-user/) and converted the library to TypeScript.

##### Dependency Updates

* **sip.js:** Upgrade to 0.21.2 to pick up the SimpleUser helper and modern WebRTC fixes.
* **@peermetrics/webrtc-stats:** Added for WebRTC stats collection.

---

### @telnyx/rtc-sipjs-user-agent

#### 0.0.3

##### Documentation Changes

* **docs:** Added comprehensive API documentation following the webrtc SDK documentation format:
  * Created `TelnyxDevice.md` with full API reference, configuration options, events, and usage examples.
  * Created `TelnyxCall.md` with full API reference, methods, events with enum constants, session state mapping, and audio handling documentation.
* **docs:** Added comparison tables between packages.

#### 0.0.2

##### New Features

* **TelnyxDevice:** Accept an optional `remoteAudioElement` so the remote media stream can be auto-attached by the library when calls connect.
* **TelnyxDevice:** Support passing SIP headers via `register({ extraHeaders })` and `unregister({ extraHeaders })`.
* **TelnyxDevice:** Default STUN/TURN servers to the same configuration used by [`@telnyx/webrtc`](https://github.com/team-telnyx/webrtc).
* **TelnyxDevice:** `traceSip` option properly passed to SIP.js transport options for SIP message tracing.
* **TelnyxDevice/TelnyxCall:** Typed `on()` and `off()` event listener methods with proper TypeScript signatures.
* **Constants:** New `DeviceEvent` and `CallEvent` enums for type-safe event subscription.
* **TelnyxCall:** Full access to the underlying SIP.js `Session` object for advanced use cases.
* **TelnyxCall:** `Info` event for handling SIP INFO messages.
* **TelnyxCall:** DTMF parsing from SIP INFO messages (`application/dtmf-relay` content type).
* **TelnyxCall:** Auto-creation of audio element in the DOM when `remoteAudioElement` is not provided.

##### Breaking Changes

* **Core:** Built `TelnyxDevice`/`TelnyxCall` on top of SIP.js [`UserAgent`](https://sipjs.com/api/classes/api_useragent.UserAgent.html) with TypeScript.

##### Dependency Updates

* **sip.js:** Uses 0.21.2 for modern WebRTC fixes.

---

## Package Comparison

| Feature | `@telnyx/rtc-sipjs-simple-user` | `@telnyx/rtc-sipjs-user-agent` |
|---------|--------------------------------|-------------------------------|
| SIP.js API | SimpleUser (high-level) | UserAgent (low-level) |
| Built-in WebRTC stats | Yes (`Stats` event) | No |
| Hold events | Yes (`Held`/`Resumed`) | No |
| SIP INFO handling | No | Yes (`Info` event) |
| Direct session access | Limited (via `getSession()`) | Full |
| Auto-create audio element | No | Yes |

---

## Legacy Releases (pre-monorepo)

The versions below refer to the original `@telnyx/rtc-sipjs` package before the monorepo split.

#### 1.3.6 (2017-5-19)

##### Bug Fixes

* **TelnyxDevice:** Chrome consistently connecting to SIP [TEL-1010] ([890a75f2](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/890a75f2693a912bf20ef77075ebddb4eaf8ba53))

#### 1.3.5 (2017-5-19)

##### Documentation Changes

* **server:** Update to new stun and turn servers in examples ([963e5499](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/963e5499a12e679147e58d9913632663a681ceb9))

##### Bug Fixes

* **TelnyxDevice:** Chrome would not connect to web socket [TEL-1010] ([4da7d0ab](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/4da7d0ab447dbc7d72e95d06f47fd68700a3e834))

#### 1.3.4 (2017-4-13)

##### New Features

* **TelnyxDevice:** Add support for tuning log level and traceSip ([3238131f](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/3238131f07049f610915eb431741e75ac2d92726))

#### 1.3.3 (2017-4-12)

##### Documentation Changes

* **README:** remove links to private repos from readme ([32764939](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/3276493989a73b405e61cd15ab6d0a8bf88c9ac3))

##### Bug Fixes

* **Audio:** Fix one-way audio issue. (TEL-964) ([6b236b85](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/6b236b850f6267d5e49a3940b03e06b6a0d92463))

#### 1.3.2 (2017-4-10)

##### Documentation Changes

* **TelnyxCall:** Add docs for accept, reject and request ([702385d3](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/702385d37c14905e858a6ca65a303a822a23c1ae))

##### New Features

* **TelnyxCall:** Add 'request' support to show From info on incoming ([c135527c](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/c135527cfd2f4a8cd52ae47094eb8bf1be80058e))

#### 1.3.1 (2017-4-7)

##### Documentation Changes

* **all:** Build new docs ([17a9a684](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/17a9a684d88adb708b57e3cd4d92cc1447a3140c))

##### Bug Fixes

* **incoming:** Don't ask user for permission to use camera ([c8447a89](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/c8447a896b3bd2f133c0318e338d6827e6098695))

### 1.3.0 (2017-4-6)

##### Chores

* **dist files:** commit dist files. ([a2e9985c](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/a2e9985ccf36f15983edc64f722da9ffefbbe6cb))

##### New Features

* **incoming calls:** Draft support for incoming calls. ([dcbb176a](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/dcbb176a59e41d0553c6096ce4acb843f79b2965))

##### Bug Fixes

* **TelnyxCall:** add isIncoming and isOutgoing helpers ([d8093687](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/d8093687f5d08f01f39e6b8c0287c59538f88db8))
* **sip.js:** upgrade from 0.7.5 to 0.7.7 ([c1e11521](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/c1e115218e89ccc62ee76ee4daef634e4b36f0b7))

### 1.2.0 (2017-1-13)

##### Chores

* **rtc-mocks:** upgrade @telnyx/rtc-mocks dependency to 1.0.3 ([7a343921](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/7a3439211a6ef1e7245d0272ba12f48ae6ab62f1))

##### Documentation Changes

* **README:** remove use of deprecated method in Example Config section. ([38dcb69c](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/38dcb69c145b1139bfbe8ac2e7e59174b74cf690))
* **API:**
  * Typo in event class names ([24022407](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/240224073dfb0600add6224cce2d634668cb82f0))
  * Add details to README, a rudimentary doc gen system, and built API docs. ([92c361a9](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/92c361a912e9720f124e9a0d4342e6233c123350))

##### New Features

* **TelnyxDevice:** Add isWSConnected() method in additon to previously added startWS and stopWS methods. ([f25f030c](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/f25f030cd6b1c4a41fa23c4758d5212504d01bf0))

##### Other Changes

* **package.json:** move everything from dependencies to devDependencies. ([7d6bcdc5](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/7d6bcdc587509774f85615e14218c4b0d0ae2e30))
* **docs:** Refactor docs and doc build system to use jsdoc-to-markdown ([2ffa30b0](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/2ffa30b045370e035376ff8d9b052df0c24f5642))

##### Refactors

* **TelnyxDevice:** Move TelnyxDevice class definition to its own file, add WebSocket events. ([4ab289c3](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/4ab289c35367f6b4178bf5ceaad06e23c7788116))

##### Tests

* **TelnyxDevice:** fix existing test after last refactor ([db8925ee](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/db8925eea69aa1de8c78715c59db1f79e56100f0))

### 1.1.0 (2017-1-9)

##### Chores

* **dist files:** Build dist files ([e8e9fd4a](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/e8e9fd4ace68621f288870b4879bb26d889998f2))

##### New Features

* **api:** Simplify TelnyxDevice constructor to expect a single object with all parameters. ([0d3fa6a0](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/0d3fa6a0205be4de0843d745ebd87a3973b65533))

##### Bug Fixes

* **events:** Add more events from underlying sip.js ([962d76e2](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/962d76e2fad89d565cd56b565bbb70c841901ff9))

##### Refactors

* **SIP.js Integration:** Plain import sip.js and use jasmine more effectively to fake it out in tests ([4b9d13ff](https://github.com/team-telnyx/telnyx-rtc-sipjs/commit/4b9d13ff0e2e9ffe3c00b3b28dc2f195a3bc3be8))
