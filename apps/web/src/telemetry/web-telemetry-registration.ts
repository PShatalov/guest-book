import { registerOTel } from '@vercel/otel';

export const DEFAULT_WEB_SERVICE_NAME = 'guest-book-web';

export function isOtelSdkDisabled(): boolean {
  return process.env.OTEL_SDK_DISABLED === 'true';
}

export function resolveWebServiceName(): string {
  const configured = process.env.OTEL_SERVICE_NAME?.trim();
  return configured && configured.length > 0
    ? configured
    : DEFAULT_WEB_SERVICE_NAME;
}

function buildPropagateContextUrls(): Array<string | RegExp> {
  const urls: Array<string | RegExp> = [/^\/api(\/|$)/];

  const apiProxyTarget = process.env.API_PROXY_TARGET?.trim();
  if (apiProxyTarget) {
    urls.push(apiProxyTarget);
  }

  return urls;
}

export function registerWebTelemetry(): void {
  if (isOtelSdkDisabled()) {
    return;
  }

  registerOTel({
    serviceName: resolveWebServiceName(),
    instrumentationConfig: {
      fetch: {
        propagateContextUrls: buildPropagateContextUrls(),
      },
    },
  });
}
