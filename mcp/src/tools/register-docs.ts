import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DocumentationService, patchManagedRegion, type DocKind, type AiProviderId } from "@gitpagedocs/tools";
import type { ServerContext } from "../context";
import { text, safe } from "../result";
import { repoListing, fileContext, packageContext, gitLog, docsContext } from "../gather";

async function generate(
  ctx: ServerContext,
  kind: DocKind,
  context: string,
  instructions?: string,
  provider?: AiProviderId,
): Promise<string> {
  const { provider: impl, config } = await ctx.resolveProvider(provider);
  const service = new DocumentationService(impl, config);
  return service.generate({ kind, context, instructions });
}

const providerOpt = z.string().optional().describe("Override the configured AI provider id.");

/** Documentation generators and analyzers (AI-backed, delegating to tools). */
export function registerDocsTools(server: McpServer, ctx: ServerContext): void {
  const def = (
    name: string,
    description: string,
    kind: DocKind,
    gather: (args: { path?: string }) => Promise<string>,
    withPath = false,
  ): void => {
    server.registerTool(
      name,
      {
        description,
        inputSchema: withPath
          ? { path: z.string().describe("Relative file path."), provider: providerOpt }
          : { provider: providerOpt },
      },
      safe(async (args: { path?: string; provider?: string }) =>
        text(await generate(ctx, kind, await gather(args), undefined, args.provider as AiProviderId | undefined)),
      ),
    );
  };

  def("generate_documentation", "Generate developer documentation for a source file.", "documentation",
    ({ path }) => fileContext(ctx, path as string), true);
  def("generate_api_docs", "Generate API reference docs for a file.", "api",
    ({ path }) => fileContext(ctx, path as string), true);
  def("generate_database_docs", "Generate data-model documentation for a file.", "database",
    ({ path }) => fileContext(ctx, path as string), true);
  def("analyze_source_code", "Analyze a source file: responsibilities, issues, suggestions.", "analyze-source",
    ({ path }) => fileContext(ctx, path as string), true);

  def("generate_readme", "Generate a README from the repository.", "readme",
    async () => `${await repoListing(ctx)}\n\n${await packageContext(ctx)}`);
  def("generate_architecture_docs", "Generate architecture documentation for the repository.", "architecture",
    () => repoListing(ctx));
  def("analyze_repository", "Analyze the repository structure and stack.", "analyze-repository",
    () => repoListing(ctx));
  def("analyze_project", "Analyze the project: architecture, dependencies, risks.", "analyze-project",
    async () => `${await repoListing(ctx)}\n\n${await packageContext(ctx)}`);
  def("generate_changelog", "Generate a CHANGELOG from recent commits.", "changelog",
    async () => gitLog(ctx, 80) || (await repoListing(ctx)));
  def("generate_release_notes", "Generate release notes from recent commits.", "release-notes",
    async () => gitLog(ctx, 80) || (await repoListing(ctx)));
  def("validate_docs", "Review docs for accuracy, completeness and broken references.", "validate",
    () => docsContext(ctx));

  // update_documentation patches the managed region of an existing file.
  server.registerTool(
    "update_documentation",
    {
      description: "Regenerate and patch the managed region of a documentation file (preserves manual content).",
      inputSchema: {
        path: z.string().describe("Target documentation file."),
        instructions: z.string().optional().describe("What to update."),
        provider: providerOpt,
      },
    },
    safe(async ({ path, instructions, provider }) => {
      let existing = "";
      try {
        existing = await ctx.files.read(path);
      } catch {
        existing = "";
      }
      const generated = await generate(
        ctx,
        "update",
        `Existing file:\n${existing}`,
        instructions,
        provider as AiProviderId | undefined,
      );
      const patched = patchManagedRegion(existing, generated);
      const written = await ctx.files.write(path, patched.content);
      return text(`Updated ${written} (${patched.replaced ? "replaced" : "appended"} managed region).`);
    }),
  );
}
