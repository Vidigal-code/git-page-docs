import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ServerContext } from "./context";
import { registerFilesystemTools } from "./tools/register-filesystem";
import { registerAiTools } from "./tools/register-ai";
import { registerDocsTools } from "./tools/register-docs";
import { registerResources } from "./resources/register-resources";

export const SERVER_INFO = { name: "gitpagedocs-mcp", version: "0.1.0" } as const;

/** Build the MCP server with every tool and resource registered. */
export function createServer(root: string = process.cwd()): McpServer {
  const server = new McpServer(SERVER_INFO);
  const ctx = new ServerContext(root);

  registerFilesystemTools(server, ctx);
  registerAiTools(server, ctx);
  registerDocsTools(server, ctx);
  registerResources(server, ctx);

  return server;
}
