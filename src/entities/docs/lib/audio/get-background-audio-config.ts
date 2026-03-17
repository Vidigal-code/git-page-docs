import type {
  ContentTypeRouteConfig,
  LoadedPage,
  PageRouteAudioConfig,
  SiteConfig,
} from "@/entities/docs/model/types";

export interface ResolvedBackgroundAudioConfig {
  tracks: PageRouteAudioConfig["tracks"];
  autoPlayOnLoad: boolean;
  loopEnabled: boolean;
  allowUserChoice: boolean;
}

function isPageRouteAudioConfig(
  audio: ContentTypeRouteConfig["audio"]
): audio is PageRouteAudioConfig {
  return (
    Boolean(audio) &&
    typeof audio === "object" &&
    Array.isArray((audio as PageRouteAudioConfig).tracks) &&
    (audio as PageRouteAudioConfig).tracks.length > 0
  );
}

function getRouteBackgroundAudio(
  config: ContentTypeRouteConfig | { id: number; path?: Record<string, string> } | undefined
): PageRouteAudioConfig | null {
  if (!config || !("audio" in config)) return null;
  const audio = (config as ContentTypeRouteConfig).audio;
  if (!isPageRouteAudioConfig(audio)) return null;
  if (audio.enabled === false) return null;
  return audio;
}

/**
 * Resolves background audio config for the current page.
 * Priority: page route audio (md > html > video) > site.audioTracks
 */
export function getBackgroundAudioConfig(
  currentPage: LoadedPage | undefined,
  site: SiteConfig,
  _language: string
): ResolvedBackgroundAudioConfig | null {
  const pageAudio =
    getRouteBackgroundAudio(currentPage?.md?.config) ??
    getRouteBackgroundAudio(currentPage?.html?.config) ??
    getRouteBackgroundAudio(currentPage?.video?.config);

  if (pageAudio) {
    return {
      tracks: pageAudio.tracks,
      autoPlayOnLoad: pageAudio.autoPlayOnLoad ?? site.audioAutoPlayOnLoad ?? false,
      loopEnabled: pageAudio.loopEnabled ?? site.audioLoopEnabled ?? false,
      allowUserChoice: pageAudio.allowUserChoice ?? site.audioAllowUserChoice ?? true,
    };
  }

  if (!site.audioPlayerEnabled || !site.audioTracks?.length) {
    return null;
  }

  return {
    tracks: site.audioTracks as PageRouteAudioConfig["tracks"],
    autoPlayOnLoad: site.audioAutoPlayOnLoad ?? false,
    loopEnabled: site.audioLoopEnabled ?? false,
    allowUserChoice: site.audioAllowUserChoice ?? true,
  };
}
