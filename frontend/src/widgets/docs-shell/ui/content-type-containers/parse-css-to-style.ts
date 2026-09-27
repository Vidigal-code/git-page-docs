/**
 * Turns an inline CSS declaration list (`color: red; font-size: 12px`) into a
 * React style object with camelCased property names. Declarations without a
 * colon, or with an empty name or value, are skipped.
 */
export function parseCssToStyle(css: string | undefined): React.CSSProperties {
  if (!css) return {};
  const out: Record<string, string> = {};
  css.split(";").forEach((part) => {
    const idx = part.indexOf(":");
    if (idx < 0) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (!k || !v) return;
    const camel = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v;
  });
  return out as React.CSSProperties;
}
