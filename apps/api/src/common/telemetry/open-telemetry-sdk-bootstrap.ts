import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NodeSDK } from '@opentelemetry/sdk-node';

export type OpenTelemetrySdkBootstrapOptions = {
  serviceName: string;
};

let activeSdk: NodeSDK | undefined;

export function isOtelSdkDisabled(): boolean {
  return process.env.OTEL_SDK_DISABLED === 'true';
}

export function startOpenTelemetrySdk(
  options: OpenTelemetrySdkBootstrapOptions,
): NodeSDK | undefined {
  if (isOtelSdkDisabled()) {
    return undefined;
  }

  const sdk = new NodeSDK({
    serviceName: options.serviceName,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
        '@opentelemetry/instrumentation-net': { enabled: false },
        // Pino correlation is handled via createOtelTraceMixin in pino-logger.config
        // (works with pino-pretty transport and Docker/Tilt stdout).
        '@opentelemetry/instrumentation-pino': { enabled: false },
      }),
    ],
  });

  sdk.start();
  activeSdk = sdk;

  const shutdown = (): void => {
    void sdk.shutdown().finally(() => {
      activeSdk = undefined;
    });
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);

  return sdk;
}

export async function shutdownOpenTelemetrySdk(): Promise<void> {
  if (activeSdk === undefined) {
    return;
  }
  await activeSdk.shutdown();
  activeSdk = undefined;
}
