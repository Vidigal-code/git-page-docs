import { describe, it, expect, vi } from "vitest";
import { createLogger, ConsoleSink, NullSink } from "../src/logger/logger";
import { redact, redactFields, REDACTED } from "../src/logger/redaction";
import type { LogLevel } from "../src/ports/logger";

describe("redaction", () => {
  it("masks sensitive keys", () => {
    const out = redact({ apiKey: "sk-abcdefghijklmnop", token: "ghp_xxxxxxxx", ok: "visible" }) as Record<string, unknown>;
    expect(out.apiKey).not.toContain("abcdefghij");
    expect(out.ok).toBe("visible");
  });

  it("masks very short secret as REDACTED", () => {
    const out = redact({ password: "short" }) as Record<string, unknown>;
    expect(out.password).toBe(REDACTED);
  });

  it("scrubs token-like values inside free strings", () => {
    const masked = redact("key is sk-1234567890abcdefghij here") as string;
    expect(masked).not.toContain("sk-1234567890abcdefghij");
  });

  it("recurses arrays and nested objects", () => {
    const out = redact({ list: [{ secret: "abcdefghijklmnop" }] }) as { list: Array<{ secret: string }> };
    expect(out.list[0].secret).not.toContain("abcdefghij");
  });

  it("redactFields returns a plain object", () => {
    expect(redactFields({ a: 1 })).toEqual({ a: 1 });
  });
});

describe("logger", () => {
  it("filters by level", () => {
    const records: Array<[LogLevel, string]> = [];
    const sink = { write: (l: LogLevel, m: string) => records.push([l, m]) };
    const log = createLogger({ level: "warn", sink });
    log.debug("d");
    log.info("i");
    log.warn("w");
    log.error("e");
    expect(records.map((r) => r[0])).toEqual(["warn", "error"]);
  });

  it("child merges base fields", () => {
    const seen: Record<string, unknown>[] = [];
    const sink = { write: (_l: LogLevel, _m: string, f: Record<string, unknown>) => seen.push(f) };
    const log = createLogger({ level: "debug", sink }).child({ scope: "x" });
    log.info("hello", { extra: 1 });
    expect(seen[0]).toMatchObject({ scope: "x", extra: 1 });
  });

  it("ConsoleSink redacts and routes by level", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const sink = new ConsoleSink();
    sink.write("info", "hi", { apiKey: "sk-abcdefghijklmnop" });
    sink.write("warn", "w", {});
    sink.write("error", "e", {});
    expect(logSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expect(errSpy).toHaveBeenCalled();
    const payload = JSON.stringify(logSpy.mock.calls[0]);
    expect(payload).not.toContain("abcdefghij");
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errSpy.mockRestore();
  });

  it("NullSink discards", () => {
    const log = createLogger({ sink: new NullSink() });
    expect(() => log.error("boom")).not.toThrow();
  });
});
