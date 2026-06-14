import type { AiProviderId } from "@/shared/config/ai-config";

export const AI_CLI_CONFIG_FILENAME = ".gitpagedocsconfig";

export interface AiCliConfig {
  version: 1;
  ai: {
    provider: AiProviderId;
    model: string;
    apiKey?: string;
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
}
