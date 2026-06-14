/**
 * Secret redaction. Applied to every log record before it reaches a sink so
 * API keys and other credentials can never appear in logs.
 */
const SENSITIVE_KEY_PATTERN = /(api[_-]?key|secret|token|password|passwd|authorization|bearer|x-api-key)/i;

/** Token-like values: long opaque strings, optionally with a provider prefix. */
const TOKEN_VALUE_PATTERN = /\b((?:sk|pk|gsk|xai|or|hf|ghp|gho|github_pat|AIza)[-_][A-Za-z0-9-_]{8,}|[A-Za-z0-9-_]{32,})\b/g;

export const REDACTED = "[REDACTED]";

/** Mask a string value, keeping a short, non-reversible hint. */
function maskValue(value: string): string {
  if (value.length <= 8) return REDACTED;
  return `${value.slice(0, 3)}…${value.slice(-4)}`;
}

function redactString(input: string): string {
  return input.replace(TOKEN_VALUE_PATTERN, (match) => maskValue(match));
}

/** Recursively redact a value: sensitive keys are masked, strings scrubbed. */
export function redact(value: unknown, keyHint?: string): unknown {
  if (typeof value === "string") {
    if (keyHint && SENSITIVE_KEY_PATTERN.test(keyHint)) return maskValue(value);
    return redactString(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => redact(item));
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEY_PATTERN.test(k) && typeof v === "string" ? maskValue(v) : redact(v, k);
    }
    return out;
  }
  return value;
}

export function redactFields(fields: Record<string, unknown>): Record<string, unknown> {
  return redact(fields) as Record<string, unknown>;
}
