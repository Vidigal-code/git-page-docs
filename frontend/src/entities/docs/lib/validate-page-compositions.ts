import { PAGE_BLOCK_TYPES, type PageCompositionConfig, type PageContentBlockConfig, type RouteAuthorizationConfig } from "../model/types/config";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIdentifier(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isOptionalStringList(value: unknown): value is string[] | undefined {
  return value === undefined || (Array.isArray(value) && value.every((item) => typeof item === "string"));
}

function isAuthorization(value: unknown): value is RouteAuthorizationConfig | undefined {
  if (value === undefined) return true;
  if (!isRecord(value)) return false;
  return (value.enabled === undefined || typeof value.enabled === "boolean") &&
    (value.accessKeyId === undefined || typeof value.accessKeyId === "string") &&
    (value.requireExternalAuth === undefined || typeof value.requireExternalAuth === "boolean") &&
    isOptionalStringList(value.requiredRoles) && isOptionalStringList(value.allowedProviders) &&
    (value.allowedProviders?.every((provider) => ["authjs", "clerk", "firebase", "jwt"].includes(provider)) ?? true);
}

function isBlock(value: unknown): value is PageContentBlockConfig {
  return isRecord(value) && typeof value.id === "string" && value.id.trim().length > 0 &&
    typeof value.type === "string" && (PAGE_BLOCK_TYPES as readonly string[]).includes(value.type) && isIdentifier(value.routeId);
}

export function getPageCompositions(value: unknown): PageCompositionConfig[] {
  if (!Array.isArray(value)) return [];
  const pageIds = new Set<number>();
  return value.flatMap((candidate: unknown) => {
    if (!isRecord(candidate) || !isIdentifier(candidate.id) || !Array.isArray(candidate.blocks) ||
      !isAuthorization(candidate.authorization) || pageIds.has(candidate.id)) return [];
    pageIds.add(candidate.id);
    const blockIds = new Set<string>();
    const blocks = candidate.blocks.filter((block: unknown): block is PageContentBlockConfig => {
      if (!isBlock(block) || blockIds.has(block.id)) return false;
      blockIds.add(block.id);
      return true;
    });
    return [{ id: candidate.id, authorization: candidate.authorization, blocks }];
  });
}
