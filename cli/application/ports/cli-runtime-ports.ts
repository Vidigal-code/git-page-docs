import type { CliOptions } from "../../domain/models/cli-options";

export interface BuildArtifactsInput {
  useLocalLayoutConfig: boolean;
  githubOwner: string;
  githubRepo: string;
  root: string;
}

export interface LayoutDefinition {
  file: string;
  [key: string]: unknown;
}

export interface BuiltConfigArtifacts {
  rootConfig: unknown;
  layoutsConfig: unknown;
  fallbackLayoutsConfig: unknown;
  docs?: Record<string, Record<string, string>>;
  docsHtml?: Record<string, Record<string, string>>;
  versionConfigs: Record<string, Record<string, unknown>>;
}

export interface CliRuntimeParams {
  root: string;
  pkgRoot: string;
  prebuiltDir: string;
  buildConfigArtifacts: (input: BuildArtifactsInput) => BuiltConfigArtifacts;
  createThemeTemplate: (layout: LayoutDefinition) => unknown;
  layouts: LayoutDefinition[];
}

export interface CliCommandContext extends CliRuntimeParams {
  options: CliOptions;
}

export interface CliCommandRunner {
  runConfigOnly: (params: CliCommandContext) => Promise<void>;
  runHome: (params: CliCommandContext) => Promise<void>;
}

export interface ConfigOnlyOutputInput {
  root: string;
  pkgRoot: string;
  outputDir: string;
  artifacts: BuiltConfigArtifacts;
  useLocalLayoutConfig: boolean;
  layouts: LayoutDefinition[];
  createThemeTemplate: (layout: LayoutDefinition) => unknown;
}

export interface ConfigOnlyRuntimePort {
  hasPath: (absolutePath: string) => boolean;
  writeConfigOnlyOutput: (input: ConfigOnlyOutputInput) => Promise<void>;
  writeText: (root: string, relativePath: string, data: string) => Promise<void>;
  ensureGitHubPagesWorkflow: (
    getCurrentGitBranch: () => string,
    writeText: (relativePath: string, content: string) => Promise<void>,
    docsPath?: string,
  ) => Promise<void>;
  getCurrentGitBranch: (root: string) => string;
  runGitPushForGeneratedArtifacts: (
    options: CliOptions,
    root: string,
    sanitizeSegment: (value: string | undefined | null) => string,
  ) => void;
  logInfo: (message: string) => void;
}

export interface HomeRuntimePort {
  joinPath: (...parts: string[]) => string;
  ensureDirEmpty: (root: string, relativeDir: string) => void;
  copyRecursive: (src: string, dest: string) => void;
  readDirNames: (absolutePath: string) => string[];
  existsPath: (absolutePath: string) => boolean;
  runNextBuild: (root: string, env: NodeJS.ProcessEnv) => void;
  writeConfigOnlyOutput: (input: ConfigOnlyOutputInput) => Promise<void>;
  writeHomeFiles: (
    root: string,
    outputDir: string,
    options: { repositorySearch?: boolean; basePath?: string },
  ) => Promise<void>;
  writeText: (root: string, relativePath: string, data: string) => Promise<void>;
  logSuccess: (message: string) => void;
  logInfo: (message: string) => void;
}
