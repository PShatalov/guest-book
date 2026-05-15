import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  isOtelSdkDisabled,
  shutdownOpenTelemetrySdk,
  startOpenTelemetrySdk,
} from './open-telemetry-sdk-bootstrap';

jest.mock('@opentelemetry/sdk-node', () => ({
  NodeSDK: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    shutdown: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('@opentelemetry/auto-instrumentations-node', () => ({
  getNodeAutoInstrumentations: jest.fn(() => []),
}));

describe('open-telemetry-sdk-bootstrap', () => {
  const previousDisabled = process.env.OTEL_SDK_DISABLED;

  afterEach(async () => {
    await shutdownOpenTelemetrySdk();
    jest.clearAllMocks();
    if (previousDisabled === undefined) {
      delete process.env.OTEL_SDK_DISABLED;
    } else {
      process.env.OTEL_SDK_DISABLED = previousDisabled;
    }
  });

  it('reports disabled when OTEL_SDK_DISABLED=true', () => {
    process.env.OTEL_SDK_DISABLED = 'true';
    expect(isOtelSdkDisabled()).toBe(true);
  });

  it('does not start the SDK when OTEL_SDK_DISABLED=true', () => {
    process.env.OTEL_SDK_DISABLED = 'true';

    const result = startOpenTelemetrySdk({ serviceName: 'test-api' });

    expect(result).toBeUndefined();
    expect(NodeSDK).not.toHaveBeenCalled();
  });

  it('starts the SDK when OTEL_SDK_DISABLED is not set', () => {
    delete process.env.OTEL_SDK_DISABLED;

    const result = startOpenTelemetrySdk({ serviceName: 'test-api' });

    expect(result).toBeDefined();
    expect(NodeSDK).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceName: 'test-api',
      }),
    );
    expect(result?.start).toHaveBeenCalled();
  });

  it('shuts down the active SDK', async () => {
    delete process.env.OTEL_SDK_DISABLED;
    startOpenTelemetrySdk({ serviceName: 'test-api' });

    await expect(shutdownOpenTelemetrySdk()).resolves.toBeUndefined();
    await expect(shutdownOpenTelemetrySdk()).resolves.toBeUndefined();
  });
});
