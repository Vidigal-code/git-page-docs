export const PROJECT_FOOTER_URL = "https://github.com/Vidigal-code/git-page-docs";

/** URL query param for active theme layout id (e.g. theme=aurora-dark). Always reflected in URL. */
export const THEME_URL_PARAM = "theme";

/** Base path for gitpagedocs config files. */
export const CONFIG_BASE = "gitpagedocs/config";

/** Supported config file extensions. */
export const CONFIG_EXTENSIONS = [".json", ".js", ".ts"] as const;

/** Default config path for remote repository config. */
export const DEFAULT_CONFIG_PATH = "gitpagedocs/config.json";

/** Default content hierarchy. */
export const DEFAULT_HIERARCHY = { md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4 } as const;
