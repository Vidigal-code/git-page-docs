import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PROVIDER_CATALOG, ALL_PROVIDER_IDS, type AiProviderId } from "@gitpagedocs/tools";
import type { ServerContext } from "../context";
import { json, text, safe } from "../result";

const providerEnum = z.enum(ALL_PROVIDER_IDS as [AiProviderId, ...AiProviderId[]]);

/** AI provider/model info, configuration, and one-shot generation. */
export function registerAiTools(server: McpServer, ctx: ServerContext): void {
  server.registerTool(
    "list_ai_providers",
    { description: "List the available AI providers with their default models and capabilities." },
    safe(async () =>
      json(
        ALL_PROVIDER_IDS.map((id) => ({
          id,
          label: PROVIDER_CATALOG[id].label,
          defaultModel: PROVIDER_CATALOG[id].defaultModel,
          capabilities: PROVIDER_CATALOG[id].capabilities,
        })),
      ),
    ),
  );

  server.registerTool(
    "list_ai_models",
    {
      description: "List the catalog models for a provider (or all providers).",
      inputSchema: { provider: providerEnum.optional() },
    },
    safe(async ({ provider }) => {
      const ids = provider ? [provider] : ALL_PROVIDER_IDS;
      return json(ids.map((id) => ({ provider: id, models: ctx.models.list(id).map((m) => m.id) })));
    }),
  );

  server.registerTool(
    "configure_ai_provider",
    {
      description: "Set the default AI provider/model for this project (non-secret; keys come from env).",
      inputSchema: {
        provider: providerEnum,
        model: z.string().optional(),
      },
    },
    safe(async ({ provider, model }) => {
      await ctx.saveSelection({ provider, model });
      return text(`Default provider set to ${provider}${model ? ` (${model})` : ""}.`);
    }),
  );

  server.registerTool(
    "ask_ai",
    {
      description: "Ask the configured AI provider a question and return its answer.",
      inputSchema: {
        prompt: z.string().describe("The user prompt."),
        provider: providerEnum.optional(),
        model: z.string().optional(),
        system: z.string().optional().describe("Optional system instruction."),
      },
    },
    safe(async ({ prompt, provider, model, system }) => {
      const { provider: impl, config } = await ctx.resolveProvider(provider, model);
      const response = await impl.generate(
        { system, messages: [{ role: "user", content: prompt }], temperature: 0.3 },
        config,
      );
      return text(response.text);
    }),
  );
}
