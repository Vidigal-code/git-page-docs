import path from "node:path";
import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { RepositoryError, ValidationError } from "../errors/app-error";

const DEFAULT_IGNORE = new Set([
  "node_modules", ".git", ".next", "out", "dist", "prebuilt", ".turbo", "coverage",
]);

export interface ListOptions {
  recursive?: boolean;
  maxEntries?: number;
}

export interface SearchOptions {
  /** Restrict to files whose path includes this substring (e.g. ".ts"). */
  extension?: string;
  maxResults?: number;
  maxFileBytes?: number;
}

export interface SearchMatch {
  readonly file: string;
  readonly line: number;
  readonly text: string;
}

/** Extensions (lower-case, dot included) that `search()` scans by default. */
const TEXT_EXTENSIONS = new Set([
  ".md", ".markdown", ".mdx", ".txt", ".json", ".yml", ".yaml",
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".css", ".scss", ".htm", ".html", ".svg", ".toml", ".env",
]);

/**
 * Whether a repo-relative file path carries a text extension. The suffix after
 * the last dot is compared, so a dotfile such as `.env` counts and a dot in a
 * folder name (`dir.x/file`) does not.
 */
function isTextFile(file: string): boolean {
  const dot = file.lastIndexOf(".");
  return dot !== -1 && TEXT_EXTENSIONS.has(file.slice(dot).toLowerCase());
}

/** Line matches of `needle` (already lower-cased) in one file, at most `limit`. */
function collectLineMatches(file: string, content: string, needle: string, limit: number): SearchMatch[] {
  const found: SearchMatch[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length && found.length < limit; i += 1) {
    if (lines[i].toLowerCase().includes(needle)) {
      found.push({ file, line: i + 1, text: lines[i].trim().slice(0, 240) });
    }
  }
  return found;
}

/** Plain UTF-16 code-unit order (the default `sort()` order), independent of locale. */
function compareCodeUnits(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Root-bounded filesystem service. All paths are resolved relative to `root`
 * and may not escape it — the single safe FS surface for the CLI and MCP.
 */
export class FileService {
  constructor(private readonly root: string) {}

  private resolveInside(relativePath: string): string {
    const abs = path.resolve(this.root, relativePath);
    const rel = path.relative(this.root, abs);
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      throw new ValidationError(`Path escapes the project root: ${relativePath}`);
    }
    return abs;
  }

  private toRel(abs: string): string {
    return path.relative(this.root, abs).split(path.sep).join("/");
  }

  async list(relativeDir = ".", options: ListOptions = {}): Promise<string[]> {
    const { recursive = false, maxEntries = 2000 } = options;
    const start = this.resolveInside(relativeDir);
    const out: string[] = [];

    const walk = async (dir: string): Promise<void> => {
      if (out.length >= maxEntries) return;
      let entries: import("node:fs").Dirent[];
      try {
        entries = await readdir(dir, { withFileTypes: true });
      } catch (cause) {
        throw new RepositoryError(`Cannot read directory: ${this.toRel(dir)}`, { cause });
      }
      for (const entry of entries) {
        if (DEFAULT_IGNORE.has(entry.name)) continue;
        if (out.length >= maxEntries) break;
        const abs = path.join(dir, entry.name);
        out.push(this.toRel(abs) + (entry.isDirectory() ? "/" : ""));
        if (recursive && entry.isDirectory()) await walk(abs);
      }
    };

    await walk(start);
    return out.sort(compareCodeUnits);
  }

  async read(relativePath: string, maxBytes = 512_000): Promise<string> {
    const abs = this.resolveInside(relativePath);
    const info = await stat(abs).catch((cause) => {
      throw new RepositoryError(`File not found: ${relativePath}`, { cause });
    });
    if (info.size > maxBytes) {
      throw new ValidationError(`File too large (${info.size} bytes > ${maxBytes}): ${relativePath}`);
    }
    return readFile(abs, "utf8");
  }

  async write(relativePath: string, content: string): Promise<string> {
    const abs = this.resolveInside(relativePath);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, content, "utf8");
    return this.toRel(abs);
  }

  /** Directories are skipped; an explicit extension filter replaces the text-extension default. */
  private static isSearchable(entry: string, extension?: string): boolean {
    if (entry.endsWith("/")) return false;
    return extension ? entry.endsWith(extension) : isTextFile(entry);
  }

  /** File content for searching, or undefined when it is missing, too large or unreadable. */
  private async readForSearch(file: string, maxFileBytes: number): Promise<string | undefined> {
    try {
      return await this.read(file, maxFileBytes);
    } catch {
      return undefined;
    }
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchMatch[]> {
    if (!query.trim()) throw new ValidationError("Search query must not be empty.");
    const { extension, maxResults = 200, maxFileBytes = 512_000 } = options;
    const files = await this.list(".", { recursive: true, maxEntries: 5000 });
    const matches: SearchMatch[] = [];
    const needle = query.toLowerCase();

    for (const file of files) {
      if (matches.length >= maxResults) break;
      if (!FileService.isSearchable(file, extension)) continue;
      const content = await this.readForSearch(file, maxFileBytes);
      if (content === undefined) continue;
      matches.push(...collectLineMatches(file, content, needle, maxResults - matches.length));
    }
    return matches;
  }
}
