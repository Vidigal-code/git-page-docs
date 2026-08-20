export interface LayoutsMigrationResult {
  moved: string[];
  failed: Array<{ file: string; reason: string }>;
}

export declare function listFilesRecursively(absoluteDir: string): string[];

export declare function executeLayoutsMigration(
  root: string,
  plan: { from: string; to: string; files: string[] },
): LayoutsMigrationResult;
