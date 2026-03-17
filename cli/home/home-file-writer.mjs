/** Write .env, Dockerfile, README to home output directory */

import path from "node:path";
import { mkdir } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import { getEnvTemplate, getDockerfileTemplate, getReadmeTemplate } from "./templates.mjs";

/**
 * @param {string} root
 * @param {string} outputDir - e.g. gitpagedocshome or .
 * @param {{ repositorySearch?: boolean; basePath?: string }} opts
 */
export async function writeHomeFiles(root, outputDir, opts = {}) {
  const basePath = outputDir === "." || outputDir === "./" ? root : path.join(root, outputDir);
  await mkdir(basePath, { recursive: true });

  await writeFile(path.join(basePath, ".env"), getEnvTemplate(opts), "utf-8");
  await writeFile(path.join(basePath, "Dockerfile"), getDockerfileTemplate(), "utf-8");
  await writeFile(path.join(basePath, "README.md"), getReadmeTemplate({ outputDir }), "utf-8");
}
