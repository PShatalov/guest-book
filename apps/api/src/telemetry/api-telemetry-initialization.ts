import { startOpenTelemetrySdk } from '../common/telemetry/open-telemetry-sdk-bootstrap';

export const DEFAULT_API_SERVICE_NAME = 'guest-book-api';

export function resolveApiServiceName(): string {
  const configured = process.env.OTEL_SERVICE_NAME?.trim();
  return configured && configured.length > 0
    ? configured
    : DEFAULT_API_SERVICE_NAME;
}

export function initializeApiTelemetry(): void {
  startOpenTelemetrySdk({
    serviceName: resolveApiServiceName(),
  });
}
