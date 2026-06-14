import type { Logger, LogFields, LogLevel, LogSink } from "../ports/logger";
import { redact, redactFields } from "./redaction";

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface LoggerOptions {
  readonly level?: LogLevel;
  readonly sink?: LogSink;
  readonly baseFields?: LogFields;
}

/** Sink that writes redacted records to the console. */
export class ConsoleSink implements LogSink {
  write(level: LogLevel, message: string, fields: LogFields): void {
    const safeMessage = redact(message) as string;
    const hasFields = Object.keys(fields).length > 0;
    const payload = hasFields ? redactFields(fields as Record<string, unknown>) : undefined;
    const line = `[${level}] ${safeMessage}`;
    if (level === "error") console.error(line, payload ?? "");
    else if (level === "warn") console.warn(line, payload ?? "");
    else console.log(line, payload ?? "");
  }
}

/** Discards all records (useful for tests / silent CLI runs). */
export class NullSink implements LogSink {
  write(): void {
    /* no-op */
  }
}

class StandardLogger implements Logger {
  private readonly level: LogLevel;
  private readonly sink: LogSink;
  private readonly baseFields: LogFields;

  constructor(options: LoggerOptions) {
    this.level = options.level ?? "info";
    this.sink = options.sink ?? new ConsoleSink();
    this.baseFields = options.baseFields ?? {};
  }

  private emit(level: LogLevel, message: string, fields?: LogFields): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.level]) return;
    const merged = fields ? { ...this.baseFields, ...fields } : this.baseFields;
    this.sink.write(level, message, merged);
  }

  debug(message: string, fields?: LogFields): void {
    this.emit("debug", message, fields);
  }
  info(message: string, fields?: LogFields): void {
    this.emit("info", message, fields);
  }
  warn(message: string, fields?: LogFields): void {
    this.emit("warn", message, fields);
  }
  error(message: string, fields?: LogFields): void {
    this.emit("error", message, fields);
  }

  child(fields: LogFields): Logger {
    return new StandardLogger({
      level: this.level,
      sink: this.sink,
      baseFields: { ...this.baseFields, ...fields },
    });
  }
}

export function createLogger(options: LoggerOptions = {}): Logger {
  return new StandardLogger(options);
}
