import { PROVIDER_CATALOG, ALL_PROVIDER_IDS } from "../ai/catalog";

/**
 * Deterministic documentation section generators. Pure functions over the
 * static catalog/command data, so the managed regions they produce are stable
 * across runs (idempotent) and require no AI call.
 */

/** Markdown table of supported AI providers and their default models. */
export function providersSection(): string {
  const header = "| Provider | ID | Default model | Capabilities |\n| --- | --- | --- | --- |";
  const rows = ALL_PROVIDER_IDS.map((id) => {
    const spec = PROVIDER_CATALOG[id];
    const caps = [
      spec.capabilities.streaming ? "stream" : null,
      spec.capabilities.vision ? "vision" : null,
      spec.capabilities.audio ? "audio" : null,
    ]
      .filter(Boolean)
      .join(", ");
    return `| ${spec.label} | \`${id}\` | \`${spec.defaultModel}\` | ${caps || "text"} |`;
  });
  return [`### Supported AI providers (${ALL_PROVIDER_IDS.length})`, "", header, ...rows].join("\n");
}

export interface CommandDoc {
  readonly name: string;
  readonly summary: string;
}

/** Markdown list of CLI commands. */
export function cliCommandsSection(commands: readonly CommandDoc[]): string {
  const items = commands.map((c) => `- \`gitpagedocs ${c.name}\` — ${c.summary}`);
  return [
    "### CLI commands",
    "",
    ...items,
    "",
    "### User references",
    "",
    "The generated documentation includes 32 Markdown pages per language: focused references plus complete configuration recipes, migration/compatibility, troubleshooting, contributing/testing and HTML-container guides. All pages are available in English, Portuguese and Spanish; Markdown filenames stay in English while titles and content preserve UTF-8 accents and special characters.",
    "The scaffold registers documentation versions 0.0.11 and 0.0.10, both with the current examples; the npm package version is 0.0.11. Paths and version badges match each generated documentation version. Existing older version folders are preserved.",
    "",
    "The scaffold has real nested sections: Guides → Configure your site / Read and explore / Automate and integrate → documents, plus Operations and development and Git/GitHub groups. Getting Started and Project overview remain the first destinations. Every parent section has its own localized Markdown overview: click its title to read it, or use the separate arrow to expand children. Breadcrumb ancestors such as Guides → Configure your site remain navigable. Recursive `submenus` can extend the hierarchy without a fixed depth limit; `site.nestedMenusEnabled: false` keeps every destination in a flat presentation.",
    "",
    "Configure controls through `gitpagedocs/config.json` → `site.icons`. `LanguageSelector`, `ThemeSelector`, `FocusMode`, `QuickNavigation`, `PdfDownload`, `PdfOpenInNewTab`, `DocumentPrevious` and `DocumentNext` use icons by default. Set `reactIcon: false` independently to display text; `true` displays the icon. Customize `tag`, `size`, `colorDark` and `colorLight` per entry. Compact configs inherit omitted values from `icons.defaults`, so an omitted per-control `reactIcon` does not mean text mode. The Ctrl+K shortcut and accessible control names remain available.",
    "",
    "`site.nestedMenusEnabled` selects recursive or flat navigation. Breadcrumbs use `RouteGuide` with route > version defaults > site precedence. `site.FocusMode` enables reading mode; `site.focusMode` controls copy, download, section navigation and document navigation independently.",
    "",
    "Focus mode provides eight navigation buttons: first, previous, next and last document, plus first, previous, next and last section. Each navigation flag controls its group of four; document changes keep the reader open and restart at the first section.",
    "",
    "Document-footer controls use `DocumentPrevious` (`LuChevronLeft`) and `DocumentNext` (`LuChevronRight`); either can use its translated text with `reactIcon: false`. The footer appears for multiple available menu destinations and disables unavailable directions. `site.ActiveNavigation` controls quick navigation and Ctrl+K separately.",
    "",
    "`site.accessibility.narration` configures native browser reading. Voices and offline availability depend on the browser and operating system. `site.mediaExclusivePlayback` coordinates narration, radio, audio and video so only one audible source plays by default.",
    "",
    "See [the MCP reference](mcp/README.md) for installation, client configuration, all 20 tools, all 7 resources, provider variables and limits. Start with `gitpagedocs mcp start` from the target project; on a source checkout the direct entry is `node --import tsx mcp/src/bin.ts`.",
    "",
    "### PDF documents",
    "",
    "Read or download the [GitPageDocs project guide (PDF, English)](cli/content/assets/gitpagedocs-project-guide.pdf). The CLI includes this real PDF in each generated version under `en/gitpagedocs-project-guide.pdf`; the example route points all three languages to the English document.",
    "",
    "Configure `site.pdf` with `enabled`, `previewEnabled`, `downloadEnabled` and `openInNewTabEnabled` (all default to `true`). The version config uses `routes-pdf`, `pdf.pathPdf` per language and `menus-header-pdf` with `page:23` for the bundled example. Route-level preview/download/new-tab options go inside `pdf`; `hierarchyPage.pdf` and `hierarchyMenu.pdf` order the content and menu sections.",
    "",
    "```json",
    '{ "id": 23, "pdf": { "pathPdf": { "en": "gitpagedocs/docs/versions/0.0.11/en/gitpagedocs-project-guide.pdf", "pt": "gitpagedocs/docs/versions/0.0.11/en/gitpagedocs-project-guide.pdf", "es": "gitpagedocs/docs/versions/0.0.11/en/gitpagedocs-project-guide.pdf" }, "previewEnabled": true, "downloadEnabled": true, "openInNewTabEnabled": true } }',
    "```",
    "",
    "The native browser viewer handles PDF previews and new tabs through validated `application/pdf` Blob URLs. Preview, download and new-tab actions all require CORS permission for external files. Opening a new tab does not navigate to the raw repository URL, so that server's Content-Type/Content-Disposition does not force a download. Browser PDF support and user preferences still apply. With preview disabled, the first download or new-tab action loads the PDF; cached bytes are reused. File/network errors and blocked pop-ups are reported without silently falling back to the raw URL.",
    "",
    "PDF action icons are independent: `site.icons.PdfDownload` defaults to `LuDownload`, and `site.icons.PdfOpenInNewTab` defaults to `LuExternalLink`. For example, `\"PdfDownload\": { \"reactIcon\": false }` shows download text while the new-tab control remains an icon. The `site.pdf` and route `pdf` action flags control availability separately from appearance.",
    "",
    "Next.js dev/build stages repository PDFs from `gitpagedocs/` into public assets and respects the Pages subpath; other local files must be in `frontend/public/`. See the generated PDF documents page for complete site, route, menu and icon examples.",
    "",
    "### Multiple ordered content blocks",
    "",
    "A version config can define `pages: [{ id: 39, blocks: [{ id: 'intro', type: 'md', routeId: 1 }, { id: 'repeat', type: 'md', routeId: 1 }] }]`. Use valid JSON with double quotes in the configuration. Block IDs are unique within a page; route references can repeat. The list order determines display order, independently of `hierarchyPage`. Supported types are `md`, `html`, `video`, `audio` and `pdf`; their sources and individual options remain in the corresponding `routes-*` arrays. Reference two route IDs pointing to the same file when two instances need different options.",
    "",
    "The example at `gitpagedocs/docs/versions/0.0.10/config.json` and the current scaffold use one destination, `page:39`, containing three Markdown blocks, two HTML blocks, two videos, two audio tracks and three PDFs. See the generated Ordered content blocks guide for the complete JSON, access behavior and compatibility rules. Existing pages without this array retain their behavior.",
    "",
    "Routes independently position their configured title and description through `layout.title` and `layout.description`: each accepts `placement: 'inside' | 'outside'` and `position: 'before' | 'after'`. Markdown always keeps configured labels outside its document while honoring before/after. Omitted layout preserves existing presentation. Existing visibility, alignment and CSS settings remain applicable.",
    "",
    "### HTML containers and the DOOM example",
    "",
    "The scaffold includes a local HTML demonstration whose outer documentation container supplies its title and description. The HTML itself contains only the externally hosted DOOM player, without duplicated prose or a custom load button. Game assets are not bundled. The wrapper is generated as `docs/versions/<version>/{en,pt,es}/doom.html`; the HTML containers guide explains sizing, external URLs and browser restrictions.",
    "",
    "Keep both `routes-html` and `menus-header-html` in the version configuration. Menu paths must match the localized HTML paths; local HTML does not use a `page:29` alias. Merge this example with existing arrays:",
    "",
    "```json",
    "{",
    '  "routes-html": [{',
    '    "id": 29,',
    '    "title": { "en": "DOOM: HTML example", "pt": "DOOM: exemplo HTML", "es": "DOOM: ejemplo HTML" },',
    '    "description": { "en": "Load an interactive HTML demo", "pt": "Carregue uma demonstração HTML interativa", "es": "Carga una demostración HTML interactiva" },',
    '    "titleIsVisible": true, "descriptionIsVisible": true, "container": "full",',
    '    "path": { "en": "gitpagedocs/docs/versions/0.0.11/en/doom.html", "pt": "gitpagedocs/docs/versions/0.0.11/pt/doom.html", "es": "gitpagedocs/docs/versions/0.0.11/es/doom.html" }',
    "  }],",
    '  "menus-header-html": [{',
    '    "id": 29,',
    '    "en": { "title": "DOOM: HTML example", "path-click": "gitpagedocs/docs/versions/0.0.11/en/doom.html" },',
    '    "pt": { "title": "DOOM: exemplo HTML", "path-click": "gitpagedocs/docs/versions/0.0.11/pt/doom.html" },',
    '    "es": { "title": "DOOM: ejemplo HTML", "path-click": "gitpagedocs/docs/versions/0.0.11/es/doom.html" }',
    "  }]",
    "}",
    "```",
    "",
    "Select the HTML menu entry: the SDK loads when the page opens, and the native Play control starts the game. Internet access and a compatible browser are required. Bootstrap failures display an error asking you to reload the page. Only publish trusted HTML: the existing iframe permits scripts and same-origin content. Test keyboard access, mobile layout and the actual deployed Pages URL; external availability and framing policies remain controlled by the provider.",
  ].join("\n");
}

/** Markdown block documenting the monorepo dev workflow (deterministic). */
export function devWorkflowSection(): string {
  const cmds = [
    ["pnpm install", "install workspace dependencies"],
    ["pnpm run typecheck", "type-check frontend + tools + mcp"],
    ["pnpm run lint", "lint the project"],
    ["pnpm run test:unit", "run the Vitest unit/integration suite"],
    ["pnpm run test:cov", "unit tests with coverage"],
    ["pnpm exec cross-env PORT=3100 pnpm run test:e2e", "Playwright frontend E2E on ports 3100 and 3101"],
    ["pnpm run smoke:all", "CLI/contract/tools/mcp regression wall"],
    ["pnpm run build", "build the Next.js production runtime; Pages export additionally requires its build environment"],
  ];
  return [
    "### Development",
    "",
    "This is a pnpm + turbo monorepo: `frontend/` (Next.js viewer), `cli/` (the published `gitpagedocs` npm package), `tools/` (`@gitpagedocs/tools` shared core), and `mcp/` (`@gitpagedocs/mcp` server).",
    "",
    ...cmds.map(([c, d]) => `- \`${c}\` — ${d}`),
  ].join("\n");
}

/** Markdown block summarizing how API keys are handled (deterministic). */
export function securityNoteSection(): string {
  return [
    "### API key handling",
    "",
    "- API keys are stored **encrypted at rest** (AES-256-GCM, key derived with PBKDF2-HMAC-SHA-256) behind a local password — never in plaintext.",
    "- Site: the `/ai` console and the chat drawer keep the vault in `localStorage`; the drawer locks itself after `site.AiChatAutoLockSeconds` idle seconds (default 30) and asks for the password again.",
    "- CLI: `gitpagedocs ai` / `gitpagedocs chat` seal the key in `.gitpagedocsvault` next to `.gitpagedocsconfig`; the vault password is created on first use and asked on every run (`GITPAGEDOCS_VAULT_PASSWORD` for non-interactive runs).",
    "- The password gates sensitive operations and is held only in memory for the session.",
    "- Keys are **never logged** (the logger redacts secrets) and are sent only to the AI provider you select.",
    "- To report a vulnerability, open a security advisory or issue on the repository.",
  ].join("\n");
}

/** The canonical command list for the documentation (legacy + new verbs). */
export const CLI_COMMANDS: readonly CommandDoc[] = [
  { name: "init", summary: "scaffold gitpagedocs config files" },
  { name: "config", summary: "show the resolved gitpagedocs config" },
  { name: "provider [id]", summary: "list AI providers or show one" },
  { name: "models [provider]", summary: "list catalog models" },
  { name: "ai", summary: "interactive AI docs generator (writes pages in the gitpagedocs pattern)" },
  { name: "chat [question]", summary: "streaming AI chat in the terminal (REPL on a TTY; one-shot with a question or piped stdin)" },
  { name: "document[:repo|:file|:folder]", summary: "aliases of the interactive documentation generator; select input directories in its prompts" },
  { name: "password", summary: "set a documentation access password (writes the public key to config.json)" },
  { name: "config clear", summary: "delete the stored .gitpagedocsconfig and the encrypted key vault" },
  { name: "docs", summary: "refresh the managed regions of README, CONTRIBUTING and SECURITY" },
  { name: "deploy | pages", summary: "configure GitHub Pages via Actions and push" },
  { name: "pages actions", summary: "switch the repository's GitHub Pages source to GitHub Actions (no docs generation or push)" },
  { name: "pages deploy", summary: "detect owner/repo, confirm, then generate, commit, push and print the site URL" },
  { name: "doctor", summary: "diagnose the environment" },
  { name: "mcp start", summary: "start the MCP server over stdio" },
  { name: "version", summary: "print the CLI version" },
  { name: "update", summary: "check the registry for a newer CLI and print the install command" },
];
