<!-- gitpagedocs:start -->
### Development

This is a pnpm + turbo monorepo: `frontend/` (Next.js viewer), `cli/` (the published `gitpagedocs` npm package), `tools/` (`@gitpagedocs/tools` shared core), and `mcp/` (`@gitpagedocs/mcp` server).

- `pnpm install` — install workspace dependencies
- `pnpm run typecheck` — type-check frontend + tools + mcp
- `pnpm run lint` — lint the project
- `pnpm run test:unit` — run the Vitest unit/integration suite
- `pnpm run test:cov` — unit tests with coverage
- `pnpm exec cross-env PORT=3100 pnpm run test:e2e` — Playwright frontend E2E on ports 3100 and 3101
- `pnpm run smoke:all` — CLI/contract/tools/mcp regression wall
- `pnpm run build` — build the Next.js production runtime; Pages export additionally requires its build environment

### CLI commands

- `gitpagedocs init` — scaffold gitpagedocs config files
- `gitpagedocs config` — show the resolved gitpagedocs config
- `gitpagedocs provider [id]` — list AI providers or show one
- `gitpagedocs models [provider]` — list catalog models
- `gitpagedocs ai` — interactive AI docs generator (writes pages in the gitpagedocs pattern)
- `gitpagedocs chat [question]` — streaming AI chat in the terminal (REPL on a TTY; one-shot with a question or piped stdin)
- `gitpagedocs document[:repo|:file|:folder]` — aliases of the interactive documentation generator; select input directories in its prompts
- `gitpagedocs password` — set a documentation access password (writes the public key to config.json)
- `gitpagedocs config clear` — delete the stored .gitpagedocsconfig and the encrypted key vault
- `gitpagedocs docs` — refresh the managed regions of README, CONTRIBUTING and SECURITY
- `gitpagedocs deploy | pages` — configure GitHub Pages via Actions and push
- `gitpagedocs pages actions` — switch the repository's GitHub Pages source to GitHub Actions (no docs generation or push)
- `gitpagedocs pages deploy` — detect owner/repo, confirm, then generate, commit, push and print the site URL
- `gitpagedocs doctor` — diagnose the environment
- `gitpagedocs mcp start` — start the MCP server over stdio
- `gitpagedocs version` — print the CLI version
- `gitpagedocs update` — check the registry for a newer CLI and print the install command

### User references

The generated documentation includes 35 Markdown pages per language: focused references plus complete configuration recipes, migration/compatibility, troubleshooting, contributing/testing and HTML-container guides. All pages are available in English, Portuguese and Spanish; Markdown filenames stay in English while titles and content preserve UTF-8 accents and special characters.
The scaffold registers documentation versions 0.0.16, 0.0.15, 0.0.14, 0.0.13, 0.0.12, 0.0.11, 0.0.10 and 0.0.9 in descending order with the current examples; the npm package version is 0.0.16. Paths and version badges match each generated documentation version. Existing older version folders are preserved.

The scaffold has real nested sections: Guides → Configure your site / Read and explore / Automate and integrate → documents, plus Operations and development and Git/GitHub groups. Getting Started and Project overview remain the first destinations. Every parent section has its own localized Markdown overview: click its title to read it, or use the separate arrow to expand children. Breadcrumb ancestors such as Guides → Configure your site remain navigable. Recursive `submenus` can extend the hierarchy without a fixed depth limit; `site.nestedMenusEnabled: false` keeps every destination in a flat presentation.

Configure controls through `gitpagedocs/config.json` → `site.icons`. `LanguageSelector`, `ThemeSelector`, `VersionSelector`, `FocusMode`, `QuickNavigation`, `PdfDownload`, `PdfOpenInNewTab`, `DocumentPrevious` and `DocumentNext` use icons by default. Set `reactIcon: false` independently to display text; `true` displays the icon. Customize `tag`, `size`, `colorDark` and `colorLight` per entry. Compact configs inherit omitted values from `icons.defaults`, so an omitted per-control `reactIcon` does not mean text mode. The Ctrl+K shortcut and accessible control names remain available.
`VersionSelector` uses `LuGitBranch` by default; `reactIcon: false` displays the selected version as text. It appears only when more than one documentation version is available, retains the selector's localized accessible name and shows the selected version in its tooltip.

`site.nestedMenusEnabled` selects recursive or flat navigation. Breadcrumbs use `RouteGuide` with route > version defaults > site precedence and have 12 px of spacing above and below. `site.FocusMode` enables reading mode; `site.focusMode` controls copy, download, section navigation and document navigation independently.

Focus mode provides eight navigation buttons: first, previous, next and last document, plus first, previous, next and last section. Each navigation flag controls its group of four; document changes keep the reader open and restart at the first section.
Focus narration reads only the displayed section. Section/document changes and entering/leaving focus stop the previous speech; a new reading uses the visible content while retaining voice, speed and volume preferences. With `sectionNavigationEnabled: false`, the whole document is visible and narratable. Source copy/download still covers the complete document.

Documentation pages and the introduction guide use `site.backToTop: { enabled: true, minPageHeightViewports: 3 }` for their back-to-top arrow. It is available only on a scrollable page at least three viewport heights tall. Set `enabled: false` to hide it; the threshold accepts a finite number greater than 1 and otherwise defaults to 3.

Document-footer controls use `DocumentPrevious` (`LuChevronLeft`) and `DocumentNext` (`LuChevronRight`); either can use its translated text with `reactIcon: false`. The footer appears for multiple available menu destinations and disables unavailable directions. `site.ActiveNavigation` controls quick navigation and Ctrl+K separately.
`site.documentNavigation.position` in `gitpagedocs/config.json` accepts `left`, `center` or `right`; it defaults to `center` when omitted or invalid. Previous, Next and Back to top remain grouped in that order on desktop and mobile. The position setting does not change the arrow's `site.backToTop` visibility rules or the introduction-guide arrow.

`site.accessibility.narration` configures native browser reading. Voices and offline availability depend on the browser and operating system. `site.mediaExclusivePlayback` coordinates narration, radio, audio and video so only one audible source plays by default.

See [the MCP reference](mcp/README.md) for installation, client configuration, all 20 tools, all 7 resources, provider variables and limits. Start with `gitpagedocs mcp start` from the target project; on a source checkout the direct entry is `node --import tsx mcp/src/bin.ts`.

### Animated themes

The catalog contains 124 themes: 64 original themes, 20 standalone Motion backgrounds and 20 additional parallax families with dark and light variants (40 entries). All 84 earlier themes remain unchanged. Try `aurora-borealis-dark`/`aurora-borealis-light`, `firefly-grove-dark`/`firefly-grove-light`, or `ocean-depths-dark`/`ocean-depths-light`; the existing light/dark control switches within each pair. Each pair shares `supportsLightAndDarkModesReference` in the catalog. All themes are available through the official catalog and local `--layoutconfig` generation. See [the complete catalog](gitpagelayouts/README.md) and the generated Themes and layouts guide in English, Portuguese and Spanish.

Customize `site.backgroundEffects` in `gitpagedocs/config.json`: `enabled: false` disables every background; `overrides` applies common settings; `themes[themeId]` applies theme-specific settings. Templates provide optional top-level `backgroundEffects`. Precedence is template → global overrides → per-theme overrides, while `layers` replaces the complete array. Adjust layer counts/colors, animation speed and pointer/scroll parallax without editing JavaScript. Reduced-motion preferences and a visitor pause control are supported; every new preset retains both protections.
Pause/resume sits beside the navigation lock in the documentation menu (expanded, collapsed and mobile), or in the search-page header. A manual pause survives menu and theme changes until Resume is selected. `site.backgroundEffects.overrides.accessibility.showPauseButton` defaults to `true`; `false` hides only the control. Configure `site.icons.BackgroundAnimationPause` (`FiPause`) and `BackgroundAnimationResume` (`FiPlay`) with `reactIcon`, `tag`, `size`, `colorDark` and `colorLight`. Defaults are icons, 22px and `currentColor`; `reactIcon: false` shows localized text. Use the background master switch to disable the effect itself.

Preset sources live in `gitpagelayouts/v2/layouts/` as `overrides.backgroundEffects`. `pnpm run layouts:sync` expands templates and compiles the same presets into the CLI package; existing themes do not acquire an animation implicitly.

### PDF documents

Read or download the [GitPageDocs project guide (PDF, English)](cli/content/assets/gitpagedocs-project-guide.pdf). The CLI includes this real PDF in each generated version under `en/gitpagedocs-project-guide.pdf`; the example route points all three languages to the English document.

Configure `site.pdf` with `enabled`, `previewEnabled`, `downloadEnabled` and `openInNewTabEnabled` (all default to `true`). The version config uses `routes-pdf`, `pdf.pathPdf` per language and `menus-header-pdf` with `page:23` for the bundled example. Route-level preview/download/new-tab options go inside `pdf`; `hierarchyPage.pdf` and `hierarchyMenu.pdf` order the content and menu sections.

```json
{ "id": 23, "pdf": { "pathPdf": { "en": "gitpagedocs/docs/versions/0.0.16/en/gitpagedocs-project-guide.pdf", "pt": "gitpagedocs/docs/versions/0.0.16/en/gitpagedocs-project-guide.pdf", "es": "gitpagedocs/docs/versions/0.0.16/en/gitpagedocs-project-guide.pdf" }, "previewEnabled": true, "downloadEnabled": true, "openInNewTabEnabled": true } }
```

The native browser viewer handles PDF previews and new tabs through validated `application/pdf` Blob URLs. Preview, download and new-tab actions all require CORS permission for external files. Opening a new tab does not navigate to the raw repository URL, so that server's Content-Type/Content-Disposition does not force a download. Browser PDF support and user preferences still apply. With preview disabled, the first download or new-tab action loads the PDF; cached bytes are reused. File/network errors and blocked pop-ups are reported without silently falling back to the raw URL.

PDF action icons are independent: `site.icons.PdfDownload` defaults to `LuDownload`, and `site.icons.PdfOpenInNewTab` defaults to `LuExternalLink`. For example, `"PdfDownload": { "reactIcon": false }` shows download text while the new-tab control remains an icon. The `site.pdf` and route `pdf` action flags control availability separately from appearance.

Next.js dev/build stages repository PDFs and supported native audio/video files from `gitpagedocs/` into public assets and respects the Pages subpath. Files outside that tree must already be in `frontend/public/` or available by HTTP(S). Remote repository routes resolve native media against the repository's raw-file URL. See the generated PDF documents and Paginated containers pages for complete examples.

### Multiple ordered content blocks

A version config can define `pages: [{ id: 39, blocks: [{ id: 'intro', type: 'md', routeId: 1 }, { id: 'repeat', type: 'md', routeId: 1 }] }]`. Use valid JSON with double quotes in the configuration. Block IDs are unique within a page; route references can repeat. The list order determines display order, independently of `hierarchyPage`. Supported types are `md`, `html`, `video`, `audio` and `pdf`; their sources and individual options remain in the corresponding `routes-*` arrays. Reference two route IDs pointing to the same file when two instances need different options.

The example at `gitpagedocs/docs/versions/0.0.10/config.json` and the current scaffold use one destination, `page:39`, containing three Markdown blocks, two HTML blocks, two videos, two audio tracks and three PDFs. See the generated Ordered content blocks guide for the complete JSON, access behavior and compatibility rules. Existing pages without this array retain their behavior.

Routes independently position their configured title and description through `layout.title` and `layout.description`: each accepts `placement: 'inside' | 'outside'` and `position: 'before' | 'after'`. Markdown always keeps configured labels outside its document while honoring before/after. Omitted layout preserves existing presentation. Existing visibility, alignment and CSS settings remain applicable.

### Paginated containers and Markdown markers

A Markdown, HTML, video, audio or PDF route can define `pagination.items: [{ routeId: 51 }, { routeId: 1 }]`, referencing routes of the same type in display order. Each container keeps an independent selection; item title/description language maps override the referenced route's metadata. Existing routes and ordered content blocks remain compatible. The bundled `page:50` demonstrates three Markdown files, two HTML pages, MP4/WebM video, two local WAV files and two PDFs.

`site.containerPagination` supplies shared defaults; route `pagination` overrides them. Defaults are enabled, bottom/right aligned, icon controls for first/previous/next/last, plus current/total count. Configure `alignment`, `placement`, `display`, `showCount`, individual `controls`, React Icons `icons`/`iconSize` and localized `labels`. Pagination also works in Markdown focus mode without closing it; Ctrl+K can open a container's available files. See `container-pagination.md` for complete options, access rules and examples.

`routes-md[].markdownMarkers.items` marks arbitrary visible Markdown text or elements using exactly one of `text` or `selector`, with a unique `id`, optional one-based `occurrence`, localized `label` and theme colors. Every valid marker highlights its target and adds an index link that scrolls there. `site.markdownMarkers` supplies shared enablement/styles; route and item options refine them. This does not replace `RouteGuideSpeciFicbrand`: an empty heading filter still includes all headings. Targets remain unique across repeated Markdown blocks, and source copy/download stays unchanged. See `markdown-markers.md` for translated examples and validation behavior.

### HTML containers and the DOOM example

The scaffold includes a local HTML demonstration whose outer documentation container supplies its title and description. The HTML itself contains only the externally hosted DOOM player, without duplicated prose or a custom load button. Game assets are not bundled. The wrapper is generated as `docs/versions/<version>/{en,pt,es}/doom.html`; the HTML containers guide explains sizing, external URLs and browser restrictions.

Keep both `routes-html` and `menus-header-html` in the version configuration. Menu paths must match the localized HTML paths; local HTML does not use a `page:29` alias. Merge this example with existing arrays:

```json
{
  "routes-html": [{
    "id": 29,
    "title": { "en": "DOOM: HTML example", "pt": "DOOM: exemplo HTML", "es": "DOOM: ejemplo HTML" },
    "description": { "en": "Load an interactive HTML demo", "pt": "Carregue uma demonstração HTML interativa", "es": "Carga una demostración HTML interactiva" },
    "titleIsVisible": true, "descriptionIsVisible": true, "container": "full",
    "path": { "en": "gitpagedocs/docs/versions/0.0.16/en/doom.html", "pt": "gitpagedocs/docs/versions/0.0.16/pt/doom.html", "es": "gitpagedocs/docs/versions/0.0.16/es/doom.html" }
  }],
  "menus-header-html": [{
    "id": 29,
    "en": { "title": "DOOM: HTML example", "path-click": "gitpagedocs/docs/versions/0.0.16/en/doom.html" },
    "pt": { "title": "DOOM: exemplo HTML", "path-click": "gitpagedocs/docs/versions/0.0.16/pt/doom.html" },
    "es": { "title": "DOOM: ejemplo HTML", "path-click": "gitpagedocs/docs/versions/0.0.16/es/doom.html" }
  }]
}
```

Select the HTML menu entry: the SDK loads when the page opens, and the native Play control starts the game. Internet access and a compatible browser are required. Bootstrap failures display an error asking you to reload the page. Only publish trusted HTML: the existing iframe permits scripts and same-origin content. Test keyboard access, mobile layout and the actual deployed Pages URL; external availability and framing policies remain controlled by the provider.
<!-- gitpagedocs:end -->
