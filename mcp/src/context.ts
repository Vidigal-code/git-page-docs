import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import {
  FileService,
  GitPageDocsConfigLoader,
  CatalogModelRegistry,
  createDefaultFactory,
  PROVIDER_CATALOG,
  ConfigurationError,
  ProviderError,
  type AiProviderId,
  type AIProvider,
  type ProviderConfig,
} from "@gitpagedocs/tools";

const ENV_KEYS: Record<AiProviderId, string[]> = {
  openai: ["OPENAI_API_KEY"],
  anthropic: ["ANTHROPIC_API_KEY", "CLAUDE_API_KEY"],
  gemini: ["GEMINI_API_KEY", "GOOGLE_API_KEY"],
  openrouter: ["OPENROUTER_API_KEY"],
  ollama: [],
  "azure-openai": ["AZURE_OPENAI_API_KEY"],
  mistral: ["MISTRAL_API_KEY"],
  deepseek: ["DEEPSEEK_API_KEY"],
  cohere: ["COHERE_API_KEY"],
  groq: ["GROQ_API_KEY"],
  xai: ["XAI_API_KEY"],
  together: ["TOGETHER_API_KEY"],
  fireworks: ["FIREWORKS_API_KEY"],
  perplexity: ["PERPLEXITY_API_KEY"],
};

const SELECTION_FILE = ".gitpagedocs-mcp.json";

interface ProviderSelection {
  provider: AiProviderId;
  model?: string;
}

/** Shared services for every MCP tool/resource. Holds no secrets. */
export class ServerContext {
  readonly files: FileService;
  readonly models = new CatalogModelRegistry();
  readonly configLoader = new GitPageDocsConfigLoader();
  private readonly factory = createDefaultFactory();

  constructor(readonly root: string = process.cwd()) {
    this.files = new FileService(root);
  }

  async loadSelection(): Promise<ProviderSelection> {
    const file = path.join(this.root, SELECTION_FILE);
    if (existsSync(file)) {
      try {
        return JSON.parse(await readFile(file, "utf8")) as ProviderSelection;
      } catch {
        /* fall through to default */
      }
    }
    return { provider: "openai" };
  }

  async saveSelection(selection: ProviderSelection): Promise<void> {
    await writeFile(path.join(this.root, SELECTION_FILE), JSON.stringify(selection, null, 2), "utf8");
  }

  private resolveKey(providerId: AiProviderId): string | undefined {
    for (const name of ENV_KEYS[providerId]) {
      const value = process.env[name];
      if (value) return value;
    }
    return undefined;
  }

  /** Build a provider + config, resolving the API key from the environment. */
  async resolveProvider(
    providerId?: AiProviderId,
    model?: string,
  ): Promise<{ provider: AIProvider; config: ProviderConfig }> {
    const selection = await this.loadSelection();
    const id = providerId ?? selection.provider;
    if (!PROVIDER_CATALOG[id]) throw new ConfigurationError(`Unknown AI provider: ${id}`);
    const spec = PROVIDER_CATALOG[id];
    const apiKey = this.resolveKey(id);
    if (spec.auth !== "none" && !apiKey) {
      throw new ProviderError(
        `No API key for ${spec.label}. Set ${ENV_KEYS[id].join(" or ")} in the environment.`,
      );
    }
    const baseUrl =
      id === "ollama"
        ? process.env.OLLAMA_BASE_URL
        : id === "azure-openai"
          ? process.env.AZURE_OPENAI_BASE_URL
          : undefined;
    return {
      provider: this.factory.create(id),
      config: { providerId: id, model: model ?? selection.model ?? spec.defaultModel, apiKey, baseUrl },
    };
  }
}
