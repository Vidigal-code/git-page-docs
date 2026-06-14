import fs from 'node:fs/promises';
import path from 'node:path';
import { statSync } from 'node:fs';

export interface FilePayload {
    filePath: string;
    content: string;
}

export class FileSystemAdapter {
    splitExistingDirectories(targetDirectories: string[]): { existing: string[]; missing: string[] } {
        const existing: string[] = [];
        const missing: string[] = [];

        for (const targetDirectory of targetDirectories) {
            const absolutePath = path.resolve(process.cwd(), targetDirectory);
            try {
                const stat = statSync(absolutePath);
                if (stat.isDirectory()) {
                    existing.push(targetDirectory);
                } else {
                    missing.push(targetDirectory);
                }
            } catch {
                missing.push(targetDirectory);
            }
        }

        return { existing, missing };
    }

    async readDirectoryRecursively(targetDirectory: string): Promise<FilePayload[]> {
        const absolutePath = path.resolve(process.cwd(), targetDirectory);
        const resolvedFiles: FilePayload[] = [];

        try {
            await this.traverse(absolutePath, resolvedFiles);
        } catch (error) {
        }

        return resolvedFiles;
    }

    private async traverse(currentPath: string, payloadList: FilePayload[]): Promise<void> {
        let stats;
        try {
            stats = await fs.stat(currentPath);
        } catch {
            return;
        }

        if (stats.isDirectory()) {
            const basename = path.basename(currentPath);
            if (['node_modules', '.git', '.next', 'out', 'dist'].includes(basename)) {
                return;
            }

            const entries = await fs.readdir(currentPath);
            for (const entry of entries) {
                await this.traverse(path.join(currentPath, entry), payloadList);
            }
        } else if (stats.isFile()) {
            const ext = path.extname(currentPath);
            const validExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css'];
            if (validExtensions.includes(ext)) {
                try {
                    const content = await fs.readFile(currentPath, 'utf-8');
                    payloadList.push({
                        filePath: currentPath,
                        content: content
                    });
                } catch {
                }
            }
        }
    }

    async writeDocumentationOutput(outputContent: string, targetPath: string = "documentation-output.md"): Promise<void> {
        const absoluteDest = path.resolve(process.cwd(), targetPath);
        await fs.mkdir(path.dirname(absoluteDest), { recursive: true });
        await fs.writeFile(absoluteDest, outputContent, 'utf-8');
    }
}
