const DEFAULT_API_BASE_URL = 'http://localhost:3001';

export const getApiBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL;
