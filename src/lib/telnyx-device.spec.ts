import { TelnyxDevice, TelnyxDeviceConfig } from './telnyx-device';

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
});
