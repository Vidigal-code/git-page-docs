import { legacyProviderToCatalogId, resolveApiKeyFromEnv } from "@gitpagedocs/tools/ai";
import type { AiProviderId } from "@gitpagedocs/tools/ports";
import { PROVIDER_CATALOG } from "@gitpagedocs/tools";
import { AiConfigFileRepository } from "../infrastructure/ai-config-file";
import type { AiCliConfig } from "../core/models/ai-cli-config";

export interface ResolvedChatCredentials {
  readonly providerId: AiProviderId;
  readonly model: string;
  readonly apiKey?: string;
  readonly baseUrl?: string;
}

export interface ResolveChatCredentialsInput {
  readonly cwd: string;
  /** Overrides the stored/detected provider (e.g. a `--provider` flag). */
  readonly providerOverride?: string;
  /** Overrides the stored/detected model (e.g. a `--model` flag). */
  readonly modelOverride?: string;
  /** Injectable for tests; defaults to a real config file repository. */
  readonly configRepo?: Pick<AiConfigFileRepository, "read">;
  /** Injectable for tests; defaults to process.env. */
  readonly env?: Readonly<Record<string, string | undefined>>;
}

/**
 * Resolves the provider, model and credentials for a chat turn, layering
 * sources by priority: explicit overrides > stored .gitpagedocsconfig > env
 * vars declared by the catalog. Returns null when no provider can be
 * determined and no key/base URL is available, so the caller can guide setup.
 */
export async function resolveChatCredentials(
  input: ResolveChatCredentialsInput,
): Promise<ResolvedChatCredentials | null> {
  const env = input.env ?? process.env;
  const configRepo = input.configRepo ?? new AiConfigFileRepository({ cwd: input.cwd });
  const stored = await configRepo.read().catch(() => null);

  const providerId = resolveProviderId(input.providerOverride, stored, env);
  const spec = PROVIDER_CATALOG[providerId];
  const model = input.modelOverride?.trim() || stored?.ai.model?.trim() || spec.defaultModel;
  const baseUrl = stored?.ai.baseUrl?.trim() || undefined;
  const apiKey = stored?.ai.apiKey?.trim() || resolveApiKeyFromEnv(providerId, env);

  const keyless = spec.auth === "none";
  if (!keyless && !apiKey) return null;

  return { providerId, model, apiKey, baseUrl };
}

/** Explicit override > stored config > first provider with an env key > openai. */
function resolveProviderId(
  override: string | undefined,
  stored: AiCliConfig | null,
  env: Readonly<Record<string, string | undefined>>,
): AiProviderId {
  if (override) return legacyProviderToCatalogId(override);
  if (stored) return legacyProviderToCatalogId(stored.ai.provider);
  return firstProviderFromEnv(env) ?? "openai";
}

function firstProviderFromEnv(
  env: Readonly<Record<string, string | undefined>>,
): AiProviderId | undefined {
  for (const id of Object.keys(PROVIDER_CATALOG) as AiProviderId[]) {
    if (resolveApiKeyFromEnv(id, env)) return id;
  }
  return undefined;
}
