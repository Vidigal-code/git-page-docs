import { describe, it, expect, afterEach, vi } from "vitest";
import { loadLayoutsAndThemes } from "@/entities/docs/api/load-remote-docs-data-client";
import type { GitPageDocsConfig } from "@/entities/docs";

/** Reproduces the live regression: a repository whose committed config still
 * points at the retired official layouts location (both index and templates).
 * The index recovers through the official fallback candidates, and the stale
 * templates override must NOT misdirect template fetches away from the source
 * that actually served the index. */

const RETIRED_DIR = "gitpagedocs/layouts";
const CANONICAL_DIR = "gitpagelayouts";

const AURORA_LIGHT_TEMPLATE = {
  id: "aurora-light",
  name: "Aurora Light",
  author: "Test",
  version: "1.0.0",
  mode: "light",
  supportsLightAndDarkModes: true,
  colors: { background: "#F7FAFF" },
  typography: { fontFamily: "sans-serif", fontSize: { base: "1rem" } },
  components: {},
  animations: {},
};

const LAYOUTS_INDEX = {
  layouts: [
    {
      id: "aurora-light",
      name: "Aurora Light",
      author: "Test",
      file: "templates/aurora-light.json",
      preview: "",
      supportsLightAndDarkModes: true,
      mode: "light",
    },
  ],
};

function jsonResponse(body: unknown): { ok: true; text: () => Promise<string> } {
  return { ok: true, text: async () => JSON.stringify(body) };
}

const NOT_FOUND = { ok: false, text: async () => "" };

function stubRegistryFetch(): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes(RETIRED_DIR)) return NOT_FOUND;
      if (url.includes(`${CANONICAL_DIR}/layoutsConfig.json`)) return jsonResponse(LAYOUTS_INDEX);
      if (url.includes(`${CANONICAL_DIR}/templates/aurora-light.json`)) return jsonResponse(AURORA_LIGHT_TEMPLATE);
      return NOT_FOUND;
    }),
  );
}

function staleOfficialConfig(): GitPageDocsConfig {
  return {
    site: {
      layoutsConfigPathOficial: true,
      layoutsConfigPathOficialUrl: `https://github.com/Vidigal-code/git-page-docs/blob/main/${RETIRED_DIR}/layoutsConfig.json`,
      layoutsConfigPathTemplatesOficial: `https://github.com/Vidigal-code/git-page-docs/blob/main/${RETIRED_DIR}/templates`,
    },
  } as unknown as GitPageDocsConfig;
}

afterEach(() => vi.unstubAllGlobals());

describe("remote layouts resolution with a stale official config", () => {
  it("loads the index via the official fallback and the templates from the same source", async () => {
    stubRegistryFetch();

    const { layoutsConfig, themes } = await loadLayoutsAndThemes(staleOfficialConfig(), "someone", "some-repo");

    expect(layoutsConfig.layouts.map((layout) => layout.id)).toEqual(["aurora-light"]);
    expect(themes["aurora-light"]).toBeDefined();
    expect(themes["aurora-light"].colors.background).toBe("#F7FAFF");
  });

  it("still honors the configured templates override when the configured index URL works", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("custom-home/layoutsConfig.json")) return jsonResponse(LAYOUTS_INDEX);
        if (url.includes("custom-templates/templates/aurora-light.json")) return jsonResponse(AURORA_LIGHT_TEMPLATE);
        return NOT_FOUND;
      }),
    );
    const config = {
      site: {
        layoutsConfigPathOficial: true,
        layoutsConfigPathOficialUrl: "https://example.com/custom-home/layoutsConfig.json",
        layoutsConfigPathTemplatesOficial: "https://example.com/custom-templates",
      },
    } as unknown as GitPageDocsConfig;

    const { themes } = await loadLayoutsAndThemes(config, "someone", "some-repo");

    expect(themes["aurora-light"]).toBeDefined();
  });
});
