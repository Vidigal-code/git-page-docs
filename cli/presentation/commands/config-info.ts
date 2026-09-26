import path from "node:path";
import { readFile } from "node:fs/promises";
import { DEFAULT_LANGS_MANIFEST_PATH, defaultConfigLoader, isAppError, parseLanguageManifest } from "@gitpagedocs/tools";
import type { CommandContext } from "./run-command";

const UNKNOWN = "—";

/** Languages from `gitpagedocs/langs.json`, else the legacy inline `site.supportedLanguages`. */
async function resolveLanguages(cwd: string, site: Record<string, unknown>): Promise<string[]> {
  try {
    const manifest = parseLanguageManifest(JSON.parse(await readFile(path.join(cwd, DEFAULT_LANGS_MANIFEST_PATH), "utf-8")));
    if (manifest) return manifest.languages;
  } catch {
    // No manifest: fall back to the inline list below.
  }
  return Array.isArray(site.supportedLanguages) ? (site.supportedLanguages as string[]) : [];
}

/** `gitpagedocs config` — resolve and summarize the active gitpagedocs config. */
export async function runConfig(ctx: CommandContext): Promise<void> {
  try {
    const { config, sourcePath, extension } = await defaultConfigLoader.loadGitPageDocsConfig(ctx.cwd);
    const site = (config as { site?: Record<string, unknown> }).site ?? {};
    const languages = await resolveLanguages(ctx.cwd, site);
    // eslint-disable-next-line no-console
    console.log(
      `\n  Config: ${path.relative(ctx.cwd, sourcePath)} (${extension})\n` +
        `    site name        : ${String(site.name ?? UNKNOWN)}\n` +
        `    default language : ${String(site.defaultLanguage ?? UNKNOWN)}\n` +
        `    languages        : ${languages.length > 0 ? languages.join(", ") : UNKNOWN}\n`,
    );
  } catch (error) {
    const message = isAppError(error) ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.log(`\n  No usable config found: ${message}\n  Run \`gitpagedocs init\` to generate one.\n`);
  }
}
