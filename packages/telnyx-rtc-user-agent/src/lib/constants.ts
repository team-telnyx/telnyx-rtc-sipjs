/**
 * Event names for TelnyxDevice
 */
export enum DeviceEvent {
  // WebSocket connection events
  WsConnecting = 'telnyx.sipjs.wsConnecting',
  WsConnected = 'telnyx.sipjs.wsConnected',
  WsDisconnected = 'telnyx.sipjs.wsDisconnected',

  // Registration events
  Registered = 'telnyx.sipjs.registered',
  Unregistered = 'telnyx.sipjs.unregistered',
  RegistrationFailed = 'telnyx.sipjs.registrationFailed',

  // Call events
  IncomingInvite = 'telnyx.sipjs.incomingInvite',

  // Message events
  Message = 'telnyx.sipjs.message',
}

/**
 * Event names for TelnyxCall
 */
export enum CallEvent {
  // Call state events
  Connecting = 'telnyx.sipjs.connecting',
  Accepted = 'telnyx.sipjs.accepted',
  Terminated = 'telnyx.sipjs.terminated',
  Failed = 'telnyx.sipjs.failed',
  Rejected = 'telnyx.sipjs.rejected',

  // Audio state events
  Muted = 'telnyx.sipjs.muted',
  Unmuted = 'telnyx.sipjs.unmuted',

  // DTMF events
  Dtmf = 'telnyx.sipjs.dtmf',

  // Info events
  Info = 'telnyx.sipjs.info',

  // Other events
  Notification = 'telnyx.sipjs.notification',
}
