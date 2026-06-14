import type { AiProviderId } from "../ports/ai";
import { PROVIDER_CATALOG } from "./catalog";

/**
 * Bridges the legacy frontend/CLI provider ids ("claude", and the
 * "provider:model" string form) to the shared catalog. Lets existing consumers
 * adopt tools/src/ai without changing their stored config strings.
 */
const LEGACY_ALIASES: Readonly<Record<string, AiProviderId>> = {
  openai: "openai",
  claude: "anthropic",
  anthropic: "anthropic",
  gemini: "gemini",
  ollama: "ollama",
};

export function legacyProviderToCatalogId(legacy: string | undefined): AiProviderId {
  const key = (legacy ?? "").trim().toLowerCase();
  return LEGACY_ALIASES[key] ?? "openai";
}

export interface ParsedLegacyProvider {
  readonly providerId: AiProviderId;
  readonly model: string;
}

/** Parse a legacy "provider:model" string (e.g. "claude:claude-3-5-sonnet"). */
export function parseLegacyProviderAndModel(value: string | undefined): ParsedLegacyProvider {
  const [rawProvider, rawModel] = (value ?? "").split(":");
  const providerId = legacyProviderToCatalogId(rawProvider);
  const model = (rawModel ?? "").trim() || PROVIDER_CATALOG[providerId].defaultModel;
  return { providerId, model };
}
