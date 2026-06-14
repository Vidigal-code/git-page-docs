# CLI Architecture (Clean Architecture + SOLID)

## Layer Overview

```
cli/
├── index.mjs                          # Node entry (bootstraps TS presentation)
├── contracts/                         # Stable contracts for external tooling
│   └── doc-versions.mjs
│
├── presentation/                      # Interface/composition root
│   ├── index.ts
│   ├── options/
│   └── ui/
│
├── application/                       # Use-cases and ports
│   ├── config-only/handler.mjs
│   ├── home/handler.mjs
│   ├── report/config-only-reporter.mjs
│   ├── use-cases/dispatch-mode.ts
│   └── ports/cli-runtime-ports.ts
│
├── domain/                            # Business rules
│   └── services/sanitize-segment.mjs
│
├── infrastructure/                    # Side effects and adapters
│   ├── config-only/runtime.mjs
│   └── home/runtime.mjs
│
├── builders/                          # Pure config builders
├── data/                              # Constants and metadata
├── content/                           # Static docs content
├── runtime/                           # Low-level runtime helpers
└── home/                              # Home templates/files
```

## SOLID Principles

| Principle | Application |
|-----------|-------------|
| **SRP** | `application/report` only formats messages; handlers only orchestrate |
| **OCP** | New runtime implementations can be injected through ports |
| **LSP** | `dispatch-mode` works with any runner implementing `CliCommandRunner` |
| **ISP** | Split runtime contracts (`ConfigOnlyRuntimePort`, `HomeRuntimePort`) |
| **DIP** | Use-cases depend on `application/ports`, not concrete fs/git/exec |

## Clean Architecture

- **Interfaces/Presentation**: parse CLI args, resolve mode, wire dependencies in `presentation/index.ts`
- **Application**: orchestrate flows with explicit ports, without direct fs/git/exec imports
- **Domain**: sanitize and core rules with no infrastructure dependencies
- **Infrastructure**: concrete adapters for runtime side effects
- **Contracts**: `tools/smoke` consumes `cli/contracts` instead of internal CLI modules

## Authorized Routes Pipeline

The CLI now generates authorized-route docs and config entries in PT/EN/ES.

- Source content: `cli/content/docs.mjs` (`authorizedRoutes` key per language)
- Route metadata: `cli/data/route-metas.mjs` (`ROUTE_META_ID6`)
- Route path mapping: `cli/data/path-mappings.mjs` (`authorized-routes.md`)
- Version config composition: `cli/builders/version-config-builder.mjs`
- Doc key resolution: `cli/runtime/doc-path-resolver.mjs`

Generated artifacts include:

- `gitpagedocs/docs/versions/<version>/config.json` with `auth` and route `authorization`
- `gitpagedocs/docs/versions/<version>/{pt,en,es}/authorized-routes.md`
- `menus-header-md` entry dedicated to Authorized Routes

## GitHub Pages Push Paths

- Default project-site publish (`--push` without `--path`) targets `/<repo>/`.
- Custom project subpath publish (`--push --path <segment>`) targets `/<repo>/<segment>/`.
- `--path` accepts a single sanitized segment (letters, numbers, `.`, `_`, `-`).

Example:

```bash
npx gitpagedocs --owner vidigal-code --repo energy-bill-ai-parser --path git-docs --push
```

Expected URL after deployment:

```text
https://vidigal-code.github.io/energy-bill-ai-parser/git-docs/
```

## AI CLI (interactive + config file)

The CLI now includes a dedicated interactive AI mode:

```bash
npx gitpagedocs ai
```

### What it does

- asks provider (`openai`, `claude`, `gemini`, `ollama`)
- asks API key or Ollama URL
- asks paths to scan (supports one or many paths, including other repositories)
- generates markdown documentation in `pt`, `en`, `es`
- optionally persists config in `.gitpagedocsconfig`
- optionally runs standard `gitpagedocs` scaffolding after AI generation

### `.gitpagedocsconfig` (manual mode)

You can create/edit this file manually and then run `npx gitpagedocs ai`:

```json
{
	"version": 1,
	"ai": {
		"provider": "openai",
		"model": "gpt-4o-mini",
		"apiKey": "<YOUR_API_KEY>",
		"paths": ["src", "cli", "../another-repo/src"],
		"languages": ["pt", "en", "es"],
		"outputDir": "gitpagedocs/docs",
		"filePrefix": "ai-generated",
		"contextPrompt": "Você é um redator técnico sênior..."
	}
}
```

For Ollama, use `baseUrl` instead of `apiKey`.

### Interactive fallback

If a directory is not found, CLI offers fallback choices:

- fix paths and retry
- skip missing paths and continue
- abort safely
