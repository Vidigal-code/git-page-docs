// Browser-safe security entry: encrypted vault + web storage.
// Excludes FileVaultStorage (node:fs).
export { EncryptedCredentialVault } from "./credential-vault";
export type { VaultStorage } from "./credential-vault";
export { SessionPasswordGate } from "./password-gate";
export type { PasswordPrompt, SessionPasswordGateOptions } from "./password-gate";
export { WebStorageVaultStorage } from "./web-storage-vault-storage";
