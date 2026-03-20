import type {
  ExternalAuthProviderType,
  RouteAuthorizationConfig,
} from "@/entities/docs";

export type RouteAccessDeniedReason =
  | "missing_access_key"
  | "missing_roles"
  | "external_auth_required"
  | "provider_not_allowed";

export interface ExternalProviderState {
  provider: ExternalAuthProviderType;
  authenticated: boolean;
  roles: string[];
  error?: string;
}

export interface RouteAuthSession {
  unlockedKeyIds: string[];
  roles: string[];
  authenticatedProviders: ExternalAuthProviderType[];
}

export interface RouteAuthorizationTarget {
  routeId: number;
  contentType: "md" | "html" | "video" | "audio";
  authorization?: RouteAuthorizationConfig;
  title?: string;
}

export interface RouteAccessResult {
  allowed: boolean;
  reason?: RouteAccessDeniedReason;
}
