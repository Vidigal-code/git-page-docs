import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  AI_MODEL_DEFAULTS,
  OLLAMA_DEFAULT_BASE_URL,
  getProviderInputPlaceholder,
  normalizeProviderAndModel,
  resolveDefaultModel,
} from "@/shared/config/ai-config";
import {
  CONFIG_BASE,
  CONFIG_EXTENSIONS,
  DEFAULT_CONFIG_PATH,
  DEFAULT_HIERARCHY,
  PROJECT_FOOTER_URL,
  SMALL_SCREEN_MEDIA_QUERY,
  THEME_URL_PARAM,
} from "@/shared/config/constants";
import {
  LAYOUTS_CONFIG_FILENAME,
  LAYOUTS_DIR_CANDIDATES,
  OFFICIAL_LAYOUTS_CONFIG_URL,
  OFFICIAL_LAYOUTS_CONFIG_URLS,
  OFFICIAL_LAYOUTS_TEMPLATES_URL,
  REMOTE_FETCH_TIMEOUT_MS,
} from "@/shared/config/remote-urls";
import { DEFAULT_ICON_FALLBACK_URL } from "@/shared/config/icon-defaults";
import * as notFoundDict from "@/shared/config/i18n/not-found-dict";
import { getRepoFromPackage } from "@/shared/config/repo-from-package";

describe("ai-config", () => {
  it("resolves the default model per provider, defaulting to OpenAI", () => {
    expect(resolveDefaultModel(undefined)).toBe(AI_MODEL_DEFAULTS.openai);
    expect(resolveDefaultModel("")).toBe(AI_MODEL_DEFAULTS.openai);
    expect(resolveDefaultModel("claude")).toBe(AI_MODEL_DEFAULTS.claude);
    expect(resolveDefaultModel("ollama")).toBe(AI_MODEL_DEFAULTS.ollama);
    expect(resolveDefaultModel("unknown-provider")).toBe(AI_MODEL_DEFAULTS.openai);
  });

  it("normalizes provider:model strings", () => {
    expect(normalizeProviderAndModel(undefined)).toEqual({ provider: "openai", model: AI_MODEL_DEFAULTS.openai });
    expect(normalizeProviderAndModel("")).toEqual({ provider: "openai", model: AI_MODEL_DEFAULTS.openai });
    expect(normalizeProviderAndModel("gemini")).toEqual({ provider: "gemini", model: AI_MODEL_DEFAULTS.gemini });
    expect(normalizeProviderAndModel("ollama:llama3.1")).toEqual({ provider: "ollama", model: "llama3.1" });
    expect(normalizeProviderAndModel(" claude : opus ")).toEqual({ provider: "claude", model: AI_MODEL_DEFAULTS.claude });
    expect(normalizeProviderAndModel(":gpt-4o")).toEqual({ provider: "openai", model: "gpt-4o" });
  });

  it("falls back to OpenAI and self-heals unknown or retired models to the provider default", () => {
    expect(normalizeProviderAndModel("acme:custom-model")).toEqual({ provider: "openai", model: AI_MODEL_DEFAULTS.openai });
    expect(normalizeProviderAndModel("claude:claude-3-5-sonnet-20240620")).toEqual({ provider: "claude", model: AI_MODEL_DEFAULTS.claude });
    expect(normalizeProviderAndModel("gemini:gemini-pro")).toEqual({ provider: "gemini", model: AI_MODEL_DEFAULTS.gemini });
  });

  it("hints the Ollama base URL instead of an API key placeholder", () => {
    expect(getProviderInputPlaceholder("ollama:llama3")).toBe(OLLAMA_DEFAULT_BASE_URL);
    expect(getProviderInputPlaceholder("openai:gpt-4o-mini")).toBe("sk-...");
  });
});

describe("constants", () => {
  it("exposes the documented defaults", () => {
    expect(PROJECT_FOOTER_URL).toBe("https://github.com/Vidigal-code/git-page-docs");
    expect(THEME_URL_PARAM).toBe("theme");
    expect(SMALL_SCREEN_MEDIA_QUERY).toBe("(max-width: 640px)");
    expect(CONFIG_BASE).toBe("gitpagedocs/config");
    expect(CONFIG_EXTENSIONS).toEqual([".json", ".js", ".ts"]);
    expect(DEFAULT_CONFIG_PATH).toBe(`${CONFIG_BASE}.json`);
    expect(DEFAULT_HIERARCHY).toEqual({ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4 });
    expect(DEFAULT_ICON_FALLBACK_URL).toMatch(/^https:\/\//);
  });
});

describe("remote-urls", () => {
  it("tries the canonical layouts home before the legacy one", () => {
    expect(OFFICIAL_LAYOUTS_CONFIG_URLS).toEqual([OFFICIAL_LAYOUTS_CONFIG_URL]);
    expect(OFFICIAL_LAYOUTS_CONFIG_URL).toContain("gitpagelayouts/layoutsConfig.json");
    expect(OFFICIAL_LAYOUTS_TEMPLATES_URL).toContain("gitpagelayouts/templates");
  });

  it("checks the legacy repo folder before the standalone layouts folder", () => {
    expect(LAYOUTS_DIR_CANDIDATES).toEqual(["gitpagelayouts/"]);
    expect(LAYOUTS_CONFIG_FILENAME).toBe("layoutsConfig.json");
    expect(REMOTE_FETCH_TIMEOUT_MS).toBeGreaterThan(0);
  });
});

describe("not-found dictionary", () => {
  it("translates every entry into en, pt and es", () => {
    const entries = Object.entries(notFoundDict);
    expect(entries.length).toBeGreaterThan(0);
    for (const [name, dictionary] of entries) {
      for (const language of ["en", "pt", "es"] as const) {
        expect(dictionary[language], `${name}.${language}`).toEqual(expect.any(String));
        expect(dictionary[language].trim().length, `${name}.${language}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("getRepoFromPackage", () => {
  const dirs: string[] = [];

  async function makeProject(packageJson: string | null): Promise<string> {
    const dir = await mkdtemp(path.join(tmpdir(), "gpd-repo-from-package-"));
    dirs.push(dir);
    if (packageJson !== null) {
      await writeFile(path.join(dir, "package.json"), packageJson, "utf-8");
    }
    return dir;
  }

  afterEach(async () => {
    await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it("reads owner/repo from the repository object and the homepage", async () => {
    const dir = await makeProject(
      JSON.stringify({
        repository: { type: "git", url: "git+https://github.com/acme/site.git" },
        homepage: "https://github.com/acme/other",
      }),
    );
    expect(await getRepoFromPackage(dir)).toEqual({
      fromRepository: { owner: "acme", repo: "site" },
      fromHomepage: { owner: "acme", repo: "other" },
    });
  });

  it("accepts the shorthand string repository field and skips a non-repo homepage", async () => {
    const dir = await makeProject(
      JSON.stringify({ repository: "https://github.com/acme/strform", homepage: "https://acme.github.io/" }),
    );
    expect(await getRepoFromPackage(dir)).toEqual({ fromRepository: { owner: "acme", repo: "strform" } });
  });

  it("returns null when neither field identifies a repository", async () => {
    const dir = await makeProject(JSON.stringify({ name: "nothing-here" }));
    expect(await getRepoFromPackage(dir)).toBeNull();
  });

  it("returns null when package.json is missing or malformed", async () => {
    expect(await getRepoFromPackage(await makeProject(null))).toBeNull();
    expect(await getRepoFromPackage(await makeProject("{ not json"))).toBeNull();
  });
});
