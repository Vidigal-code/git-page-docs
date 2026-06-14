/**
 * Logging port. Implemented in Phase 4 (tools/src/logger).
 * The implementation MUST redact secrets (API keys) before any sink write.
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogFields {
  readonly [key: string]: unknown;
}

export interface Logger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
  /** Returns a child logger that merges the given fields into every record. */
  child(fields: LogFields): Logger;
}

/** A destination for log records. */
export interface LogSink {
  write(level: LogLevel, message: string, fields: LogFields): void;
}
