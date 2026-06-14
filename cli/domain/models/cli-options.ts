export type CliMode = "home" | "full" | "config-only" | "ai";

export interface CliOptions {
  isBuild: boolean;
  isServe: boolean;
  mode: CliMode;
  aiCommand?: string;
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
