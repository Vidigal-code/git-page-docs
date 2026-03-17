import path from "node:path";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { readFile } from "node:fs/promises";
import { CONFIG_BASE, CONFIG_EXTENSIONS } from "@/shared/config/constants";
import type { ConfigLoader } from "./types";

export function resolveConfigPath(cwd: string = process.cwd()): string | null {
  const base = path.join(cwd, CONFIG_BASE);
  for (const ext of CONFIG_EXTENSIONS) {
    const fullPath = base + ext;
    if (existsSync(fullPath)) return fullPath;
  }
  return null;
}

async function loadLocalConfig<T>(resolvedPath: string): Promise<T> {
  const ext = path.extname(resolvedPath);
  if (ext === ".json") {
    const text = await readFile(resolvedPath, "utf-8");
    return JSON.parse(text) as T;
  }
  if (ext === ".js" || ext === ".ts") {
    const fileUrl = pathToFileURL(resolvedPath).href;
    const mod = await import(fileUrl);
    const value = mod.default ?? mod;
    if (value == null) {
      throw new Error(`Config file ${resolvedPath} did not export default or module.exports`);
    }
    return value as T;
  }
  throw new Error(`Unsupported config extension: ${ext}`);
}

export async function loadRootConfig<T>(cwd: string = process.cwd()): Promise<T> {
  const resolvedPath = resolveConfigPath(cwd);
  if (!resolvedPath) {
    throw new Error(`No config file found. Expected one of: ${CONFIG_EXTENSIONS.map((e) => CONFIG_BASE + e).join(", ")}`);
  }
  return loadLocalConfig<T>(resolvedPath);
}

export const defaultConfigLoader: ConfigLoader = {
  loadRootConfig,
  resolveConfigPath,
};
