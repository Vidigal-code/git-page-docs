(() => {
  const STORAGE_PREFIX = "gitpagedocs:spa:";
  const APP_ID = "gitpagedocs-app";

  function getAppRoot() {
    const existing = document.getElementById(APP_ID);
    if (existing) {
      return existing;
    }
    const root = document.createElement("div");
    root.id = APP_ID;
    document.body.appendChild(root);
    return root;
  }

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function markdownToHtml(markdown) {
    const source = markdown.replace(/\r\n/g, "\n");
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
        if (/^<h[1-6]>/.test(block) || /^<pre>/.test(block)) {
          return block;
        }
        if (/^- /.test(block)) {
          const items = block
            .split("\n")
            .filter((line) => line.startsWith("- "))
            .map((line) => `<li>${line.slice(2)}</li>`)
            .join("");
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
    const siteSlug = getSiteName(config).toLowerCase().replaceAll(" ", "-");
    return `${STORAGE_PREFIX}${siteSlug}:${suffix}`;
  }

  function flattenMenus(menuList, language) {
    const result = [];
    const walk = (items, parentTitle) => {
      items.forEach((item) => {
        const localized = item?.[language];
        if (!localized) {
          return;
        }
        const title = localized.title || "Untitled";
        const fullTitle = parentTitle ? `${parentTitle} / ${title}` : title;
        result.push({ title: fullTitle, pathClick: localized["path-click"] || "" });
        if (Array.isArray(localized.submenus) && localized.submenus.length) {
          walk(
            localized.submenus.map((submenu) => ({ [language]: submenu })),
            fullTitle,
          );
        }
      });
    };
    walk(menuList || [], "");
    return result;
  }

  function resolveLanguages(config) {
    const route = config?.routes?.[0];
    if (!route || !route.path) {
      return ["en", "pt", "es"];
    }
    return Object.keys(route.path);
  }

  async function loadMarkdown(route, language, baseUrl) {
    const mdPath = route?.path?.[language];
    if (!mdPath) {
      return "<p>Missing markdown path for selected language.</p>";
    }
    const url = mdPath.startsWith("http") ? mdPath : (baseUrl || "") + mdPath.replace(/^\\.\\//, "");
    const response = await fetch(url);
    if (!response.ok) {
      return "<p>Unable to load markdown file.</p>";
    }
    return markdownToHtml(await response.text());
  }

  function createStyles() {
    return `
      #${APP_ID} {
        min-height: 100vh;
        background: linear-gradient(180deg, #0b1220, #060b14);
        color: #e2e8f0;
        font-family: Inter, Segoe UI, Arial, sans-serif;
        padding: 20px;
      }
      #${APP_ID} .gpd-shell {
        max-width: 1100px;
        margin: 0 auto;
        border: 1px solid #334155;
        border-radius: 16px;
        background: #0f172a;
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
      }
      #${APP_ID} .gpd-header {
        padding: 16px;
        border-bottom: 1px solid #334155;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        justify-content: space-between;
      }
      #${APP_ID} .gpd-controls {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      #${APP_ID} select, #${APP_ID} button {
        height: 40px;
        border-radius: 10px;
        border: 1px solid #475569;
        background: #020617;
        color: #e2e8f0;
        font-weight: 600;
        padding: 0 12px;
      }
      #${APP_ID} button {
        cursor: pointer;
      }
      #${APP_ID} .gpd-main {
        display: grid;
        grid-template-columns: 280px 1fr;
        min-height: 70vh;
      }
      #${APP_ID} .gpd-sidebar {
        border-right: 1px solid #334155;
        padding: 14px;
        overflow-y: auto;
      }
      #${APP_ID} .gpd-sidebar button {
        width: 100%;
        text-align: left;
        margin-bottom: 6px;
      }
      #${APP_ID} .gpd-content {
        padding: 20px;
      }
      #${APP_ID} .gpd-content h1, #${APP_ID} .gpd-content h2, #${APP_ID} .gpd-content h3 {
        color: #f8fafc;
      }
      #${APP_ID} .gpd-content a {
        color: #22d3ee;
      }
      #${APP_ID} .gpd-footer {
        border-top: 1px solid #334155;
        padding: 12px 16px 16px;
        display: flex;
        justify-content: space-between;
        gap: 8px;
      }
      @media (max-width: 900px) {
        #${APP_ID} .gpd-main {
          grid-template-columns: 1fr;
        }
        #${APP_ID} .gpd-sidebar {
          border-right: none;
          border-bottom: 1px solid #334155;
          max-height: 220px;
        }
      }
    `;
  }

  function getConfigBaseUrl() {
    const script = document.currentScript;
    if (script && script.src) {
      try {
        const url = new URL(script.src);
        return url.origin + url.pathname.replace(/\/[^/]*$/, "/") || "./";
      } catch {}
    }
    const loc = typeof window !== "undefined" && window.location;
    if (loc) {
      const path = loc.pathname.replace(/\/[^/]*$/, "/") || "./";
      return loc.origin + (path.startsWith("/") ? path : "/" + path);
    }
    return "./";
  }

  async function bootstrap() {
    const root = getAppRoot();
    root.innerHTML = "<p>Loading GitPageDocs...</p>";

    const baseUrl = getConfigBaseUrl();
    const configPaths = [
      baseUrl + "gitpagedocs/config.json",
      "./gitpagedocs/config.json",
      "gitpagedocs/config.json",
    ];

    let config;
    for (const configPath of configPaths) {
      try {
        const response = await fetch(configPath);
        if (response.ok) {
          config = await response.json();
          break;
        }
      } catch {}
    }

    if (!config) {
      root.innerHTML = `
        <div class="gpd-shell" style="padding:20px">
          <h2>GitPageDocs config not found</h2>
          <p>Run <code>npx gitpagedocs</code> in your project root to create the config.</p>
          <p style="margin-top:12px;color:#94a3b8">Then serve the folder (e.g. <code>npx serve .</code>) &mdash; opening index.html as <code>file://</code> may block fetch.</p>
        </div>
      `;
      return;
    }

    const languages = resolveLanguages(config);
    const languageKey = getStorageKey(config, "language");
    const routeKey = getStorageKey(config, "route-index");
    let language = localStorage.getItem(languageKey) || config?.site?.defaultLanguage || languages[0] || "en";
    if (!languages.includes(language)) {
      language = languages[0] || "en";
    }
    let routeIndex = Number(localStorage.getItem(routeKey) || 0);

    function safeRouteIndex() {
      if (!Array.isArray(config.routes) || !config.routes.length) {
        return 0;
      }
      if (routeIndex < 0) {
        return 0;
      }
      if (routeIndex >= config.routes.length) {
        return config.routes.length - 1;
      }
      return routeIndex;
    }

    function buildMenuButtons() {
      const menuEntries = flattenMenus(config["menus-header"], language);
      return menuEntries
        .map((entry) => {
          const idx = config.routes.findIndex((route) => route?.path?.[language] === entry.pathClick);
          if (idx < 0) {
            return "";
          }
          return `<button data-route-index="${idx}">${entry.title}</button>`;
        })
        .join("");
    }

    async function render() {
      if (!Array.isArray(config.routes) || !config.routes.length) {
        root.innerHTML = `
          <style>${createStyles()}</style>
          <div class="gpd-shell" style="padding:20px">
            <h2>No routes found in gitpagedocs/config.json</h2>
          </div>
        `;
        return;
      }

      routeIndex = safeRouteIndex();
      localStorage.setItem(languageKey, language);
      localStorage.setItem(routeKey, String(routeIndex));

      const route = config.routes[routeIndex];
      const html = await loadMarkdown(route, language, baseUrl);
      const prevDisabled = routeIndex <= 0 ? "disabled" : "";
      const nextDisabled = routeIndex >= config.routes.length - 1 ? "disabled" : "";

      root.innerHTML = `
        <style>${createStyles()}</style>
        <div class="gpd-shell">
          <header class="gpd-header">
            <strong>${getSiteName(config)}</strong>
            <div class="gpd-controls">
              <select id="gpd-language">
                ${languages.map((lang) => `<option value="${lang}" ${lang === language ? "selected" : ""}>${lang.toUpperCase()}</option>`).join("")}
              </select>
            </div>
          </header>
          <section class="gpd-main">
            <aside class="gpd-sidebar">
              ${buildMenuButtons()}
            </aside>
            <article class="gpd-content">${html}</article>
          </section>
          <footer class="gpd-footer">
            <button id="gpd-prev" ${prevDisabled}>Previous</button>
            <button id="gpd-next" ${nextDisabled}>Next</button>
          </footer>
        </div>
      `;

      const languageSelect = root.querySelector("#gpd-language");
      if (languageSelect) {
        languageSelect.addEventListener("change", (event) => {
          language = event.target.value;
          routeIndex = 0;
          void render();
        });
      }

      root.querySelectorAll("[data-route-index]").forEach((button) => {
        button.addEventListener("click", () => {
          routeIndex = Number(button.getAttribute("data-route-index") || "0");
          void render();
        });
      });

      const prevButton = root.querySelector("#gpd-prev");
      if (prevButton) {
        prevButton.addEventListener("click", () => {
          routeIndex -= 1;
          void render();
        });
      }

      const nextButton = root.querySelector("#gpd-next");
      if (nextButton) {
        nextButton.addEventListener("click", () => {
          routeIndex += 1;
          void render();
        });
      }
    }

    await render();
  }

  void bootstrap();
})();
