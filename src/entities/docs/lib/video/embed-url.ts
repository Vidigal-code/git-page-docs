import type { LanguageCode } from "@/entities/docs/model/types";
import { isNativeAudio, isNativeVideo, isAudioEmbed } from "@/shared/lib/media-types";
import { resolveAudioEmbedUrl } from "@/entities/docs/lib/embed";

const TWITTER_X_REGEX = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;
const TIKTOK_REGEX = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/;

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

export { isNativeVideo, isNativeAudio } from "@/shared/lib/media-types";
