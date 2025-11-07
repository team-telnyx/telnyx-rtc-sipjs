import SIP from 'sip.js';
import EventEmitter from 'es6-event-emitter';
import { TelnyxDevice, TelnyxDeviceConfig } from './telnyx-device';

class SessionMock extends EventEmitter {
  mediaHandler = new EventEmitter();
  accept(): void {}
  reject(): void {}
  terminate(): void {}
  mute(): void {}
  unmute(): void {}
  dtmf(): void {}
}

class UAMock extends EventEmitter {
  static instances: UAMock[] = [];

  constructor() {
    super();
    UAMock.instances.push(this);
  }

  start(): void {}
  stop(): void {}
  register(): void {}
  unregister(): void {}
  isConnected(): boolean {
    return true;
  }
  isRegistered(): boolean {
    return true;
  }
  invite(): SessionMock {
    return new SessionMock();
  }
}

class URIMock {
  toString(): string {
    return 'sipURI';
  }
}

describe('telnyx device', () => {
  let suite: { config: TelnyxDeviceConfig };

  beforeEach(() => {
    UAMock.instances = [];
    (SIP as unknown as { URI: typeof URIMock }).URI = URIMock;
    (SIP as unknown as { UA: typeof UAMock }).UA = UAMock;

    suite = {
      config: {
        host: 'foo.com',
        port: '8000',
        wsServers: 'WSservers',
        username: 'username',
        password: 'password',
        stunServers: 'stun',
        turnServers: { urls: 'turn' },
        registrarServer: 'registrar',
      },
    };
  });

  describe('constructor', () => {
    it('loads', () => {
      const deviceConstructor = () => {
        new TelnyxDevice(suite.config);
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
      const config = { ...suite.config } as Partial<TelnyxDeviceConfig>;
      delete config.host;
      const deviceConstructor = () => new TelnyxDevice(config as TelnyxDeviceConfig);
      expect(deviceConstructor).toThrowError(TypeError);
    });

    it("requires 'port' config option", () => {
      const config = { ...suite.config } as Partial<TelnyxDeviceConfig>;
      delete config.port;
      const deviceConstructor = () => new TelnyxDevice(config as TelnyxDeviceConfig);
      expect(deviceConstructor).toThrowError(TypeError);
    });

    it('Creates a SIPjs User Agent', () => {
      new TelnyxDevice(suite.config);
      expect(UAMock.instances.length).toBe(1);
    });
  });

  it('initiates a call', () => {
    let tcall: unknown;
    const device = new TelnyxDevice(suite.config);
    device._userAgent = new UAMock();
    const makeCall = () => {
      tcall = device.initiateCall('1235556789');
    };

    expect(makeCall).not.toThrow();
    expect(typeof tcall).toBe('object');
  });
});
