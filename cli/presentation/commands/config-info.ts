import path from "node:path";
import { defaultConfigLoader, getEnabledLanguages, isAppError, parseLanguageToggles } from "@gitpagedocs/tools";
import type { CommandContext } from "./run-command";

const UNKNOWN = "—";

interface LanguageSummary {
  enabled: string[];
  disabled: string[];
}

/** `site.languages` toggles from config.json, else the resolved `supportedLanguages` list. */
function summarizeLanguages(site: Record<string, unknown>): LanguageSummary {
  const toggles = parseLanguageToggles(site.languages);
  if (toggles) {
    const enabled = getEnabledLanguages(toggles);
    return { enabled, disabled: Object.keys(toggles).filter((language) => !enabled.includes(language)) };
  }
  if (Array.isArray(site.supportedLanguages)) {
    return { enabled: site.supportedLanguages as string[], disabled: [] };
  }
  return { enabled: [], disabled: [] };
}

function formatList(languages: string[]): string {
  return languages.length > 0 ? languages.join(", ") : UNKNOWN;
}

/** Scalars print as-is; anything else (missing, object) prints as unknown instead of "[object Object]". */
function formatScalar(value: unknown): string {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : UNKNOWN;
}

/** `gitpagedocs config` — resolve and summarize the active gitpagedocs config. */
export async function runConfig(ctx: CommandContext): Promise<void> {
  try {
    const { config, sourcePath, extension } = await defaultConfigLoader.loadGitPageDocsConfig(ctx.cwd);
    const site = (config as { site?: Record<string, unknown> }).site ?? {};
    const languages = summarizeLanguages(site);
    // eslint-disable-next-line no-console
    console.log(
      `\n  Config: ${path.relative(ctx.cwd, sourcePath)} (${extension})\n` +
        `    site name        : ${formatScalar(site.name)}\n` +
        `    default language : ${formatScalar(site.defaultLanguage)}\n` +
        `    languages        : ${formatList(languages.enabled)}\n` +
        `    disabled         : ${formatList(languages.disabled)}\n`,
    );
  } catch (error) {
    const message = isAppError(error) ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.log(`\n  No usable config found: ${message}\n  Run \`gitpagedocs init\` to generate one.\n`);
  }
}
