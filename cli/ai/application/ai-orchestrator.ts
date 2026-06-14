import { AiCommandService } from './ai-command';
import { FileSystemAdapter } from '../infrastructure/file-system-adapter';

export class AiOrchestrator {
    constructor(
        private aiCommand: AiCommandService,
        private fileSystem: FileSystemAdapter
    ) { }

    async runDocumentationWorkflow(targetDir: string, contextPrompt: string, outputDest: string = "docs-output.md") {
        const dirs = targetDir.split(',').map(d => d.trim()).filter(Boolean);
        let allFiles: any[] = [];

        for (const dir of dirs) {
            console.log(`\n[Orchestrator] Reading directory: ${dir}`);
            const files = await this.fileSystem.readDirectoryRecursively(dir);
            allFiles = allFiles.concat(files);
        }

        if (allFiles.length === 0) {
            console.log("[Orchestrator] No valid files found to document.");
            return;
        }

        console.log(`[Orchestrator] Found ${allFiles.length} files. Assembling payload...`);
        let aggregatedContent = "";
        for (const f of allFiles) {
            aggregatedContent += `\n\n--- FILE: ${f.filePath} ---\n\n${f.content}`;
        }

        console.log("[Orchestrator] Sending payload to AI Provider...");
        const resultMarkdown = await this.aiCommand.runGeneration(aggregatedContent, contextPrompt);

        console.log(`[Orchestrator] Writing output to: ${outputDest}`);
        await this.fileSystem.writeDocumentationOutput(resultMarkdown, outputDest);
        console.log("[Orchestrator] Documentation generated successfully! 🎉");
    }
}
