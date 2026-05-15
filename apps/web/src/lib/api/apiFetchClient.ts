import { getApiBaseUrl } from './getApiBaseUrl';
import { ApiError } from './apiError';

export type ApiFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
};

const parseErrorMessages = (body: unknown): string | string[] => {
  if (typeof body !== 'object' || body === null) {
    return 'Request failed';
  }
  const record = body as Record<string, unknown>;
  if (typeof record.message === 'string') {
    return record.message;
  }
  if (Array.isArray(record.message)) {
    return record.message.filter((item): item is string => typeof item === 'string');
  }
  return 'Request failed';
};

export const apiFetchClient = async <T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> => {
  const { method = 'GET', body, signal } = options;
  const headers: HeadersInit =
    body === undefined ? {} : { 'Content-Type': 'application/json' };

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const parsed: unknown = text.length > 0 ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(response.status, parseErrorMessages(parsed));
  }

  return parsed as T;
};
