import type { AIProvider, GenerateRequest, ProviderConfig } from "../ports/ai";

/** Documentation artifact kinds the generator can produce. */
export type DocKind =
  | "readme"
  | "changelog"
  | "release-notes"
  | "api"
  | "architecture"
  | "database"
  | "documentation"
  | "update"
  | "analyze-repository"
  | "analyze-project"
  | "analyze-source"
  | "validate";

const BASE_SYSTEM =
  "You are a senior staff engineer and technical writer. Produce precise, " +
  "well-structured GitHub-flavored Markdown. Be accurate to the provided source; " +
  "never invent APIs, files, or behavior that is not present in the input.";

const KIND_SYSTEM: Record<DocKind, string> = {
  readme: "Generate a complete README.md: title, summary, features, install, usage, configuration, and license.",
  changelog: "Produce a Keep a Changelog style CHANGELOG entry grouping changes under Added/Changed/Fixed/Removed.",
  "release-notes": "Write concise, user-facing release notes highlighting notable changes and breaking changes.",
  api: "Generate API reference documentation for the exported functions, classes, and types in the input.",
  architecture: "Describe the architecture: layers, modules, data flow, and key design decisions. Use diagrams in text form where helpful.",
  database: "Document the data model: entities, fields, relationships, and constraints inferred from the input.",
  documentation: "Generate clear developer documentation for the provided code.",
  update: "Update the existing documentation to reflect the provided source changes, preserving correct content.",
  "analyze-repository": "Analyze the repository structure and summarize purpose, stack, modules, and notable patterns.",
  "analyze-project": "Analyze the project and summarize architecture, dependencies, and areas of risk or improvement.",
  "analyze-source": "Analyze the provided source code: responsibilities, complexity, issues, and suggestions.",
  validate: "Review the documentation for accuracy, completeness, broken references, and gaps. Return a findings list.",
};

export interface GenerateDocInput {
  readonly kind: DocKind;
  /** Source/context material (file listing, code, existing docs, …). */
  readonly context: string;
  /** Optional extra user instructions. */
  readonly instructions?: string;
  readonly signal?: AbortSignal;
}

/**
 * Generates documentation by composing a kind-specific prompt and delegating to
 * any AIProvider. The single place documentation prompts live, shared by the
 * CLI, MCP and frontend.
 */
export class DocumentationService {
  constructor(
    private readonly provider: AIProvider,
    private readonly config: ProviderConfig,
  ) {}

  buildRequest(input: GenerateDocInput): GenerateRequest {
    const system = `${BASE_SYSTEM}\n${KIND_SYSTEM[input.kind]}`;
    const userParts = [input.instructions, "--- INPUT ---", input.context].filter(Boolean);
    return {
      system,
      messages: [{ role: "user", content: userParts.join("\n\n") }],
      temperature: 0.2,
      maxTokens: 4000,
      signal: input.signal,
    };
  }

  async generate(input: GenerateDocInput): Promise<string> {
    const response = await this.provider.generate(this.buildRequest(input), this.config);
    return response.text;
  }
}
