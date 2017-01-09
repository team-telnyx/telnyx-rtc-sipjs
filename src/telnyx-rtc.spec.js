import SIP  from 'sip.js';
import {TelnyxDevice} from "./telnyx-rtc";
import EventEmitter from 'es6-event-emitter';

describe("telnyx device", () => {
  let suite = {};

  class URI { toString() {return 'sipURI'; } };
  class UA {
    start() {}
    invite() {
      let sess = new EventEmitter();
      sess.mediaHandler = new EventEmitter();
      return sess;
    }
  };

  beforeEach(() => {
    spyOn(SIP, "URI").and.callFake(() => {
      return new URI();
    });
    spyOn(SIP, "UA").and.callFake(() => {
      return new UA();
    });

    suite.config = {
      host: "foo.com",
      port: "8000",
      wsServers: "WSservers",
      username: "username",
      password: "password",
      stunServers: "stun",
      turnServers: "turn",
      registarServer: "registar"
    };
  });

  describe("constructor", () => {
    it("loads", () => {
      let deviceConstructor = () => new TelnyxDevice(suite.config);
      expect(deviceConstructor).not.toThrow();
    });

    it("requires a config object", () => {
      let deviceConstructor = () => new TelnyxDevice();
      expect(deviceConstructor).toThrow();
      deviceConstructor = () => new TelnyxDevice("string");
      expect(deviceConstructor).toThrow();
    });

    it("requires 'host' config option", () => {
      delete(suite.config.host);
      let deviceConstructor = () => new TelnyxDevice(suite.config);
      expect(deviceConstructor).toThrowError(TypeError);
    });

    it("requires 'port' config option", () => {
      delete(suite.config.port);
      let deviceConstructor = () => new TelnyxDevice(suite.config);
      expect(deviceConstructor).toThrowError(TypeError);
    });
  });


  it("authorizes", (done) => {
    let device = new TelnyxDevice(suite.config);
    device.on("Authorized", () => {
      done();
    });
    device.authorize();
    expect(SIP.UA).toHaveBeenCalled();
  });

  it("initiates a call", () => {
    let tcall;
    let device = new TelnyxDevice(suite.config);
    device._userAgent = new UA();
    let makeCall = () => {
      tcall = device.initiateCall('1235556789');
    }

    expect(makeCall).not.toThrow();
    expect(typeof(tcall)).toBe('object');
  });

});

