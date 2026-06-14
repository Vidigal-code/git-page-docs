/**
 * Domains that block embedding via X-Frame-Options or Content-Security-Policy.
 * GitHub, Twitter/X, Facebook, and similar sites refuse iframe loading.
 */
const FRAME_BLOCKED_HOSTS = [
  "github.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "linkedin.com",
  "instagram.com",
];

export function isFrameBlockedUrl(url: string | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return FRAME_BLOCKED_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
  } catch {
    return false;
  }
}
