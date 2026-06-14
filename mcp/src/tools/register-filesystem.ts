import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ServerContext } from "../context";
import { json, text, safe } from "../result";

/** Filesystem tools — root-bounded, delegating to tools FileService. */
export function registerFilesystemTools(server: McpServer, ctx: ServerContext): void {
  server.registerTool(
    "list_files",
    {
      description: "List files and directories within the project (root-bounded).",
      inputSchema: {
        path: z.string().optional().describe("Relative directory (default: project root)."),
        recursive: z.boolean().optional().describe("Recurse into subdirectories."),
      },
    },
    safe(async ({ path, recursive }) => json(await ctx.files.list(path ?? ".", { recursive: recursive ?? false }))),
  );

  server.registerTool(
    "read_file",
    {
      description: "Read a UTF-8 text file from the project.",
      inputSchema: { path: z.string().describe("Relative file path.") },
    },
    safe(async ({ path }) => text(await ctx.files.read(path))),
  );

  server.registerTool(
    "write_file",
    {
      description: "Write a UTF-8 text file in the project (creates directories as needed).",
      inputSchema: {
        path: z.string().describe("Relative file path."),
        content: z.string().describe("Full file content."),
      },
    },
    safe(async ({ path, content }) => text(`Wrote ${await ctx.files.write(path, content)}`)),
  );

  server.registerTool(
    "search_project",
    {
      description: "Search project text files for a substring; returns file/line matches.",
      inputSchema: {
        query: z.string().describe("Text to search for."),
        extension: z.string().optional().describe('Limit to files ending with this (e.g. ".ts").'),
      },
    },
    safe(async ({ query, extension }) => json(await ctx.files.search(query, { extension }))),
  );
}
