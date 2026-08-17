import { describe, it, expect } from "vitest";
import { evaluateRouteAccess } from "@/features/route-authorization/model/access-policy";
import { resolveRouteAuthorizationTarget } from "@/features/route-authorization/model/resolve-route-authorization";
import type { RouteAuthSession } from "@/features/route-authorization/model/types";
import type { AuthConfig, LoadedDocsData, RouteAuthorizationConfig } from "@/entities/docs";

const OPEN_SESSION: RouteAuthSession = { unlockedKeyIds: [], roles: [], authenticatedProviders: [] };

const AUTH_CONFIG: AuthConfig = {
  accessKeys: { "docs-key": "open-gitpagedocs-docs" },
  providers: [
    { type: "authjs", enabled: true },
    { type: "jwt", enabled: true },
    { type: "clerk", enabled: false },
  ],
};

describe("evaluateRouteAccess", () => {
  it("allows routes without authorization or with authorization disabled", () => {
    expect(evaluateRouteAccess(undefined, AUTH_CONFIG, OPEN_SESSION)).toEqual({ allowed: true });
    expect(evaluateRouteAccess({ enabled: false, requiredRoles: ["maintainer"] }, AUTH_CONFIG, OPEN_SESSION)).toEqual({
      allowed: true,
    });
  });

  it("denies until the access key is unlocked", () => {
    const authorization: RouteAuthorizationConfig = { accessKeyId: "docs-key" };
    expect(evaluateRouteAccess(authorization, AUTH_CONFIG, OPEN_SESSION)).toEqual({
      allowed: false,
      reason: "missing_access_key",
    });
    expect(
      evaluateRouteAccess(authorization, AUTH_CONFIG, { ...OPEN_SESSION, unlockedKeyIds: ["docs-key"] }),
    ).toEqual({ allowed: true });
  });

  it("requires every listed role, matching case-insensitively", () => {
    const authorization: RouteAuthorizationConfig = { requiredRoles: ["Maintainer", "editor"] };
    expect(evaluateRouteAccess(authorization, AUTH_CONFIG, { ...OPEN_SESSION, roles: ["maintainer"] })).toEqual({
      allowed: false,
      reason: "missing_roles",
    });
    expect(
      evaluateRouteAccess(authorization, AUTH_CONFIG, { ...OPEN_SESSION, roles: ["MAINTAINER", " Editor "] }),
    ).toEqual({ allowed: true });
  });

  it("requires an authenticated configured external provider", () => {
    const authorization: RouteAuthorizationConfig = { requireExternalAuth: true };
    expect(evaluateRouteAccess(authorization, AUTH_CONFIG, OPEN_SESSION)).toEqual({
      allowed: false,
      reason: "external_auth_required",
    });
    // clerk is configured but disabled, so it must not satisfy the rule.
    expect(
      evaluateRouteAccess(authorization, AUTH_CONFIG, { ...OPEN_SESSION, authenticatedProviders: ["clerk"] }),
    ).toEqual({ allowed: false, reason: "external_auth_required" });
    expect(
      evaluateRouteAccess(authorization, AUTH_CONFIG, { ...OPEN_SESSION, authenticatedProviders: ["jwt"] }),
    ).toEqual({ allowed: true });
  });

  it("restricts to the allowedProviders list when present", () => {
    const authorization: RouteAuthorizationConfig = { allowedProviders: ["authjs"] };
    expect(
      evaluateRouteAccess(authorization, AUTH_CONFIG, { ...OPEN_SESSION, authenticatedProviders: ["jwt"] }),
    ).toEqual({ allowed: false, reason: "provider_not_allowed" });
    expect(
      evaluateRouteAccess(authorization, AUTH_CONFIG, { ...OPEN_SESSION, authenticatedProviders: ["authjs"] }),
    ).toEqual({ allowed: true });
  });

  it("enforces the full key + roles + external-auth combination (scaffolded route 6)", () => {
    const authorization: RouteAuthorizationConfig = {
      accessKeyId: "docs-key",
      requiredRoles: ["maintainer"],
      requireExternalAuth: true,
      allowedProviders: ["authjs", "jwt"],
    };
    const unlocked: RouteAuthSession = {
      unlockedKeyIds: ["docs-key"],
      roles: ["maintainer"],
      authenticatedProviders: ["jwt"],
    };
    expect(evaluateRouteAccess(authorization, AUTH_CONFIG, OPEN_SESSION).reason).toBe("missing_access_key");
    expect(evaluateRouteAccess(authorization, AUTH_CONFIG, { ...unlocked, roles: [] }).reason).toBe("missing_roles");
    expect(evaluateRouteAccess(authorization, AUTH_CONFIG, { ...unlocked, authenticatedProviders: [] }).reason).toBe(
      "external_auth_required",
    );
    expect(evaluateRouteAccess(authorization, AUTH_CONFIG, unlocked)).toEqual({ allowed: true });
  });
});

function buildDocsData(): LoadedDocsData {
  const config = {
    auth: AUTH_CONFIG,
    "routes-md": [
      {
        id: 6,
        title: { en: "Authorized Routes", pt: "Rotas autorizadas" },
        path: { en: "docs/en/authorized-routes.md", pt: "docs/pt/authorized-routes.md" },
        authorization: { accessKeyId: "docs-key" },
      },
    ],
    "routes-html": [
      { id: 2, title: { en: "External" }, url: { en: "https://example.com/page" } },
    ],
    "routes-video": [
      { id: 8, title: { en: "Video" }, authorization: { requireExternalAuth: true } },
    ],
    "routes-audio": [
      { id: 12, title: { en: "Audio" }, audio: { pathAudio: { en: "media/audio-en.mp3" } } },
    ],
  };
  return { config } as unknown as LoadedDocsData;
}

describe("resolveRouteAuthorizationTarget", () => {
  const data = buildDocsData();

  it("resolves markdown routes by localized path", () => {
    const target = resolveRouteAuthorizationTarget(data, "docs/pt/authorized-routes.md", "en");
    expect(target?.routeId).toBe(6);
    expect(target?.contentType).toBe("md");
    expect(target?.authorization?.accessKeyId).toBe("docs-key");
    expect(target?.title).toBe("Authorized Routes");
  });

  it("resolves page:<id> references to video routes with their authorization", () => {
    const target = resolveRouteAuthorizationTarget(data, "page:8", "en");
    expect(target?.contentType).toBe("video");
    expect(target?.authorization?.requireExternalAuth).toBe(true);
  });

  it("resolves html routes by url and audio routes by media path", () => {
    expect(resolveRouteAuthorizationTarget(data, "url:https://example.com/page", "en")?.contentType).toBe("html");
    expect(resolveRouteAuthorizationTarget(data, "media/audio-en.mp3", "en")?.contentType).toBe("audio");
  });

  it("returns undefined for unknown targets", () => {
    expect(resolveRouteAuthorizationTarget(data, "docs/en/unknown.md", "en")).toBeUndefined();
    expect(resolveRouteAuthorizationTarget(data, "page:999", "en")).toBeUndefined();
  });
});
