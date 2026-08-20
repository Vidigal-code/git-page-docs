export type CliMode = "home" | "full" | "config-only" | "ai";

/**
 * Values the user supplied explicitly on the command line. Interactive mode
 * only asks for what is missing, so an explicit flag is never re-asked.
 */
export interface CliExplicitFlags {
  useLocalLayoutConfig: boolean;
  layoutsDir: boolean;
  githubOwner: boolean;
  githubRepo: boolean;
  outputDir: boolean;
}

export interface CliOptions {
  isBuild: boolean;
  isServe: boolean;
  mode: CliMode;
  aiCommand?: string;
  outputDir: string;
  /** Standalone layouts home (repo-relative); local layouts are generated here. */
  layoutsDir: string;
  useLocalLayoutConfig: boolean;
  shouldPush: boolean;
  githubOwner: string;
  githubRepo: string;
  docsPath: string;
  basePath: string;
  repositorySearch?: boolean;
  isInteractive: boolean;
  hasArgs: boolean;
  explicit: CliExplicitFlags;
}
