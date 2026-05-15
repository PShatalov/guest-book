import {
  DEFAULT_API_SERVICE_NAME,
  initializeApiTelemetry,
  resolveApiServiceName,
} from './api-telemetry-initialization';
import { startOpenTelemetrySdk } from '../common/telemetry/open-telemetry-sdk-bootstrap';

jest.mock('../common/telemetry/open-telemetry-sdk-bootstrap', () => ({
  startOpenTelemetrySdk: jest.fn(),
}));

describe('api-telemetry-initialization', () => {
  const previousServiceName = process.env.OTEL_SERVICE_NAME;
  const previousDisabled = process.env.OTEL_SDK_DISABLED;

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
  });

  it('uses the default API service name when OTEL_SERVICE_NAME is unset', () => {
    delete process.env.OTEL_SERVICE_NAME;
    expect(resolveApiServiceName()).toBe(DEFAULT_API_SERVICE_NAME);
  });

  it('uses OTEL_SERVICE_NAME when configured', () => {
    process.env.OTEL_SERVICE_NAME = 'custom-api';
    expect(resolveApiServiceName()).toBe('custom-api');
  });

  it('does not throw when OTEL_SDK_DISABLED=true', () => {
    process.env.OTEL_SDK_DISABLED = 'true';

    expect(() => initializeApiTelemetry()).not.toThrow();
    expect(startOpenTelemetrySdk).toHaveBeenCalledWith({
      serviceName: DEFAULT_API_SERVICE_NAME,
    });
  });
});
