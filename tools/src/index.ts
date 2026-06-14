// @gitpagedocs/tools — shared business-logic core.
//
// The single home for domain logic consumed by the frontend, the CLI and the
// MCP server. Consumers import from here (or subpath modules) and depend on the
// port interfaces, never on concrete adapters they don't need.

// Port contracts (type-only).
export type * from "./ports";

// Phase 4 — cross-cutting core implementations.
export * from "./errors";
export * from "./logger";
export * from "./crypto";
export * from "./cache";
export * from "./security";
export * from "./config";
export * from "./constants";

// Phase 5 — shared AI system.
export * from "./ai";

// Phase 7 — filesystem + documentation services.
export * from "./filesystem";
export * from "./documentation";
