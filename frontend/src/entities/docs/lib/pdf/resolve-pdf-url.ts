import { toFullPath } from "@/shared/lib/base-path";

export interface PdfUrlContext {
  source: "local" | "remote";
  owner?: string;
  repo?: string;
}

const LOCAL_URL_BASE = "https://gitpagedocs.local/";
const FIRST_PRINTABLE_CHARACTER = 32;
const DELETE_CHARACTER = 127;

function resolveSafePath(path: string, context: PdfUrlContext): string {
  const url = new URL(path, LOCAL_URL_BASE);
  if (url.protocol !== "http:" && url.protocol !== "https:") return "";
  if (/^https?:\/\//i.test(path)) return url.href;
  if (context.source === "remote") {
    if (!context.owner || !context.repo) return "";
    return new URL(path.replace(/^\//, ""), `https://raw.githubusercontent.com/${encodeURIComponent(context.owner)}/${encodeURIComponent(context.repo)}/HEAD/`).href;
  }
  return toFullPath(`${url.pathname}${url.search}${url.hash}`);
}

export function resolvePdfUrl(value: string | undefined, context: PdfUrlContext): string {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const decoded = decodeURIComponent(value);
    const hasControlCharacter = [...decoded].some((character) => {
      const codePoint = character.codePointAt(0) ?? FIRST_PRINTABLE_CHARACTER;
      return codePoint < FIRST_PRINTABLE_CHARACTER || codePoint === DELETE_CHARACTER;
    });
    if (hasControlCharacter || decoded.includes("\\") || decoded.trim().startsWith("//")) return "";
    if (decoded.split(/[/?#]/).includes("..")) return "";
    return resolveSafePath(value.trim(), context);
  } catch {
    return "";
  }
}
