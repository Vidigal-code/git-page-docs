import type { AiProviderId } from "../ports/ai";
import { PROVIDER_CATALOG } from "./catalog";

/** Environment lookup, injectable for tests; defaults to process.env. */
export type EnvLookup = Readonly<Record<string, string | undefined>>;

/**
 * Resolves a provider's API key from the environment, reading the catalog's
 * declared env vars in priority order (the single source — no hardcoded names
 * at the call site). Returns undefined for keyless providers (Ollama) or when
 * none is set.
 */
export function resolveApiKeyFromEnv(
  providerId: AiProviderId,
  env: EnvLookup = process.env,
): string | undefined {
  for (const name of PROVIDER_CATALOG[providerId].envVars) {
    const value = env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

/** Provider ids that have at least one API key present in the environment. */
export function detectConfiguredProviders(env: EnvLookup = process.env): AiProviderId[] {
  return (Object.keys(PROVIDER_CATALOG) as AiProviderId[]).filter((id) =>
    PROVIDER_CATALOG[id].envVars.some((name) => Boolean(env[name]?.trim())),
  );
}
