/** Native audio formats supported for direct playback via HTML5 audio */
export const NATIVE_AUDIO_TYPES = new Set([
  "mp3",
  "wav",
  "ogg",
  "aac",
  "m4a",
  "flac",
  "opus",
  "weba",
  "wma",
]);

/** Video formats that can be played as audio (stripped of visuals) */
export const NATIVE_VIDEO_AS_AUDIO_TYPES = new Set(["mp4", "webm"]);

/** Embed providers that support real audio (YouTube, Vimeo, Spotify, LinkedIn, Instagram, SoundCloud, Bandcamp, Deezer, X/Twitter, TikTok) */
export const AUDIO_EMBED_TYPES = new Set([
  "youtube",
  "vimeo",
  "spotify",
  "linkedin",
  "instagram",
  "soundcloud",
  "bandcamp",
  "deezer",
  "x",
  "twitter",
  "tiktok",
]);

/** Native video formats for video playback */
export const NATIVE_VIDEO_TYPES = new Set(["mp4", "webm", "ogg", "avi"]);

export function isNativeAudio(type: string): boolean {
  return NATIVE_AUDIO_TYPES.has(String(type).toLowerCase());
}

export function isNativeVideoAsAudio(type: string): boolean {
  return NATIVE_VIDEO_AS_AUDIO_TYPES.has(String(type).toLowerCase());
}

export function isAudioEmbed(type: string): boolean {
  return AUDIO_EMBED_TYPES.has(String(type).toLowerCase());
}

export function isNativeVideo(type: string): boolean {
  return NATIVE_VIDEO_TYPES.has(String(type).toLowerCase());
}
