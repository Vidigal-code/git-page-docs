# FAQ

## Why are remote repositories not opening locally?

Check:

- `GITPAGEDOCS_REPOSITORY_SEARCH=true` in `.env`
- target repo contains `gitpagedocs/config.json`
- target repo markdown paths match its routes config

## Why does a version path return wrong content?

Check:

- `VersionControl.versions[*].path` in `gitpagedocs/config.json`
- that version config has valid `routes` and `menus-header`
- markdown files exist for each language

## Why does theme selection not apply correctly?

Check:

- `layoutsConfig.json` references valid template files
- template ids are unique
- selected theme exists in loaded themes map

## Why can GitHub Pages behave differently from local?

Because GitHub Pages build mode enables repository-search home and static-export specific behavior.

## Why does an icon still show text?

Set `site.icons.<Control>.reactIcon` to the boolean `true`, with an exact React Icons export name in `tag`. LanguageSelector, ThemeSelector, FocusMode, QuickNavigation, PdfDownload, PdfOpenInNewTab, DocumentPrevious and DocumentNext use icons by default; set any entry to `false` for text. Flat `Icon*ReactIcones` fields take precedence if both formats are present. Check whether the feature itself is disabled, such as `HideThemeSelector`, `FocusMode` or the PDF action flags.

## Why do menu children or breadcrumbs differ?

`nestedMenusEnabled: false` intentionally flattens destinations. Check `submenus`, language objects and `path-click`, then confirm that referenced pages exist and are accessible. Breadcrumbs use `RouteGuide` with route > version > site priority. `RouteguideBrand` controls the heading outline instead.

## Why is narration silent or interrupted?

Check browser support, available voice, language, volume and system output. Voices can load asynchronously or require a remote service. With `mediaExclusivePlayback: true`, another audio/video source stops narration by design. Switching documents cancels the old speech. See Accessibility for setup.

## Why does the MCP command wait or a tool fail?

`mcp start` waits for an MCP client over stdio; it is not a terminal chat prompt. Confirm the process cwd and use the published CLI entry or `mcp/src/bin.ts`. Filesystem/catalog tools need no provider, but generation requires credentials in the MCP process environment. The CLI vault and `.env` are not loaded automatically; inspect `isError` and the client's stderr log.

## Why did regeneration change my pages?

Scaffolding writes generated routes, configs and documentation again. Review changes in Git and keep project-specific content in your chosen source files. In this repository, edit `cli/content/docs-{en,pt,es}.mjs` and route metadata before regeneration; do not edit generated copies as the only source.

> Version: 0.0.8
