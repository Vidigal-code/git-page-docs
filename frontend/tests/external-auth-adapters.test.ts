import { describe, it, expect, afterEach, vi } from "vitest";
import { resolveExternalProviderState } from "@/features/route-authorization/infrastructure/external-auth-adapters";
import type { ExternalAuthProviderConfig } from "@/entities/docs";

function encodeJwt(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `header.${body}.signature`;
}

function stubBrowser(overrides: { Clerk?: unknown; firebaseUser?: unknown; storage?: Record<string, string> }): void {
  const store = new Map(Object.entries(overrides.storage ?? {}));
  vi.stubGlobal("window", {
    Clerk: overrides.Clerk,
    __GITPAGEDOCS_FIREBASE_USER__: overrides.firebaseUser,
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("resolveExternalProviderState", () => {
  it("reports a disabled provider without touching the environment", async () => {
    const state = await resolveExternalProviderState({ type: "clerk", enabled: false });
    expect(state).toEqual({ provider: "clerk", authenticated: false, roles: [], error: "provider_disabled" });
  });

  describe("clerk", () => {
    const config: ExternalAuthProviderConfig = {
      type: "clerk",
      enabled: true,
      rolesClaimPath: "claims.publicMetadata.roles",
    };

    it("is unauthenticated when Clerk has no user", async () => {
      stubBrowser({ Clerk: {} });
      const state = await resolveExternalProviderState(config);
      expect(state).toEqual({ provider: "clerk", authenticated: false, roles: [] });
    });

    it("extracts roles from session claims via the configured claim path", async () => {
      stubBrowser({
        Clerk: {
          user: { id: "user_1" },
          sessionClaims: { publicMetadata: { roles: ["Maintainer", "editor"] } },
        },
      });
      const state = await resolveExternalProviderState(config);
      expect(state.authenticated).toBe(true);
      expect(state.roles).toEqual(["maintainer", "editor"]);
    });

    it("falls back to well-known role locations when the claim path is empty", async () => {
      stubBrowser({ Clerk: { user: { id: "user_1", roles: "admin, maintainer" } } });
      const state = await resolveExternalProviderState({ type: "clerk", enabled: true });
      expect(state.roles).toEqual(["admin", "maintainer"]);
    });
  });

  describe("jwt (local token)", () => {
    const config: ExternalAuthProviderConfig = { type: "jwt", enabled: true, rolesClaimPath: "roles" };
    const storageKey = "git-page-docs:jwt-token";

    it("is unauthenticated without a stored token", async () => {
      stubBrowser({});
      expect(await resolveExternalProviderState(config)).toEqual({ provider: "jwt", authenticated: false, roles: [] });
    });

    it("decodes roles from a stored JWT payload", async () => {
      stubBrowser({ storage: { [storageKey]: encodeJwt({ roles: ["maintainer"] }) } });
      const state = await resolveExternalProviderState(config);
      expect(state).toEqual({ provider: "jwt", authenticated: true, roles: ["maintainer"] });
    });

    it("flags malformed tokens instead of throwing", async () => {
      stubBrowser({ storage: { [storageKey]: "not-a-jwt" } });
      const state = await resolveExternalProviderState(config);
      expect(state.authenticated).toBe(false);
      expect(state.error).toBe("invalid_token");
    });
  });

  describe("firebase", () => {
    it("reads roles from an injected firebase user", async () => {
      stubBrowser({ firebaseUser: { roles: ["maintainer"] } });
      const state = await resolveExternalProviderState({ type: "firebase", enabled: true, rolesClaimPath: "roles" });
      expect(state).toEqual({ provider: "firebase", authenticated: true, roles: ["maintainer"] });
    });

    it("falls back to the stored token when no user object is present", async () => {
      stubBrowser({ storage: { "git-page-docs:firebase-token": encodeJwt({ roles: ["viewer"] }) } });
      const state = await resolveExternalProviderState({ type: "firebase", enabled: true, rolesClaimPath: "roles" });
      expect(state).toEqual({ provider: "firebase", authenticated: true, roles: ["viewer"] });
    });
  });

  describe("authjs", () => {
    const config: ExternalAuthProviderConfig = {
      type: "authjs",
      enabled: true,
      sessionEndpoint: "/api/auth/session",
      rolesClaimPath: "user.roles",
    };

    it("authenticates from a valid session payload", async () => {
      stubBrowser({});
      vi.stubGlobal("fetch", vi.fn(async () => ({
        ok: true,
        json: async () => ({ user: { roles: ["maintainer"] }, expires: "2099-01-01" }),
      })));
      const state = await resolveExternalProviderState(config);
      expect(state).toEqual({ provider: "authjs", authenticated: true, roles: ["maintainer"] });
    });

    it("surfaces HTTP failures as structured errors", async () => {
      stubBrowser({});
      vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 401 })));
      const state = await resolveExternalProviderState(config);
      expect(state.error).toBe("session_error_401");
    });

    it("surfaces network failures as structured errors", async () => {
      stubBrowser({});
      vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("offline"))));
      const state = await resolveExternalProviderState(config);
      expect(state.error).toBe("session_request_failed");
    });
  });
});
