# Telnyx RTC SIP.js Monorepo

This repository now mirrors the layout of the [`@telnyx/webrtc`](../webrtc) workspace. It contains two packages built on SIP.js 0.21 so you can choose the helper that best matches your integration style:

> **Heads up:** the legacy [`@telnyx/rtc-sipjs`](https://www.npmjs.com/package/@telnyx/rtc-sipjs) publish is being split into these two packages. If you currently depend on `@telnyx/rtc-sipjs`, plan to migrate to the package that matches your integration before the split lands.

- [`@telnyx/rtc-sipjs-simple-user`](packages/telnyx-rtc-simple-user/README.md) – retains the modern SimpleUser powered implementation of `TelnyxDevice`/`TelnyxCall`.
- [`@telnyx/rtc-sipjs-user-agent`](packages/telnyx-rtc-user-agent/README.md) – restores a `UserAgent` driven device for teams that still depend on the classic SIP.js API surface.

## Getting started

```bash
yarn install
yarn workspaces list
```

Each workspace exposes the usual `build`, `test`, `typecheck`, and `clean` scripts. You can target a specific package with `yarn workspace <name> <script>` or run every package in parallel:

```bash
yarn build
```

Refer to the README inside each package for detailed usage instructions.
