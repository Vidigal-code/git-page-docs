import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const mcp = vi.hoisted(() => ({ startMcpServer: vi.fn<(cwd: string) => Promise<void>>() }));
vi.mock("@gitpagedocs/mcp", () => mcp);

import { runMcp } from "../../presentation/commands/mcp";
import type { CommandContext } from "../../presentation/commands/run-command";

function context(args: string[]): CommandContext {
  return { argv: ["node", "gitpagedocs", ...args], args, pkgRoot: "/pkg", cwd: "/work/site" };
}

let logged: string[];
let errors: string[];

beforeEach(() => {
  logged = [];
  errors = [];
  vi.spyOn(console, "log").mockImplementation((...parts: unknown[]) => {
    logged.push(parts.map(String).join(" "));
  });
  vi.spyOn(console, "error").mockImplementation((...parts: unknown[]) => {
    errors.push(parts.map(String).join(" "));
  });
  mcp.startMcpServer.mockReset();
  mcp.startMcpServer.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runMcp", () => {
  it("starts the stdio server for `mcp start`, announcing on stderr only", async () => {
    await runMcp(context(["mcp", "start"]));

    expect(mcp.startMcpServer).toHaveBeenCalledWith("/work/site");
    expect(errors.join("\n")).toContain("Starting MCP server over stdio");
    expect(logged).toEqual([]);
  });

  it("defaults to `start` when no subcommand is given", async () => {
    await runMcp(context(["mcp"]));
    expect(mcp.startMcpServer).toHaveBeenCalledTimes(1);
  });

  it("rejects an unknown subcommand without starting the server", async () => {
    await runMcp(context(["mcp", "stop"]));

    expect(mcp.startMcpServer).not.toHaveBeenCalled();
    expect(logged.join("\n")).toContain("Unknown mcp subcommand: stop");
    expect(logged.join("\n")).toContain("Usage: gitpagedocs mcp start");
  });
});
