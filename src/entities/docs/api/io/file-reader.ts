import { promises as fs } from "node:fs";
import path from "node:path";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export async function readLocalText(filePath: string): Promise<string | null> {
  if (isBrowser()) {
    try {
      const baseUrl = window.location.origin;
      const configuredBasePath = process.env.NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH?.trim() ?? "";
      const pathPrefix = configuredBasePath && window.location.pathname.startsWith(configuredBasePath) ? configuredBasePath : "";
      const url = `${baseUrl}${pathPrefix}/${filePath.replace(/^\//, "")}`;
      const response = await fetch(url);
      if (!response.ok) return null;
      return await response.text();
    } catch {
      return null;
    }
  }
  try {
    const fullPath = path.join(process.cwd(), filePath);
    return await fs.readFile(fullPath, "utf-8");
  } catch {
    return null;
  }
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const text = await readLocalText(filePath);
  if (text === null) {
    throw new Error(`Failed to read local file: ${filePath}`);
  }
  return JSON.parse(text) as T;
}

export async function tryReadJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    return await readJsonFile<T>(filePath);
  } catch {
    return null;
  }
}
