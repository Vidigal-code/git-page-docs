import type { LanguageCode } from "@/entities/docs/model/types";
import { isNativeAudio, isNativeVideo, isAudioEmbed } from "@/shared/lib/media-types";
import { resolveAudioEmbedUrl } from "@/entities/docs/lib/embed";

const TWITTER_X_REGEX = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;
const TIKTOK_REGEX = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/;
const INSTAGRAM_REGEX = /instagram\.com\/p\/([a-zA-Z0-9_-]+)/;

export function getEmbedUrl(videoType: string, pathVideo: string, language: LanguageCode): string {
  const type = String(videoType).toLowerCase();

  if (isNativeVideo(type) || isNativeAudio(type)) {
    return pathVideo;
  }

  if (isAudioEmbed(type)) {
    return resolveAudioEmbedUrl(type, pathVideo, language);
  }

  switch (type) {
    case "x":
    case "twitter": {
      const id = TWITTER_X_REGEX.exec(pathVideo)?.[1] ?? pathVideo;
      return `https://platform.twitter.com/embed/tweet.html?id=${id}`;
    }
    case "tiktok": {
      const id = TIKTOK_REGEX.exec(pathVideo)?.[1] ?? pathVideo;
      return `https://www.tiktok.com/embed/v2/${id}`;
    }
    case "linkedin":
      return pathVideo.startsWith("http") ? pathVideo : `https://www.linkedin.com/embed/${pathVideo}`;
    case "instagram": {
      const code = INSTAGRAM_REGEX.exec(pathVideo)?.[1] ?? pathVideo;
      return `https://www.instagram.com/p/${code}/embed`;
    }
    default:
      return pathVideo;
  }
}

export { isNativeVideo, isNativeAudio } from "@/shared/lib/media-types";
