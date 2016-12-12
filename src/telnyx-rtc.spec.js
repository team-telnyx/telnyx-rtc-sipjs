import { TelnyxDevice } from "./telnyx-rtc";

describe('telnyx device', () => {
  let SIP;

  beforeEach(() => {
    SIP = jasmine.createSpyObj('SIP', ['URI', 'UA']);
    window.SIP = SIP; // Stick on window to mirror how webpack loads the lib
  });

  afterEach(() => {
    SIP = null;
    window.SIP = null;
  });



  it('loads', () => {
    let device = new TelnyxDevice();
    expect(true).toBe(true);
  });

  it('authorizes', (done) => {
    let device = new TelnyxDevice('http://testhost.com', 1111);
    device.on('Authorized', () => {
      done();
    });
    device.authorize('testacct', 'testauth', 'testpw');
    expect(SIP.UA).toHaveBeenCalled();

  });


  it('starts up', (done) => {
    let device = new TelnyxDevice('http://testhost.com', 1111);
    device.on('Ready', () => {
      done();
    });
    device.startup();
  });

});

