import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveExternalProviderState } from "@/features/route-authorization/infrastructure/external-auth-adapters";
import type { ExternalAuthProviderConfig } from "@/entities/docs";

// Complements frontend/tests/external-auth-adapters.test.ts with the
// session-endpoint and token-storage branches it leaves out.

function encodeJwt(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `header.${body}.signature`;
}

function stubBrowser(storage: Record<string, string> = {}, extras: Record<string, unknown> = {}): void {
  const store = new Map(Object.entries(storage));
  vi.stubGlobal("window", {
    ...extras,
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("jwt provider with a session endpoint", () => {
  const config: ExternalAuthProviderConfig = {
    type: "jwt",
    enabled: true,
    sessionEndpoint: "/api/session",
    rolesClaimPath: "user.roles",
  };

  it("validates the stored token against the endpoint with a Bearer header", async () => {
    stubBrowser({ "git-page-docs:jwt-token": "tok-1" });
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ user: { roles: ["Maintainer", "ops"] } }) }));
    vi.stubGlobal("fetch", fetchMock);

    const state = await resolveExternalProviderState(config);

    expect(state).toEqual({ provider: "jwt", authenticated: true, roles: ["maintainer", "ops"] });
    expect(fetchMock).toHaveBeenCalledWith("/api/session", {
      method: "GET",
      headers: { Authorization: "Bearer tok-1", Accept: "application/json" },
    });
  });

  it("honours a custom header prefix and token storage key", async () => {
    stubBrowser({ "my-app:token": "tok-2" });
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ roles: "admin" }) }));
    vi.stubGlobal("fetch", fetchMock);

    const state = await resolveExternalProviderState({
      ...config,
      tokenStorageKey: "my-app:token",
      authHeaderPrefix: "Token",
      rolesClaimPath: undefined,
    });

    expect(state.roles).toEqual(["admin"]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/session",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Token tok-2" }) }),
    );
  });

  it("surfaces HTTP failures as structured errors", async () => {
    stubBrowser({ "git-page-docs:jwt-token": "tok-1" });
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 403 })));
    expect(await resolveExternalProviderState(config)).toEqual({
      provider: "jwt",
      authenticated: false,
      roles: [],
      error: "session_error_403",
    });
  });

  it("surfaces network failures as structured errors", async () => {
    stubBrowser({ "git-page-docs:jwt-token": "tok-1" });
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("offline"))));
    expect((await resolveExternalProviderState(config)).error).toBe("session_request_failed");
  });

  it("does not call the endpoint without a stored token", async () => {
    stubBrowser();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await resolveExternalProviderState(config)).toEqual({ provider: "jwt", authenticated: false, roles: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("firebase provider token fallback", () => {
  const config: ExternalAuthProviderConfig = { type: "firebase", enabled: true, rolesClaimPath: "roles" };

  it("is unauthenticated without a user object or a stored token", async () => {
    stubBrowser();
    expect(await resolveExternalProviderState(config)).toEqual({ provider: "firebase", authenticated: false, roles: [] });
  });

  it("flags a malformed stored token", async () => {
    stubBrowser({ "git-page-docs:firebase-token": "header.%%%.sig" });
    expect(await resolveExternalProviderState(config)).toEqual({
      provider: "firebase",
      authenticated: false,
      roles: [],
      error: "invalid_token",
    });
  });

  it("reads a token from a custom storage key", async () => {
    stubBrowser({ "app:fb": encodeJwt({ roles: ["Editor"] }) });
    expect(await resolveExternalProviderState({ ...config, tokenStorageKey: "app:fb" })).toEqual({
      provider: "firebase",
      authenticated: true,
      roles: ["editor"],
    });
  });

  it("returns no roles when the claim holds an unsupported value", async () => {
    stubBrowser({}, { __GITPAGEDOCS_FIREBASE_USER__: { roles: 42, role: { nested: true } } });
    expect(await resolveExternalProviderState(config)).toEqual({ provider: "firebase", authenticated: true, roles: [] });
  });
});

describe("clerk provider", () => {
  it("reads roles from the session claims through the fallback candidates", async () => {
    stubBrowser({}, { Clerk: { user: { id: "u1" }, sessionClaims: { roles: ["Owner"] } } });
    const state = await resolveExternalProviderState({ type: "clerk", enabled: true });
    expect(state).toEqual({ provider: "clerk", authenticated: true, roles: ["owner"] });
  });
});
