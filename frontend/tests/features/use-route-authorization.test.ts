// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthConfig, ExternalAuthProviderConfig, LoadedDocsData, LoadedPage } from "@/entities/docs";
import { useRouteAuthorization } from "@/features/route-authorization/model/use-route-authorization";

const adapterState = vi.hoisted(() => ({ reject: false }));

// The real adapters run (jwt tokens decode from localStorage); the wrapper only
// lets one test simulate the resolver blowing up.
vi.mock("@/features/route-authorization/infrastructure/external-auth-adapters", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/route-authorization/infrastructure/external-auth-adapters")>();
  return {
    ...actual,
    resolveExternalProviderState: (config: ExternalAuthProviderConfig) =>
      adapterState.reject ? Promise.reject(new Error("adapter exploded")) : actual.resolveExternalProviderState(config),
  };
});

const KEYS_STORAGE = "git-page-docs:route-auth:keys:my-site";
const ROLES_STORAGE = "git-page-docs:route-auth:roles:my-site";
const JWT_STORAGE = "git-page-docs:jwt-token";

const DEFAULT_AUTH: AuthConfig = {
  accessKeys: { "docs-key": "open-sesame" },
  providers: [{ type: "jwt", enabled: true, rolesClaimPath: "roles" }],
};

const MD_ROUTES = [
  { id: 1, title: { en: "Private" }, path: { en: "docs/en/private.md" }, authorization: { accessKeyId: "docs-key" } },
  { id: 2, title: { en: "Open" }, path: { en: "docs/en/open.md" } },
  { id: 3, title: { en: "Staff" }, path: { en: "docs/en/staff.md" }, authorization: { requiredRoles: ["maintainer"] } },
  { id: 4, title: { en: "Members" }, path: { en: "docs/en/members.md" }, authorization: { requireExternalAuth: true } },
  { id: 5, title: { en: "Partners" }, path: { en: "docs/en/partners.md" }, authorization: { allowedProviders: ["authjs"] } },
  { id: 6, title: { en: "Ghost" }, path: { en: "docs/en/ghost.md" }, authorization: { accessKeyId: "ghost-key" } },
];

function encodeJwt(payload: Record<string, unknown>): string {
  const body = btoa(JSON.stringify(payload)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
  return `header.${body}.signature`;
}

function buildData(auth: AuthConfig | undefined = DEFAULT_AUTH, pages?: LoadedPage[]): LoadedDocsData {
  const config = {
    site: {
      name: "My Site",
      langmenu: {
        en: {
          authAccessDenied: "Locked{titleSuffix}: key needed.",
          authEnterAccessKeyFor: "Key for {accessKeyId}:",
        },
      },
    },
    auth,
    "routes-md": MD_ROUTES,
    "routes-html": [],
    "routes-video": [
      { id: 8, title: { en: "Video" }, video: { pathVideo: { en: "media/v.mp4" } }, authorization: { requiredRoles: ["editor"] } },
    ],
    "routes-audio": [],
  };
  const defaultPages = [
    { id: 1, md: { config: MD_ROUTES[0] } },
    { id: 2, md: { config: MD_ROUTES[1] } },
    { id: 3, html: { config: { url: { en: "https://example.com" } } } },
    { id: 4, video: { routeId: 8 } },
    { id: 5 },
  ];
  return { config, pages: pages ?? defaultPages } as unknown as LoadedDocsData;
}

function renderAuth(data = buildData(), query = "") {
  return renderHook(() => useRouteAuthorization(data, "en", new URLSearchParams(query)));
}

beforeEach(() => {
  window.localStorage.clear();
  adapterState.reject = false;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useRouteAuthorization", () => {
  it("resolves enabled providers and merges stored, query and provider roles", async () => {
    window.localStorage.setItem(JWT_STORAGE, encodeJwt({ roles: ["Maintainer"] }));
    window.localStorage.setItem(ROLES_STORAGE, JSON.stringify(["Editor", " "]));
    const { result } = renderAuth(buildData(), "authRoles=Viewer,%20admin,");

    await waitFor(() => expect(result.current.providersResolved).toBe(true));
    expect(result.current.authenticatedProviders).toEqual(["jwt"]);
    expect([...result.current.effectiveRoles].sort()).toEqual(["admin", "editor", "maintainer", "viewer"]);
  });

  it("resolves immediately when no provider is configured", async () => {
    const { result } = renderAuth(buildData({ accessKeys: {} }));
    await waitFor(() => expect(result.current.providersResolved).toBe(true));
    expect(result.current.authenticatedProviders).toEqual([]);
    expect(result.current.effectiveRoles).toEqual([]);
  });

  it("honours a custom rolesStorageKey and ignores malformed stored lists", async () => {
    window.localStorage.setItem("custom-roles", JSON.stringify(["Ops"]));
    const custom = renderAuth(buildData({ rolesStorageKey: "custom-roles" }));
    await waitFor(() => expect(custom.result.current.providersResolved).toBe(true));
    expect(custom.result.current.effectiveRoles).toEqual(["ops"]);

    window.localStorage.setItem(ROLES_STORAGE, "{not json");
    window.localStorage.setItem(KEYS_STORAGE, JSON.stringify({ unexpected: true }));
    const malformed = renderAuth(buildData({ accessKeys: {} }));
    await waitFor(() => expect(malformed.result.current.providersResolved).toBe(true));
    expect(malformed.result.current.effectiveRoles).toEqual([]);
  });

  it("falls back to no providers when the resolver rejects", async () => {
    adapterState.reject = true;
    window.localStorage.setItem(JWT_STORAGE, encodeJwt({ roles: ["Maintainer"] }));
    const { result } = renderAuth();
    await waitFor(() => expect(result.current.providersResolved).toBe(true));
    expect(result.current.authenticatedProviders).toEqual([]);
    expect(result.current.effectiveRoles).toEqual([]);
  });

  it("gates key-protected routes behind the prompt and persists the unlocked key", async () => {
    const prompt = vi.spyOn(window, "prompt").mockReturnValue("nope");
    const { result } = renderAuth();
    await waitFor(() => expect(result.current.providersResolved).toBe(true));

    const initial = result.current.evaluatePathAccess("docs/en/private.md");
    expect(initial).toMatchObject({ allowed: false, reason: "missing_access_key", target: { routeId: 1, contentType: "md" } });
    expect(result.current.evaluatePathAccess("docs/en/open.md")).toMatchObject({ allowed: true });

    let decision = await result.current.ensurePathAccess("docs/en/private.md");
    expect(decision.allowed).toBe(false);
    expect(prompt).toHaveBeenCalledWith("Key for docs-key:");

    prompt.mockReturnValue(null);
    decision = await result.current.ensurePathAccess("docs/en/private.md");
    expect(decision.allowed).toBe(false);

    prompt.mockReturnValue("  open-sesame ");
    await act(async () => {
      decision = await result.current.ensurePathAccess("docs/en/private.md");
    });
    expect(decision.allowed).toBe(true);
    expect(JSON.parse(window.localStorage.getItem(KEYS_STORAGE) ?? "[]")).toEqual(["docs-key"]);
    expect(result.current.evaluatePathAccess("docs/en/private.md").allowed).toBe(true);

    // A later visit reads the persisted key back without prompting.
    prompt.mockClear();
    const revisit = renderAuth();
    await waitFor(() => expect(revisit.result.current.evaluatePathAccess("docs/en/private.md").allowed).toBe(true));
    expect(prompt).not.toHaveBeenCalled();
  });

  it("never prompts for unknown keys or non-key denials", async () => {
    const prompt = vi.spyOn(window, "prompt").mockReturnValue("open-sesame");
    const { result } = renderAuth();
    await waitFor(() => expect(result.current.providersResolved).toBe(true));

    expect((await result.current.ensurePathAccess("docs/en/ghost.md")).reason).toBe("missing_access_key");
    expect((await result.current.ensurePathAccess("docs/en/staff.md")).reason).toBe("missing_roles");
    expect(prompt).not.toHaveBeenCalled();
  });

  it("builds denied messages from the language menu, falling back to defaults", async () => {
    const anonymous = renderAuth();
    await waitFor(() => expect(anonymous.result.current.providersResolved).toBe(true));
    const message = anonymous.result.current.getDeniedMessage;
    expect(message("docs/en/private.md")).toBe("Locked (Private): key needed.");
    expect(message("docs/en/open.md")).toBeUndefined();
    expect(message("docs/en/staff.md")).toBe("Access denied (Staff): missing required roles.");
    expect(message("docs/en/members.md")).toBe("Access denied (Members): external authentication required.");
    expect(message("docs/en/unknown.md")).toBeUndefined();

    window.localStorage.setItem(JWT_STORAGE, encodeJwt({ roles: ["maintainer"] }));
    const signedIn = renderAuth();
    await waitFor(() => expect(signedIn.result.current.authenticatedProviders).toEqual(["jwt"]));
    expect(signedIn.result.current.getDeniedMessage("docs/en/members.md")).toBeUndefined();
    expect(signedIn.result.current.getDeniedMessage("docs/en/staff.md")).toBeUndefined();
    expect(signedIn.result.current.getDeniedMessage("docs/en/partners.md")).toBe(
      "Access denied (Partners): external provider not allowed for this route.",
    );
  });

  it("resolves video routes by media path", async () => {
    const { result } = renderAuth();
    await waitFor(() => expect(result.current.providersResolved).toBe(true));
    expect(result.current.evaluatePathAccess("media/v.mp4")).toMatchObject({
      allowed: false,
      reason: "missing_roles",
      target: { routeId: 8, contentType: "video" },
    });
  });

  it("finds the first accessible page and skips locked ones", async () => {
    const anonymous = renderAuth();
    await waitFor(() => expect(anonymous.result.current.providersResolved).toBe(true));
    const { isPageAccessible, firstAccessiblePageIndex } = anonymous.result.current;
    expect(isPageAccessible(0)).toBe(false);
    expect(isPageAccessible(1)).toBe(true);
    expect(isPageAccessible(2)).toBe(true);
    expect(isPageAccessible(3)).toBe(false);
    expect(isPageAccessible(4)).toBe(true);
    expect(isPageAccessible(99)).toBe(false);
    expect(firstAccessiblePageIndex).toBe(1);

    window.localStorage.setItem(ROLES_STORAGE, JSON.stringify(["Editor"]));
    const editor = renderAuth();
    await waitFor(() => expect(editor.result.current.effectiveRoles).toEqual(["editor"]));
    expect(editor.result.current.isPageAccessible(3)).toBe(true);

    const allLocked = renderAuth(buildData(DEFAULT_AUTH, [{ id: 1, md: { config: MD_ROUTES[0] } }] as unknown as LoadedPage[]));
    await waitFor(() => expect(allLocked.result.current.providersResolved).toBe(true));
    expect(allLocked.result.current.firstAccessiblePageIndex).toBe(0);
  });

  it("keeps working in memory when storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(window, "prompt").mockReturnValue("open-sesame");
    const { result } = renderAuth(buildData(), "authRoles=viewer");
    await waitFor(() => expect(result.current.providersResolved).toBe(true));
    expect(result.current.effectiveRoles).toEqual(["viewer"]);

    let decision = result.current.evaluatePathAccess("docs/en/private.md");
    expect(decision.allowed).toBe(false);
    await act(async () => {
      decision = await result.current.ensurePathAccess("docs/en/private.md");
    });
    expect(decision.allowed).toBe(true);
  });
});
