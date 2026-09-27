import { AiConfigFileRepository } from "../../ai/infrastructure/ai-config-file";
import { AiKeyVault } from "../../ai/infrastructure/ai-key-vault";
import type { CommandContext } from "./run-command";

/**
 * `gitpagedocs config clear` — delete the stored `.gitpagedocsconfig` from the
 * per-user config directory together with the encrypted key vault, wiping the
 * saved AI credentials, provider and scan paths.
 */
export async function runConfigClear(_ctx: CommandContext): Promise<void> {
  const repository = new AiConfigFileRepository();
  const vault = new AiKeyVault();
  const removed = await repository.clear();
  if (await vault.clear()) removed.push(vault.getVaultPath());

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
