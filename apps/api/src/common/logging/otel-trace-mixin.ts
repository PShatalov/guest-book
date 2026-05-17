import { context, trace } from '@opentelemetry/api';

export type OtelTraceLogFields = {
  trace_id: string;
  span_id: string;
  trace_flags: string;
};

export function createOtelTraceMixin(): Partial<OtelTraceLogFields> {
  const span = trace.getSpan(context.active());
  if (span === undefined) {
    return {};
  }

  const { traceId, spanId, traceFlags } = span.spanContext();
  if (traceId === '' || spanId === '') {
    return {};
  }

  return {
    trace_id: traceId,
    span_id: spanId,
    trace_flags: `0${traceFlags.toString(16).padStart(2, '0')}`,
  };
}
