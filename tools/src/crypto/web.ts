// Browser-safe crypto entry: Web Crypto only (no node:crypto).
export { WebCryptoService } from "./web-crypto-service";
export { deriveDocAccessKeys, verifyDocAccess } from "./doc-access";
export type { DocAccessKeys, Sha256Service } from "./doc-access";
