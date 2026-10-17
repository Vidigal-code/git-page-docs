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

The generated versioned documentation includes dedicated pages for configuration, CLI, MCP, recursive navigation, focus mode, accessibility/narration, PDF documents, deployment, architecture, themes and troubleshooting. Each page is available in English, Portuguese and Spanish; Markdown filenames stay in English across languages.

Configure language, theme, focus and Ctrl+K control icons through `gitpagedocs/config.json` → `site.icons`. Set `reactIcon` independently on `LanguageSelector`, `ThemeSelector`, `FocusMode` and `QuickNavigation`; `false` keeps the text controls. Customize `tag`, `size`, `colorDark` and `colorLight` per entry.

`site.nestedMenusEnabled` selects recursive or flat navigation. Breadcrumbs use `RouteGuide` with route > version defaults > site precedence. `site.FocusMode` enables reading mode; `site.focusMode` controls copy, download, section navigation and document navigation independently.

`site.accessibility.narration` configures native browser reading. Voices and offline availability depend on the browser and operating system. `site.mediaExclusivePlayback` coordinates narration, radio, audio and video so only one audible source plays by default.

See [the MCP reference](mcp/README.md) for installation, client configuration, all 20 tools, all 7 resources, provider variables and limits. Start with `gitpagedocs mcp start` from the target project; on a source checkout the direct entry is `node --import tsx mcp/src/bin.ts`.

### PDF documents

Read or download the [GitPageDocs project guide (PDF, English)](cli/content/assets/gitpagedocs-project-guide.pdf). The CLI includes this real PDF in each generated version under `en/gitpagedocs-project-guide.pdf`; the example route points all three languages to the English document.

Configure `site.pdf` with `enabled`, `previewEnabled`, `downloadEnabled` and `openInNewTabEnabled` (all default to `true`). The version config uses `routes-pdf`, `pdf.pathPdf` per language and `menus-header-pdf` with `page:23` for the bundled example. Route-level preview/download/new-tab options go inside `pdf`; `hierarchyPage.pdf` and `hierarchyMenu.pdf` order the content and menu sections.

```json
{ "id": 23, "pdf": { "pathPdf": { "en": "gitpagedocs/docs/versions/0.0.9/en/gitpagedocs-project-guide.pdf", "pt": "gitpagedocs/docs/versions/0.0.9/en/gitpagedocs-project-guide.pdf", "es": "gitpagedocs/docs/versions/0.0.9/en/gitpagedocs-project-guide.pdf" }, "previewEnabled": true, "downloadEnabled": true, "openInNewTabEnabled": true } }
```

The native browser viewer handles PDF previews through temporary Blob URLs after the file signature is validated. Both preview and download require CORS permission when the file comes from another origin. The new-tab link opens the original URL directly, where browser support and the server's Content-Type/Content-Disposition can cause a download instead of inline display. Next.js dev/build stages repository PDFs from `gitpagedocs/` into public assets and respects the Pages subpath; other local files must be in `frontend/public/`. See the generated PDF documents page for complete site, route and menu examples.
<!-- gitpagedocs:end -->
