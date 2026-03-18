/**
 * Re-exports from entities for the not-found page.
 * Keeps app layer from importing entities directly (FSD compliance).
 */
export {
  checkRepositoryHasGitPageDocs,
  loadRemoteDocsData,
  parseSupportedLanguage,
  getLanguageLabelFromMenu,
  resolveThemeByMode,
  toSearchShellCssVars,
} from "@/entities/docs";
export type { LoadedDocsData, SupportedLanguage } from "@/entities/docs";
