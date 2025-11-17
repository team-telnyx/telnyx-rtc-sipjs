import {
  TelnyxDevice,
  TelnyxDeviceConfig,
  DEFAULT_STUN_SERVERS,
  DEFAULT_TURN_SERVERS,
} from './telnyx-device';

describe('telnyx device', () => {
  let config: TelnyxDeviceConfig;

  beforeEach(() => {
    config = {
      host: 'foo.com',
      port: '8000',
      wsServers: 'wss://foo.com:8000',
      username: 'username',
      password: 'password',
      stunServers: 'stun:foo.com',
      turnServers: { urls: 'turn:foo.com', username: 'turn', password: 'turn' },
      registrarServer: 'sip:foo.com',
    };
  });

  describe('constructor', () => {
    it('loads', () => {
      const deviceConstructor = () => {
        new TelnyxDevice(config);
      };
      expect(deviceConstructor).not.toThrow();
    });

    it('requires a config object', () => {
      let deviceConstructor = () => new TelnyxDevice(undefined as unknown as TelnyxDeviceConfig);
      expect(deviceConstructor).toThrow();
      deviceConstructor = () => new TelnyxDevice('string' as unknown as TelnyxDeviceConfig);
      expect(deviceConstructor).toThrow();
    });

    it("requires 'host' config option", () => {
      const invalidConfig = { ...config, host: '' };
      const deviceConstructor = () => new TelnyxDevice(invalidConfig);
      expect(deviceConstructor).toThrowError(TypeError);
    });

    it("requires 'port' config option", () => {
      const invalidConfig = { ...config, port: '' };
      const deviceConstructor = () => new TelnyxDevice(invalidConfig as TelnyxDeviceConfig);
      expect(deviceConstructor).toThrowError(TypeError);
    });
  });

  it('initiates a call', () => {
    const device = new TelnyxDevice(config);
    const makeCall = () => device.initiateCall('1235556789');

    expect(makeCall).not.toThrow();
    expect(device.activeCall()).toBeTruthy();
  });

  it('defaults stun/turn servers to the Telnyx WebRTC configuration', () => {
    const { stunServers, turnServers, ...rest } = config;
    const device = new TelnyxDevice(rest as TelnyxDeviceConfig);

    expect(device.stunServers).toEqual(DEFAULT_STUN_SERVERS);
    expect(device.turnServers).toEqual(DEFAULT_TURN_SERVERS);
  });
});
