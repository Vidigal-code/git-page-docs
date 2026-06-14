import type { CommandContext } from "./run-command";

/**
 * `gitpagedocs mcp start` — entry point for the MCP server. The server package
 * (@gitpagedocs/mcp) is implemented in Phase 7; this command is wired to launch
 * it there. Until then it reports status honestly rather than failing silently.
 */
export async function runMcp(ctx: CommandContext): Promise<void> {
  const sub = ctx.args[1] ?? "start";
  if (sub !== "start") {
    // eslint-disable-next-line no-console
    console.log(`\n  Unknown mcp subcommand: ${sub}\n  Usage: gitpagedocs mcp start\n`);
    return;
  }
  // stderr only: stdout is the MCP stdio channel and must stay protocol-clean.
  console.error("[gitpagedocs] Starting MCP server over stdio (Ctrl-C to stop)...");
  // Dynamic import keeps the MCP SDK out of the frontend bundle.
  const { startMcpServer } = await import("@gitpagedocs/mcp");
  await startMcpServer(ctx.cwd);
}
