import { vi } from "vitest";
import type {
  GitPageDocsConfig,
  LayoutItem,
  LoadedDocsData,
  LoadedPage,
  SiteConfig,
  VersionEntry,
} from "@/entities/docs";

/** Path clicks used across the widget-model tests. */
export const INTRO = "docs/intro.md";
export const GUIDE = "docs/guide.md";
export const LANDING = "pages/landing.html";
export const VIDEO_ROUTE_ID = 30;
export const AUDIO_ROUTE_ID = 40;
export const VIDEO_PATH = `page:${VIDEO_ROUTE_ID}`;
export const AUDIO_PATH = `page:${AUDIO_ROUTE_ID}`;
/** Media entries are also reachable by a slug-bearing key (fullscreen `?slug=`). */
export const VIDEO_SLUG_KEY = "video/copilot-overview";
export const AUDIO_SLUG_KEY = "audio/intro-track";

export const PAGE_INDEX = { intro: 0, guide: 1, landing: 2, video: 3, audio: 4 } as const;

function layout(id: string, mode: "dark" | "light", pairReference?: string): LayoutItem {
  return {
    id,
    name: id,
    author: "tests",
    file: `${id}.json`,
    preview: "",
    supportsLightAndDarkModes: Boolean(pairReference),
    supportsLightAndDarkModesReference: pairReference,
    mode,
  };
}

/** Two paired aurora themes plus a single-mode theme that cannot toggle. */
export function makeLayouts(): LayoutItem[] {
  return [layout("aurora-dark", "dark", "aurora"), layout("aurora-light", "light", "aurora"), layout("mono-dark", "dark")];
}

export function makeSite(overrides: Partial<SiteConfig> = {}): SiteConfig {
  return {
    name: "Demo Docs",
    defaultLanguage: "en",
    HideThemeSelector: false,
    ThemeDefault: "aurora-dark",
    rendering: "static",
    langmenu: {
      en: {
        en: "English",
        pt: "Portuguese",
        titleHeaderMenuMd: "Docs",
        titleHeaderMenuHtml: "Pages",
        menuClose: "Close",
      },
      pt: { en: "Inglês", pt: "Português", titleHeaderMenuMd: "Documentos" },
    },
    ...overrides,
  };
}

export function makePages(): LoadedPage[] {
  return [
    { id: 1, md: { routeId: 1, config: { id: 1, path: { en: INTRO } }, markdownByLanguage: { en: "# Intro" } } },
    { id: 2, md: { routeId: 2, config: { id: 2, path: { en: GUIDE } }, markdownByLanguage: { en: "# Guide" } } },
    { id: 20, html: { routeId: 20, config: { id: 20, path: { en: LANDING } }, htmlByLanguage: { en: "<p>landing</p>" } } },
    {
      id: VIDEO_ROUTE_ID,
      video: {
        routeId: VIDEO_ROUTE_ID,
        config: { id: VIDEO_ROUTE_ID, videoSlug: { en: "copilot-overview" } },
        videoTypeByLanguage: { en: "youtube" },
        pathVideoByLanguage: { en: "https://youtu.be/copilot" },
      },
    },
    {
      id: AUDIO_ROUTE_ID,
      audio: {
        routeId: AUDIO_ROUTE_ID,
        config: { id: AUDIO_ROUTE_ID, audioSlug: { en: "intro-track" } },
        audioTypeByLanguage: { en: "mp3" },
        pathAudioByLanguage: { en: "audio/intro-track.mp3" },
      },
    },
  ];
}

export function makeVersions(): VersionEntry[] {
  return [
    {
      id: "v1",
      path: "v1",
      branch: "https://github.com/demo/docs/tree/main",
      release: "https://github.com/demo/docs/releases/tag/v1",
      UpdateDate: "2026-01-15",
      PreviewProject: "https://demo.example.com",
    },
    { id: "v2", path: "v2" },
  ];
}

export function makeConfig(overrides: Partial<GitPageDocsConfig> = {}): GitPageDocsConfig {
  return {
    site: makeSite(),
    routes: [
      { id: 1, path: { en: INTRO } },
      { id: 2, path: { en: GUIDE } },
    ],
    "menus-header": [],
    "menus-header-md": [
      { id: 1, en: { title: "Intro", "path-click": INTRO } },
      {
        id: 2,
        en: { title: "Guide", "path-click": "" },
        submenus: [{ id: 3, en: { title: "Install", "path-click": GUIDE } }],
      },
    ],
    "menus-header-html": [{ id: 20, en: { title: "Landing", "path-click": LANDING } }],
    "routes-html": [{ id: 20, path: { en: LANDING } }],
    "routes-video": [{ id: VIDEO_ROUTE_ID, videoSlug: { en: "copilot-overview" } }],
    "routes-audio": [{ id: AUDIO_ROUTE_ID, audioSlug: { en: "intro-track" } }],
    ...overrides,
  };
}

export function makeDocsData(overrides: Partial<LoadedDocsData> = {}): LoadedDocsData {
  const versions = makeVersions();
  return {
    config: makeConfig(),
    docs: [],
    pages: makePages(),
    pathToPageMap: {
      [INTRO]: { pageIndex: PAGE_INDEX.intro, contentType: "md" },
      [GUIDE]: { pageIndex: PAGE_INDEX.guide, contentType: "md" },
      [LANDING]: { pageIndex: PAGE_INDEX.landing, contentType: "html" },
      [VIDEO_PATH]: { pageIndex: PAGE_INDEX.video, contentType: "video" },
      [VIDEO_SLUG_KEY]: { pageIndex: PAGE_INDEX.video, contentType: "video" },
      [AUDIO_PATH]: { pageIndex: PAGE_INDEX.audio, contentType: "audio" },
      [AUDIO_SLUG_KEY]: { pageIndex: PAGE_INDEX.audio, contentType: "audio" },
    },
    availableVersions: versions,
    activeVersionId: "v1",
    activeVersion: versions[0],
    activeRepository: { source: "local" },
    availableLanguages: ["en", "pt"],
    layoutsConfig: { layouts: makeLayouts() },
    themes: {},
    ...overrides,
  };
}

/** Storage keys the docs shell derives from the site name (see use-docs-preferences). */
export const STORAGE_KEYS = {
  language: "git-page-docs:language:demo-docs",
  version: "git-page-docs:version:demo-docs",
  mode: "git-page-docs:mode:demo-docs",
  theme: "git-page-docs:theme:demo-docs",
} as const;

/** Puts the jsdom window on `path` (a `/path?query#hash` string) without navigating. */
export function setWindowUrl(path: string): void {
  window.history.replaceState({}, "", path);
}

/** Resolves once every queued microtask (the theme/language hooks restore state through queueMicrotask). */
export function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export interface LocationStub {
  assign: ReturnType<typeof vi.fn>;
  replace: ReturnType<typeof vi.fn>;
  restore: () => void;
}

/**
 * Replaces `window.location` with a plain object so hard navigations
 * (`assign`/`replace`, which jsdom does not implement) can be asserted on.
 * jsdom keeps the property configurable, but `Location` methods are not
 * spy-able, hence the whole-object swap. Call `restore()` in `afterEach`.
 */
export function stubWindowLocation(url: string): LocationStub {
  const original = Object.getOwnPropertyDescriptor(window, "location");
  const parsed = new URL(url, "http://localhost");
  const assign = vi.fn();
  const replace = vi.fn();
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: {
      href: parsed.href,
      origin: parsed.origin,
      pathname: parsed.pathname,
      search: parsed.search,
      hash: parsed.hash,
      assign,
      replace,
      reload: vi.fn(),
      toString: () => parsed.href,
    },
  });
  return {
    assign,
    replace,
    restore: () => {
      if (original) Object.defineProperty(window, "location", original);
    },
  };
}
