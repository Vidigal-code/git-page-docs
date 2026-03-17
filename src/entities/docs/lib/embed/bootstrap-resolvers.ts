import type { LanguageCode } from "@/entities/docs/model/types";
import { registerEmbedResolver } from "./embed-resolver-registry";
import { resolveYoutubeEmbed } from "./resolvers/youtube-resolver";
import { resolveVimeoEmbed } from "./resolvers/vimeo-resolver";
import { resolveSpotifyEmbed } from "./resolvers/spotify-resolver";
import { resolveLinkedInEmbed } from "./resolvers/linkedin-resolver";
import { resolveInstagramEmbed } from "./resolvers/instagram-resolver";
import { resolveSoundCloudEmbed } from "./resolvers/soundcloud-resolver";
import { resolveBandcampEmbed } from "./resolvers/bandcamp-resolver";
import { resolveDeezerEmbed } from "./resolvers/deezer-resolver";
import { resolveXEmbed } from "./resolvers/x-resolver";
import { resolveTiktokEmbed } from "./resolvers/tiktok-resolver";

const RESOLVERS: [string, (url: string, lang: LanguageCode) => string][] = [
  ["youtube", resolveYoutubeEmbed],
  ["vimeo", resolveVimeoEmbed],
  ["spotify", resolveSpotifyEmbed],
  ["linkedin", resolveLinkedInEmbed],
  ["instagram", resolveInstagramEmbed],
  ["soundcloud", resolveSoundCloudEmbed],
  ["bandcamp", resolveBandcampEmbed],
  ["deezer", resolveDeezerEmbed],
  ["x", resolveXEmbed],
  ["twitter", resolveXEmbed],
  ["tiktok", resolveTiktokEmbed],
];

function bootstrap(): void {
  for (const [type, resolver] of RESOLVERS) {
    registerEmbedResolver(type, resolver);
  }
}

bootstrap();
