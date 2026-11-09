import { getLangMenuLabelFromMenu } from "@/entities/docs";
import type { LanguageCode, SiteConfig } from "@/entities/docs";

export interface SourceViewerLabels {
  files: string;
  path: string;
  name: string;
  size: string;
  parent: string;
  owner: string;
  repo: string;
  branch: string;
  submit: string;
  filter: string;
  clear: string;
  loadingTree: string;
  loadingFile: string;
  notFound: string;
  retry: string;
  fileError: string;
  empty: string;
  selectFile: string;
  preview: string;
  code: string;
  /** Standalone page: the header link back to the site root. */
  back: string;
}

const NAVIGATION_LABELS: Readonly<Record<LanguageCode, Pick<SourceViewerLabels, "files" | "path" | "name" | "size" | "parent">>> = {
  en: { files: "Files", path: "Repository path", name: "Name", size: "Size", parent: "Parent directory" },
  pt: { files: "Arquivos", path: "Caminho do repositório", name: "Nome", size: "Tamanho", parent: "Pasta anterior" },
  es: { files: "Archivos", path: "Ruta del repositorio", name: "Nombre", size: "Tamaño", parent: "Carpeta superior" },
} as const;

/** Single source for the source-viewer copy (langmenu-overridable, shared by
 * the standalone page and the docs-shell container). */
export function buildSourceViewerLabels(
  langmenu: SiteConfig["langmenu"],
  language: LanguageCode,
): SourceViewerLabels {
  const label = (key: string, fallback: string) =>
    getLangMenuLabelFromMenu(langmenu, language, key, fallback);
  const navigation = NAVIGATION_LABELS[language] ?? NAVIGATION_LABELS.en;
  return {
    files: label("sourceViewerFilesLabel", navigation.files),
    path: label("sourceViewerPathLabel", navigation.path),
    name: label("sourceViewerNameLabel", navigation.name),
    size: label("sourceViewerSizeLabel", navigation.size),
    parent: label("sourceViewerParentLabel", navigation.parent),
    owner: label("searchOwnerLabel", "Owner"),
    repo: label("searchRepoLabel", "Repository"),
    branch: label("sourceViewerBranchLabel", "Branch"),
    submit: label("searchButtonLabel", "Search"),
    filter: label("sourceViewerFilterLabel", "Filter files"),
    clear: label("sourceViewerClearLabel", "Clear"),
    loadingTree: label("sourceViewerLoadingTree", "Loading source tree..."),
    loadingFile: label("sourceViewerLoadingFile", "Loading file..."),
    notFound: label("sourceViewerNotFound", "Repository, branch, or source tree was not found."),
    retry: label("sourceViewerRetryLabel", "Try again"),
    fileError: label("sourceViewerFileError", "File could not be loaded."),
    empty: label("sourceViewerEmpty", "No entries found."),
    selectFile: label("sourceViewerSelectFile", "Select a file"),
    preview: label("sourceViewerPreview", "Preview"),
    code: label("sourceViewerCode", "Code"),
    back: label("sourceViewerBackLabel", "Back"),
  };
}
