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
