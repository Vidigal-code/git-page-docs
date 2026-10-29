import type { VersionEntry } from "@/entities/docs/model/types";

export interface VersionLinkOption {
  id: "branch" | "release" | "commit";
  label: string;
  name?: string;
  url: string;
}

const VERSION_LINK_LABELS = { branch: "Branch", release: "Release", commit: "Commit" } as const;
const VERSION_LINK_KINDS = ["branch", "release", "commit"] as const;
const RELATIVE_LINK_BASE = "https://gitpagedocs.invalid/";

function safeLinkUrl(value: string): string | undefined {
  const url = value.trim();
  if (!url) return undefined;
  try {
    const parsed = new URL(url, RELATIVE_LINK_BASE);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? url : undefined;
  } catch {
    return undefined;
  }
}

function namedLink(value: unknown, id: VersionLinkOption["id"]): VersionLinkOption[] {
  if (typeof value !== "object" || value === null || !("name" in value) || !("url" in value)) {
    return [];
  }
  if (typeof value.name !== "string" || typeof value.url !== "string") {
    return [];
  }
  const name = value.name.trim();
  const url = safeLinkUrl(value.url);
  return name && url ? [{ id, label: VERSION_LINK_LABELS[id], name, url }] : [];
}

function linksForKind(value: unknown, id: VersionLinkOption["id"]): VersionLinkOption[] {
  if (typeof value === "string") {
    const url = safeLinkUrl(value);
    return url ? [{ id, label: VERSION_LINK_LABELS[id], url }] : [];
  }
  return Array.isArray(value) ? value.flatMap((item: unknown) => namedLink(item, id)) : [];
}

export function buildVersionLinkOptions(activeVersion: VersionEntry | undefined): VersionLinkOption[] {
  if (!activeVersion) {
    return [];
  }
  const seen = new Set<string>();
  return VERSION_LINK_KINDS.flatMap((id) => linksForKind(activeVersion[id], id)).filter((option) => {
    const identity = JSON.stringify([option.id, option.name, option.url]);
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}
