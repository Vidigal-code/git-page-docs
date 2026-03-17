# CLI Architecture (Clean Architecture + SOLID)

## Layer Overview

```
cli/
├── index.mjs         # Presentation: entry, banner, command dispatch
├── ui/               # Presentation: banner, logger, prompts
├── commands/         # Presentation: thin command wrappers
│
├── application/      # Use cases (orchestration)
│   ├── config-only/handler.mjs
│   ├── home/handler.mjs
│   └── report/       # Output messaging (SRP)
│       └── config-only-reporter.mjs
│
├── builders/         # Domain: pure config building logic
│   ├── root-config-builder.mjs
│   ├── version-config-builder.mjs
│   ├── config-orchestrator.mjs
│   └── ...
│
├── infrastructure/   # I/O adapters
│   ├── file-writer.mjs   # FileWriter abstraction (DIP)
│   └── runtime/         # output, workflow, git-ops, doc-path-resolver
│
├── options/          # Shared: parser, resolver, schema
├── data/             # Shared: layouts, urls, constants
├── content/          # Shared: docs, html-pages
└── home/             # Home-specific: templates, file-writer
```

## SOLID Principles

| Principle | Application |
|-----------|-------------|
| **SRP** | ConfigOnlyReporter (messages only); handlers (orchestration only) |
| **OCP** | FileWriter interface allows new writers without modifying consumers |
| **LSP** | Handlers interchangeable via execute(params) contract |
| **ISP** | Small interfaces (writeText, writeJson) |
| **DIP** | Use cases depend on abstractions (writeText injected) |

## Clean Architecture

- **Domain**: Pure logic, no I/O (builders)
- **Application**: Use cases orchestrate domain + infrastructure
- **Infrastructure**: Concrete I/O (fs, git, exec)
- **Presentation**: CLI entry, parses args, delegates to use cases
