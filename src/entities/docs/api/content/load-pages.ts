import type {
  ContentTypeRouteConfig,
  LanguageCode,
  LoadedPage,
  PathToPageEntry,
  RouteConfig,
} from "@/entities/docs/model/types";
import { readLocalText } from "../io/file-reader";
import { readRemoteText } from "../io/remote-fetcher";
import { markdownToHtml } from "../utils/markdown";
import { hasPath, hasVideo } from "../utils/route-utils";

export async function loadPages(options: {
  sortedIds: number[];
  routesMd: (ContentTypeRouteConfig | RouteConfig)[];
  routesHtml: ContentTypeRouteConfig[];
  routesVideo: ContentTypeRouteConfig[];
  languages: LanguageCode[];
  source: "local" | "remote";
  owner?: string;
  repo?: string;
}): Promise<{ pages: LoadedPage[]; pathToPageMap: Record<string, PathToPageEntry> }> {
  const pathToPageMap: Record<string, PathToPageEntry> = {};
  const pages: LoadedPage[] = [];
  const { sortedIds, routesMd, routesHtml, routesVideo, languages, source, owner, repo } = options;

  for (let pageIndex = 0; pageIndex < sortedIds.length; pageIndex++) {
    const id = sortedIds[pageIndex];
    const page: LoadedPage = { id };

    const mdRoute = routesMd.find((r) => r.id === id);
    if (mdRoute && hasPath(mdRoute)) {
      const markdownByLanguage: Record<LanguageCode, string> = {};
      await Promise.all(
        languages.map(async (language) => {
          const languagePath = mdRoute.path![language];
          if (!languagePath) {
            markdownByLanguage[language] = "<p>Missing language file path in config.</p>";
            return;
          }
          if (source === "remote" && owner && repo) {
            const remoteText = await readRemoteText(owner, repo, languagePath);
            markdownByLanguage[language] = remoteText ? markdownToHtml(remoteText) : "<p>Unable to load remote markdown file.</p>";
            return;
          }
          try {
            const localText = await readLocalText(languagePath);
            markdownByLanguage[language] = localText ? markdownToHtml(localText) : "<p>Unable to load local markdown file.</p>";
          } catch {
            markdownByLanguage[language] = "<p>Unable to load local markdown file.</p>";
          }
        }),
      );
      const fullscreenEnabled = "fullscreenEnabled" in mdRoute ? mdRoute.fullscreenEnabled : true;
      page.md = { routeId: id, config: mdRoute, markdownByLanguage, fullscreenEnabled };
      languages.forEach((lang) => {
        const pathVal = mdRoute.path![lang];
        if (pathVal) pathToPageMap[pathVal] = { pageIndex, contentType: "md" };
      });
    }

    const htmlRoute = routesHtml.find((r) => r.id === id && (r.path || r.url));
    if (htmlRoute) {
      const fullscreenEnabled = htmlRoute.fullscreenEnabled ?? true;
      const htmlByLanguage: Record<LanguageCode, string> = {};

      if (htmlRoute.path) {
        await Promise.all(
          languages.map(async (language) => {
            const languagePath = htmlRoute.path![language];
            if (!languagePath) {
              htmlByLanguage[language] = "<p>Missing HTML path.</p>";
              return;
            }
            if (source === "remote" && owner && repo) {
              const remoteText = await readRemoteText(owner, repo, languagePath);
              htmlByLanguage[language] = remoteText ?? "<p>Unable to load remote HTML.</p>";
              return;
            }
            try {
              const localText = await readLocalText(languagePath);
              htmlByLanguage[language] = localText ?? "<p>Unable to load local HTML file.</p>";
            } catch {
              htmlByLanguage[language] = "<p>Unable to load local HTML file.</p>";
            }
          }),
        );
        languages.forEach((lang) => {
          const pathVal = htmlRoute.path![lang];
          if (pathVal) pathToPageMap[pathVal] = { pageIndex, contentType: "html" };
        });
      } else if (htmlRoute.url) {
        languages.forEach((lang) => {
          htmlByLanguage[lang] = "";
        });
        const urlKey = htmlRoute.url.en ?? Object.values(htmlRoute.url)[0];
        if (urlKey) pathToPageMap[`url:${urlKey}`] = { pageIndex, contentType: "html" };
      }

      page.html = { routeId: id, config: htmlRoute, htmlByLanguage, fullscreenEnabled };
    }

    const videoRoute = routesVideo.find((r) => r.id === id && hasVideo(r));
    if (videoRoute && hasVideo(videoRoute)) {
      const videoTypeByLanguage: Record<LanguageCode, string> = {};
      const pathVideoByLanguage: Record<LanguageCode, string> = {};
      languages.forEach((lang) => {
        videoTypeByLanguage[lang] = videoRoute.video!.videoType[lang] ?? videoRoute.video!.videoType.en ?? "youtube";
        pathVideoByLanguage[lang] = videoRoute.video!.pathVideo[lang] ?? videoRoute.video!.pathVideo.en ?? "";
      });
      const fullscreenEnabled = videoRoute.fullscreenEnabled ?? true;
      page.video = { routeId: id, config: videoRoute, videoTypeByLanguage, pathVideoByLanguage, fullscreenEnabled };
      pathToPageMap[`page:${id}`] = { pageIndex, contentType: "video" };
      languages.forEach((lang) => {
        const url = pathVideoByLanguage[lang];
        if (url) pathToPageMap[url] = { pageIndex, contentType: "video" };
      });
    }

    pages.push(page);
  }

  return { pages, pathToPageMap };
}
