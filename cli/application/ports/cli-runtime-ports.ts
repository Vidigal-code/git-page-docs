import type { CliOptions } from "../../domain/models/cli-options";

export interface CliRuntimeParams {
  root: string;
  pkgRoot: string;
  prebuiltDir: string;
  buildConfigArtifacts: (...args: unknown[]) => unknown;
  createThemeTemplate: (...args: unknown[]) => unknown;
  layouts: unknown[];
}

export interface CliCommandContext extends CliRuntimeParams {
  options: CliOptions;
}

export interface CliCommandRunner {
  runConfigOnly: (params: CliCommandContext) => Promise<void>;
  runHome: (params: CliCommandContext) => Promise<void>;
}
