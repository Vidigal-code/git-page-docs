import { SecurityError } from "@gitpagedocs/tools";
import { askPassword, note } from "../../presentation/ui/clack";
import { VAULT_PASSWORD_ENV, type VaultPasswordPrompt } from "../application/vault-password";

const MIN_PASSWORD_LENGTH = 4;

function requireTerminal(): void {
  if (!process.stdin.isTTY) {
    throw new SecurityError(
      `The encrypted API key needs its password. Run the command in a terminal or set ${VAULT_PASSWORD_ENV}.`,
    );
  }
}

/** Terminal prompts for the vault password: create + confirm on first run, unlock afterwards. */
export const clackVaultPasswordPrompt: VaultPasswordPrompt = {
  async create() {
    requireTerminal();
    for (;;) {
      const password = await askPassword({
        message: "Create a local password to encrypt your API key (asked on every run):",
        validate: (value) => (value.trim().length >= MIN_PASSWORD_LENGTH ? undefined : `Use at least ${MIN_PASSWORD_LENGTH} characters.`),
      });
      const confirmation = await askPassword({ message: "Confirm the password:" });
      if (password === confirmation) return password;
      note("The passwords do not match. Try again.");
    }
  },
  async unlock(attempt) {
    requireTerminal();
    return askPassword({
      message: attempt > 1 ? `Local password (attempt ${attempt} of 3):` : "Local password to decrypt the API key:",
    });
  },
};
