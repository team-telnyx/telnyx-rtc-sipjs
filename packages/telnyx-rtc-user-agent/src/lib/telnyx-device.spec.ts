import { TelnyxDevice, DEFAULT_STUN_SERVERS, DEFAULT_TURN_SERVERS } from './telnyx-device';

describe('telnyx device', () => {
  const validConfig = {
    host: 'sip.example.com',
    port: '7443',
    username: 'testuser',
    password: 'testpass',
  };

  it('defaults stun/turn servers to the Telnyx WebRTC configuration', () => {
    const device = new TelnyxDevice(validConfig);
    expect(device.stunServers).toEqual(DEFAULT_STUN_SERVERS);
    expect(device.turnServers).toEqual(DEFAULT_TURN_SERVERS);
  });

  describe('constructor', () => {
    it('loads', () => {
      expect(typeof TelnyxDevice).toBe('function');
    });

    it('requires a config object', () => {
      expect(() => new TelnyxDevice(null as any)).toThrow("TelnyxDevice: Missing config");
    });

    it("requires 'host' config option", () => {
      const config = { ...validConfig, host: undefined } as any;
      expect(() => new TelnyxDevice(config)).toThrow("TelnyxDevice: Missing 'host' parameter");
    });

    it("requires 'port' config option", () => {
      const config = { ...validConfig, port: undefined } as any;
      expect(() => new TelnyxDevice(config)).toThrow("TelnyxDevice: Missing 'port' parameter");
    });

    it('accepts custom stun servers', () => {
      const customStun = ['stun:custom.server.com:3478'];
      const device = new TelnyxDevice({
        ...validConfig,
        stunServers: customStun,
      });
      expect(device.stunServers).toEqual(customStun);
    });

    it('accepts custom turn servers', () => {
      const customTurn = {
        urls: 'turn:custom.server.com:3478',
        username: 'user',
        password: 'pass',
      };
      const device = new TelnyxDevice({
        ...validConfig,
        turnServers: customTurn,
      });
      expect(device.turnServers).toEqual(customTurn);
    });

    it('uses username as displayName when displayName is not provided', () => {
      const device = new TelnyxDevice(validConfig);
      expect(device.displayName).toBe(validConfig.username);
    });

    it('uses provided displayName when available', () => {
      const displayName = 'Test User';
      const device = new TelnyxDevice({
        ...validConfig,
        displayName,
      });
      expect(device.displayName).toBe(displayName);
    });
  });

  describe('connection methods', () => {
    it('has startWS method', () => {
      const device = new TelnyxDevice(validConfig);
      expect(typeof device.startWS).toBe('function');
    });

    it('has stopWS method', () => {
      const device = new TelnyxDevice(validConfig);
      expect(typeof device.stopWS).toBe('function');
    });

    it('has isWSConnected method', () => {
      const device = new TelnyxDevice(validConfig);
      expect(typeof device.isWSConnected).toBe('function');
    });
  });

  describe('registration methods', () => {
    it('has register method', () => {
      const device = new TelnyxDevice(validConfig);
      expect(typeof device.register).toBe('function');
    });

    it('has unregister method', () => {
      const device = new TelnyxDevice(validConfig);
      expect(typeof device.unregister).toBe('function');
    });

    it('has isRegistered method', () => {
      const device = new TelnyxDevice(validConfig);
      expect(typeof device.isRegistered).toBe('function');
      expect(device.isRegistered()).toBe(false);
    });
  });

  describe('call methods', () => {
    it('has initiateCall method', () => {
      const device = new TelnyxDevice(validConfig);
      expect(typeof device.initiateCall).toBe('function');
    });

    it('has activeCall method', () => {
      const device = new TelnyxDevice(validConfig);
      expect(typeof device.activeCall).toBe('function');
      expect(device.activeCall()).toBeUndefined();
    });
  });

  describe('event emitter', () => {
    it('extends event emitter', () => {
      const device = new TelnyxDevice(validConfig);
      expect(typeof device.on).toBe('function');
      expect(typeof device.off).toBe('function');
    });
  });
});
