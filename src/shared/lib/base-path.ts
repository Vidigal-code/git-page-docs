export function getBasePath(): string {
  const configuredBasePath = (process.env.NEXT_PUBLIC_GITPAGEDOCS_BASE_PATH ?? "").trim();
  if (typeof window === "undefined") return configuredBasePath;
  const p = window.location.pathname;
  if (configuredBasePath && p.startsWith(configuredBasePath)) {
    return configuredBasePath;
  }
  if (window.location.hostname.endsWith("github.io")) {
    const parts = p.split("/").filter(Boolean);
    if (parts.length > 0) {
      return `/${parts[0]}`;
    }
  }
  return "";
}
