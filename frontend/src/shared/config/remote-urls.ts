export const REMOTE_FETCH_TIMEOUT_MS = 12000;

/** Repo-relative folders that can host layout data, in resolution order. */
export const LAYOUTS_DIR_CANDIDATES = ["gitpagelayouts/"] as const;

/** Index file name inside a layouts folder. */
export const LAYOUTS_CONFIG_FILENAME = "layoutsConfig.json";

/** Preferred official layouts home (this repository's `gitpagelayouts/` folder). */
export const OFFICIAL_LAYOUTS_CONFIG_URL =
    "https://github.com/Vidigal-code/git-page-docs/blob/main/gitpagelayouts/layoutsConfig.json";

/** Official layouts config URLs to try in order. */
export const OFFICIAL_LAYOUTS_CONFIG_URLS = [OFFICIAL_LAYOUTS_CONFIG_URL] as const;

export const OFFICIAL_LAYOUTS_TEMPLATES_URL =
    "https://github.com/Vidigal-code/git-page-docs/blob/main/gitpagelayouts/templates";
