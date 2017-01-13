### 1.2.0 (2017-1-13)

##### Chores

* **rtc-mocks:** upgrade @telnyx/rtc-mocks dependency to 1.0.3 ([7a343921](https://github.com/team-telnyx/telnyx-rtc/commit/7a3439211a6ef1e7245d0272ba12f48ae6ab62f1))

##### Documentation Changes

* **README:** remove use of deprecated method in Example Config section. ([38dcb69c](https://github.com/team-telnyx/telnyx-rtc/commit/38dcb69c145b1139bfbe8ac2e7e59174b74cf690))
* **API:**
  * Typo in event class names ([24022407](https://github.com/team-telnyx/telnyx-rtc/commit/240224073dfb0600add6224cce2d634668cb82f0))
  * Add details to README, a rudimentary doc gen system, and built API docs. ([92c361a9](https://github.com/team-telnyx/telnyx-rtc/commit/92c361a912e9720f124e9a0d4342e6233c123350))

##### New Features

* **TelnyxDevice:** Add isWSConnected() method in additon to previously added startWS and stopWS methods. ([f25f030c](https://github.com/team-telnyx/telnyx-rtc/commit/f25f030cd6b1c4a41fa23c4758d5212504d01bf0))

##### Other Changes

* **package.json:** move everything from dependencies to devDependencies. ([7d6bcdc5](https://github.com/team-telnyx/telnyx-rtc/commit/7d6bcdc587509774f85615e14218c4b0d0ae2e30))
* **docs:** Refactor docs and doc build system to use jsdoc-to-markdown ([2ffa30b0](https://github.com/team-telnyx/telnyx-rtc/commit/2ffa30b045370e035376ff8d9b052df0c24f5642))

##### Refactors

* **TelnyxDevice:** Move TelnyxDevice class definition to its own file, add WebSocket events. ([4ab289c3](https://github.com/team-telnyx/telnyx-rtc/commit/4ab289c35367f6b4178bf5ceaad06e23c7788116))

##### Tests

* **TelnyxDevice:** fix existing test after last refactor ([db8925ee](https://github.com/team-telnyx/telnyx-rtc/commit/db8925eea69aa1de8c78715c59db1f79e56100f0))

### 1.1.0 (2017-1-9)

##### Chores

* **dist files:** Build dist files ([e8e9fd4a](https://github.com/team-telnyx/telnyx-rtc/commit/e8e9fd4ace68621f288870b4879bb26d889998f2))

##### New Features

* **api:** Simplify TelnyxDevice constructor to expect a single object with all parameters. ([0d3fa6a0](https://github.com/team-telnyx/telnyx-rtc/commit/0d3fa6a0205be4de0843d745ebd87a3973b65533))

##### Bug Fixes

* **events:** Add more events from underlying sip.js ([962d76e2](https://github.com/team-telnyx/telnyx-rtc/commit/962d76e2fad89d565cd56b565bbb70c841901ff9))

##### Refactors

* **SIP.js Integration:** Plain import sip.js and use jasmine more effectively to fake it out in tests ([4b9d13ff](https://github.com/team-telnyx/telnyx-rtc/commit/4b9d13ff0e2e9ffe3c00b3b28dc2f195a3bc3be8))

