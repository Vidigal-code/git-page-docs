import { NodeCryptoService, deriveDocAccessKeys } from "@gitpagedocs/tools";
import type { CommandContext } from "./run-command";
import { askPassword, note, outro } from "../ui/clack";
import { interactivePromptsAvailable } from "../ui/prompts";
import { GitPageDocsConfigRepository } from "../../infrastructure/gitpagedocs-config-file";

const MIN_PASSWORD_LENGTH = 4;

/**
 * `gitpagedocs password` — interactively set a documentation access password.
 *
 * Type + confirm a password, derive the double-hash key pair, write the PUBLIC
 * key into gitpagedocs/config.json (which makes the frontend gate the docs), and
 * print the PRIVATE key for the user to copy. The password itself is never stored.
 */
export async function runPassword(ctx: CommandContext): Promise<void> {
  if (!interactivePromptsAvailable()) {
    // eslint-disable-next-line no-console
    console.log("\n  `gitpagedocs password` is interactive — run it in a terminal (TTY).\n");
    return;
  }

  const password = await askPassword({
    message: "Documentation password:",
    validate: (v) =>
      v && v.trim().length >= MIN_PASSWORD_LENGTH
        ? undefined
        : `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
  });
  const confirmation = await askPassword({
    message: "Confirm password:",
    validate: (v) => (v ? undefined : "Required."),
  });

  if (password !== confirmation) {
    note("Passwords do not match. Nothing was changed.", "Aborted");
    return;
  }

  const { privateKey, publicKey } = await deriveDocAccessKeys(password, new NodeCryptoService());

  let configPath: string;
  try {
    configPath = await new GitPageDocsConfigRepository(ctx.cwd).patchDocsAccess(publicKey);
  } catch (error) {
    note(error instanceof Error ? error.message : String(error), "Could not save");
    return;
  }

  note(
    `Public key saved to ${configPath}\nThe documentation is now password-protected.`,
    "Saved",
  );
  // eslint-disable-next-line no-console
  console.log(
    "\n  PRIVATE KEY (copy & keep it safe — it also unlocks the docs):\n\n" +
      `    ${privateKey}\n\n` +
      "  Readers can unlock with the password OR this private key.\n" +
      "  To remove protection, set site.docsAccess.enabled to false in config.json.\n",
  );
  outro("Done.");
}
