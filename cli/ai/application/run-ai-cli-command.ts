import { AiCommandService } from "./ai-command";
import { createAiProvider } from "./ai-provider-factory";
import { FileSystemAdapter, type FilePayload } from "../infrastructure/file-system-adapter";
import {
  AiConfigFileRepository,
} from "../infrastructure/ai-config-file";
import type { AiCliRunPlan, AiCliRunSummary } from "../core/models/ai-cli-config";
import { promptMissingDirectories, runAiInteractivePrompt } from "../presentation/ai-prompts";
import { GITPAGEDOCS_DOC_SYSTEM_PROMPT } from "../config";
import { parseAiPages, type AiDocPage } from "./docs-pattern";
import { writeVersionDocs } from "../infrastructure/version-docs-writer";
// @ts-expect-error .mjs runtime module is type-less in this package.
import { DOC_VERSIONS } from "../../contracts/doc-versions.mjs";

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
  const authorGuidance = basePrompt?.trim() ? `Additional author guidance:\n${basePrompt.trim()}\n\n` : "";
  return (
    `${GITPAGEDOCS_DOC_SYSTEM_PROMPT}\n\n` +
    authorGuidance +
    `Output language: write every page Title and body 100% in ${languageLabel}. ` +
    `Keep each page slug lowercase-kebab and in English so the languages line up.`
  );
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

async function runPlan(plan: AiCliRunPlan, cwd: string): Promise<AiCliRunSummary> {
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
  const pagesByLang: Partial<Record<"pt" | "en" | "es", AiDocPage[]>> = {};

  for (const language of plan.config.ai.languages) {
    const prompt = buildLanguagePrompt(plan.config.ai.contextPrompt, language);
    const markdown = await aiService.runGeneration(payload, prompt);
    pagesByLang[language] = parseAiPages(markdown);
  }

  // Wire the AI pages into the latest documentation version (gitpagedocs pattern).
  const versionId = DOC_VERSIONS[DOC_VERSIONS.length - 1] as string;
  const result = await writeVersionDocs({ cwd, versionId, pagesByLang });

  return {
    scannedDirectories: scanned,
    skippedDirectories: skipped,
    scannedFilesCount: files.length,
    outputs: result.files,
    pages: result.slugs,
  };
}

export async function runAiCliCommand(options: {
  cwd: string;
  onInfo?: (message: string) => void;
  /** Provided by the composition root to scaffold the base gitpagedocs/ tree
   * (so the version config.json exists before AI pages are wired into it). */
  onScaffold?: () => Promise<void>;
}): Promise<{ summary: AiCliRunSummary; runConfigScaffold: boolean }> {
  const logInfo = options.onInfo ?? (() => undefined);
  const configRepo = new AiConfigFileRepository(options.cwd);

  const existingConfig = await configRepo.read();
  const plan = await runAiInteractivePrompt(existingConfig);

  if (plan.saveConfig) {
    await configRepo.write(plan.config);
    logInfo(`[gitpagedocs:ai] Configuration saved to ${configRepo.getConfigPath()}`);
  }

  // Build the base gitpagedocs structure BEFORE generation so the version
  // config.json exists and the AI pages can be wired into it.
  if (plan.runConfigScaffold && options.onScaffold) {
    logInfo("[gitpagedocs] Generating base gitpagedocs structure...");
    await options.onScaffold();
  }

  const summary = await runPlan(plan, options.cwd);
  return {
    summary,
    runConfigScaffold: plan.runConfigScaffold,
  };
}
