/**
 * Documentation password-gate key scheme (runtime-agnostic).
 *
 * Double-hash so config.json can ship a non-reversible verifier while the user
 * keeps a copyable credential:
 *   privateKey = sha256(password)     // printed by the CLI, shareable
 *   publicKey  = sha256(privateKey)   // stored in config.json
 * Unlock succeeds when the supplied input is the password OR the private key.
 *
 * Pure: depends only on a { sha256 } service, so the SAME code runs in the CLI
 * (NodeCryptoService) and the browser (WebCryptoService). It must NOT import
 * node:crypto (e.g. safeHexEqual) so it stays safe to bundle for the web.
 */

/** Minimal hashing surface — satisfied by both Node and Web CryptoService. */
export interface Sha256Service {
  sha256(input: string): Promise<string>;
}

export interface DocAccessKeys {
  /** sha256(password) — printed for the user to copy/share. */
  readonly privateKey: string;
  /** sha256(privateKey) — safe to commit in config.json. */
  readonly publicKey: string;
}

/** Derive the { privateKey, publicKey } pair from a plaintext password. */
export async function deriveDocAccessKeys(
  password: string,
  crypto: Sha256Service,
): Promise<DocAccessKeys> {
  const privateKey = await crypto.sha256(password);
  const publicKey = await crypto.sha256(privateKey);
  return { privateKey, publicKey };
}

/**
 * Verify a user-supplied credential (password OR private key) against the stored
 * public key. Returns false when either side is empty.
 */
export async function verifyDocAccess(
  input: string,
  publicKey: string,
  crypto: Sha256Service,
): Promise<boolean> {
  if (!input || !publicKey) return false;
  const once = await crypto.sha256(input);
  if (hexEqual(once, publicKey)) return true; // input is the private key
  const twice = await crypto.sha256(once);
  return hexEqual(twice, publicKey); // input is the password
}

/**
 * Length-checked, constant-time hex comparison. Local (not safeHexEqual) so this
 * module never imports node:crypto and stays browser-bundle-safe.
 */
function hexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
