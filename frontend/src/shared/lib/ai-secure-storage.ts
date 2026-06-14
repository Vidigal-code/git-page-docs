/**
 * @file ai-secure-storage.ts
 * @description Password-encrypted storage for AI API keys, backed by the shared
 * @gitpagedocs/tools vault (AES-256-GCM via Web Crypto). This is the secure
 * replacement for the plaintext ai-storage.ts: keys live encrypted in
 * localStorage and are only decryptable with the local password.
 *
 * The chat UI wires this behind a password prompt (one unlock per session). It
 * coexists with the legacy plaintext store via migrateFromPlaintext().
 */
import { WebCryptoService } from '@gitpagedocs/tools/crypto/web';
import {
    EncryptedCredentialVault,
    WebStorageVaultStorage,
    migratePlaintextKey,
} from '@gitpagedocs/tools/security/web';
import type { WebStorageLike } from '@gitpagedocs/tools/cache/web';

function resolveStorage(injected?: WebStorageLike): WebStorageLike | null {
    if (injected) return injected;
    if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage as unknown as WebStorageLike;
    }
    return null;
}

export class AiSecureStorage {
    private readonly vault: EncryptedCredentialVault | null;

    constructor(storage?: WebStorageLike) {
        const backing = resolveStorage(storage);
        this.vault = backing
            ? new EncryptedCredentialVault(new WebStorageVaultStorage(backing), new WebCryptoService())
            : null;
    }

    /** True when a vault exists in storage (a password has been set). */
    async isInitialized(): Promise<boolean> {
        return this.vault ? this.vault.isInitialized() : false;
    }

    async setPassword(password: string): Promise<void> {
        if (this.vault && !(await this.vault.isInitialized())) {
            await this.vault.initialize(password);
        }
    }

    async unlock(password: string): Promise<boolean> {
        return this.vault ? this.vault.unlock(password) : false;
    }

    async saveKey(password: string, provider: string, key: string): Promise<void> {
        if (this.vault) await this.vault.setCredential(password, provider, key);
    }

    async getKey(password: string, provider: string): Promise<string | undefined> {
        return this.vault ? this.vault.getCredential(password, provider) : undefined;
    }

    /** Remove a single provider's stored key from the vault (used by "Clear Data"). */
    async removeKey(password: string, provider: string): Promise<void> {
        if (this.vault) await this.vault.removeCredential(password, provider);
    }

    /** Move a legacy plaintext key into the encrypted vault, then clear it. */
    async migrateFromPlaintext(
        password: string,
        provider: string,
        plaintextKey: string,
        clearPlaintext: () => void,
    ): Promise<boolean> {
        if (!this.vault) return false;
        const result = await migratePlaintextKey({
            vault: this.vault,
            password,
            providerId: provider,
            plaintextKey,
            clearPlaintext,
        });
        return result.migrated;
    }
}

export const aiSecureStorage = new AiSecureStorage();
