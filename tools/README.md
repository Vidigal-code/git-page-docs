# @gitpagedocs/tools

The **shared business-logic core** of the [Git Page Docs](../README.md) monorepo — the single home for domain logic consumed by the frontend, the CLI, and the MCP server. It ships **TypeScript source** and is consumed via `tsx` (CLI/MCP) or a TS-aware bundler (Next `transpilePackages`).

## Modules (`src/`)

| Module | Responsibility |
|---|---|
| `ai/` | 14-provider AI system — data-driven `PROVIDER_CATALOG`, registry + factory (no switch chains), 5 family adapters (OpenAI-compatible, Anthropic, Gemini, Ollama, Cohere), SSE/NDJSON streaming, legacy↔catalog id mapping |
| `security/` | `EncryptedCredentialVault` (AES-256-GCM, PBKDF2-HMAC-SHA-256 key derivation), `SessionPasswordGate`; `WebStorageVaultStorage` (site `localStorage` vault) + `FileVaultStorage` (the CLI `.gitpagedocsvault` file) adapters |
| `crypto/` | `NodeCryptoService` + `WebCryptoService` (SHA-256, PBKDF2, AES-256-GCM, masking, secure wipe); `deriveDocAccessKeys` / `verifyDocAccess` (double-hash documentation password gate shared by the CLI `password` command and the frontend gate) |
| `cache/` | `MemoryCache`, `FileCache`, `WebStorageCache` (Strategy over one `Cache` port) |
| `config/` | `GitPageDocsConfigLoader` (`.json` / `.js` / `.ts`) |
| `config-format/` | Browser-safe `compactSiteIcons` / `expandSiteIcons` and `applyRouteDefaults` / `factorRouteDefaults` for compact configuration and inherited route values |
| `logger/` | Level-filtered logger with **secret redaction** |
| `errors/` | `AppError` + typed subclasses |
| `filesystem/` | `FileService` (list/read/write/search with lexical and canonical root containment; validates existing parents before creating files and rejects destination symlinks on writes; concurrent path replacement still requires trusted filesystem boundaries) |
| `documentation/` | `DocumentationService`, `patchManagedRegion`, `DocUpdater` |
| `i18n/` | Language bundles (`site.languages` toggles in `config.json` + `langs/<lang>.json`): `loadConfigLanguageBundles`, `applyLanguageBundles` (fold into `site.langmenu` / `translations`), `filterEnabledLanguages`, `splitLanguageBundles` (generator side); browser-safe |
| `ports/` | Type-only contracts (logger, cache, crypto, security, config, ai) |

## Entry points (`exports`)

`.` (full barrel) · `./ai` · `./errors` · `./i18n` · `./config-format` · `./ports` · `./crypto/web` · `./security/web` · `./cache/web` — the `web` subpaths, `./i18n` and `./config-format` are browser-safe (no `node:` imports) for the Next.js bundle.

## Usage

```ts
import { createDefaultFactory, PROVIDER_CATALOG } from "@gitpagedocs/tools/ai";
import { EncryptedCredentialVault } from "@gitpagedocs/tools/security/web";
```

## Tests

Unit + integration + E2E live in `tools/tests/**` (Vitest); self-tests in `tools/smoke/**`. Run from the repo root: `npx vitest run` and `npm run smoke:all`.
