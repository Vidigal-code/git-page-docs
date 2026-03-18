import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { DOC_VERSIONS } from "../../cli/data/version-constants.mjs";

export const BASELINE_FILE = path.join("tools", "smoke", "baseline.snapshot.json");

export function getBaselineTargets() {
  const targets = [
    path.join("gitpagedocs", "config.json"),
    path.join("gitpagedocs", "docs", "versions", DOC_VERSIONS[0], "en", "source-viewer"),
  ];
  for (const version of DOC_VERSIONS) {
    targets.push(path.join("gitpagedocs", "docs", "versions", version, "config.json"));
  }
  return targets;
}

export function hashText(text) {
  return createHash("sha256").update(text).digest("hex");
}

export function hashFile(root, relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    return null;
  }
  const raw = readFileSync(absolutePath);
  return hashText(raw);
}

export function collectFileHashes(root, targets) {
  const map = {};
  for (const file of targets) {
    const hash = hashFile(root, file);
    if (!hash) {
      throw new Error(`Missing baseline target: ${file}`);
    }
    map[file] = hash;
  }
  return map;
}
