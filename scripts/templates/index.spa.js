(() => {
  const STORAGE_PREFIX = "gitpagedocs:spa:";
  const APP_ID = "gitpagedocs-app";

  const AURORA = {
    dark: {
      bg: "#070A14",
      cardBg: "#101726",
      cardBorder: "#334155",
      primary: "#7C3AED",
      secondary: "#22D3EE",
      text: "#E5E7EB",
      textMuted: "#B8C3D6",
    },
    light: {
      bg: "#F8FAFC",
      cardBg: "#FFFFFF",
      cardBorder: "#E2E8F0",
      primary: "#7C3AED",
      secondary: "#0D9488",
      text: "#1E293B",
      textMuted: "#64748B",
    },
  };

  function getAppRoot() {
    const existing = document.getElementById(APP_ID);
    if (existing) return existing;
    const root = document.createElement("div");
    root.id = APP_ID;
    document.body.appendChild(root);
    return root;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function markdownToHtml(markdown) {
    const source = String(markdown).replace(/\r\n/g, "\n");
    const escaped = escapeHtml(source);
    const withBlocks = escaped
      .replace(/^###### (.*)$/gm, "<h6>$1</h6>")
      .replace(/^##### (.*)$/gm, "<h5>$1</h5>")
      .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
      .replace(/^### (.*)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*)$/gm, "<h1>$1</h1>")
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
    return withBlocks
      .split(/\n{2,}/)
      .map((block) => {
        if (/^<h[1-6]>/.test(block) || /^<pre>/.test(block)) return block;
        if (/^- /.test(block)) {
          const items = block.split("\n").filter((l) => l.startsWith("- ")).map((l) => `<li>${l.slice(2)}</li>`).join("");
          return `<ul>${items}</ul>`;
        }
        return `<p>${block.replace(/\n/g, "<br/>")}</p>`;
      })
      .join("\n");
  }

  function getSiteName(config) {
    return config?.site?.name || "GitPageDocs";
  }

  function getStorageKey(config, suffix) {
    return `${STORAGE_PREFIX}${getSiteName(config).toLowerCase().replaceAll(" ", "-")}:${suffix}`;
  }

  function getLanguageLabel(config, currentLang, targetLang) {
    const labels = config?.site?.langmenu?.[currentLang];
    return labels?.[targetLang] ?? targetLang.toUpperCase();
  }

  function flattenMenus(menuList, language) {
    const result = [];
    const walk = (items) => {
      items.forEach((item) => {
        const localized = item?.[language];
        if (!localized) return;
        const pathClick = localized["path-click"] || "";
        if (pathClick) result.push({ title: localized.title || "Untitled", pathClick });
        if (Array.isArray(localized.submenus) && localized.submenus.length) {
          walk(localized.submenus.map((s) => ({ [language]: s })));
        }
      });
    };
    walk(menuList || []);
    return result;
  }

  function resolveLanguages(config) {
    const route = config?.routes?.[0];
    return route?.path ? Object.keys(route.path) : ["en", "pt", "es"];
  }

  async function loadMarkdown(route, language, baseUrl) {
    const mdPath = route?.path?.[language];
    if (!mdPath) return "<p>Missing markdown path.</p>";
    const cleanPath = mdPath.startsWith("./") ? mdPath.slice(2) : mdPath;
    const url = mdPath.startsWith("http") ? mdPath : (baseUrl || "") + cleanPath;
    try {
      const res = await fetch(url);
      if (!res.ok) return "<p>Unable to load markdown file.</p>";
      return markdownToHtml(await res.text());
    } catch {
      return "<p>Unable to load markdown file.</p>";
    }
  }

  function splitMarkdownIntoPages(html) {
    const pages = html.split(/(?=<h1)/i).filter(Boolean);
    return pages.length ? pages : [html];
  }

  function createStyles(theme) {
    const t = theme === "aurora-light" ? AURORA.light : AURORA.dark;
    return `
      #${APP_ID} {
        min-height: 100vh;
        background: ${theme === "aurora-light" ? `linear-gradient(180deg, #E0F2FE, #F0F9FF 50%, #F8FAFC)` : `radial-gradient(circle at 10% -20%, rgba(124,58,237,0.22), transparent 44%), radial-gradient(circle at 90% -30%, rgba(34,211,238,0.2), transparent 42%), ${t.bg}`};
        color: ${t.text};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Arial, sans-serif;
      }
      #${APP_ID} .gpd-shell { max-width: 1200px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }
      #${APP_ID} .gpd-header {
        position: sticky; top: 0; z-index: 20;
        padding: 14px 18px;
        border-bottom: 1px solid ${t.cardBorder};
        background: ${theme === "aurora-light" ? "linear-gradient(90deg, rgba(241,245,249,0.95), rgba(248,250,252,0.95))" : "linear-gradient(90deg, rgba(11,18,32,0.95), rgba(15,23,42,0.95))"};
        backdrop-filter: blur(8px);
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
        justify-content: space-between;
      }
      #${APP_ID} .gpd-header-left, #${APP_ID} .gpd-header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
      #${APP_ID} .gpd-header a { color: inherit; text-decoration: none; display: flex; align-items: center; gap: 8px; font-weight: 700; }
      #${APP_ID} .gpd-header a:hover { color: ${t.secondary}; }
      #${APP_ID} .gpd-header select, #${APP_ID} .gpd-header button {
        height: 38px; min-height: 38px;
        border-radius: 12px;
        border: 1px solid ${t.cardBorder};
        background: ${t.cardBg};
        color: ${t.text};
        padding: 0 12px;
        font-size: 0.9rem;
        font-weight: 600;
      }
      #${APP_ID} .gpd-header button { cursor: pointer; min-width: 86px; }
      #${APP_ID} .gpd-header button:hover { border-color: ${t.secondary}; }
      #${APP_ID} .gpd-mode-btn {
        width: 38px; min-width: 38px; padding: 0;
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 1.1rem; border-radius: 12px;
      }
      #${APP_ID} .gpd-main {
        display: grid;
        grid-template-columns: 280px 1fr;
        flex: 1;
        transition: grid-template-columns 0.2s ease;
      }
      #${APP_ID} .gpd-main.gpd-sidebar-collapsed { grid-template-columns: 28px 1fr; }
      #${APP_ID} .gpd-sidebar {
        display: flex; flex-direction: column;
        border-right: 1px solid ${t.cardBorder};
        padding: 18px 14px;
        background: ${theme === "aurora-light" ? "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(248,250,252,0.88))" : "linear-gradient(180deg, rgba(16,23,38,0.94), rgba(7,10,20,0.88))"};
        overflow-y: auto;
        height: 100%;
        min-height: calc(100vh - 60px);
        transition: opacity 0.2s;
      }
      #${APP_ID} .gpd-main.gpd-sidebar-collapsed .gpd-sidebar { display: none; }
      #${APP_ID} .gpd-sidebar-rail {
        display: none;
        width: 28px; min-width: 28px;
        border-right: 1px solid ${t.cardBorder};
        background: ${theme === "aurora-light" ? "rgba(248,250,252,0.92)" : "rgba(16,23,38,0.92)"};
        align-items: center; justify-content: center;
        cursor: pointer;
        color: ${t.secondary};
        font-size: 1rem;
      }
      #${APP_ID} .gpd-main.gpd-sidebar-collapsed .gpd-sidebar-rail { display: flex; }
      #${APP_ID} .gpd-sidebar-rail:hover { background: rgba(34,211,238,0.12); }
      #${APP_ID} .gpd-brand {
        display: flex; align-items: center; gap: 10px;
        font-weight: 800; font-size: 1.1rem;
        margin-bottom: 20px; color: ${t.text};
      }
      #${APP_ID} .gpd-menu-list { display: flex; flex-direction: column; gap: 6px; }
      #${APP_ID} .gpd-menu-item {
        display: flex; align-items: center;
        padding: 10px 12px; margin: 0 -4px;
        border: 1px solid transparent;
        border-radius: 10px;
        border-left: 3px solid transparent;
        background: transparent;
        color: ${t.textMuted};
        cursor: pointer;
        font-size: 0.9rem; font-weight: 600;
        min-height: 40px;
        transition: all 0.16s ease;
      }
      #${APP_ID} .gpd-menu-item:hover {
        color: ${t.text};
        border-color: ${t.secondary};
        background: rgba(34,211,238,0.08);
      }
      #${APP_ID} .gpd-menu-item.gpd-active {
        color: ${t.text};
        border-left-color: ${t.secondary};
        background: rgba(34,211,238,0.12);
        border-color: rgba(34,211,238,0.3);
      }
      #${APP_ID} .gpd-menu-item.gpd-sub { padding-left: 24px; font-size: 0.85rem; }
      #${APP_ID} .gpd-menu-group { margin-bottom: 6px; }
      #${APP_ID} .gpd-menu-group-title {
        display: flex; align-items: center; gap: 8px;
        padding: 10px 12px; margin: 0 -4px;
        border: 1px solid transparent;
        border-radius: 10px;
        border-left: 3px solid transparent;
        background: transparent;
        color: ${t.textMuted};
        cursor: pointer;
        font-size: 0.9rem; font-weight: 600;
        min-height: 40px;
        width: 100%; text-align: left;
        transition: all 0.16s ease;
      }
      #${APP_ID} .gpd-menu-group-title:hover { color: ${t.text}; border-color: ${t.secondary}; background: rgba(34,211,238,0.08); }
      #${APP_ID} .gpd-menu-group-title.gpd-active { border-left-color: ${t.secondary}; background: rgba(34,211,238,0.12); color: ${t.text}; }
      #${APP_ID} .gpd-menu-group-row { display: flex; align-items: center; gap: 4px; }
      #${APP_ID} .gpd-menu-group-title { flex: 1; text-align: left; }
      #${APP_ID} .gpd-menu-expand {
        width: 34px; min-width: 34px; height: 34px; padding: 0;
        border: none; border-radius: 50%; background: transparent;
        color: ${t.secondary}; cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 0.9rem; transition: transform 0.2s;
      }
      #${APP_ID} .gpd-menu-expand:hover { background: rgba(34,211,238,0.12); }
      #${APP_ID} .gpd-menu-group.expanded .gpd-menu-expand { transform: rotate(90deg); }
      #${APP_ID} .gpd-menu-group-children { margin-left: 12px; margin-top: 4px; display: flex; flex-direction: column; gap: 6px; }
      #${APP_ID} .gpd-sidebar-footer {
        margin-top: auto; padding-top: 12px;
        border-top: 1px solid ${t.cardBorder};
        display: flex; justify-content: center;
      }
      #${APP_ID} .gpd-collapse-btn {
        width: 42px; height: 42px; min-width: 42px;
        border-radius: 50%;
        border: 1px solid ${t.cardBorder};
        background: ${t.cardBg};
        color: ${t.secondary};
        cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 1rem;
        transition: all 0.16s;
      }
      #${APP_ID} .gpd-collapse-btn:hover { background: rgba(34,211,238,0.15); border-color: ${t.secondary}; }
      #${APP_ID} .gpd-content-wrap { padding: 24px 18px 80px; overflow-y: auto; min-width: 0; }
      #${APP_ID} .gpd-card {
        background: ${theme === "aurora-light" ? "linear-gradient(160deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))" : "linear-gradient(160deg, rgba(16,23,38,0.94), rgba(15,23,42,0.92))"};
        border: 1px solid ${t.cardBorder};
        border-radius: 16px;
        padding: 22px;
        box-shadow: 0 18px 60px rgba(0,0,0,0.35);
      }
      #${APP_ID} .gpd-content h1, #${APP_ID} .gpd-content h2, #${APP_ID} .gpd-content h3 { color: ${t.text}; }
      #${APP_ID} .gpd-content a { color: ${t.primary}; }
      #${APP_ID} .gpd-footer-actions { margin-top: 18px; display: flex; justify-content: space-between; gap: 12px; }
      #${APP_ID} .gpd-footer-actions button, #${APP_ID} .gpd-footer button {
        padding: 10px 18px; border-radius: 12px;
        border: 1px solid ${t.cardBorder};
        background: ${t.cardBg};
        color: ${t.text};
        cursor: pointer; font-weight: 600; font-size: 0.9rem;
      }
      #${APP_ID} .gpd-footer-actions button:hover:not(:disabled), #${APP_ID} .gpd-footer button:hover:not(:disabled) { border-color: ${t.secondary}; }
      #${APP_ID} .gpd-footer button:disabled, #${APP_ID} .gpd-footer-actions button:disabled { opacity: 0.55; cursor: not-allowed; }
      #${APP_ID} .gpd-footer { border-top: 1px solid ${t.cardBorder}; padding: 16px 24px; display: flex; justify-content: space-between; background: ${theme === "aurora-light" ? "#F8FAFC" : "#0B1220"}; }
      #${APP_ID} .gpd-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
      #${APP_ID} .gpd-modal { background: ${t.cardBg}; border: 1px solid ${t.cardBorder}; border-radius: 16px; padding: 24px; max-width: 480px; width: 100%; max-height: 80vh; overflow-y: auto; }
      #${APP_ID} .gpd-modal a { color: ${t.primary}; }
      #${APP_ID} .gpd-focus-content { max-width: 720px; margin: 0 auto; padding: 24px; }
      @media (max-width: 900px) {
        #${APP_ID} .gpd-main { grid-template-columns: 1fr !important; }
        #${APP_ID} .gpd-main.gpd-sidebar-collapsed .gpd-sidebar-rail { display: none !important; }
        #${APP_ID} .gpd-sidebar { max-height: 220px; border-right: none; border-bottom: 1px solid ${t.cardBorder}; }
      }
    `;
  }

  function getConfigBaseUrl() {
    try {
      const script = document.currentScript;
      if (script?.src) {
        const u = new URL(script.src);
        return u.origin + u.pathname.replace(/\/[^/]*$/, "/");
      }
    } catch {}
    const loc = typeof window !== "undefined" && window.location;
    if (loc) {
      const p = loc.pathname.replace(/\/[^/]*$/, "/") || "/";
      return loc.origin + (p.startsWith("/") ? p : "/" + p);
    }
    return "./";
  }

  const GITHUB_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.53 2.87 8.37 6.85 9.72.5.1.68-.22.68-.5 0-.24-.01-.9-.01-1.77-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.93.85.09-.67.35-1.12.64-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.32 9.32 0 0112 6.88c1.7 0 2.5.35 2.5.35 1.54-1.83 2.74-1.05 2.74-1.05.55 1.42.2 2.47.1 2.73.64.71 1.03 1.62 1.03 2.74 0 3.94-2.34 4.8-4.56 5.06.36.31.68.92.68 1.86 0 1.35-.01 2.43-.01 2.76 0 .27.18.6.69.49C19.14 20.6 22 16.76 22 12.24 22 6.58 17.52 2 12 2z"/></svg>';
  const SUN_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 80-8 4 4 0 000 8z"/></svg>';
  const MOON_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
  const CHEVRON_RIGHT = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
  const COLLAPSE_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';

  async function bootstrap() {
    const root = getAppRoot();
    root.innerHTML = "<p>Loading GitPageDocs...</p>";

    const baseUrl = getConfigBaseUrl();
    let config;
    for (const path of [baseUrl + "gitpagedocs/config.json", "./gitpagedocs/config.json", "gitpagedocs/config.json"]) {
      try {
        const res = await fetch(path);
        if (res.ok) {
          config = await res.json();
          break;
        }
      } catch {}
    }

    if (!config) {
      root.innerHTML = `<div style="padding:24px;color:#e2e8f0;font-family:system-ui"><h2>GitPageDocs config not found</h2><p>Run <code>npx gitpagedocs</code> then <code>npx serve .</code></p></div>`;
      return;
    }

    const versions = config?.VersionControl?.versions ?? [];
    const versionKey = getStorageKey(config, "version");
    const themeKey = getStorageKey(config, "theme");
    const expandedKey = getStorageKey(config, "menu-expanded");
    const sidebarKey = getStorageKey(config, "sidebar-collapsed");
    let activeVersionId = localStorage.getItem(versionKey) || config?.site?.docsVersion || versions[0]?.id || "";
    if (!versions.some((v) => v.id === activeVersionId)) activeVersionId = versions[0]?.id || "";
    const languages = resolveLanguages(config);
    const languageKey = getStorageKey(config, "language");
    const routeKey = getStorageKey(config, "route-index");
    let language = localStorage.getItem(languageKey) || config?.site?.defaultLanguage || languages[0] || "en";
    if (!languages.includes(language)) language = languages[0] || "en";
    let routeIndex = Number(localStorage.getItem(routeKey) || 0);
    let activeThemeId = localStorage.getItem(themeKey) || config?.site?.ThemeDefault || "aurora-dark";
    let sidebarCollapsed = localStorage.getItem(sidebarKey) === "true";
    let expandedMap = {};
    try {
      const saved = localStorage.getItem(expandedKey);
      if (saved) expandedMap = JSON.parse(saved) || {};
    } catch {}

    async function getActiveConfig() {
      if (!activeVersionId || !versions.length) return config;
      try {
        const res = await fetch(baseUrl + "gitpagedocs/docs/versions/" + activeVersionId + "/config.json");
        if (!res.ok) return config;
        const vc = await res.json();
        return { ...config, routes: vc.routes ?? config.routes, "menus-header": vc["menus-header"] ?? config["menus-header"] };
      } catch {
        return config;
      }
    }

    function safeRouteIndex(routes) {
      if (!Array.isArray(routes) || !routes.length) return 0;
      return Math.max(0, Math.min(routeIndex, routes.length - 1));
    }

    function toggleThemeMode() {
      activeThemeId = activeThemeId === "aurora-dark" ? "aurora-light" : "aurora-dark";
      void render();
    }

    function buildMenuHtml(activeConfig) {
      const menus = activeConfig["menus-header"] ?? [];
      const routes = activeConfig.routes ?? [];
      const currentPath = routes[routeIndex]?.path?.[language] || "";
      const out = [];
      for (const item of menus) {
        const loc = item?.[language];
        if (!loc) continue;
        const pathClick = loc["path-click"] || "";
        const hasSub = Array.isArray(loc.submenus) && loc.submenus.length > 0;
        const groupKey = "g" + (item.id ?? out.length);
        const childPaths = hasSub ? (loc.submenus || []).map((s) => s["path-click"]).filter(Boolean) : [];
        const isCurrentInGroup = childPaths.some((p) => p === currentPath);
        const isExpanded = expandedMap[groupKey] !== false || isCurrentInGroup;

        if (hasSub) {
          const idx = routes.findIndex((r) => r?.path?.[language] === pathClick);
          const active = idx >= 0 && idx === routeIndex;
          out.push(`<div class="gpd-menu-group ${isExpanded ? "expanded" : ""}" data-group="${groupKey}">`);
          out.push(`<div class="gpd-menu-group-row"><button class="gpd-menu-group-title ${active ? "gpd-active" : ""}" data-route-index="${idx >= 0 ? idx : ""}" type="button">${escapeHtml(loc.title)}</button><button class="gpd-menu-expand" data-group="${groupKey}" type="button" aria-label="Expand">${CHEVRON_RIGHT}</button></div>`);
          out.push(`<div class="gpd-menu-group-children">`);
          for (const sub of loc.submenus) {
            const subPath = sub["path-click"] || "";
            const subIdx = routes.findIndex((r) => r?.path?.[language] === subPath);
            const subActive = subIdx >= 0 && subIdx === routeIndex;
            out.push(`<button class="gpd-menu-item gpd-sub ${subActive ? "gpd-active" : ""}" data-route-index="${subIdx}" type="button">${escapeHtml(sub.title)}</button>`);
          }
          out.push(`</div></div>`);
        } else {
          const idx = routes.findIndex((r) => r?.path?.[language] === pathClick);
          const active = idx >= 0 && idx === routeIndex;
          out.push(`<button class="gpd-menu-item ${active ? "gpd-active" : ""}" data-route-index="${idx >= 0 ? idx : ""}" type="button">${escapeHtml(loc.title)}</button>`);
        }
      }
      return out.join("");
    }

    function getVersionLinks(versionEntry) {
      const links = [];
      if (versionEntry?.ProjectLink) links.push({ label: "Project", url: versionEntry.ProjectLink });
      if (versionEntry?.branch) links.push({ label: "Branch", url: versionEntry.branch });
      if (versionEntry?.release) links.push({ label: "Release", url: versionEntry.release });
      if (versionEntry?.commit) links.push({ label: "Commit", url: versionEntry.commit });
      return links;
    }

    const layouts = [{ id: "aurora-dark", name: "Aurora Dark" }, { id: "aurora-light", name: "Aurora Light" }];
    const canToggleMode = layouts.some((l) => l.id === activeThemeId);

    async function render() {
      const activeConfig = await getActiveConfig();
      const routes = activeConfig.routes ?? [];
      if (!routes.length) {
        root.innerHTML = `<style>${createStyles(activeThemeId)}</style><div class="gpd-shell" style="padding:24px"><h2>No routes</h2></div>`;
        return;
      }

      routeIndex = safeRouteIndex(routes);
      localStorage.setItem(languageKey, language);
      localStorage.setItem(routeKey, String(routeIndex));
      localStorage.setItem(versionKey, activeVersionId);
      localStorage.setItem(themeKey, activeThemeId);
      localStorage.setItem(sidebarKey, String(sidebarCollapsed));
      try {
        localStorage.setItem(expandedKey, JSON.stringify(expandedMap));
      } catch {}

      const route = routes[routeIndex];
      const html = await loadMarkdown(route, language, baseUrl);
      const flatEntries = flattenMenus(activeConfig["menus-header"], language);
      const linearIdx = flatEntries.findIndex((e) => routes.findIndex((r) => r?.path?.[language] === e.pathClick) === routeIndex);
      const prevDisabled = linearIdx <= 0;
      const nextDisabled = linearIdx < 0 || linearIdx >= flatEntries.length - 1;
      const prevLabel = config?.translations?.navigation?.previous?.[language] || "Previous";
      const nextLabel = config?.translations?.navigation?.next?.[language] || "Next Markdown";
      const projectLink = config?.site?.ProjectLink || "";
      const versionEntry = versions.find((v) => v.id === activeVersionId);
      const versionLinks = getVersionLinks(versionEntry);
      const hideTheme = config?.site?.HideThemeSelector === true;
      const darkMode = activeThemeId === "aurora-dark";

      const versionSelect =
        versions.length > 1
          ? `<select id="gpd-version" aria-label="Version">${versions.map((v) => `<option value="${v.id}" ${v.id === activeVersionId ? "selected" : ""}>Version ${v.id}</option>`).join("")}</select>`
          : "";

      const langOptions = languages
        .map((lang) => `<option value="${lang}" ${lang === language ? "selected" : ""}>${getLanguageLabel(config, language, lang)}</option>`)
        .join("");

      const themeOptions = hideTheme ? "" : layouts.map((t) => `<option value="${t.id}" ${t.id === activeThemeId ? "selected" : ""}>${t.name}</option>`).join("");

      root.innerHTML = `
        <style>${createStyles(activeThemeId)}</style>
        <div class="gpd-shell">
          <header class="gpd-header">
            <div class="gpd-header-left">
              ${projectLink ? `<a href="${escapeHtml(projectLink)}" target="_blank" rel="noreferrer">${GITHUB_SVG} ${escapeHtml(getSiteName(config))}</a>` : `<span style="font-weight:800">${escapeHtml(getSiteName(config))}</span>`}
              ${versionLinks.length ? `<button id="gpd-repo-links" type="button">Repository links ${GITHUB_SVG}</button>` : ""}
              ${config?.site?.FocusMode !== false ? `<button id="gpd-focus" type="button">Focus mode</button>` : ""}
              <button id="gpd-ctrlk" type="button" style="min-width:auto;padding:0 10px">Ctrl+K</button>
            </div>
            <div class="gpd-header-right">
              ${versionSelect}
              <select id="gpd-language" aria-label="Language">${langOptions}</select>
              ${themeOptions ? `<select id="gpd-theme" aria-label="Theme">${themeOptions}</select>` : ""}
              ${canToggleMode ? `<button id="gpd-mode-toggle" class="gpd-mode-btn" type="button" aria-label="${darkMode ? "Light mode" : "Dark mode"}">${darkMode ? SUN_SVG : MOON_SVG}</button>` : ""}
            </div>
          </header>
          <section class="gpd-main ${sidebarCollapsed ? "gpd-sidebar-collapsed" : ""}">
            <aside class="gpd-sidebar">
              <div class="gpd-brand">${GITHUB_SVG} ${escapeHtml(getSiteName(config))}</div>
              <nav class="gpd-menu-list">${buildMenuHtml(activeConfig)}</nav>
              <div class="gpd-sidebar-footer">
                <button id="gpd-collapse" class="gpd-collapse-btn" type="button" aria-label="Collapse sidebar">${COLLAPSE_SVG}${COLLAPSE_SVG}</button>
              </div>
            </aside>
            <div class="gpd-sidebar-rail" id="gpd-rail" aria-label="Expand sidebar">${CHEVRON_RIGHT}</div>
            <div class="gpd-content-wrap">
              <article class="gpd-card">
                <div class="gpd-content">${html}</div>
                ${flatEntries.length > 1 ? `<div class="gpd-footer-actions"><button id="gpd-prev" ${prevDisabled ? "disabled" : ""}>${prevLabel}</button><button id="gpd-next" ${nextDisabled ? "disabled" : ""}>${nextLabel}</button></div>` : ""}
              </article>
            </div>
          </section>
          ${flatEntries.length > 1 ? `<footer class="gpd-footer"><button id="gpd-prev2" ${prevDisabled ? "disabled" : ""}>${prevLabel}</button><button id="gpd-next2" ${nextDisabled ? "disabled" : ""}>${nextLabel}</button></footer>` : ""}
        </div>
        ${versionLinks.length ? `<div id="gpd-links-modal" class="gpd-overlay" style="display:none"><div class="gpd-modal"><h3>Repository links</h3>${versionLinks.map((l) => `<p><a href="${l.url}" target="_blank" rel="noreferrer">${escapeHtml(l.label)}</a></p>`).join("")}<button id="gpd-links-close" type="button">Close</button></div></div>` : ""}
        ${config?.site?.FocusMode !== false ? `<div id="gpd-focus-overlay" class="gpd-overlay" style="display:none"><div class="gpd-focus-content"><div class="gpd-card"><div id="gpd-focus-body"></div><button id="gpd-focus-close" type="button">Close</button></div></div>` : ""}
      `;

      root.querySelector("#gpd-version")?.addEventListener("change", (e) => {
        activeVersionId = e.target.value;
        routeIndex = 0;
        void render();
      });
      root.querySelector("#gpd-language")?.addEventListener("change", (e) => {
        language = e.target.value;
        void render();
      });
      root.querySelector("#gpd-theme")?.addEventListener("change", (e) => {
        activeThemeId = e.target.value;
        void render();
      });
      root.querySelector("#gpd-mode-toggle")?.addEventListener("click", toggleThemeMode);
      root.querySelector("#gpd-collapse")?.addEventListener("click", () => {
        sidebarCollapsed = true;
        void render();
      });
      root.querySelector("#gpd-rail")?.addEventListener("click", () => {
        sidebarCollapsed = false;
        void render();
      });

      root.querySelectorAll("[data-route-index]").forEach((btn) => {
        const idx = btn.getAttribute("data-route-index");
        if (idx === "" || idx === null) return;
        btn.addEventListener("click", () => {
          routeIndex = Number(idx);
          void render();
        });
      });
      root.querySelectorAll(".gpd-menu-expand").forEach((btn) => {
        const key = btn.getAttribute("data-group");
        btn.addEventListener("click", () => {
          expandedMap[key] = !(expandedMap[key] !== false);
          void render();
        });
      });

      function goLinear(offset) {
        const next = linearIdx + offset;
        if (next < 0 || next >= flatEntries.length) return;
        const pathClick = flatEntries[next].pathClick;
        const idx = routes.findIndex((r) => r?.path?.[language] === pathClick);
        if (idx >= 0) {
          routeIndex = idx;
          void render();
        }
      }

      root.querySelector("#gpd-prev")?.addEventListener("click", () => goLinear(-1));
      root.querySelector("#gpd-next")?.addEventListener("click", () => goLinear(1));
      root.querySelector("#gpd-prev2")?.addEventListener("click", () => goLinear(-1));
      root.querySelector("#gpd-next2")?.addEventListener("click", () => goLinear(1));

      root.querySelector("#gpd-repo-links")?.addEventListener("click", () => {
        const m = root.querySelector("#gpd-links-modal");
        if (m) m.style.display = "flex";
      });
      root.querySelector("#gpd-links-close")?.addEventListener("click", () => {
        root.querySelector("#gpd-links-modal")?.style.setProperty("display", "none");
      });
      root.querySelector("#gpd-links-modal")?.addEventListener("click", (e) => {
        if (e.target?.id === "gpd-links-modal") e.target.style.display = "none";
      });

      root.querySelector("#gpd-focus")?.addEventListener("click", () => {
        const overlay = root.querySelector("#gpd-focus-overlay");
        const body = root.querySelector("#gpd-focus-body");
        if (overlay && body) {
          body.innerHTML = html;
          overlay.style.display = "flex";
        }
      });
      root.querySelector("#gpd-focus-close")?.addEventListener("click", () => {
        root.querySelector("#gpd-focus-overlay")?.style.setProperty("display", "none");
      });

      document.addEventListener("keydown", function onKey(e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          root.querySelector("#gpd-focus")?.click();
        }
      });
    }

    await render();
  }

  void bootstrap();
})();
