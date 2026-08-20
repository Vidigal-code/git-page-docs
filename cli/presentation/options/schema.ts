import { DEFAULT_LAYOUTS_DIR } from "../../contracts/layouts-paths.mjs";

export const DEFAULTS = {
  outputDir: "gitpagedocs",
  /** Standalone layouts home; local layouts are generated here, never in outputDir. */
  layoutsDir: DEFAULT_LAYOUTS_DIR as string,
  repositorySearch: false,
  basePath: "",
  home: {
    outputDir: "gitpagedocshome",
    repositorySearch: false,
    basePath: "",
  },
} as const;
