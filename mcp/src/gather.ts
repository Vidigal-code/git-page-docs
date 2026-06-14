import { execSync } from "node:child_process";
import type { ServerContext } from "./context";

const MAX_CONTEXT = 24_000;

function clamp(text: string): string {
  return text.length > MAX_CONTEXT ? `${text.slice(0, MAX_CONTEXT)}\n…[truncated]` : text;
}

export async function repoListing(ctx: ServerContext): Promise<string> {
  const files = await ctx.files.list(".", { recursive: true, maxEntries: 400 });
  return `Project files:\n${files.join("\n")}`;
}

export async function fileContext(ctx: ServerContext, path: string): Promise<string> {
  return clamp(`File: ${path}\n\n${await ctx.files.read(path)}`);
}

export async function packageContext(ctx: ServerContext): Promise<string> {
  try {
    return `package.json:\n${await ctx.files.read("package.json")}`;
  } catch {
    return "";
  }
}

export function gitLog(ctx: ServerContext, count = 50): string {
  try {
    const out = execSync(`git log --oneline -n ${count}`, {
      cwd: ctx.root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    return out.trim() ? `Recent commits:\n${out.trim()}` : "";
  } catch {
    return "";
  }
}

export async function docsContext(ctx: ServerContext, dir = "."): Promise<string> {
  const files = (await ctx.files.list(dir, { recursive: true, maxEntries: 2000 })).filter((f) =>
    /\.(md|markdown|mdx)$/i.test(f),
  );
  const parts: string[] = [];
  for (const file of files.slice(0, 40)) {
    try {
      parts.push(`### ${file}\n${await ctx.files.read(file, 40_000)}`);
    } catch {
      /* skip unreadable */
    }
  }
  return clamp(parts.join("\n\n"));
}

export { clamp };
