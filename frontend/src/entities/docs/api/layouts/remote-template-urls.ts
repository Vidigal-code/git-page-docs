import { ensureTrailingSlash, toRawGithubUrl } from "@/shared/lib/remote/github-url";

/** Derive the templates base URL from a layouts config URL (its parent folder). */
export function templatesBaseFromConfigUrl(layoutsConfigUrl: string): string {
  const rawUrl = toRawGithubUrl(layoutsConfigUrl);
  return ensureTrailingSlash(rawUrl.slice(0, rawUrl.lastIndexOf("/") + 1));
}

/**
 * Join a layout's `file` entry (e.g. `templates/aurora-dark.json`) onto a
 * remote templates base URL, avoiding a duplicated `templates/` segment when
 * the base already points inside the templates folder.
 */
export function buildRemoteTemplateUrl(layoutFile: string, remoteTemplatesBaseUrl: string): string {
  const normalizedBase = ensureTrailingSlash(remoteTemplatesBaseUrl);
  const basePath = new URL(normalizedBase).pathname;
  const baseEndsWithTemplates = /\/templates\/$/i.test(basePath);
  const normalizedFile = layoutFile.replace(/^\.\//, "");
  const fileWithoutTemplatesPrefix = normalizedFile.replace(/^templates\//i, "");
  const filePath = baseEndsWithTemplates ? fileWithoutTemplatesPrefix : normalizedFile;
  return new URL(filePath, normalizedBase).toString();
}
