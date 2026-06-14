import type { FileService } from "../filesystem/file-service";
import { patchManagedRegion } from "./marker-patcher";

export interface ManagedUpdate {
  /** Target file relative to the project root. */
  readonly path: string;
  /** Generated content for the managed region (markers added automatically). */
  readonly generated: string;
}

export interface UpdateResult {
  readonly path: string;
  /** True if an existing managed region was replaced (vs appended). */
  readonly replaced: boolean;
  /** True if the file content actually changed (idempotent re-runs are false). */
  readonly changed: boolean;
}

/**
 * Updates only the managed region of documentation files, preserving manual
 * content. Idempotent: re-running with identical generated content leaves files
 * untouched (`changed: false`). Built on patchManagedRegion + FileService.
 */
export class DocUpdater {
  constructor(private readonly files: FileService) {}

  async updateManagedFile(path: string, generated: string): Promise<UpdateResult> {
    let existing = "";
    try {
      existing = await this.files.read(path, 2_000_000);
    } catch {
      existing = "";
    }
    const { content, replaced } = patchManagedRegion(existing, generated);
    const changed = content !== existing;
    if (changed) await this.files.write(path, content);
    return { path, replaced, changed };
  }

  async updateManagedFiles(updates: ManagedUpdate[]): Promise<UpdateResult[]> {
    const results: UpdateResult[] = [];
    for (const update of updates) {
      results.push(await this.updateManagedFile(update.path, update.generated));
    }
    return results;
  }
}
