import { describe, it, expect } from "vitest";
import {
  AppError,
  ValidationError,
  ProviderError,
  ConfigurationError,
  DocumentationError,
  RepositoryError,
  SecurityError,
  CacheError,
  isAppError,
} from "../src/errors/app-error";

describe("errors", () => {
  it("AppError carries code, details and cause", () => {
    const cause = new Error("root");
    const err = new AppError("boom", { code: "VALIDATION_ERROR", details: { a: 1 }, cause });
    expect(err.message).toBe("boom");
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.details).toEqual({ a: 1 });
    expect(err.cause).toBe(cause);
    expect(err.name).toBe("AppError");
  });

  it("defaults code to APP_ERROR", () => {
    expect(new AppError("x").code).toBe("APP_ERROR");
  });

  it.each([
    [ValidationError, "VALIDATION_ERROR"],
    [ProviderError, "PROVIDER_ERROR"],
    [ConfigurationError, "CONFIGURATION_ERROR"],
    [DocumentationError, "DOCUMENTATION_ERROR"],
    [RepositoryError, "REPOSITORY_ERROR"],
    [SecurityError, "SECURITY_ERROR"],
    [CacheError, "CACHE_ERROR"],
  ])("%s sets its code and is an AppError", (Ctor, code) => {
    const e = new Ctor("msg", { details: { k: "v" } });
    expect(e.code).toBe(code);
    expect(e).toBeInstanceOf(AppError);
    expect(isAppError(e)).toBe(true);
    expect(e.details).toEqual({ k: "v" });
  });

  it("isAppError is false for plain errors and values", () => {
    expect(isAppError(new Error("x"))).toBe(false);
    expect(isAppError("nope")).toBe(false);
    expect(isAppError(null)).toBe(false);
  });
});
