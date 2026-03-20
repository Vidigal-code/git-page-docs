"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AuthConfig,
  ExternalAuthProviderType,
  LanguageCode,
  LoadedDocsData,
} from "@/entities/docs";
import { resolveExternalProviderState } from "../infrastructure/external-auth-adapters";
import { evaluateRouteAccess } from "./access-policy";
import { resolveRouteAuthorizationTarget } from "./resolve-route-authorization";
import type { ExternalProviderState, RouteAccessDeniedReason } from "./types";

const ACCESS_KEYS_STORAGE_PREFIX = "git-page-docs:route-auth:keys";
const ROLES_STORAGE_PREFIX = "git-page-docs:route-auth:roles";

function normalizeSiteName(siteName: string): string {
  return siteName.toLowerCase().replaceAll(" ", "-");
}

function buildKeysStorageKey(siteName: string): string {
  return `${ACCESS_KEYS_STORAGE_PREFIX}:${normalizeSiteName(siteName)}`;
}

function buildRolesStorageKey(siteName: string, authConfig: AuthConfig | undefined): string {
  return authConfig?.rolesStorageKey ?? `${ROLES_STORAGE_PREFIX}:${normalizeSiteName(siteName)}`;
}

function parseStoredList(rawValue: string | null): string[] {
  if (!rawValue) return [];
  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => String(item).trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function parseRolesFromQuery(searchParams: URLSearchParams): string[] {
  const value = searchParams.get("authRoles");
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}

function toLowerUnique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean)));
}

function reasonMessage(reason: RouteAccessDeniedReason, language: LanguageCode, routeTitle?: string): string {
  const titleSuffix = routeTitle ? ` (${routeTitle})` : "";
  if (reason === "missing_access_key") {
    if (language === "pt") return `Acesso negado${titleSuffix}: chave de acesso obrigatória.`;
    if (language === "es") return `Acceso denegado${titleSuffix}: se requiere clave de acceso.`;
    return `Access denied${titleSuffix}: access key required.`;
  }
  if (reason === "missing_roles") {
    if (language === "pt") return `Acesso negado${titleSuffix}: papéis insuficientes.`;
    if (language === "es") return `Acceso denegado${titleSuffix}: roles insuficientes.`;
    return `Access denied${titleSuffix}: missing required roles.`;
  }
  if (reason === "provider_not_allowed") {
    if (language === "pt") return `Acesso negado${titleSuffix}: provedor externo não autorizado para esta rota.`;
    if (language === "es") return `Acceso denegado${titleSuffix}: proveedor externo no permitido para esta ruta.`;
    return `Access denied${titleSuffix}: external provider not allowed for this route.`;
  }
  if (language === "pt") return `Acesso negado${titleSuffix}: autenticação externa obrigatória.`;
  if (language === "es") return `Acceso denegado${titleSuffix}: autenticación externa requerida.`;
  return `Access denied${titleSuffix}: external authentication required.`;
}

export function useRouteAuthorization(data: LoadedDocsData, language: LanguageCode, searchParams: URLSearchParams) {
  const authConfig = data.config.auth;
  const siteName = data.config.site.name;
  const [unlockedKeyIds, setUnlockedKeyIds] = useState<string[]>([]);
  const [storedRoles, setStoredRoles] = useState<string[]>([]);
  const [providerStates, setProviderStates] = useState<ExternalProviderState[]>([]);
  const [providersResolved, setProvidersResolved] = useState(false);

  const keysStorageKey = useMemo(() => buildKeysStorageKey(siteName), [siteName]);
  const rolesStorageKey = useMemo(() => buildRolesStorageKey(siteName, authConfig), [siteName, authConfig]);

  useEffect(() => {
    try {
      setUnlockedKeyIds(parseStoredList(window.localStorage.getItem(keysStorageKey)));
    } catch {
      setUnlockedKeyIds([]);
    }
  }, [keysStorageKey]);

  useEffect(() => {
    try {
      setStoredRoles(
        parseStoredList(window.localStorage.getItem(rolesStorageKey)).map((role) => role.toLowerCase()),
      );
    } catch {
      setStoredRoles([]);
    }
  }, [rolesStorageKey]);

  const queryRoles = useMemo(() => parseRolesFromQuery(searchParams), [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const providers = (authConfig?.providers ?? []).filter((provider) => provider.enabled !== false);
    if (!providers.length) {
      setProviderStates([]);
      setProvidersResolved(true);
      return () => {
        cancelled = true;
      };
    }

    setProvidersResolved(false);
    Promise.all(providers.map((provider) => resolveExternalProviderState(provider)))
      .then((states) => {
        if (cancelled) return;
        setProviderStates(states);
        setProvidersResolved(true);
      })
      .catch(() => {
        if (cancelled) return;
        setProviderStates([]);
        setProvidersResolved(true);
      });

    return () => {
      cancelled = true;
    };
  }, [authConfig?.providers]);

  const providerRoles = useMemo(
    () =>
      providerStates
        .filter((provider) => provider.authenticated)
        .flatMap((provider) => provider.roles)
        .map((role) => role.toLowerCase()),
    [providerStates],
  );
  const authenticatedProviders = useMemo<ExternalAuthProviderType[]>(
    () =>
      providerStates
        .filter((provider) => provider.authenticated)
        .map((provider) => provider.provider),
    [providerStates],
  );
  const effectiveRoles = useMemo(
    () => toLowerUnique([...storedRoles, ...queryRoles, ...providerRoles]),
    [storedRoles, queryRoles, providerRoles],
  );

  const persistUnlockedKeys = useCallback(
    (nextKeys: string[]) => {
      try {
        window.localStorage.setItem(keysStorageKey, JSON.stringify(nextKeys));
      } catch {
        // Ignore storage failures (private mode, blocked storage).
      }
    },
    [keysStorageKey],
  );

  const tryUnlockAccessKey = useCallback(
    (accessKeyId: string): boolean => {
      const expected = authConfig?.accessKeys?.[accessKeyId];
      if (!expected) return false;
      const promptLabel =
        language === "pt"
          ? `Digite a chave de acesso para "${accessKeyId}":`
          : language === "es"
            ? `Ingresa la clave de acceso para "${accessKeyId}":`
            : `Enter access key for "${accessKeyId}":`;
      const input = window.prompt(promptLabel);
      if (typeof input !== "string") return false;
      if (input.trim() !== expected) return false;

      const updated = unique([...unlockedKeyIds, accessKeyId]);
      setUnlockedKeyIds(updated);
      persistUnlockedKeys(updated);
      return true;
    },
    [authConfig?.accessKeys, language, persistUnlockedKeys, unlockedKeyIds],
  );

  const evaluatePathAccess = useCallback(
    (pathClick: string) => {
      const target = resolveRouteAuthorizationTarget(data, pathClick, language);
      const result = evaluateRouteAccess(target?.authorization, authConfig, {
        unlockedKeyIds,
        roles: effectiveRoles,
        authenticatedProviders,
      });
      return { ...result, target };
    },
    [authConfig, authenticatedProviders, data, effectiveRoles, language, unlockedKeyIds],
  );

  const ensurePathAccess = useCallback(
    async (pathClick: string) => {
      const initial = evaluatePathAccess(pathClick);
      if (initial.allowed) return initial;

      const accessKeyId = initial.target?.authorization?.accessKeyId;
      if (initial.reason === "missing_access_key" && accessKeyId) {
        const unlocked = tryUnlockAccessKey(accessKeyId);
        if (unlocked) {
          return evaluatePathAccess(pathClick);
        }
      }
      return initial;
    },
    [evaluatePathAccess, tryUnlockAccessKey],
  );

  const isPageAccessible = useCallback(
    (pageIndex: number): boolean => {
      const page = data.pages?.[pageIndex];
      if (!page) return false;
      const candidates = [
        page.md?.config?.path?.[language] ?? page.md?.config?.path?.en,
        page.html?.config?.path?.[language] ?? page.html?.config?.path?.en,
        page.html?.config?.url?.[language] ?? page.html?.config?.url?.en,
        page.video ? `page:${page.video.routeId}` : undefined,
      ].filter((candidate): candidate is string => Boolean(candidate));

      if (!candidates.length) return true;
      return candidates.some((candidate) => evaluatePathAccess(candidate).allowed);
    },
    [data.pages, evaluatePathAccess, language],
  );

  const firstAccessiblePageIndex = useMemo(() => {
    for (let index = 0; index < (data.pages?.length ?? 0); index += 1) {
      if (isPageAccessible(index)) return index;
    }
    return 0;
  }, [data.pages, isPageAccessible]);

  const getDeniedMessage = useCallback(
    (pathClick: string) => {
      const decision = evaluatePathAccess(pathClick);
      if (decision.allowed || !decision.reason) return undefined;
      return reasonMessage(decision.reason, language, decision.target?.title);
    },
    [evaluatePathAccess, language],
  );

  return {
    providersResolved,
    effectiveRoles,
    authenticatedProviders,
    evaluatePathAccess,
    ensurePathAccess,
    isPageAccessible,
    firstAccessiblePageIndex,
    getDeniedMessage,
  };
}
