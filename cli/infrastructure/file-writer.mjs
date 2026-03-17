/** File writer abstraction - DIP: depend on interface for testability */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * @typedef {Object} FileWriter
 * @property {(root: string, relativePath: string, data: string) => Promise<void>} writeText
 * @property {(root: string, relativePath: string, data: object) => Promise<void>} writeJson
 */

/**
 * Default file writer implementation
 * @returns {FileWriter}
 */
export function createFileWriter() {
  async function writeText(root, relativePath, data) {
    const absolutePath = path.join(root, relativePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, data, "utf-8");
  }

  async function writeJson(root, relativePath, data) {
    await writeText(root, relativePath, `${JSON.stringify(data, null, 2)}\n`);
  }

  return { writeText, writeJson };
}
