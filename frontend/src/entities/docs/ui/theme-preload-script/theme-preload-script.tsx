import { THEME_URL_PARAM } from "@/shared/config/constants";
import { THEME_CSS_VAR_BY_COLOR } from "../../lib/theme/to-css-vars";
import { SHELL_THEME_CACHE_KEY } from "../../lib/theme/theme-cache";

/**
 * Applies a cached palette to :root before the page paints.
 *
 * Standalone shells fetch the theme catalogue from the official remote layouts
 * host, which takes long enough that a link carrying `?theme=` would otherwise
 * paint the default palette first and swap once the fetch lands. This runs
 * synchronously in <head>, so when the requested theme is already cached from
 * an earlier visit its colours are in place for the very first painted frame.
 * React later emits the same values inline, which changes nothing on screen.
 *
 * Failures are swallowed on purpose: the page must render with the :root
 * defaults if storage is unavailable or the cache is unusable.
 */
export function ThemePreloadScript() {
  const source = `(function(){try{
var id=new URLSearchParams(location.search).get(${JSON.stringify(THEME_URL_PARAM)});
if(!id)return;
var raw=localStorage.getItem(${JSON.stringify(SHELL_THEME_CACHE_KEY)});
if(!raw)return;
var theme=(JSON.parse(raw)||{}).themes[id];
if(!theme||!theme.colors)return;
var map=${JSON.stringify(THEME_CSS_VAR_BY_COLOR)};
var root=document.documentElement;
for(var key in map){var value=theme.colors[key];if(value)root.style.setProperty(map[key],value);}
var header=(theme.components||{}).header||{};
var headerBackground=header.backgroundColor||theme.colors.cardBackground;
if(headerBackground)root.style.setProperty("--header-background",headerBackground);
var headerBorder=header.borderBottom||(theme.colors.cardBorder?"1px solid "+theme.colors.cardBorder:"");
if(headerBorder)root.style.setProperty("--header-border",headerBorder);
}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: source }} />;
}
