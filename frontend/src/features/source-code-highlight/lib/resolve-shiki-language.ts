/**
 * @file resolve-shiki-language.ts
 * @description Maps a repository file name to a Shiki grammar id. Pure and
 * dependency-free on purpose: the Shiki bundle is only dynamically imported by
 * the highlighting hook, so this resolver can run before (and without) it.
 */

/** Extensionless or special file names with a dedicated grammar. */
const SPECIAL_FILE_NAMES: Readonly<Record<string, string>> = {
  dockerfile: "dockerfile",
  makefile: "make",
  gnumakefile: "make",
  "cmakelists.txt": "cmake",
  ".gitignore": "ini",
  ".gitattributes": "ini",
  ".editorconfig": "ini",
  ".npmrc": "ini",
  ".env": "dotenv",
};

/**
 * Extensions whose grammar id differs from the bare extension. Extensions that
 * already equal their grammar id (ts, css, json, html, go, java, ...) fall
 * through to the extension itself, which the hook validates against the
 * bundled grammar/alias registries before use.
 */
const LANGUAGE_BY_EXTENSION: Readonly<Record<string, string>> = {
  mjs: "javascript",
  cjs: "javascript",
  js: "javascript",
  jsx: "jsx",
  mts: "typescript",
  cts: "typescript",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  rs: "rust",
  rb: "ruby",
  kt: "kotlin",
  kts: "kotlin",
  cs: "csharp",
  fs: "fsharp",
  yml: "yaml",
  md: "markdown",
  mdx: "mdx",
  sh: "shellscript",
  bash: "shellscript",
  zsh: "shellscript",
  ps1: "powershell",
  psm1: "powershell",
  h: "c",
  cc: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  hh: "cpp",
  ex: "elixir",
  exs: "elixir",
  erl: "erlang",
  gradle: "groovy",
  tf: "terraform",
  tfvars: "terraform",
  svg: "xml",
  plist: "xml",
  csproj: "xml",
  vb: "vb",
  pl: "perl",
  rss: "xml",
  htm: "html",
  vue: "vue",
  svelte: "svelte",
  astro: "astro",
  txt: "",
};

/**
 * Resolves the Shiki grammar id candidate for a file path, or `undefined`
 * when the file has no extension hint. The returned id is a candidate only:
 * callers must validate it against Shiki's bundled languages/aliases.
 */
export function resolveShikiLanguage(filePath: string): string | undefined {
  const fileName = filePath.split("/").pop()?.toLowerCase() ?? "";
  const special = SPECIAL_FILE_NAMES[fileName];
  if (special) return special;

  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === fileName.length - 1) return undefined;
  const extension = fileName.slice(dotIndex + 1);

  const mapped = LANGUAGE_BY_EXTENSION[extension];
  if (mapped === "") return undefined;
  return mapped ?? extension;
}
