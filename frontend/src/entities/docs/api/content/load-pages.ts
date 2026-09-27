import type {
  AudioRouteConfig,
  ContentType,
  ContentTypeRouteConfig,
  LanguageCode,
  LoadedAudioContent,
  LoadedHtmlContent,
  LoadedMdContent,
  LoadedPage,
  LoadedSourceViewerContent,
  LoadedVideoContent,
  PathToPageEntry,
  RouteConfig,
  VideoRouteConfig,
} from "@/entities/docs/model/types";
import { readLocalText } from "../io/file-reader";
import { readRemoteText } from "../io/remote-fetcher";
import { markdownToHtml } from "../utils/markdown";
import { hasPath, hasVideo, hasAudio } from "../utils/route-utils";

interface PageLoadContext {
  languages: LanguageCode[];
  source: "local" | "remote";
  owner?: string;
  repo?: string;
}

/** Where the page being assembled lands in `pathToPageMap`. */
interface PageIndex {
  pathToPageMap: Record<string, PathToPageEntry>;
  pageIndex: number;
}

type SourceKind = "remote" | "local";
type TextRenderer = (text: string | null, kind: SourceKind) => string;

type MdRoute = ContentTypeRouteConfig & { path: Record<LanguageCode, string> };
type VideoRoute = ContentTypeRouteConfig & { video: VideoRouteConfig };
type AudioRoute = ContentTypeRouteConfig & { audio: AudioRouteConfig };

const MD_MISSING_PATH = "<p>Missing language file path in config.</p>";
const MD_UNAVAILABLE: Record<SourceKind, string> = {
  remote: "<p>Unable to load remote markdown file.</p>",
  local: "<p>Unable to load local markdown file.</p>",
};
const HTML_MISSING_PATH = "<p>Missing HTML path.</p>";
const HTML_UNAVAILABLE: Record<SourceKind, string> = {
  remote: "<p>Unable to load remote HTML.</p>",
  local: "<p>Unable to load local HTML file.</p>",
};

const renderMarkdown: TextRenderer = (text, kind) => (text ? markdownToHtml(text) : MD_UNAVAILABLE[kind]);
const renderHtml: TextRenderer = (text, kind) => text ?? HTML_UNAVAILABLE[kind];

function registerPaths(index: PageIndex, contentType: ContentType, keys: (string | undefined)[]): void {
  for (const key of keys) {
    if (key) {
      index.pathToPageMap[key] = { pageIndex: index.pageIndex, contentType };
    }
  }
}

/** Reads one localized file as is: its text (null when unreadable) and where it came from. */
async function readLocalizedRaw(
  context: PageLoadContext,
  languagePath: string,
): Promise<{ text: string | null; kind: SourceKind }> {
  if (context.source === "remote" && context.owner && context.repo) {
    return { text: await readRemoteText(context.owner, context.repo, languagePath), kind: "remote" };
  }
  try {
    return { text: await readLocalText(languagePath), kind: "local" };
  } catch {
    return { text: null, kind: "local" };
  }
}

/** Reads one localized file, rendering the "unavailable" message when it cannot be read. */
async function readLocalizedText(context: PageLoadContext, languagePath: string, render: TextRenderer): Promise<string> {
  const { text, kind } = await readLocalizedRaw(context, languagePath);
  return render(text, kind);
}

async function loadTextByLanguage(
  context: PageLoadContext,
  pathByLanguage: Record<LanguageCode, string>,
  render: TextRenderer,
  missingPathMessage: string,
): Promise<Record<LanguageCode, string>> {
  const textByLanguage: Record<LanguageCode, string> = {};
  await Promise.all(
    context.languages.map(async (language) => {
      const languagePath = pathByLanguage[language];
      textByLanguage[language] = languagePath ? await readLocalizedText(context, languagePath, render) : missingPathMessage;
    }),
  );
  return textByLanguage;
}

/** Per-language value with an `en` fallback, then the given default. */
function localizeRecord(record: Record<LanguageCode, string>, languages: LanguageCode[], fallback: string): Record<LanguageCode, string> {
  const localized: Record<LanguageCode, string> = {};
  languages.forEach((language) => {
    localized[language] = record[language] ?? record.en ?? fallback;
  });
  return localized;
}

function findMdRoute(routes: (ContentTypeRouteConfig | RouteConfig)[], id: number): MdRoute | undefined {
  const route = routes.find((r) => r.id === id);
  return route && hasPath(route) ? route : undefined;
}

function findSourceViewerRoute(routes: ContentTypeRouteConfig[], id: number): ContentTypeRouteConfig | undefined {
  return routes.find((r) => r.id === id && r["source-viewer"] === true);
}

function findHtmlRoute(routes: ContentTypeRouteConfig[], id: number): ContentTypeRouteConfig | undefined {
  return routes.find((r) => r.id === id && (r.path || r.url));
}

function findVideoRoute(routes: ContentTypeRouteConfig[], id: number): VideoRoute | undefined {
  return routes.find((r): r is VideoRoute => r.id === id && hasVideo(r));
}

function findAudioRoute(routes: ContentTypeRouteConfig[], id: number): AudioRoute | undefined {
  return routes.find((r): r is AudioRoute => r.id === id && hasAudio(r));
}

async function loadMdContent(route: MdRoute, context: PageLoadContext, index: PageIndex): Promise<LoadedMdContent> {
  // Each file is read once: the HTML is rendered for display and the original
  // text is kept for the "copy" / "download .md" actions.
  const markdownByLanguage: Record<LanguageCode, string> = {};
  const sourceByLanguage: Record<LanguageCode, string> = {};
  await Promise.all(
    context.languages.map(async (language) => {
      const languagePath = route.path[language];
      if (!languagePath) {
        markdownByLanguage[language] = MD_MISSING_PATH;
        return;
      }
      const { text, kind } = await readLocalizedRaw(context, languagePath);
      markdownByLanguage[language] = renderMarkdown(text, kind);
      if (text) sourceByLanguage[language] = text;
    }),
  );
  const fullscreenEnabled = "fullscreenEnabled" in route ? route.fullscreenEnabled : true;
  registerPaths(index, "md", context.languages.map((language) => route.path[language]));
  return { routeId: route.id, config: route, markdownByLanguage, sourceByLanguage, fullscreenEnabled };
}

function resolveSourceViewerPath(rawPath: ContentTypeRouteConfig["source-viewer-path"], preferredLanguage: LanguageCode): string {
  if (typeof rawPath === "string") {
    return rawPath;
  }
  return rawPath?.[preferredLanguage] ?? rawPath?.en ?? Object.values(rawPath ?? {})[0] ?? "";
}

function buildSourceViewerContent(route: ContentTypeRouteConfig, context: PageLoadContext, index: PageIndex): LoadedSourceViewerContent {
  const sourceViewerPath = resolveSourceViewerPath(route["source-viewer-path"], context.languages[0]);
  registerPaths(index, "source-viewer", [`page:${route.id}`, sourceViewerPath ? `source-viewer:${sourceViewerPath}` : undefined]);
  return { routeId: route.id, config: route, sourceViewerPath, fullscreenEnabled: route.fullscreenEnabled ?? false };
}

async function loadHtmlContent(route: ContentTypeRouteConfig, context: PageLoadContext, index: PageIndex): Promise<LoadedHtmlContent> {
  let htmlByLanguage: Record<LanguageCode, string> = {};
  if (route.path) {
    const pathByLanguage = route.path;
    htmlByLanguage = await loadTextByLanguage(context, pathByLanguage, renderHtml, HTML_MISSING_PATH);
    registerPaths(index, "html", context.languages.map((language) => pathByLanguage[language]));
  } else if (route.url) {
    context.languages.forEach((language) => {
      htmlByLanguage[language] = "";
    });
    registerPaths(index, "html", [`url:${route.url.en ?? Object.values(route.url)[0]}`]);
  }
  return { routeId: route.id, config: route, htmlByLanguage, fullscreenEnabled: route.fullscreenEnabled ?? true };
}

function buildVideoContent(route: VideoRoute, context: PageLoadContext, index: PageIndex): LoadedVideoContent {
  const videoTypeByLanguage = localizeRecord(route.video.videoType, context.languages, "youtube");
  const pathVideoByLanguage = localizeRecord(route.video.pathVideo, context.languages, "");
  registerPaths(index, "video", [`page:${route.id}`, ...context.languages.map((language) => pathVideoByLanguage[language])]);
  return { routeId: route.id, config: route, videoTypeByLanguage, pathVideoByLanguage, fullscreenEnabled: route.fullscreenEnabled ?? true };
}

function buildAudioContent(route: AudioRoute, context: PageLoadContext, index: PageIndex): LoadedAudioContent {
  const audioTypeByLanguage = localizeRecord(route.audio.audioType, context.languages, "youtube");
  const pathAudioByLanguage = localizeRecord(route.audio.pathAudio, context.languages, "");
  registerPaths(index, "audio", [`page:${route.id}`, ...context.languages.map((language) => pathAudioByLanguage[language])]);
  return { routeId: route.id, config: route, audioTypeByLanguage, pathAudioByLanguage, fullscreenEnabled: route.fullscreenEnabled ?? true };
}

export async function loadPages(options: {
  sortedIds: number[];
  routesMd: (ContentTypeRouteConfig | RouteConfig)[];
  routesSourceViewer: ContentTypeRouteConfig[];
  routesHtml: ContentTypeRouteConfig[];
  routesVideo: ContentTypeRouteConfig[];
  routesAudio: ContentTypeRouteConfig[];
  languages: LanguageCode[];
  source: "local" | "remote";
  owner?: string;
  repo?: string;
}): Promise<{ pages: LoadedPage[]; pathToPageMap: Record<string, PathToPageEntry> }> {
  const pathToPageMap: Record<string, PathToPageEntry> = {};
  const pages: LoadedPage[] = [];
  const { sortedIds, routesMd, routesSourceViewer, routesHtml, routesVideo, routesAudio, languages, source, owner, repo } = options;
  const context: PageLoadContext = { languages, source, owner, repo };

  for (let pageIndex = 0; pageIndex < sortedIds.length; pageIndex++) {
    const id = sortedIds[pageIndex];
    const page: LoadedPage = { id };
    const index: PageIndex = { pathToPageMap, pageIndex };

    const mdRoute = findMdRoute(routesMd, id);
    if (mdRoute) page.md = await loadMdContent(mdRoute, context, index);

    const sourceViewerRoute = findSourceViewerRoute(routesSourceViewer, id);
    if (sourceViewerRoute) page.sourceViewer = buildSourceViewerContent(sourceViewerRoute, context, index);

    const htmlRoute = findHtmlRoute(routesHtml, id);
    if (htmlRoute) page.html = await loadHtmlContent(htmlRoute, context, index);

    const videoRoute = findVideoRoute(routesVideo, id);
    if (videoRoute) page.video = buildVideoContent(videoRoute, context, index);

    const audioRoute = findAudioRoute(routesAudio, id);
    if (audioRoute) page.audio = buildAudioContent(audioRoute, context, index);

    pages.push(page);
  }

  return { pages, pathToPageMap };
}
