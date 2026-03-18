import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { DOC_VERSIONS } from "../../cli/contracts/doc-versions.mjs";

export const BASELINE_FILE = path.join("tools", "smoke", "baseline.snapshot.json");

function toPortablePath(relativePath) {
  return String(relativePath).replace(/[\\/]+/g, "/");
}

export function getBaselineTargets() {
  const targets = [
    "gitpagedocs/config.json",
    `gitpagedocs/docs/versions/${DOC_VERSIONS[0]}/en/source-viewer`,
  ];
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
