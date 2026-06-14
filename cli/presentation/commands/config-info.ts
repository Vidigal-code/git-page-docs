import path from "node:path";
import { defaultConfigLoader, isAppError } from "@gitpagedocs/tools";
import type { CommandContext } from "./run-command";

/** `gitpagedocs config` — resolve and summarize the active gitpagedocs config. */
export async function runConfig(ctx: CommandContext): Promise<void> {
  try {
    const { config, sourcePath, extension } = await defaultConfigLoader.loadGitPageDocsConfig(ctx.cwd);
    const site = (config as { site?: Record<string, unknown> }).site ?? {};
    // eslint-disable-next-line no-console
    console.log(
      `\n  Config: ${path.relative(ctx.cwd, sourcePath)} (${extension})\n` +
        `    site name        : ${String(site.name ?? "—")}\n` +
        `    default language : ${String(site.defaultLanguage ?? "—")}\n` +
        `    languages        : ${
          Array.isArray(site.supportedLanguages) ? (site.supportedLanguages as string[]).join(", ") : "—"
        }\n`,
    );
  } catch (error) {
    const message = isAppError(error) ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.log(`\n  No usable config found: ${message}\n  Run \`gitpagedocs init\` to generate one.\n`);
  }
}
