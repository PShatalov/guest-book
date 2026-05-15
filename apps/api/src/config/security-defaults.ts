import configuration from './configuration';

const { throttleAuthLimit, throttleAuthTtlMs } = configuration();

/** Used by `@Throttle()` on auth routes; values mirror `THROTTLE_AUTH_*` env vars. */
export const AUTH_ROUTE_THROTTLE = {
  auth: {
    limit: throttleAuthLimit,
    ttl: throttleAuthTtlMs,
  },
} as const;
