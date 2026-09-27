import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveThemeByMode } from "@/entities/docs/lib/theme/resolve-theme-by-mode";
import {
  SHELL_THEME_CACHE_KEY,
  readCachedShellThemes,
  writeCachedShellThemes,
  type CachedShellThemes,
} from "@/entities/docs/lib/theme/theme-cache";
import { toDocsShellCssVars, toSearchShellCssVars } from "@/entities/docs/lib/theme/to-css-vars";
import type { LayoutItem, SiteConfig, ThemeMode, ThemeTemplate } from "@/entities/docs/model/types";

function layout(id: string, mode: ThemeMode, reference?: string): LayoutItem {
  return {
    id,
    name: id,
    author: "a",
    file: `${id}.json`,
    preview: "",
    supportsLightAndDarkModes: Boolean(reference),
    supportsLightAndDarkModesReference: reference,
    mode,
  };
}

describe("resolveThemeByMode", () => {
  const dark = layout("aurora-dark", "dark", "aurora");
  const light = layout("aurora-light", "light", "aurora");
  const single = layout("mono", "dark");
  const layouts = [dark, light, single];

  it("keeps a theme with no light/dark pair", () => {
    expect(resolveThemeByMode(layouts, single, "light")).toBe(single);
  });

  it("keeps a paired theme whose reference is missing", () => {
    const orphan = { ...dark, supportsLightAndDarkModesReference: undefined };
    expect(resolveThemeByMode(layouts, orphan, "light")).toBe(orphan);
  });

  it("switches to the sibling with the requested mode", () => {
    expect(resolveThemeByMode(layouts, dark, "light")).toBe(light);
    expect(resolveThemeByMode(layouts, light, "dark")).toBe(dark);
    expect(resolveThemeByMode(layouts, dark, "dark")).toBe(dark);
  });

  it("keeps the active theme when no sibling has the requested mode", () => {
    expect(resolveThemeByMode([dark, single], dark, "light")).toBe(dark);
  });
});

function fakeStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  } as unknown as Storage;
  return { store, storage };
}

const cached: CachedShellThemes = {
  layoutsConfig: { layouts: [layout("mono", "dark")] },
  themes: { mono: { id: "mono" } as ThemeTemplate },
};

describe("shell theme cache", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("namespaces the key by schema version", () => {
    expect(SHELL_THEME_CACHE_KEY).toBe("git-page-docs:shell-themes:v1");
  });

  it("is a no-op outside the browser", () => {
    expect(readCachedShellThemes()).toBeNull();
    expect(() => writeCachedShellThemes(cached)).not.toThrow();
  });

  it("round-trips the catalogue through localStorage", () => {
    const { store, storage } = fakeStorage();
    vi.stubGlobal("window", { localStorage: storage });
    writeCachedShellThemes(cached);
    expect(JSON.parse(store.get(SHELL_THEME_CACHE_KEY) ?? "null")).toEqual(cached);
    expect(readCachedShellThemes()).toEqual(cached);
  });

  it("does not cache an empty catalogue", () => {
    const { store, storage } = fakeStorage();
    vi.stubGlobal("window", { localStorage: storage });
    writeCachedShellThemes({ layoutsConfig: { layouts: [] }, themes: {} });
    expect(store.size).toBe(0);
  });

  it("ignores absent, malformed or mis-shaped entries", () => {
    const { store, storage } = fakeStorage();
    vi.stubGlobal("window", { localStorage: storage });
    expect(readCachedShellThemes()).toBeNull();
    store.set(SHELL_THEME_CACHE_KEY, "{not json");
    expect(readCachedShellThemes()).toBeNull();
    store.set(SHELL_THEME_CACHE_KEY, JSON.stringify({ layoutsConfig: { layouts: [] }, themes: {} }));
    expect(readCachedShellThemes()).toBeNull();
    store.set(SHELL_THEME_CACHE_KEY, JSON.stringify({ layoutsConfig: cached.layoutsConfig }));
    expect(readCachedShellThemes()).toBeNull();
  });

  it("swallows storage access and quota errors", () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new Error("blocked");
      },
    });
    expect(readCachedShellThemes()).toBeNull();
    expect(() => writeCachedShellThemes(cached)).not.toThrow();

    const throwing = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("quota");
      },
    } as unknown as Storage;
    vi.stubGlobal("window", { localStorage: throwing });
    expect(readCachedShellThemes()).toBeNull();
    expect(() => writeCachedShellThemes(cached)).not.toThrow();
  });
});

describe("toDocsShellCssVars", () => {
  it("emits the built-in component defaults without a theme", () => {
    expect(toDocsShellCssVars(undefined)).toEqual({
      "--header-background": "#0b1220",
      "--header-border": "1px solid #334155",
      "--card-shadow": "0 18px 60px rgba(0, 0, 0, 0.35)",
      "--card-radius": "16px",
      "--control-radius": "10px",
      "--control-border": "1px solid var(--card-border)",
      "--control-background": "var(--card-background)",
      "--select-radius": "10px",
      "--select-border": "1px solid var(--card-border)",
      "--button-radius": "10px",
      "--button-border": "1px solid var(--card-border)",
      "--button-glow": "0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent)",
      "--toc-scroll-max-height-desktop": "min(65vh, 400px)",
      "--toc-scroll-max-height-mobile": "min(45vh, 280px)",
    });
  });

  it("prefers theme components, header controls and site TOC heights", () => {
    const theme = {
      colors: { primary: "#123456" },
      components: {
        header: { backgroundColor: "#111", borderBottom: "2px solid #222" },
        card: { borderRadius: "4px", boxShadow: "none" },
        button: { borderRadius: "2px", border: "1px solid red", hoverGlow: "0 0 1px red" },
        select: { borderRadius: "3px", border: "1px solid blue", backgroundColor: "#333" },
        headerControls: { common: { borderRadius: "9px", border: "1px solid green", backgroundColor: "#444" } },
      },
    } as unknown as ThemeTemplate;
    const site = { TocScrollMaxHeightDesktop: "500px", TocScrollMaxHeightMobile: "200px" } as unknown as SiteConfig;

    expect(toDocsShellCssVars(theme, site)).toMatchObject({
      "--primary": "#123456",
      "--header-background": "#111",
      "--header-border": "2px solid #222",
      "--card-shadow": "none",
      "--card-radius": "4px",
      "--control-radius": "9px",
      "--control-border": "1px solid green",
      "--control-background": "#444",
      "--select-radius": "3px",
      "--select-border": "1px solid blue",
      "--button-radius": "2px",
      "--button-border": "1px solid red",
      "--button-glow": "0 0 1px red",
      "--toc-scroll-max-height-desktop": "500px",
      "--toc-scroll-max-height-mobile": "200px",
    });
  });

  it("falls back per field to the palette when a component is declared but partial", () => {
    const theme = { colors: {}, components: { button: {}, select: {}, card: {} } } as unknown as ThemeTemplate;
    const vars = toDocsShellCssVars(theme) as Record<string, string | undefined>;
    expect(vars["--control-radius"]).toBe("10px");
    expect(vars["--control-border"]).toBe("1px solid var(--card-border)");
    expect(vars["--control-background"]).toBe("var(--card-background)");
    expect(vars["--select-radius"]).toBe("10px");
    expect(vars["--select-border"]).toBe("1px solid var(--card-border)");
    expect(vars["--button-radius"]).toBe("10px");
    expect(vars["--button-glow"]).toContain("var(--primary)");
    expect(vars["--card-radius"]).toBeUndefined();
    expect(vars["--card-shadow"]).toBeUndefined();
  });
});

describe("toSearchShellCssVars", () => {
  it("emits nothing without a theme", () => {
    expect(toSearchShellCssVars(undefined)).toEqual({});
  });

  it("uses the header component when declared, on top of the base palette", () => {
    const theme = {
      colors: { cardBackground: "#abc", cardBorder: "#def" },
      components: { header: { backgroundColor: "#h", borderBottom: "3px dotted #b" } },
    } as unknown as ThemeTemplate;
    expect(toSearchShellCssVars(theme)).toMatchObject({
      "--header-background": "#h",
      "--header-border": "3px dotted #b",
      "--card-background": "#abc",
      "--card-border": "#def",
    });
  });

  it("derives the header from the card colours, then from the built-in defaults", () => {
    const fromCard = { colors: { cardBackground: "#abc", cardBorder: "#def" }, components: {} } as unknown as ThemeTemplate;
    expect(toSearchShellCssVars(fromCard)).toMatchObject({ "--header-background": "#abc", "--header-border": "1px solid #def" });

    const bare = { components: {} } as unknown as ThemeTemplate;
    expect(toSearchShellCssVars(bare)).toMatchObject({ "--header-background": "#0f172a", "--header-border": "1px solid #334155" });
  });
});
