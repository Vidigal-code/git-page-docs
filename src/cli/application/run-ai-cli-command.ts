import path from "node:path";
import { AiCommandService } from "./ai-command";
import { createAiProvider } from "./ai-provider-factory";
import { FileSystemAdapter, type FilePayload } from "../infrastructure/file-system-adapter";
import {
  AiConfigFileRepository,
} from "../infrastructure/ai-config-file";
import type { AiCliRunPlan, AiCliRunSummary } from "../core/models/ai-cli-config";
import { promptMissingDirectories, runAiInteractivePrompt } from "../presentation/ai-prompts";

const LANGUAGE_TO_LABEL: Record<string, string> = {
  pt: "Portuguese",
  en: "English",
  es: "Español",
};

function aggregateFilesPayload(files: FilePayload[]): string {
  return files
    .map((file) => `\n\n--- FILE: ${file.filePath} ---\n\n${file.content}`)
    .join("");
}

function buildLanguagePrompt(basePrompt: string, language: "pt" | "en" | "es"): string {
  const languageLabel = LANGUAGE_TO_LABEL[language] ?? language;
  return `${basePrompt}\n\nMandatory output rules:\n- Respond 100% in ${languageLabel}.\n- Generate professional markdown for technical documentation.\n- Include architectural overview, layer responsibilities, and next steps.\n- Avoid content outside the scope of the analyzed files.`;
}

async function collectFilesWithInteractiveFallback(
  fileSystem: FileSystemAdapter,
  initialPaths: string[],
): Promise<{ files: FilePayload[]; scanned: string[]; skipped: string[] }> {
  let queue = [...initialPaths];
  let scanned: string[] = [];
  let skipped: string[] = [];
  const files: FilePayload[] = [];

  while (queue.length > 0) {
    const { existing, missing } = fileSystem.splitExistingDirectories(queue);
    scanned = [...scanned, ...existing];

    for (const directory of existing) {
      const directoryFiles = await fileSystem.readDirectoryRecursively(directory);
      files.push(...directoryFiles);
    }

    if (!missing.length) break;

    const fallback = await promptMissingDirectories(missing);
    if (fallback.abort) {
      skipped = [...skipped, ...missing];
      break;
    }

    if (!fallback.replacementPaths.length) {
      skipped = [...skipped, ...missing];
      break;
    }

    queue = fallback.replacementPaths;
  }

  return {
    files,
    scanned,
    skipped,
  };
}

async function runPlan(plan: AiCliRunPlan): Promise<AiCliRunSummary> {
  const provider = createAiProvider({
    provider: plan.config.ai.provider,
    model: plan.config.ai.model,
    apiKey: plan.config.ai.apiKey,
    baseUrl: plan.config.ai.baseUrl,
  });

  const aiService = new AiCommandService(provider);
  const fileSystem = new FileSystemAdapter();

  const { files, scanned, skipped } = await collectFilesWithInteractiveFallback(
    fileSystem,
    plan.config.ai.paths,
  );

  if (!files.length) {
    return {
      scannedDirectories: scanned,
      skippedDirectories: skipped,
      scannedFilesCount: 0,
      outputs: [],
    };
  }

  const payload = aggregateFilesPayload(files);
  const outputs: string[] = [];

  for (const language of plan.config.ai.languages) {
    const prompt = buildLanguagePrompt(plan.config.ai.contextPrompt, language);
    const markdown = await aiService.runGeneration(payload, prompt);
    const outputFile = path.posix.join(
      plan.config.ai.outputDir.replace(/\\/g, "/"),
      `${plan.config.ai.filePrefix}-${plan.config.ai.provider}-${language}.md`,
    );
    await fileSystem.writeDocumentationOutput(markdown, outputFile);
    outputs.push(outputFile);
  }

  return {
    scannedDirectories: scanned,
    skippedDirectories: skipped,
    scannedFilesCount: files.length,
    outputs,
  };
}

export async function runAiCliCommand(options: {
  cwd: string;
  onInfo?: (message: string) => void;
}): Promise<{ summary: AiCliRunSummary; runConfigScaffold: boolean }> {
  const logInfo = options.onInfo ?? (() => undefined);
  const configRepo = new AiConfigFileRepository(options.cwd);

  const existingConfig = await configRepo.read();
  const plan = await runAiInteractivePrompt(existingConfig);

  if (plan.saveConfig) {
    await configRepo.write(plan.config);
    logInfo(`[gitpagedocs:ai] Configuration saved to ${configRepo.getConfigPath()}`);
  }

  const summary = await runPlan(plan);
  return {
    summary,
    runConfigScaffold: plan.runConfigScaffold,
  };
}
