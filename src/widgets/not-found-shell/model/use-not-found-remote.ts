/**
 * Re-exports from entities for the not-found page.
 * Keeps app layer from importing entities directly (FSD compliance).
 */
export {
  checkRepositoryHasGitPageDocs,
  loadRemoteDocsData,
  parseSupportedLanguage,
} from "@/entities/docs/api/load-remote-docs-data-client";
export type { SupportedLanguage } from "@/entities/docs/api/load-remote-docs-data-client";
export { getLanguageLabelFromMenu } from "@/entities/docs/lib/i18n/lang-menu";
export { resolveThemeByMode } from "@/entities/docs/lib/theme/resolve-theme-by-mode";
export { toSearchShellCssVars } from "@/entities/docs/lib/theme/to-css-vars";
export type { LoadedDocsData } from "@/entities/docs/model/types";
