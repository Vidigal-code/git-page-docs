/**
 * Pure view-model helpers for the client-side 404 shell (`not-found.tsx`):
 * copy selection, loading-bar geometry and the repository path written back to
 * the URL. Kept free of React so the page's branching stays testable in node.
 */
import {
  INSTALLED_NOT_PRERENDERED,
  INSTALLED_PROMPT,
  NOT_INSTALLED,
  SEARCH_PROMPT,
} from "@/shared/config/i18n/not-found-dict";

export type RepoStatus = "unknown" | "checking" | "installed" | "not_installed";

export type SupportedLanguage = "en" | "pt" | "es";

type NotFoundDictionary = Readonly<Record<SupportedLanguage, string>>;

/** Text for `language`, falling back to English when the entry is missing or blank. */
export function pickNotFoundText(dictionary: NotFoundDictionary, language: SupportedLanguage): string {
  return dictionary[language] || dictionary.en;
}

/** Width of the animated loading bar for the current dot count (1, 2, then full). */
export function resolveLoadingProgressWidth(loaderDots: number): string {
  if (loaderDots === 1) return "34%";
  if (loaderDots === 2) return "68%";
  return "100%";
}

/**
 * True while the shell must keep showing the loading view: an owner/repo path
 * is present and its docs are still being probed or fetched.
 */
export function isRepositoryResolving(isRepoPath: boolean, repoStatus: RepoStatus, appLoading: boolean): boolean {
  if (!isRepoPath) return false;
  return repoStatus === "unknown" || repoStatus === "checking" || (repoStatus === "installed" && appLoading);
}

export interface NotFoundCopy {
  message: string;
  prompt: string;
  /** Whether the "404" code line is shown above the message. */
  showCode: boolean;
}

/** Headline, prompt and code visibility for the search/404 view. */
export function resolveNotFoundCopy(isRepoPath: boolean, repoStatus: RepoStatus, language: SupportedLanguage): NotFoundCopy {
  if (!isRepoPath) {
    return { message: "Page not found", prompt: "The requested page does not exist.", showCode: true };
  }
  if (repoStatus === "installed") {
    return {
      message: pickNotFoundText(INSTALLED_NOT_PRERENDERED, language),
      prompt: pickNotFoundText(INSTALLED_PROMPT, language),
      showCode: false,
    };
  }
  return {
    message: pickNotFoundText(NOT_INSTALLED, language),
    prompt: pickNotFoundText(SEARCH_PROMPT, language),
    showCode: repoStatus === "not_installed",
  };
}

/** Pathname for an owner/repo pair under the app base path (always slash-terminated). */
export function buildRepositoryPath(basePath: string, owner: string, repo: string): string {
  return `${basePath ? basePath + "/" : "/"}${owner}/${repo}/`;
}
