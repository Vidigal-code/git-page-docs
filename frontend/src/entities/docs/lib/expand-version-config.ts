import { applyRouteDefaults } from "@gitpagedocs/tools/config-format";

/**
 * Version configs are stored with the settings every route shares in
 * `routeDefaults`; readers get complete routes. Browser-safe, so both the
 * local (fs) and the remote (fetch) version readers use it.
 */
export function expandVersionConfig<T extends object>(stored: T): T {
  return applyRouteDefaults(stored as Record<string, unknown>) as T;
}
