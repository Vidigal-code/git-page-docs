#!/usr/bin/env node
import { startMcpServer } from "./start";

try {
  await startMcpServer(process.cwd());
} catch (error) {
  // stderr only — stdout is the MCP stdio channel.
  console.error("[gitpagedocs-mcp] failed to start:", error);
  process.exit(1);
}
