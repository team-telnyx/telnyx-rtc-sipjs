import { TelnyxCall } from './telnyx-call';

describe('TelnyxCall media events', () => {
  let session;
  let call;

  const buildSession = () => ({
    stateChange: { addListener: jasmine.createSpy('addListener') },
    delegate: null
  });

  beforeEach(() => {
    session = buildSession();
    call = new TelnyxCall(session);
    spyOn(call, 'trigger');
  });

  it('emits userMediaRequest and userMedia when a media stream is acquired', async () => {
    const handler = {
      mediaStreamFactory: jasmine.createSpy('mediaStreamFactory').and.returnValue(Promise.resolve('stream')),
      remoteMediaStream: null
    };

    call._handleSessionDescriptionHandler(handler);
    await handler.mediaStreamFactory({ audio: true, video: false });

    expect(call.trigger).toHaveBeenCalledWith('userMediaRequest', { audio: true, video: false });
    expect(call.trigger).toHaveBeenCalledWith('userMedia', 'stream');
  });

  it('emits userMediaFailed when the media request rejects', async () => {
    const handler = {
      mediaStreamFactory: jasmine.createSpy('mediaStreamFactory').and.returnValue(Promise.reject(new Error('fail'))),
      remoteMediaStream: null
    };

    call._handleSessionDescriptionHandler(handler);
    await handler.mediaStreamFactory({ audio: true }).catch(() => {});

    expect(call.trigger).toHaveBeenCalledWith('userMediaRequest', { audio: true });
    expect(call.trigger).toHaveBeenCalledWith('userMediaFailed', jasmine.any(Error));
  });
});
