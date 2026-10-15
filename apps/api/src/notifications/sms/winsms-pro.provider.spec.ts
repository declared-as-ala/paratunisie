import { WinSmsProProvider } from './winsms-pro.provider';

describe('WinSMS response handling', () => {
  const original = { ...process.env };
  beforeEach(() => { process.env.SMS_ENABLED = 'true'; process.env.SMS_API_KEY = 'test-only'; process.env.SMS_MAX_RETRIES = '1'; });
  afterEach(() => { process.env = { ...original }; jest.restoreAllMocks(); });

  it('accepts a numeric success code without throwing or retrying', async () => {
    const fetch = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ code: 200, id: 'message-1' }), { status: 200 }));
    const result = await new WinSmsProProvider().sendSms('20000000', 'Test');
    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('message-1');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does not mistake an error containing "ok" for a successful send', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ code: 555, message: 'token not ok' }), { status: 200 }));
    const result = await new WinSmsProProvider().sendSms('20000000', 'Test');
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('555');
  });
});
