"use client";

import type { ExternalAuthProviderConfig, ExternalAuthProviderType } from "@/entities/docs";
import type { ExternalProviderState } from "../model/types";

function readPath(input: unknown, path: string): unknown {
  const parts = path.split(".").map((part) => part.trim()).filter(Boolean);
  let current: unknown = input;
  for (const part of parts) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function normalizeRoles(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((value) => String(value).trim().toLowerCase())
      .filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(/[,\s]+/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payloadRaw = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    const decoded = atob(payloadRaw);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractRoles(payload: unknown, claimPath?: string): string[] {
  if (claimPath) {
    const byPath = normalizeRoles(readPath(payload, claimPath));
    if (byPath.length) return byPath;
  }
  const fallbackCandidates = [
    "roles",
    "role",
    "user.roles",
    "user.role",
    "app_metadata.roles",
    "publicMetadata.roles",
    "claims.roles",
  ];
  for (const key of fallbackCandidates) {
    const roles = normalizeRoles(readPath(payload, key));
    if (roles.length) return roles;
  }
  return [];
}

async function resolveAuthJsState(config: ExternalAuthProviderConfig): Promise<ExternalProviderState> {
  const endpoint = config.sessionEndpoint ?? "/api/auth/session";
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      return {
        provider: "authjs",
        authenticated: false,
        roles: [],
        error: `session_error_${response.status}`,
      };
    }
    const payload = await response.json();
    const authenticated = Boolean(payload && (payload.user || payload.expires || payload.authenticated === true));
    return {
      provider: "authjs",
      authenticated,
      roles: authenticated ? extractRoles(payload, config.rolesClaimPath) : [],
    };
  } catch {
    return { provider: "authjs", authenticated: false, roles: [], error: "session_request_failed" };
  }
}

function resolveClerkState(config: ExternalAuthProviderConfig): ExternalProviderState {
  const clerk = (window as Window & { Clerk?: Record<string, unknown> }).Clerk;
  const user = clerk?.user as Record<string, unknown> | undefined;
  const sessionClaims = clerk?.sessionClaims;
  const authenticated = Boolean(user);
  const roles = authenticated
    ? extractRoles(
        {
          user,
          claims: sessionClaims,
        },
        config.rolesClaimPath,
      )
    : [];
  return { provider: "clerk", authenticated, roles };
}

function resolveFirebaseState(config: ExternalAuthProviderConfig): ExternalProviderState {
  const firebaseUser = (window as Window & { __GITPAGEDOCS_FIREBASE_USER__?: unknown })
    .__GITPAGEDOCS_FIREBASE_USER__;
  if (firebaseUser && typeof firebaseUser === "object") {
    return {
      provider: "firebase",
      authenticated: true,
      roles: extractRoles(firebaseUser, config.rolesClaimPath),
    };
  }

  const tokenStorageKey = config.tokenStorageKey ?? "git-page-docs:firebase-token";
  const token = window.localStorage.getItem(tokenStorageKey);
  if (!token) {
    return { provider: "firebase", authenticated: false, roles: [] };
  }
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return { provider: "firebase", authenticated: false, roles: [], error: "invalid_token" };
  }
  return {
    provider: "firebase",
    authenticated: true,
    roles: extractRoles(payload, config.rolesClaimPath),
  };
}

async function resolveJwtState(config: ExternalAuthProviderConfig): Promise<ExternalProviderState> {
  const tokenStorageKey = config.tokenStorageKey ?? "git-page-docs:jwt-token";
  const token = window.localStorage.getItem(tokenStorageKey);
  if (!token) {
    return { provider: "jwt", authenticated: false, roles: [] };
  }

  if (config.sessionEndpoint) {
    try {
      const prefix = config.authHeaderPrefix ?? "Bearer";
      const response = await fetch(config.sessionEndpoint, {
        method: "GET",
        headers: {
          Authorization: `${prefix} ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        return {
          provider: "jwt",
          authenticated: false,
          roles: [],
          error: `session_error_${response.status}`,
        };
      }
      const payload = await response.json();
      return {
        provider: "jwt",
        authenticated: true,
        roles: extractRoles(payload, config.rolesClaimPath),
      };
    } catch {
      return { provider: "jwt", authenticated: false, roles: [], error: "session_request_failed" };
    }
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return { provider: "jwt", authenticated: false, roles: [], error: "invalid_token" };
  }
  return {
    provider: "jwt",
    authenticated: true,
    roles: extractRoles(payload, config.rolesClaimPath),
  };
}

export async function resolveExternalProviderState(
  providerConfig: ExternalAuthProviderConfig,
): Promise<ExternalProviderState> {
  if (providerConfig.enabled === false) {
    return {
      provider: providerConfig.type,
      authenticated: false,
      roles: [],
      error: "provider_disabled",
    };
  }

  const provider: ExternalAuthProviderType = providerConfig.type;
  if (provider === "authjs") return resolveAuthJsState(providerConfig);
  if (provider === "clerk") return resolveClerkState(providerConfig);
  if (provider === "firebase") return resolveFirebaseState(providerConfig);
  return resolveJwtState(providerConfig);
}
