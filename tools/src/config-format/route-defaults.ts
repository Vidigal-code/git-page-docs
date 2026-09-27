/**
 * Shared route settings written once per config.
 *
 * Routes of a version config repeat the same presentation settings (title and
 * description CSS, positions, visibility, margins, flags). `factorRouteDefaults`
 * moves every setting that all routes share into `routeDefaults`, and
 * `applyRouteDefaults` puts it back: `{ ...routeDefaults, ...route }`, so a value
 * written on a route always wins.
 */

type ConfigRecord = Record<string, unknown>;

export const ROUTE_DEFAULTS_KEY = "routeDefaults";

/** Every route list a config can carry (`routes` is the markdown alias). */
export const ROUTE_LIST_KEYS = [
  "routes-md",
  "routes-source-viewer",
  "routes-html",
  "routes-video",
  "routes-audio",
  "routes",
] as const;

/** Per-route identity: never shared, even when two routes happen to agree. */
const ROUTE_IDENTITY_KEYS: ReadonlySet<string> = new Set(["id", "title", "description", "path", "url"]);

/** Fewer routes than this leave nothing worth sharing. */
const MIN_ROUTES_TO_FACTOR = 2;

function isPlainObject(value: unknown): value is ConfigRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function routeLists(config: ConfigRecord): ConfigRecord[][] {
  return ROUTE_LIST_KEYS.flatMap((key) => {
    const list = config[key];
    return Array.isArray(list) ? [list.filter(isPlainObject)] : [];
  });
}

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Settings present with the same value on every route. */
function sharedSettings(routes: ConfigRecord[]): ConfigRecord {
  const [first, ...rest] = routes;
  const shared: ConfigRecord = {};
  for (const [key, value] of Object.entries(first)) {
    if (ROUTE_IDENTITY_KEYS.has(key)) continue;
    if (rest.every((route) => key in route && sameValue(route[key], value))) shared[key] = value;
  }
  return shared;
}

function mapRouteLists(config: ConfigRecord, mapRoute: (route: ConfigRecord) => ConfigRecord): ConfigRecord {
  const out: ConfigRecord = { ...config };
  for (const key of ROUTE_LIST_KEYS) {
    const list = config[key];
    if (Array.isArray(list)) out[key] = list.map((route) => (isPlainObject(route) ? mapRoute(route) : route));
  }
  return out;
}

/** Moves the settings every route shares into `routeDefaults` (placed before the first route list). */
export function factorRouteDefaults<T>(config: T): ConfigRecord | T {
  if (!isPlainObject(config) || ROUTE_DEFAULTS_KEY in config) return config;
  const routes = routeLists(config).flat();
  if (routes.length < MIN_ROUTES_TO_FACTOR) return config;
  const shared = sharedSettings(routes);
  const sharedKeys = Object.keys(shared);
  if (sharedKeys.length === 0) return config;

  const stripped = mapRouteLists(config, (route) =>
    Object.fromEntries(Object.entries(route).filter(([key]) => !sharedKeys.includes(key))),
  );
  const out: ConfigRecord = {};
  for (const [key, value] of Object.entries(stripped)) {
    if (!(ROUTE_DEFAULTS_KEY in out) && (ROUTE_LIST_KEYS as readonly string[]).includes(key)) out[ROUTE_DEFAULTS_KEY] = shared;
    out[key] = value;
  }
  return out;
}

/** Applies `routeDefaults` under every route and drops the key; configs without it are returned as is. */
export function applyRouteDefaults<T>(config: T): ConfigRecord | T {
  if (!isPlainObject(config)) return config;
  const defaults = config[ROUTE_DEFAULTS_KEY];
  if (!isPlainObject(defaults)) return config;
  const applied = mapRouteLists(config, (route) => ({ ...defaults, ...route }));
  delete applied[ROUTE_DEFAULTS_KEY];
  return applied;
}
