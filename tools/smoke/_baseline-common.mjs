import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { DOC_VERSIONS } from "../../cli/contracts/doc-versions.mjs";
import { languageArtifactPaths } from "../../cli/contracts/langs-paths.mjs";
import { SUPPORTED_LANGUAGES } from "../../cli/contracts/languages.mjs";

export const BASELINE_FILE = path.join("tools", "smoke", "baseline.snapshot.json");

function toPortablePath(relativePath) {
  return String(relativePath).replace(/[\\/]+/g, "/");
}

export function getBaselineTargets() {
  const langs = languageArtifactPaths("gitpagedocs");
  const targets = ["gitpagedocs/config.json", langs.manifest, ...SUPPORTED_LANGUAGES.map(langs.bundle)];
  for (const version of DOC_VERSIONS) {
    targets.push(`gitpagedocs/docs/versions/${version}/config.json`);
  }
  return targets;
}

export function hashText(text) {
  return createHash("sha256").update(text).digest("hex");
}

export function hashFile(root, relativePath) {
  const normalizedPath = toPortablePath(relativePath);
  const absolutePath = path.join(root, ...normalizedPath.split("/"));
  if (!existsSync(absolutePath)) {
    return null;
  }
  const raw = readFileSync(absolutePath);
  return hashText(raw);
}

export function collectFileHashes(root, targets) {
  const map = {};
  for (const file of targets) {
    const normalizedFile = toPortablePath(file);
    const hash = hashFile(root, normalizedFile);
    if (!hash) {
      throw new Error(`Missing baseline target: ${normalizedFile}`);
    }
    map[normalizedFile] = hash;
  }
  return map;
}
