import type { IconType } from "react-icons";

type IconModule = Record<string, unknown>;

const ICON_IMPORTERS: Record<string, () => Promise<IconModule>> = {
  Fa6: () => import("react-icons/fa6"),
  Fa: () => import("react-icons/fa"),
  Bs: () => import("react-icons/bs"),
  Fi: () => import("react-icons/fi"),
  Ai: () => import("react-icons/ai"),
  Bi: () => import("react-icons/bi"),
  Ci: () => import("react-icons/ci"),
  Di: () => import("react-icons/di"),
  Fc: () => import("react-icons/fc"),
  Gi: () => import("react-icons/gi"),
  Go: () => import("react-icons/go"),
  Gr: () => import("react-icons/gr"),
  Hi2: () => import("react-icons/hi2"),
  Hi: () => import("react-icons/hi"),
  Im: () => import("react-icons/im"),
  Io5: () => import("react-icons/io5"),
  Io: () => import("react-icons/io"),
  Lia: () => import("react-icons/lia"),
  Lu: () => import("react-icons/lu"),
  Md: () => import("react-icons/md"),
  Pi: () => import("react-icons/pi"),
  Ri: () => import("react-icons/ri"),
  Rx: () => import("react-icons/rx"),
  Si: () => import("react-icons/si"),
  Sl: () => import("react-icons/sl"),
  Tb: () => import("react-icons/tb"),
  Tfi: () => import("react-icons/tfi"),
  Ti: () => import("react-icons/ti"),
  Vsc: () => import("react-icons/vsc"),
  Wi: () => import("react-icons/wi"),
  Cg: () => import("react-icons/cg"),
};

const moduleCache = new Map<string, Promise<IconModule>>();
const iconCache = new Map<string, IconType | null>();
const PREFIXES = Object.keys(ICON_IMPORTERS).sort((a, b) => b.length - a.length);

function resolvePrefix(tag: string): string | undefined {
  return PREFIXES.find((prefix) => tag.startsWith(prefix));
}

async function loadIconModule(prefix: string): Promise<IconModule> {
  const existing = moduleCache.get(prefix);
  if (existing) {
    return existing;
  }
  const loader = ICON_IMPORTERS[prefix];
  const promise = loader();
  moduleCache.set(prefix, promise);
  return promise;
}

export async function resolveReactIconByTag(tag: string | undefined): Promise<IconType | null> {
  const normalizedTag = (tag ?? "").trim();
  if (!normalizedTag) {
    return null;
  }

  if (iconCache.has(normalizedTag)) {
    return iconCache.get(normalizedTag) ?? null;
  }

  const prefix = resolvePrefix(normalizedTag);
  if (!prefix) {
    iconCache.set(normalizedTag, null);
    return null;
  }

  try {
    const iconModule = await loadIconModule(prefix);
    const iconCandidate = iconModule[normalizedTag];
    const icon = typeof iconCandidate === "function" ? (iconCandidate as IconType) : null;
    iconCache.set(normalizedTag, icon);
    return icon;
  } catch {
    iconCache.set(normalizedTag, null);
    return null;
  }
}
