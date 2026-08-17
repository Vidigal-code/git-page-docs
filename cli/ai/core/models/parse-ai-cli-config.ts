import { AI_MODEL_DEFAULTS, type AiProviderId } from "../../config";
import type { AiCliConfig } from "./ai-cli-config";

const SUPPORTED_PROVIDERS = Object.keys(AI_MODEL_DEFAULTS) as AiProviderId[];
const SUPPORTED_LANGUAGES: ReadonlyArray<AiCliConfig["ai"]["languages"][number]> = ["pt", "en", "es"];

/** Fallbacks for optional fields, mirroring the interactive prompt defaults. */
const DEFAULT_LANGUAGES: AiCliConfig["ai"]["languages"] = ["en", "pt", "es"];
const DEFAULT_OUTPUT_DIR = "gitpagedocs/docs";
const DEFAULT_FILE_PREFIX = "ai-generated";

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function asOptionalString(value: unknown): string | undefined {
  return isString(value) ? value : undefined;
}

function asStringWithDefault(value: unknown, fallback: string): string {
  return isString(value) ? value : fallback;
}

function asPaths(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(isString) : [];
}

function asLanguages(value: unknown): AiCliConfig["ai"]["languages"] {
  const languages = Array.isArray(value)
    ? value.filter((language): language is AiCliConfig["ai"]["languages"][number] =>
        SUPPORTED_LANGUAGES.includes(language as AiCliConfig["ai"]["languages"][number]),
      )
    : [];
  return languages.length > 0 ? languages : [...DEFAULT_LANGUAGES];
}

function asProviderId(value: unknown): AiProviderId | null {
  return isString(value) && SUPPORTED_PROVIDERS.includes(value as AiProviderId)
    ? (value as AiProviderId)
    : null;
}

/**
 * Validate an untrusted `.gitpagedocsconfig` payload. Tolerant by design so
 * hand-edited configs keep working: only the version-1 envelope and a known
 * provider are required; every other field falls back to the interactive
 * prompt defaults. Returns a sanitized {@link AiCliConfig} with only known
 * fields, or `null` when the payload cannot identify a provider.
 */
export function parseAiCliConfig(raw: unknown): AiCliConfig | null {
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as Partial<AiCliConfig>;
  if (candidate.version !== 1) return null;

  const ai = candidate.ai;
  if (typeof ai !== "object" || ai === null) return null;
  const provider = asProviderId(ai.provider);
  if (!provider) return null;

  const model = asOptionalString(ai.model)?.trim() || AI_MODEL_DEFAULTS[provider];
  const apiKey = asOptionalString(ai.apiKey);
  const baseUrl = asOptionalString(ai.baseUrl);

  return {
    version: 1,
    ai: {
      provider,
      model,
      ...(apiKey !== undefined ? { apiKey } : {}),
      ...(baseUrl !== undefined ? { baseUrl } : {}),
      paths: asPaths(ai.paths),
      languages: asLanguages(ai.languages),
      outputDir: asStringWithDefault(ai.outputDir, DEFAULT_OUTPUT_DIR),
      filePrefix: asStringWithDefault(ai.filePrefix, DEFAULT_FILE_PREFIX),
      contextPrompt: asStringWithDefault(ai.contextPrompt, ""),
    },
  };
}
