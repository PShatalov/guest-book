import { registerOTel } from '@vercel/otel';
import {
  DEFAULT_WEB_SERVICE_NAME,
  registerWebTelemetry,
  resolveWebServiceName,
} from './web-telemetry-registration';

jest.mock('@vercel/otel', () => ({
  registerOTel: jest.fn(),
}));

describe('web-telemetry-registration', () => {
  const previousServiceName = process.env.OTEL_SERVICE_NAME;
  const previousDisabled = process.env.OTEL_SDK_DISABLED;
  const previousProxyTarget = process.env.API_PROXY_TARGET;

  afterEach(() => {
    jest.clearAllMocks();
    if (previousServiceName === undefined) {
      delete process.env.OTEL_SERVICE_NAME;
    } else {
      process.env.OTEL_SERVICE_NAME = previousServiceName;
    }
    if (previousDisabled === undefined) {
      delete process.env.OTEL_SDK_DISABLED;
    } else {
      process.env.OTEL_SDK_DISABLED = previousDisabled;
    }
    if (previousProxyTarget === undefined) {
      delete process.env.API_PROXY_TARGET;
    } else {
      process.env.API_PROXY_TARGET = previousProxyTarget;
    }
  });

  it('uses the default web service name when OTEL_SERVICE_NAME is unset', () => {
    delete process.env.OTEL_SERVICE_NAME;
    expect(resolveWebServiceName()).toBe(DEFAULT_WEB_SERVICE_NAME);
  });

  it('uses OTEL_SERVICE_NAME when configured', () => {
    process.env.OTEL_SERVICE_NAME = 'custom-web';
    expect(resolveWebServiceName()).toBe('custom-web');
  });

  it('does not register OTel when OTEL_SDK_DISABLED=true', () => {
    process.env.OTEL_SDK_DISABLED = 'true';

    registerWebTelemetry();

    expect(registerOTel).not.toHaveBeenCalled();
  });

  it('registers OTel with fetch propagation for /api and API_PROXY_TARGET', () => {
    delete process.env.OTEL_SDK_DISABLED;
    process.env.API_PROXY_TARGET = 'http://localhost:3001';

    registerWebTelemetry();

    expect(registerOTel).toHaveBeenCalledWith({
      serviceName: DEFAULT_WEB_SERVICE_NAME,
      instrumentationConfig: {
        fetch: {
          propagateContextUrls: [/^\/api(\/|$)/, 'http://localhost:3001'],
        },
      },
    });
  });
});
