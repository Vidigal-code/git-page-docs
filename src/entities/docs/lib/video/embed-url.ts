import type { LanguageCode } from "@/entities/docs/model/types";

const YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const VIMEO_REGEX = /vimeo\.com\/(?:video\/)?(\d+)/;
const TWITTER_X_REGEX = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;
const TIKTOK_REGEX = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/;

const NATIVE_VIDEO = new Set(["mp4", "webm", "ogg", "avi"]);
const NATIVE_AUDIO = new Set(["mp3", "wav"]);

export function getEmbedUrl(videoType: string, pathVideo: string, _language: LanguageCode): string {
  const type = String(videoType).toLowerCase();

  if (NATIVE_VIDEO.has(type) || NATIVE_AUDIO.has(type)) {
    return pathVideo;
  }

  switch (type) {
    case "youtube": {
      const match = pathVideo.match(YOUTUBE_REGEX);
      const id = match?.[1] ?? pathVideo;
      return `https://www.youtube.com/embed/${id}`;
    }
    case "vimeo": {
      const match = pathVideo.match(VIMEO_REGEX);
      const id = match?.[1] ?? pathVideo;
      return `https://player.vimeo.com/video/${id}`;
    }
    case "x":
    case "twitter": {
      const match = pathVideo.match(TWITTER_X_REGEX);
      const id = match?.[1] ?? pathVideo;
      return `https://platform.twitter.com/embed/tweet.html?id=${id}`;
    }
    case "tiktok": {
      const match = pathVideo.match(TIKTOK_REGEX);
      const id = match?.[1] ?? pathVideo;
      return `https://www.tiktok.com/embed/v2/${id}`;
    }
    case "linkedin":
      return pathVideo.startsWith("http") ? pathVideo : `https://www.linkedin.com/embed/${pathVideo}`;
    case "instagram": {
      const instaMatch = pathVideo.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/);
      const code = instaMatch?.[1] ?? pathVideo;
      return `https://www.instagram.com/p/${code}/embed`;
    }
    default:
      return pathVideo;
  }
}

export function isNativeVideo(videoType: string): boolean {
  return NATIVE_VIDEO.has(String(videoType).toLowerCase());
}

export function isNativeAudio(videoType: string): boolean {
  return NATIVE_AUDIO.has(String(videoType).toLowerCase());
}
