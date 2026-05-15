export class ApiError extends Error {
  readonly status: number;
  readonly messages: string[];

  constructor(status: number, messages: string | string[]) {
    const normalized = Array.isArray(messages) ? messages : [messages];
    super(normalized.join(' '));
    this.name = 'ApiError';
    this.status = status;
    this.messages = normalized;
  }
}

export const isApiError = (value: unknown): value is ApiError =>
  value instanceof ApiError;
