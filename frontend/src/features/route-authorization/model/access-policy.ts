import type { AuthConfig, RouteAuthorizationConfig } from "@/entities/docs";
import type { RouteAccessResult, RouteAuthSession } from "./types";

function normalize(values: string[] | undefined): string[] {
  return (values ?? [])
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function hasAllRequiredRoles(requiredRoles: string[], currentRoles: string[]): boolean {
  if (!requiredRoles.length) return true;
  const roleSet = new Set(normalize(currentRoles));
  return normalize(requiredRoles).every((role) => roleSet.has(role));
}

export function evaluateRouteAccess(
  routeAuthorization: RouteAuthorizationConfig | undefined,
  authConfig: AuthConfig | undefined,
  session: RouteAuthSession,
): RouteAccessResult {
  if (!routeAuthorization || routeAuthorization.enabled === false) {
    return { allowed: true };
  }

  const accessKeyId = routeAuthorization.accessKeyId?.trim();
  if (accessKeyId) {
    const unlocked = session.unlockedKeyIds.includes(accessKeyId);
    if (!unlocked) {
      return { allowed: false, reason: "missing_access_key" };
    }
  }

  if (routeAuthorization.requiredRoles?.length) {
    const rolesOk = hasAllRequiredRoles(routeAuthorization.requiredRoles, session.roles);
    if (!rolesOk) {
      return { allowed: false, reason: "missing_roles" };
    }
  }

  const providerRulesEnabled =
    routeAuthorization.requireExternalAuth === true ||
    (routeAuthorization.allowedProviders?.length ?? 0) > 0;
  if (providerRulesEnabled) {
    const configuredProviders = (authConfig?.providers ?? [])
      .filter((provider) => provider.enabled !== false)
      .map((provider) => provider.type);
    const providerSet = new Set(session.authenticatedProviders);
    const authenticatedConfiguredProviders = configuredProviders.filter((provider) => providerSet.has(provider));

    if (!authenticatedConfiguredProviders.length) {
      return { allowed: false, reason: "external_auth_required" };
    }

    const allowedProviders = routeAuthorization.allowedProviders ?? [];
    if (allowedProviders.length > 0) {
      const allowedProviderSet = new Set(allowedProviders);
      const hasAllowedProvider = authenticatedConfiguredProviders.some((provider) =>
        allowedProviderSet.has(provider),
      );
      if (!hasAllowedProvider) {
        return { allowed: false, reason: "provider_not_allowed" };
      }
    }
  }

  return { allowed: true };
}
