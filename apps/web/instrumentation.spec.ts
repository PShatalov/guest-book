import { registerOTel } from '@vercel/otel';

jest.mock('@vercel/otel', () => ({
  registerOTel: jest.fn(),
}));

describe('instrumentation', () => {
  const previousDisabled = process.env.OTEL_SDK_DISABLED;

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    if (previousDisabled === undefined) {
      delete process.env.OTEL_SDK_DISABLED;
    } else {
      process.env.OTEL_SDK_DISABLED = previousDisabled;
    }
  });

  it('exports register and calls registerOTel with the web service name', async () => {
    process.env.OTEL_SDK_DISABLED = 'false';

    const { register } = await import('./instrumentation');
    register();

    expect(registerOTel).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceName: 'guest-book-web',
      }),
    );
  });
});
