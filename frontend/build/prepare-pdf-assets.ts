import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

function assertNotSymbolicLink(directory: string): void {
  if (lstatSync(directory, { throwIfNoEntry: false })?.isSymbolicLink()) {
    throw new Error(`PDF asset destination must not be a symbolic link: ${directory}`);
  }
}

function isPdf(name: string): boolean {
  return path.extname(name).toLowerCase() === ".pdf";
}

function copyPdfDirectory(source: string, destination: string): string[] {
  assertNotSymbolicLink(destination);
  const copied: string[] = [];
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copied.push(...copyPdfDirectory(sourcePath, destinationPath));
    } else if (entry.isFile() && isPdf(entry.name)) {
      assertNotSymbolicLink(destinationPath);
      mkdirSync(destination, { recursive: true });
      copyFileSync(sourcePath, destinationPath);
      copied.push(destinationPath);
    }
  }
  return copied;
}

function removeStalePdfs(directory: string, currentPaths: ReadonlySet<string>): void {
  assertNotSymbolicLink(directory);
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    assertNotSymbolicLink(entryPath);
    if (entry.isDirectory()) removeStalePdfs(entryPath, currentPaths);
    else if (entry.isFile() && isPdf(entry.name) && !currentPaths.has(entryPath)) rmSync(entryPath, { force: true });
  }
}

export function preparePdfAssets(projectRoot: string): number {
  const root = path.resolve(projectRoot);
  const source = path.join(root, "gitpagedocs");
  const publicDirectory = path.join(root, "frontend/public");
  const destination = path.resolve(publicDirectory, "gitpagedocs");
  if (!destination.startsWith(publicDirectory + path.sep)) throw new Error("PDF destination is outside public");
  assertNotSymbolicLink(path.join(root, "frontend"));
  assertNotSymbolicLink(publicDirectory);
  const sourceAvailable = existsSync(source) && !lstatSync(source).isSymbolicLink();
  const copied = sourceAvailable ? copyPdfDirectory(source, destination) : [];
  removeStalePdfs(destination, new Set(copied));
  return copied.length;
}
