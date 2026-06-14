/**
 * Error taxonomy for @gitpagedocs/tools.
 *
 * Every domain error extends AppError so consumers can branch on a stable
 * machine-readable `code` and surface `details` without leaking secrets.
 */
export type ErrorCode =
  | "APP_ERROR"
  | "VALIDATION_ERROR"
  | "PROVIDER_ERROR"
  | "CONFIGURATION_ERROR"
  | "DOCUMENTATION_ERROR"
  | "REPOSITORY_ERROR"
  | "SECURITY_ERROR"
  | "CACHE_ERROR";

export interface AppErrorOptions {
  /** Machine-readable, stable across versions. */
  readonly code?: ErrorCode;
  /** Underlying error, preserved for diagnostics. */
  readonly cause?: unknown;
  /** Structured, secret-free context. */
  readonly details?: Record<string, unknown>;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = new.target.name;
    this.code = options.code ?? "APP_ERROR";
    this.details = options.details;
    // Preserve prototype chain when targeting ES with downleveled classes.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, options: Omit<AppErrorOptions, "code"> = {}) {
    super(message, { ...options, code: "VALIDATION_ERROR" });
  }
}

export class ProviderError extends AppError {
  constructor(message: string, options: Omit<AppErrorOptions, "code"> = {}) {
    super(message, { ...options, code: "PROVIDER_ERROR" });
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, options: Omit<AppErrorOptions, "code"> = {}) {
    super(message, { ...options, code: "CONFIGURATION_ERROR" });
  }
}

export class DocumentationError extends AppError {
  constructor(message: string, options: Omit<AppErrorOptions, "code"> = {}) {
    super(message, { ...options, code: "DOCUMENTATION_ERROR" });
  }
}

export class RepositoryError extends AppError {
  constructor(message: string, options: Omit<AppErrorOptions, "code"> = {}) {
    super(message, { ...options, code: "REPOSITORY_ERROR" });
  }
}

export class SecurityError extends AppError {
  constructor(message: string, options: Omit<AppErrorOptions, "code"> = {}) {
    super(message, { ...options, code: "SECURITY_ERROR" });
  }
}

export class CacheError extends AppError {
  constructor(message: string, options: Omit<AppErrorOptions, "code"> = {}) {
    super(message, { ...options, code: "CACHE_ERROR" });
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}
