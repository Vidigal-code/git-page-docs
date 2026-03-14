export type LanguageCode = "pt" | "en" | "es" | string;

export interface SiteConfig {
  name: string;
  defaultLanguage: LanguageCode;
  HideThemeSelector: boolean;
  ThemeDefault: string;
  ThemeModeDefault?: ThemeMode;
  ProjectLink?: string;
  docsVersion?: string;
  ActiveNavigation?: boolean;
  FocusMode?: boolean;
  IconImageMenuHeader?: string;
  IconImageMenuHeaderLight?: string;
  IconImageMenuHeaderDark?: string;
  IconImageMenuHeaderReactIcones?: boolean;
  IconImageMenuHeaderReactIconesTag?: string;
  IconImageMenuHeaderReactIconesTagColorDark?: string;
  IconImageMenuHeaderReactIconesTagColorLight?: string;
  IconImageMenuHeaderReactIconesTagSize?: string;
  IconProjectLinkReactIcones?: boolean;
  IconProjectLinkReactIconesTag?: string;
  IconProjectLinkReactIconesTagColorDark?: string;
  IconProjectLinkReactIconesTagColorLight?: string;
  IconProjectLinkReactIconesTagSize?: string;
  layoutsConfigPath?: string;
  layoutsConfigPathTemplates?: string;
  rendering: string;
  RendertoanyRepositoryviaSearch: boolean;
  langmenu: Record<LanguageCode, Record<LanguageCode, string>>;
}

export interface RouteConfig {
  id: number;
  path: Record<LanguageCode, string>;
}

export interface HeaderMenuItem {
  id: number;
  submenus?: HeaderMenuItem[];
  [language: string]: number | HeaderMenuLocalizedContent | HeaderMenuItem[] | undefined;
}

export interface HeaderMenuLocalizedContent {
  title: string;
  "path-click": string;
  submenus?: HeaderMenuLocalizedContent[];
}

export interface GitPageDocsConfig {
  site: SiteConfig;
  routes: RouteConfig[];
  "menus-header": HeaderMenuItem[];
  VersionControl?: VersionControlConfig;
  translations?: UiTranslationsConfig;
}

export interface VersionEntry {
  id: string;
  path: string;
  ProjectLink?: string;
  branch?: string;
  release?: string;
  commit?: string;
}

export interface VersionControlConfig {
  versions: VersionEntry[];
}

export interface UiTranslationEntry {
  [language: string]: string;
}

export interface UiTranslationsConfig {
  notFound?: {
    title?: UiTranslationEntry;
    description?: UiTranslationEntry;
    returnHome?: UiTranslationEntry;
  };
  navigation?: {
    previous?: UiTranslationEntry;
    next?: UiTranslationEntry;
    menuOpen?: UiTranslationEntry;
    menuClose?: UiTranslationEntry;
  };
}

export type ThemeMode = "light" | "dark";

export interface LayoutItem {
  id: string;
  name: string;
  author: string;
  file: string;
  preview: string;
  supportsLightAndDarkModes: boolean;
  supportsLightAndDarkModesReference?: string;
  mode: ThemeMode;
}

export interface LayoutsConfig {
  layouts: LayoutItem[];
}

export interface ThemeTemplate {
  id: string;
  name: string;
  author: string;
  version: string;
  mode: ThemeMode;
  supportsLightAndDarkModes: boolean;
  colors: Record<string, string>;
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
  };
  components: Record<string, unknown>;
  animations: Record<string, unknown>;
}

export interface DocsContent {
  routeId: number;
  markdownByLanguage: Record<LanguageCode, string>;
}

export interface LoadedDocsData {
  config: GitPageDocsConfig;
  docs: DocsContent[];
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
