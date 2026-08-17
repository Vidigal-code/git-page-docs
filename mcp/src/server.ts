import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ServerContext } from "./context";
import { registerFilesystemTools } from "./tools/register-filesystem";
import { registerAiTools } from "./tools/register-ai";
import { registerDocsTools } from "./tools/register-docs";
import { registerResources } from "./resources/register-resources";

export const SERVER_INFO = { name: "gitpagedocs-mcp", version: "0.1.0" } as const;

/** Build the MCP server with every tool and resource registered.
 * The context is injectable so integration tests can supply deterministic
 * provider resolution without touching the network. */
export function createServer(root: string = process.cwd(), ctx: ServerContext = new ServerContext(root)): McpServer {
  const server = new McpServer(SERVER_INFO);

  registerFilesystemTools(server, ctx);
  registerAiTools(server, ctx);
  registerDocsTools(server, ctx);
  registerResources(server, ctx);

  return server;
}
