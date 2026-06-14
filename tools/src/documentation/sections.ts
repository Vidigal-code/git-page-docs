import { PROVIDER_CATALOG, ALL_PROVIDER_IDS } from "../ai/catalog";

/**
 * Deterministic documentation section generators. Pure functions over the
 * static catalog/command data, so the managed regions they produce are stable
 * across runs (idempotent) and require no AI call.
 */

/** Markdown table of supported AI providers and their default models. */
export function providersSection(): string {
  const header = "| Provider | ID | Default model | Capabilities |\n| --- | --- | --- | --- |";
  const rows = ALL_PROVIDER_IDS.map((id) => {
    const spec = PROVIDER_CATALOG[id];
    const caps = [
      spec.capabilities.streaming ? "stream" : null,
      spec.capabilities.vision ? "vision" : null,
      spec.capabilities.audio ? "audio" : null,
    ]
      .filter(Boolean)
      .join(", ");
    return `| ${spec.label} | \`${id}\` | \`${spec.defaultModel}\` | ${caps || "text"} |`;
  });
  return [`### Supported AI providers (${ALL_PROVIDER_IDS.length})`, "", header, ...rows].join("\n");
}

export interface CommandDoc {
  readonly name: string;
  readonly summary: string;
}

/** Markdown list of CLI commands. */
export function cliCommandsSection(commands: readonly CommandDoc[]): string {
  const items = commands.map((c) => `- \`gitpagedocs ${c.name}\` — ${c.summary}`);
  return ["### CLI commands", "", ...items].join("\n");
}

/** Markdown block documenting the monorepo dev workflow (deterministic). */
export function devWorkflowSection(): string {
  const cmds = [
    ["pnpm install", "install workspace dependencies"],
    ["pnpm run typecheck", "type-check frontend + tools + mcp"],
    ["pnpm run lint", "lint the project"],
    ["pnpm run test:unit", "run the Vitest unit/integration suite"],
    ["pnpm run test:cov", "unit tests with coverage"],
    ["pnpm run test:e2e", "Playwright frontend E2E"],
    ["pnpm run smoke:all", "CLI/contract/tools/mcp regression wall"],
    ["pnpm run build", "build the static site"],
  ];
  return [
    "### Development",
    "",
    "This is a pnpm + turbo monorepo (`frontend` at root `src/`, plus `tools/`, `mcp/`, `cli/`).",
    "",
    ...cmds.map(([c, d]) => `- \`${c}\` — ${d}`),
  ].join("\n");
}

/** Markdown block summarizing how API keys are handled (deterministic). */
export function securityNoteSection(): string {
  return [
    "### API key handling",
    "",
    "- API keys are stored **encrypted at rest** (AES-256-GCM) behind a local password — never in plaintext.",
    "- The password gates sensitive operations and is held only in memory for the session.",
    "- Keys are **never logged** (the logger redacts secrets) and are sent only to the AI provider you select.",
    "- To report a vulnerability, open a security advisory or issue on the repository.",
  ].join("\n");
}

/** The canonical command list for the documentation (legacy + new verbs). */
export const CLI_COMMANDS: readonly CommandDoc[] = [
  { name: "init", summary: "scaffold gitpagedocs config files" },
  { name: "config", summary: "show the resolved gitpagedocs config" },
  { name: "provider [id]", summary: "list AI providers or show one" },
  { name: "models [provider]", summary: "list catalog models" },
  { name: "document[:repo|:file|:folder]", summary: "generate documentation with AI" },
  { name: "deploy | pages", summary: "configure GitHub Pages via Actions and push" },
  { name: "doctor", summary: "diagnose the environment" },
  { name: "mcp start", summary: "start the MCP server over stdio" },
  { name: "version", summary: "print the CLI version" },
  { name: "update", summary: "show how to update the CLI" },
];
