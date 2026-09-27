import type { AiProviderId } from "../../config";

export const AI_CLI_CONFIG_FILENAME = ".gitpagedocsconfig";

export interface AiCliConfig {
  version: 1;
  ai: {
    provider: AiProviderId;
    model: string;
    /** Only in memory during a run: the file never stores the key in clear. */
    apiKey?: string;
    /** The key lives sealed in the `.gitpagedocsvault` next to this file. */
    apiKeyEncrypted?: boolean;
    baseUrl?: string;
    paths: string[];
    languages: Array<"pt" | "en" | "es">;
    outputDir: string;
    filePrefix: string;
    contextPrompt: string;
  };
}

export interface AiCliRunPlan {
  config: AiCliConfig;
  saveConfig: boolean;
  runConfigScaffold: boolean;
}

export interface AiCliRunSummary {
  scannedDirectories: string[];
  skippedDirectories: string[];
  scannedFilesCount: number;
  outputs: string[];
  /** Slugs of the gitpagedocs pages wired into the version config (if any). */
  pages?: string[];
}
