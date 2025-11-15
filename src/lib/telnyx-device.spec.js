import * as SIP from 'sip.js';
import { TelnyxDevice } from './telnyx-device';

describe('telnyx device', () => {
  let registererMock;
  let inviterMock;
  let userAgentInstance;
  let sdhFactorySpy;
  let MockUserAgent;
  let MockRegisterer;
  let MockInviter;
  let MockWeb;
  let dependencies;
  let registererStateListener;
  let lastRegisterOptions;

  const mockRegisterer = () => ({
    register: jasmine.createSpy('register').and.callFake((options) => {
      lastRegisterOptions = options;
      return Promise.resolve();
    }),
    unregister: jasmine.createSpy('unregister').and.returnValue(Promise.resolve()),
    dispose: jasmine.createSpy('dispose').and.returnValue(Promise.resolve()),
    state: SIP.RegistererState.Unregistered,
    stateChange: { addListener: jasmine.createSpy('addListener').and.callFake((cb) => {
      registererStateListener = cb;
      cb(SIP.RegistererState.Unregistered);
    }) }
  });

  const mockInviter = () => ({
    invite: jasmine.createSpy('invite').and.returnValue(Promise.resolve())
  });

  beforeEach(() => {
    registererStateListener = null;
    lastRegisterOptions = null;
    registererMock = mockRegisterer();
    inviterMock = mockInviter();

    sdhFactorySpy = jasmine.createSpy('defaultSessionDescriptionHandlerFactory').and.returnValue(() => {});

    // Create a spy for the makeURI static method
    const makeURISpy = jasmine.createSpy('makeURI').and.callFake((input) => {
      if (!input) {
        return undefined;
      }
      return { toString: () => input, clone: function() { return this; } };
    });

    // Create mock UserAgent constructor
    let transportConnected = false;
    MockUserAgent = jasmine.createSpy('UserAgent').and.callFake(function(options) {
      transportConnected = false;
      userAgentInstance = {
        options,
        start: jasmine.createSpy('start').and.callFake(() => {
          transportConnected = true;
          return Promise.resolve();
        }),
        stop: jasmine.createSpy('stop').and.callFake(() => {
          transportConnected = false;
          return Promise.resolve();
        }),
        isConnected: jasmine.createSpy('isConnected').and.callFake(() => transportConnected),
        delegate: null,
        transport: { configuration: { server: options.transportOptions.server } }
      };
      return userAgentInstance;
    });
    MockUserAgent.makeURI = makeURISpy;

    // Create mock Registerer constructor
    MockRegisterer = jasmine.createSpy('Registerer').and.callFake(() => registererMock);

    // Create mock Inviter constructor
    // Must extend real Inviter for instanceof checks in TelnyxCall
    MockInviter = jasmine.createSpy('Inviter').and.callFake(function() {
      // Create an instance that will pass instanceof checks against the real Inviter
      const instance = Object.create(SIP.Inviter.prototype);
      Object.assign(instance, inviterMock);
      return instance;
    });

    // Create mock Web object
    MockWeb = {
      defaultSessionDescriptionHandlerFactory: sdhFactorySpy
    };

    // Package dependencies for injection
    dependencies = {
      UserAgent: MockUserAgent,
      Registerer: MockRegisterer,
      Inviter: MockInviter,
      Web: MockWeb
    };
  });

  const buildConfig = () => ({
    host: 'foo.com',
    port: '8000',
    wsServers: ['wss://foo.com:8000'],
    username: 'username',
    password: 'password',
    stunServers: ['stun:foo.com:3478'],
    turnServers: [{ urls: ['turn:foo.com:3478'], username: 'turn', password: 'turn' }],
    registrarServer: 'sip:foo.com:8000'
  });

  describe('constructor', () => {
    it('loads', () => {
      const config = buildConfig();
      const construct = () => new TelnyxDevice(config, dependencies);
      expect(construct).not.toThrow();
      expect(MockUserAgent).toHaveBeenCalled();
      expect(MockRegisterer).toHaveBeenCalled();
    });

    it('requires a config object', () => {
      expect(() => new TelnyxDevice()).toThrow();
      // @ts-ignore
      expect(() => new TelnyxDevice('string')).toThrow();
    });

    it("requires 'host' config option", () => {
      const config = buildConfig();
      delete config.host;
      expect(() => new TelnyxDevice(config, dependencies)).toThrowError(TypeError);
    });

    it("requires 'port' config option", () => {
      const config = buildConfig();
      delete config.port;
      expect(() => new TelnyxDevice(config, dependencies)).toThrowError(TypeError);
    });
  });

  it('starts and stops the websocket', async () => {
    const config = buildConfig();
    const device = new TelnyxDevice(config, dependencies);
    spyOn(device, 'trigger');

    await device.startWS();
    expect(userAgentInstance.start).toHaveBeenCalled();
    expect(device.trigger).toHaveBeenCalledWith('wsConnecting', jasmine.any(Object));

    await device.stopWS();
    expect(userAgentInstance.stop).toHaveBeenCalled();
  });

  it('registers and unregisters the device', async () => {
    const config = buildConfig();
    const device = new TelnyxDevice(config, dependencies);
    await device.register();
    expect(registererMock.register).toHaveBeenCalled();
    expect(userAgentInstance.start).toHaveBeenCalled();

    await device.unregister();
    expect(registererMock.unregister).toHaveBeenCalled();
  });

  it('initiates a call', async () => {
    const config = buildConfig();
    const device = new TelnyxDevice(config, dependencies);
    spyOn(device, '_buildTargetUri').and.returnValue({ toString: () => 'sip:123@foo.com', clone: function() { return this; } });
    spyOn(device, '_buildSessionDescriptionHandlerMediaConstraints').and.returnValue({});
    spyOn(device, '_ensureConnectivityWithSipServer').and.callFake(() => {});
    const ensureSpy = spyOn(device, '_ensureTransportIsStarted').and.returnValue(Promise.resolve());

    const call = device.initiateCall('1235556789');

    expect(call).toBeDefined();
    expect(MockInviter).toHaveBeenCalled();
    await ensureSpy.calls.mostRecent().returnValue;
    expect(inviterMock.invite).toHaveBeenCalled();
  });

  it('emits registrationFailed when the register request is rejected', async () => {
    const config = buildConfig();
    const device = new TelnyxDevice(config, dependencies);
    spyOn(device, 'trigger');

    await device.register();
    expect(lastRegisterOptions).toBeTruthy();
    const fakeResponse = { message: { statusCode: 403, reasonPhrase: 'Forbidden' } };
    lastRegisterOptions.requestDelegate.onReject(fakeResponse);
    expect(device.trigger).toHaveBeenCalledWith('registrationFailed', jasmine.objectContaining({
      cause: fakeResponse,
      response: fakeResponse.message
    }));
  });

  it('treats registerer termination as an unregistration event', () => {
    const config = buildConfig();
    const device = new TelnyxDevice(config, dependencies);
    spyOn(device, 'trigger');
    if (registererStateListener) {
      registererStateListener(SIP.RegistererState.Terminated);
    }
    expect(device.trigger).toHaveBeenCalledWith('unregistered', {cause: 'terminated', response: null});
    expect(device.trigger).not.toHaveBeenCalledWith('registrationFailed', jasmine.any(Object));
  });
});
