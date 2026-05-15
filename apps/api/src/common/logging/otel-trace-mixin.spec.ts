import { trace } from '@opentelemetry/api';
import { createOtelTraceMixin } from './otel-trace-mixin';

describe('createOtelTraceMixin', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns no fields when there is no active span', () => {
    jest.spyOn(trace, 'getSpan').mockReturnValue(undefined);

    expect(createOtelTraceMixin()).toEqual({});
  });

  it('returns trace context fields for the active span', () => {
    jest.spyOn(trace, 'getSpan').mockReturnValue({
      spanContext: () => ({
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        spanId: '00f067aa0ba902b7',
        traceFlags: 1,
      }),
    } as ReturnType<typeof trace.getSpan>);

    expect(createOtelTraceMixin()).toEqual({
      trace_id: '4bf92f3577b34da6a3ce929d0e0e4736',
      span_id: '00f067aa0ba902b7',
      trace_flags: '001',
    });
  });

  it('returns no fields when the active span has invalid ids', () => {
    jest.spyOn(trace, 'getSpan').mockReturnValue({
      spanContext: () => ({
        traceId: '',
        spanId: '',
        traceFlags: 0,
      }),
    } as ReturnType<typeof trace.getSpan>);

    expect(createOtelTraceMixin()).toEqual({});
  });
});
