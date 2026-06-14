import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PROVIDER_CATALOG, ALL_PROVIDER_IDS } from "@gitpagedocs/tools";
import type { ServerContext } from "../context";
import { repoListing, docsContext, packageContext } from "../gather";

/** Read-only project resources exposed over the MCP `project://` scheme. */
export function registerResources(server: McpServer, ctx: ServerContext): void {
  const def = (
    name: string,
    uri: string,
    description: string,
    mimeType: string,
    read: () => Promise<string>,
  ): void => {
    server.registerResource(name, uri, { description, mimeType }, async (u) => {
      let body: string;
      try {
        body = await read();
      } catch (error) {
        body = `Unavailable: ${String(error)}`;
      }
      return { contents: [{ uri: u.href, mimeType, text: body }] };
    });
  };

  def("structure", "project://structure", "Recursive project file tree.", "text/plain", () =>
    repoListing(ctx),
  );
  def("docs", "project://docs", "Concatenated project Markdown documentation.", "text/markdown", () =>
    docsContext(ctx),
  );
  def("config", "project://config", "Resolved gitpagedocs configuration.", "application/json", async () => {
    const { config, sourcePath } = await ctx.configLoader.loadGitPageDocsConfig(ctx.root);
    return JSON.stringify({ sourcePath, config }, null, 2);
  });
  def("repository", "project://repository", "Repository metadata (package.json).", "text/plain", () =>
    packageContext(ctx),
  );
  def("readme", "project://readme", "Project README.", "text/markdown", () => ctx.files.read("README.md"));
  def("ai-providers", "project://ai/providers", "Available AI providers.", "application/json", async () =>
    JSON.stringify(
      ALL_PROVIDER_IDS.map((id) => ({ id, label: PROVIDER_CATALOG[id].label, defaultModel: PROVIDER_CATALOG[id].defaultModel })),
      null,
      2,
    ),
  );
  def("ai-models", "project://ai/models", "Catalog models per provider.", "application/json", async () =>
    JSON.stringify(
      ALL_PROVIDER_IDS.map((id) => ({ provider: id, models: ctx.models.list(id).map((m) => m.id) })),
      null,
      2,
    ),
  );
}
