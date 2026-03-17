import { getBasePath } from "./base-path";

export type SupportedLanguage = "en" | "pt" | "es";

export interface ParsedRepoPath {
  owner: string;
  repo: string;
  version?: string;
  language: SupportedLanguage;
}

export type ParseLanguageFn = (langParam: string | null) => SupportedLanguage;

/**
 * Parse owner, repo, version and language from the current window location.
 * Use parseLanguage to convert the raw lang param to SupportedLanguage.
 */
export function parseRepoPathFromLocation(
  parseLanguage: ParseLanguageFn,
): ParsedRepoPath | null {
  if (typeof window === "undefined") {
    return null;
  }
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const base = getBasePath();
  const withoutBase = base ? path.slice(base.length) : path;
  const parts = withoutBase.split("/").filter(Boolean);
  if (parts.length < 2) {
    return null;
  }
  const owner = parts[0];
  const repo = parts[1];
  const versionFromPath = parts.length >= 4 && parts[2] === "v" ? parts[3] : undefined;
  const versionFromQuery = searchParams.get("version") ?? undefined;
  const language = parseLanguage(searchParams.get("lang"));
  const version = versionFromPath || versionFromQuery;
  return { owner, repo, version, language };
}

/**
 * Parse owner, repo, version from pathname and search params (for testing or non-window usage).
 */
export function parseRepoPathFromProps(
  pathname: string,
  searchParams: URLSearchParams,
  basePath: string,
  parseLanguage: ParseLanguageFn,
): ParsedRepoPath | null {
  const withoutBase = basePath ? pathname.slice(basePath.length) : pathname;
  const parts = withoutBase.split("/").filter(Boolean);
  if (parts.length < 2) {
    return null;
  }
  const owner = parts[0];
  const repo = parts[1];
  const versionFromPath = parts.length >= 4 && parts[2] === "v" ? parts[3] : undefined;
  const versionFromQuery = searchParams.get("version") ?? undefined;
  const language = parseLanguage(searchParams.get("lang"));
  const version = versionFromPath || versionFromQuery;
  return { owner, repo, version, language };
}
