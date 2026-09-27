import { SecurityError } from "@gitpagedocs/tools";
import type { AiCliConfig } from "../core/models/ai-cli-config";
import type { AiConfigFileRepository } from "../infrastructure/ai-config-file";
import type { AiKeyVault } from "../infrastructure/ai-key-vault";
import { resolveVaultPassword, type VaultPasswordPrompt } from "./vault-password";

export type KeyVault = Pick<AiKeyVault, "isInitialized" | "initialize" | "unlock" | "setKey" | "getKey" | "getVaultPath">;

/** A config carries a key to protect (plaintext to migrate) or one sealed in the vault. */
export function needsVaultPassword(config: AiCliConfig): boolean {
  return config.ai.apiKeyEncrypted === true || Boolean(config.ai.apiKey?.trim());
}

export interface SealApiKeyInput {
  readonly config: AiCliConfig;
  readonly vault: Pick<KeyVault, "setKey">;
  readonly password: string;
}

/**
 * Moves the plaintext API key into the vault and returns the config to persist:
 * no `apiKey`, `apiKeyEncrypted: true`. A config without a key is returned as is.
 */
export async function sealApiKey({ config, vault, password }: SealApiKeyInput): Promise<AiCliConfig> {
  const apiKey = config.ai.apiKey?.trim();
  if (!apiKey) return config;
  await vault.setKey(password, config.ai.provider, apiKey);
  const ai = { ...config.ai };
  delete ai.apiKey;
  return { ...config, ai: { ...ai, apiKeyEncrypted: true } };
}

export interface UnsealApiKeyInput {
  readonly config: AiCliConfig;
  readonly vault: Pick<KeyVault, "getKey">;
  readonly password: string;
}

/** The stored config with its key decrypted into memory (never written back). */
export async function unsealApiKey({ config, vault, password }: UnsealApiKeyInput): Promise<AiCliConfig> {
  if (!config.ai.apiKeyEncrypted) return config;
  const apiKey = await vault.getKey(password, config.ai.provider);
  return apiKey ? { ...config, ai: { ...config.ai, apiKey } } : config;
}

export interface UnlockStoredConfigInput {
  readonly config: AiCliConfig;
  readonly vault: KeyVault;
  readonly configRepo: Pick<AiConfigFileRepository, "write">;
  readonly env?: Readonly<Record<string, string | undefined>>;
  readonly prompt?: VaultPasswordPrompt;
  readonly onInfo?: (message: string) => void;
}

/**
 * Turns the stored config into one a run can use. An encrypted key is decrypted
 * into memory after the password check; a legacy plaintext key is sealed into
 * the vault and stripped from `.gitpagedocsconfig` on the spot, so the file
 * never keeps a key in clear again.
 */
export async function unlockStoredConfig(input: UnlockStoredConfigInput): Promise<AiCliConfig> {
  const { config } = input;
  if (!needsVaultPassword(config)) return config;
  const password = await resolveVaultPassword({ vault: input.vault, env: input.env, prompt: input.prompt });

  if (config.ai.apiKeyEncrypted && !config.ai.apiKey?.trim()) {
    const unsealed = await unsealApiKey({ config, vault: input.vault, password });
    if (!unsealed.ai.apiKey) {
      throw new SecurityError(
        `No API key is stored for "${config.ai.provider}". Run "gitpagedocs ai" and enter the key again, or "gitpagedocs config clear".`,
      );
    }
    return unsealed;
  }

  const sealed = await sealApiKey({ config, vault: input.vault, password });
  await input.configRepo.write(sealed);
  input.onInfo?.(
    `[gitpagedocs:ai] API key moved from .gitpagedocsconfig into the encrypted vault (${input.vault.getVaultPath()}).`,
  );
  return config;
}

export type StoredKeyUnlocker = (stored: AiCliConfig) => Promise<string | undefined>;

/**
 * Callback for credential resolvers: the decrypted key of the stored config, or
 * undefined (with the reason reported) when the vault cannot be opened.
 */
export function createStoredKeyUnlocker(deps: Omit<UnlockStoredConfigInput, "config">): StoredKeyUnlocker {
  return async (stored) => {
    try {
      const unlocked = await unlockStoredConfig({ ...deps, config: stored });
      return unlocked.ai.apiKey;
    } catch (error) {
      deps.onInfo?.(error instanceof Error ? error.message : String(error));
      return undefined;
    }
  };
}
