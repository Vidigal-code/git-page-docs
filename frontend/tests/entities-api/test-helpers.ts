import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { vi } from "vitest";
import type { GitPageDocsConfig } from "@/entities/docs/model/types";

/**
 * A throwaway repository root on disk. `process.cwd()` is redirected to it so
 * the local readers (`readLocalText`, `loadRootConfig`) resolve paths against
 * real fixture files instead of the monorepo.
 */
export interface TempWorkspace {
  root: string;
  write(relativePath: string, content: string | object): string;
  cleanup(): void;
}

export function createTempWorkspace(prefix = "gpd-api-"): TempWorkspace {
  const root = mkdtempSync(path.join(tmpdir(), prefix));
  const cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(root);
  return {
    root,
    write(relativePath, content) {
      const fullPath = path.join(root, relativePath);
      mkdirSync(path.dirname(fullPath), { recursive: true });
      writeFileSync(fullPath, typeof content === "string" ? content : JSON.stringify(content), "utf-8");
      return fullPath;
    },
    cleanup() {
      cwdSpy.mockRestore();
      rmSync(root, { recursive: true, force: true });
    },
  };
}

export type FetchRoute = [matcher: string | RegExp, body: unknown];

interface StubResponse {
  ok: boolean;
  status: number;
  text: () => Promise<string>;
}

function matches(url: string, matcher: string | RegExp): boolean {
  return typeof matcher === "string" ? url.includes(matcher) : matcher.test(url);
}

function okResponse(body: unknown): StubResponse {
  return { ok: true, status: 200, text: async () => (typeof body === "string" ? body : JSON.stringify(body)) };
}

const NOT_FOUND: StubResponse = { ok: false, status: 404, text: async () => "" };

/**
 * Stubs `fetch` with a substring/regex routing table. The first matching route
 * wins; anything else is a 404. Strings are served verbatim, objects as JSON.
 * Returns the spy so tests can assert which URLs were requested.
 */
export function stubFetch(routes: FetchRoute[]): ReturnType<typeof vi.fn> {
  const spy = vi.fn(async (input: RequestInfo | URL): Promise<StubResponse> => {
    const url = String(input);
    const hit = routes.find(([matcher]) => matches(url, matcher));
    return hit ? okResponse(hit[1]) : NOT_FOUND;
  });
  vi.stubGlobal("fetch", spy);
  return spy;
}

/** `owner/repo/relative/path` for any raw GitHub or jsDelivr mirror URL, null otherwise. */
export function repoKeyFromUrl(url: string): string | null {
  const raw = /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/[^/]+\/(.+)$/.exec(url);
  if (raw) return `${raw[1]}/${raw[2]}/${raw[3]}`;
  const cdn = /^https:\/\/cdn\.jsdelivr\.net\/gh\/([^/]+)\/([^/@]+)@[^/]+\/(.+)$/.exec(url);
  if (cdn) return `${cdn[1]}/${cdn[2]}/${cdn[3]}`;
  return null;
}

/**
 * Stubs `fetch` as a set of GitHub repositories: `files` is keyed by
 * `owner/repo/relative/path` and served from every raw/jsDelivr mirror and
 * branch alias, so tests describe repository contents rather than mirror URLs.
 * `extraRoutes` handles non-repository URLs the same way `stubFetch` does.
 */
export function stubRepoFetch(files: Record<string, unknown>, extraRoutes: FetchRoute[] = []): ReturnType<typeof vi.fn> {
  const spy = vi.fn(async (input: RequestInfo | URL): Promise<StubResponse> => {
    const url = String(input);
    const key = repoKeyFromUrl(url);
    if (key && key in files) return okResponse(files[key]);
    const hit = extraRoutes.find(([matcher]) => matches(url, matcher));
    return hit ? okResponse(hit[1]) : NOT_FOUND;
  });
  vi.stubGlobal("fetch", spy);
  return spy;
}

export function requestedUrls(spy: ReturnType<typeof vi.fn>): string[] {
  return spy.mock.calls.map((call) => String(call[0]));
}

/** Minimal config: only what the loaders read. Everything else is cast away. */
export function minimalConfig(overrides: Record<string, unknown> = {}, site: Record<string, unknown> = {}): GitPageDocsConfig {
  return {
    site: { name: "Test", defaultLanguage: "en", rendering: "", ThemeDefault: "aurora-dark", HideThemeSelector: false, ...site },
    routes: [],
    "menus-header": [],
    ...overrides,
  } as unknown as GitPageDocsConfig;
}
