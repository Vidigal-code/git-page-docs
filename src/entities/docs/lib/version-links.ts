import type { VersionEntry } from "@/entities/docs/model/types";

export interface VersionLinkOption {
  id: "branch" | "release" | "commit";
  label: string;
  url: string;
}

export function buildVersionLinkOptions(activeVersion: VersionEntry | undefined): VersionLinkOption[] {
  if (!activeVersion) {
    return [];
  }

  const options: VersionLinkOption[] = [];
  const branch = activeVersion.branch?.trim();
  const release = activeVersion.release?.trim();
  const commit = activeVersion.commit?.trim();

  if (branch) {
    options.push({ id: "branch", label: "Branch", url: branch });
  }
  if (release) {
    options.push({ id: "release", label: "Release", url: release });
  }
  if (commit) {
    options.push({ id: "commit", label: "Commit", url: commit });
  }

  return options;
}
