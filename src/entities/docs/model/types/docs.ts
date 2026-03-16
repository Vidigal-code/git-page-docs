import type { GitPageDocsConfig } from "./config";
import type { DocsContent, LoadedPage, PathToPageEntry } from "./content";
import type { VersionEntry } from "./version";
import type { LayoutsConfig, ThemeTemplate } from "./theme";
import type { LanguageCode } from "./site";

export interface LoadedDocsData {
  config: GitPageDocsConfig;
  docs: DocsContent[];
  pages: LoadedPage[];
  pathToPageMap: Record<string, PathToPageEntry>;
  showRepositorySearchHome?: boolean;
  availableVersions: VersionEntry[];
  activeVersionId?: string;
  activeVersion?: VersionEntry;
  activeRepository: {
    owner?: string;
    repo?: string;
    requested?: boolean;
    hasGitPageDocs?: boolean;
    source: "local" | "remote";
  };
  availableLanguages: LanguageCode[];
  layoutsConfig: LayoutsConfig;
  themes: Record<string, ThemeTemplate>;
}
