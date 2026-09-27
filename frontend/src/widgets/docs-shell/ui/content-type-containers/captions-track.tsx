import type { ContentTypeRouteConfig, LanguageCode } from "@/entities/docs";
import { getBasePath } from "@/shared/lib/base-path";

/** Site-relative path of the empty WebVTT file shipped under `public/`. */
export const EMPTY_CAPTIONS_PATH = "/captions/empty.vtt";

/** Per-language WebVTT paths as configured on a route or a track. */
export type CaptionsByLanguage = Record<LanguageCode, string>;

/**
 * Captions source for a media element: the `.vtt` configured for the active
 * language, or the empty track shipped with the site (served under the base
 * path) so every `<audio>`/`<video>` always carries a captions track.
 */
export function resolveCaptionsSrc(captions: CaptionsByLanguage | undefined, language: LanguageCode): string {
  const configured = captions?.[language]?.trim();
  return configured || `${getBasePath()}${EMPTY_CAPTIONS_PATH}`;
}

/**
 * Attribute bag for the captions `<track>` of a media element. Spread it onto a
 * literal `<track kind="captions" />` child: the captions rule only accepts an
 * unconditional `<track>` element, not a component wrapping one.
 */
export function resolveCaptionsTrackProps(captions: CaptionsByLanguage | undefined, language: LanguageCode) {
  return {
    src: resolveCaptionsSrc(captions, language),
    srcLang: language,
    label: language,
    default: true,
  };
}

/** Captions of a `routes-audio` entry; background-music (`tracks`) configs carry none at route level. */
export function getAudioRouteCaptions(config: ContentTypeRouteConfig | undefined): CaptionsByLanguage | undefined {
  const audio = config?.audio;
  return audio && "pathAudio" in audio ? audio.captions : undefined;
}
