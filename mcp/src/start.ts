import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server";

/** Start the MCP server over stdio. Resolves when the transport closes. */
export async function startMcpServer(root: string = process.cwd()): Promise<void> {
  const server = createServer(root);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
