import { isNativeAudio, isNativeVideo } from "@/shared/lib/media-types";

/**
 * How a route video can be driven: the YouTube IFrame API, the Vimeo player
 * postMessage protocol, a native `<video>`/`<audio>` element, or any other
 * embed, which is only a plain iframe.
 */
export type VideoProvider = "youtube" | "vimeo" | "native" | "iframe";

const EMBED_PROVIDERS: ReadonlySet<VideoProvider> = new Set<VideoProvider>(["youtube", "vimeo"]);

export function resolveVideoProvider(videoType: string): VideoProvider {
  const type = String(videoType).toLowerCase();
  if (isNativeVideo(type) || isNativeAudio(type)) return "native";
  return EMBED_PROVIDERS.has(type as VideoProvider) ? (type as VideoProvider) : "iframe";
}
