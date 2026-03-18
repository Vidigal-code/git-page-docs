export type CliMode = "home" | "full" | "config-only";

export interface CliOptions {
  isBuild: boolean;
  isServe: boolean;
  mode: CliMode;
  outputDir: string;
  useLocalLayoutConfig: boolean;
  shouldPush: boolean;
  githubOwner: string;
  githubRepo: string;
  docsPath: string;
  basePath: string;
  repositorySearch?: boolean;
  isInteractive: boolean;
  hasArgs: boolean;
}
