import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const requireAssets = createRequire(import.meta.url);
const { NATIVE_AUDIO_TYPES, NATIVE_VIDEO_TYPES } = requireAssets("../src/shared/lib/media-types.ts") as typeof import("../src/shared/lib/media-types");

const DOCUMENT_ASSET_EXTENSIONS = new Set(["pdf", ...NATIVE_AUDIO_TYPES, ...NATIVE_VIDEO_TYPES]);

function assertNotSymbolicLink(directory: string): void {
  if (lstatSync(directory, { throwIfNoEntry: false })?.isSymbolicLink()) {
    throw new Error(`Document asset destination must not be a symbolic link: ${directory}`);
  }
}

function isDocumentAsset(name: string): boolean {
  return DOCUMENT_ASSET_EXTENSIONS.has(path.extname(name).slice(1).toLowerCase());
}

function copyAssetDirectory(source: string, destination: string): string[] {
  assertNotSymbolicLink(destination);
  const copied: string[] = [];
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copied.push(...copyAssetDirectory(sourcePath, destinationPath));
    } else if (entry.isFile() && isDocumentAsset(entry.name)) {
      assertNotSymbolicLink(destinationPath);
      mkdirSync(destination, { recursive: true });
      copyFileSync(sourcePath, destinationPath);
      copied.push(destinationPath);
    }
  }
  return copied;
}

function removeStaleAssets(directory: string, currentPaths: ReadonlySet<string>): void {
  assertNotSymbolicLink(directory);
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    assertNotSymbolicLink(entryPath);
    if (entry.isDirectory()) removeStaleAssets(entryPath, currentPaths);
    else if (entry.isFile() && isDocumentAsset(entry.name) && !currentPaths.has(entryPath)) rmSync(entryPath, { force: true });
  }
}

export function prepareDocumentAssets(projectRoot: string): number {
  const root = path.resolve(projectRoot);
  const source = path.join(root, "gitpagedocs");
  const publicDirectory = path.join(root, "frontend/public");
  const destination = path.resolve(publicDirectory, "gitpagedocs");
  if (!destination.startsWith(publicDirectory + path.sep)) throw new Error("Document asset destination is outside public");
  assertNotSymbolicLink(path.join(root, "frontend"));
  assertNotSymbolicLink(publicDirectory);
  const sourceAvailable = existsSync(source) && !lstatSync(source).isSymbolicLink();
  const copied = sourceAvailable ? copyAssetDirectory(source, destination) : [];
  removeStaleAssets(destination, new Set(copied));
  return copied.length;
}
