import { describe, it, expect, vi, afterEach } from "vitest";

/** The bin runs at import time, so each test imports a fresh module instance. */
const mocks = vi.hoisted(() => ({ startMcpServer: vi.fn() }));

vi.mock("../src/start", () => ({ startMcpServer: mocks.startMcpServer }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  mocks.startMcpServer.mockReset();
});

describe("mcp bin", () => {
  it("starts the server for the current working directory", async () => {
    mocks.startMcpServer.mockResolvedValue(undefined);
    const exit = vi.spyOn(process, "exit").mockImplementation((() => undefined) as unknown as typeof process.exit);

    await import("../src/bin");

    expect(mocks.startMcpServer).toHaveBeenCalledWith(process.cwd());
    expect(exit).not.toHaveBeenCalled();
  });

  it("reports a startup failure on stderr and exits with code 1", async () => {
    mocks.startMcpServer.mockRejectedValue(new Error("boom"));
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const exit = vi.spyOn(process, "exit").mockImplementation((() => undefined) as unknown as typeof process.exit);

    await import("../src/bin");

    expect(error).toHaveBeenCalledWith("[gitpagedocs-mcp] failed to start:", expect.any(Error));
    expect(exit).toHaveBeenCalledWith(1);
  });
});
