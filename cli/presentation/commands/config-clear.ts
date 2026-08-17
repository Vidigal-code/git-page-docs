import { AiConfigFileRepository } from "../../ai/infrastructure/ai-config-file";
import type { CommandContext } from "./run-command";

/**
 * `gitpagedocs config clear` — delete the stored `.gitpagedocsconfig` from the
 * per-user config directory and any legacy repo-root copy, wiping the saved AI
 * credentials (API key, provider, scan paths).
 */
export async function runConfigClear(ctx: CommandContext): Promise<void> {
  const repository = new AiConfigFileRepository({ cwd: ctx.cwd });
  const removed = await repository.clear();

  if (!removed.length) {
    // eslint-disable-next-line no-console
    console.log("\n  No stored .gitpagedocsconfig found - nothing to clear.\n");
    return;
  }

  // eslint-disable-next-line no-console
  console.log(
    ["", "  Stored AI configuration removed (credentials wiped):", ...removed.map((p) => `    - ${p}`), ""].join("\n"),
  );
}
