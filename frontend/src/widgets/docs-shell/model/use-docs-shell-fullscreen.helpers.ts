import type { LoadedDocsData } from "@/entities/docs";
import type { FullscreenParams } from "./use-docs-shell-url-params.helpers";

type MediaContentType = "video" | "audio";

const FULLSCREEN_PARAM_KEYS = ["mdfull", "htmlfull", "videofull", "audiofull", "file", "slug"] as const;

const MEDIA_PARAM_KEY: Record<MediaContentType, "videofull" | "audiofull"> = {
  video: "videofull",
  audio: "audiofull",
};

/** Finds the first page of the media type whose path key contains the slug (case-insensitive). */
export function findMediaPathClickBySlug(data: LoadedDocsData, contentType: MediaContentType, slug: string): string | null {
  const needle = slug.toLowerCase();
  const entry = Object.entries(data.pathToPageMap ?? {}).find(
    ([key, value]) => value.contentType === contentType && key.toLowerCase().includes(needle),
  );
  return entry?.[0] ?? null;
}

/** Maps a fullscreen request onto the path click it opens, or null when it names nothing resolvable. */
export function resolveFullscreenPathClick(data: LoadedDocsData, params: FullscreenParams): string | null {
  if (params.type === "md" || params.type === "html") {
    return params.file || null;
  }
  if (params.type === "video" || params.type === "audio") {
    if (params.id != null) {
      return `page:${params.id}`;
    }
    return params.slug ? findMediaPathClickBySlug(data, params.type, params.slug) : null;
  }
  return null;
}

/** The page a fullscreen request opens: the resolved path click's page, or the first page when it names none. */
export function resolveFullscreenPageIndex(data: LoadedDocsData, params: FullscreenParams): number {
  const pathClick = resolveFullscreenPathClick(data, params);
  if (pathClick === null) {
    return 0;
  }
  return data.pathToPageMap?.[pathClick]?.pageIndex ?? 0;
}

/** Writes the query params that reopen this fullscreen on reload. Document requests need a file. */
export function applyFullscreenParams(params: URLSearchParams, request: FullscreenParams): void {
  if ((request.type === "md" || request.type === "html") && request.file) {
    params.set(request.type === "md" ? "mdfull" : "htmlfull", request.lang);
    params.set("file", request.file);
    return;
  }
  if (request.type === "video" || request.type === "audio") {
    params.set(MEDIA_PARAM_KEY[request.type], request.lang);
    if (request.id != null) params.set("id", String(request.id));
    if (request.slug) params.set("slug", request.slug);
  }
}

/**
 * Removes every fullscreen param. `id` doubles as the docs route id, so it is
 * dropped only when asked (`"always"`) or when a media fullscreen owned it.
 */
export function stripFullscreenParams(params: URLSearchParams, dropId: "always" | "media-only"): void {
  const hadMediaFullscreen = params.has("videofull") || params.has("audiofull");
  for (const key of FULLSCREEN_PARAM_KEYS) {
    params.delete(key);
  }
  if (dropId === "always" || hadMediaFullscreen) {
    params.delete("id");
  }
}
