// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { getVersionFromPath, isKnownVersion, stripVersionFromPath } from "@/widgets/docs-shell/model/version-url";
import { withQuery } from "@/widgets/docs-shell/model/with-query";
import {
  readSavedVersion,
  resolveVersionSyncAction,
  type VersionSyncInput,
} from "@/widgets/docs-shell/model/use-docs-shell-version-sync.helpers";
import { buildVersionChangeParams, selectVersionValue } from "@/widgets/docs-shell/model/use-version-routing.helpers";
import { STORAGE_KEYS, makeVersions } from "./fixtures";

const versions = makeVersions();

describe("withQuery", () => {
  it("appends the query only when there is one", () => {
    expect(withQuery("/docs", new URLSearchParams())).toBe("/docs");
    expect(withQuery("/docs", new URLSearchParams("a=1&b=2"))).toBe("/docs?a=1&b=2");
  });
});

describe("version-url", () => {
  it("reads the trailing version segment", () => {
    expect(getVersionFromPath("/docs/v/v2")).toBe("v2");
    expect(getVersionFromPath("/docs/v/v2/")).toBe("v2");
    expect(getVersionFromPath("/v/v2")).toBe("v2");
    expect(getVersionFromPath("/docs")).toBeUndefined();
    expect(getVersionFromPath("/docs/v/v2/extra")).toBeUndefined();
  });

  it("strips the version segment and any trailing slash", () => {
    expect(stripVersionFromPath("/docs/v/v2")).toBe("/docs");
    expect(stripVersionFromPath("/docs/v/v2/")).toBe("/docs");
    expect(stripVersionFromPath("/docs/")).toBe("/docs");
    expect(stripVersionFromPath("/v/v2")).toBe("");
    expect(stripVersionFromPath("/")).toBe("");
  });

  it("knows only the configured version ids", () => {
    expect(isKnownVersion(versions, "v1")).toBe(true);
    expect(isKnownVersion(versions, "v9")).toBe(false);
    expect(isKnownVersion(versions, "")).toBe(false);
    expect(isKnownVersion(versions, null)).toBe(false);
    expect(isKnownVersion(versions, undefined)).toBe(false);
  });
});

describe("resolveVersionSyncAction", () => {
  function input(overrides: Partial<VersionSyncInput> & { search?: string } = {}): VersionSyncInput {
    const { search = "", ...rest } = overrides;
    return {
      isRemoteRepositorySession: false,
      pathname: "/docs",
      params: new URLSearchParams(search),
      availableVersions: versions,
      savedVersion: null,
      ...rest,
    };
  }

  it("never mutates the params it is given", () => {
    const params = new URLSearchParams("version=v2&lang=pt");
    resolveVersionSyncAction(input({ params }));
    expect(params.toString()).toBe("version=v2&lang=pt");
  });

  describe("remote sessions", () => {
    const remote = { isRemoteRepositorySession: true, pathname: "/r/demo/docs/v/v1" };

    it("hard-redirects when the URL version is known and differs from the path", () => {
      const action = resolveVersionSyncAction(input({ ...remote, search: "version=v2&lang=pt" }));
      expect(action).toMatchObject({ kind: "hard-redirect", path: "/r/demo/docs/v/v2" });
      expect(action?.params.toString()).toBe("lang=pt");

      const unversionedPath = resolveVersionSyncAction(input({ ...remote, pathname: "/r/demo/docs", search: "version=v2" }));
      expect(unversionedPath).toMatchObject({ kind: "hard-redirect", path: "/r/demo/docs/v/v2" });
    });

    it("rewrites the URL to drop an unknown version", () => {
      const action = resolveVersionSyncAction(input({ ...remote, search: "version=v9&lang=pt" }));
      expect(action).toMatchObject({ kind: "rewrite-url", path: "/r/demo/docs/v/v1" });
      expect(action?.params.toString()).toBe("lang=pt");
    });

    it("does nothing when the versions agree or the URL has none, ignoring saved versions", () => {
      expect(resolveVersionSyncAction(input({ ...remote, search: "version=v1" }))).toBeNull();
      expect(resolveVersionSyncAction(input({ ...remote, search: "lang=pt", savedVersion: "v2" }))).toBeNull();
    });
  });

  describe("local sessions", () => {
    it("routes a known URL version into the path", () => {
      const action = resolveVersionSyncAction(input({ search: "version=v2&lang=pt" }));
      expect(action).toMatchObject({ kind: "route", path: "/docs/v/v2" });
      expect(action?.params.toString()).toBe("lang=pt");
      expect(resolveVersionSyncAction(input({ pathname: "/docs/", search: "version=v2" }))).toMatchObject({ path: "/docs/v/v2" });
    });

    it("routes the saved version when the URL has none or an unknown one", () => {
      expect(resolveVersionSyncAction(input({ savedVersion: "v2" }))).toMatchObject({ kind: "route", path: "/docs/v/v2" });
      expect(resolveVersionSyncAction(input({ pathname: "/docs/", search: "version=v9", savedVersion: "v2" }))).toMatchObject({
        path: "/docs/v/v2",
      });
      expect(resolveVersionSyncAction(input({ savedVersion: "v9" }))).toBeNull();
      expect(resolveVersionSyncAction(input({ search: "version=v9" }))).toBeNull();
    });

    it("leaves a path that already carries a version alone", () => {
      expect(resolveVersionSyncAction(input({ pathname: "/docs/v/v1", search: "version=v2", savedVersion: "v2" }))).toBeNull();
    });
  });
});

describe("readSavedVersion", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("reads the stored id and swallows storage failures", () => {
    expect(readSavedVersion(STORAGE_KEYS.version)).toBeNull();
    window.localStorage.setItem(STORAGE_KEYS.version, "v2");
    expect(readSavedVersion(STORAGE_KEYS.version)).toBe("v2");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readSavedVersion(STORAGE_KEYS.version)).toBeNull();
  });
});

describe("selectVersionValue", () => {
  it("prefers the path, then the query, then the active id, then the first version", () => {
    const base = { versionFromPath: undefined, versionFromQuery: null, activeVersionId: undefined, availableVersions: versions };
    expect(selectVersionValue({ ...base, versionFromPath: "v2", versionFromQuery: "v1", activeVersionId: "v1" })).toBe("v2");
    expect(selectVersionValue({ ...base, versionFromPath: "v9", versionFromQuery: "v2", activeVersionId: "v1" })).toBe("v2");
    expect(selectVersionValue({ ...base, versionFromQuery: "v9", activeVersionId: "v2" })).toBe("v2");
    expect(selectVersionValue({ ...base, activeVersionId: "v9" })).toBe("v1");
    expect(selectVersionValue({ ...base, availableVersions: [] })).toBe("");
  });
});

describe("buildVersionChangeParams", () => {
  const current = new URLSearchParams("lang=en&version=v1&x=1");

  it("drops the version and pins the language for remote sessions or a visible selector", () => {
    expect(
      buildVersionChangeParams(current, { isRemoteRepositorySession: true, isLanguageSelectVisible: false, language: "pt" }).toString(),
    ).toBe("lang=pt&x=1");
    expect(
      buildVersionChangeParams(current, { isRemoteRepositorySession: false, isLanguageSelectVisible: true, language: "pt" }).toString(),
    ).toBe("lang=pt&x=1");
    expect(
      buildVersionChangeParams(new URLSearchParams(), { isRemoteRepositorySession: false, isLanguageSelectVisible: true, language: "es" }).toString(),
    ).toBe("lang=es");
  });

  it("removes the language when the selector is hidden locally, without touching the input", () => {
    expect(
      buildVersionChangeParams(current, { isRemoteRepositorySession: false, isLanguageSelectVisible: false, language: "pt" }).toString(),
    ).toBe("x=1");
    expect(current.toString()).toBe("lang=en&version=v1&x=1");
  });
});
