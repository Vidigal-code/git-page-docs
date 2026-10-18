import { HTML_ROUTE_JSON, RECIPE_ROOT_JSON, RECIPE_VERSION_JSON } from "./configuration-examples.mjs";

export const practicalEn = {
  htmlContainers: `# HTML containers and interactive examples

An HTML route displays a local document or an external web page inside an iframe. Use it for a trusted interactive demonstration that Markdown cannot express. The scaffold includes **DOOM: HTML example**, route 29. Its title and description belong to the documentation container; the HTML itself contains only the game player, without repeated headings, instructions or a custom load button. The game remains hosted by its provider; the npm package contains the HTML integration, not the game assets.

## Configure a local HTML route

Add this route to the version configuration's existing \`routes-html\` array. Keep other routes and give each destination a distinct ID. Create each referenced file as UTF-8 HTML, or generate the bundled example with the CLI.

\`\`\`json
${HTML_ROUTE_JSON}
\`\`\`

Add a localized item in \`menus-header-html\`. Each \`path-click\` must match its language's route path, such as \`gitpagedocs/docs/versions/0.0.12/en/doom.html\`; do not substitute \`page:29\` for this local HTML path. Menu labels do not create routes. HTML uses the same recursive \`submenus\` structure as other menus.

## Size, content and external URLs

\`container: "full"\` gives the content a viewport-related minimum height; a positive number sets its height in pixels. Omit it for the normal container. \`fullscreenEnabled\` controls the viewer's fullscreen action. Route title and description remain separate from any heading authored inside the HTML document.

For a hosted page, use \`url: { "en": "https://example.com/demo", "pt": "https://example.com/demo", "es": "https://example.com/demo" }\` instead of \`path\`. A URL route uses iframe navigation; local HTML is loaded into \`srcDoc\`. For local content, prefer self-contained styling and explicit HTTPS asset URLs: a srcDoc document does not automatically resolve assets relative to the original file's directory.

The external host can prevent framing through CSP or X-Frame-Options. Known blocked hosts receive an open-in-new-tab alternative; arbitrary hosting failures are not universally detectable. Test the actual target in the deployed site. \`blockLink: true\` sets the default target of links in local HTML to a new tab; it does not prevent navigation performed by scripts or links that set their own target.

## Use and maintain the game example

Select the HTML menu entry. The player SDK loads when the page opens; use its native Play control to start the game. There is no automatic game start or separate documentation load button. Network access is required. A bootstrap failure displays an error asking you to reload the page; the normal view contains only the player. Test keyboard focus, small screens, fullscreen and returning to the documentation. Third-party player availability and browser capabilities can change independently of GitPageDocs.

Review HTML and dependencies before publishing. The current iframe permits scripts and same-origin content, so it is not a security boundary for arbitrary untrusted HTML. Do not put secrets in HTML, URLs or client configuration. Static hosting exposes the files independently of menu visibility or route authorization. For local development and Pages, commit the wrapper alongside its version configuration and validate the generated paths before deployment.
`,
  configurationRecipes: `# Configuration recipes

This guide builds a small multilingual documentation site with two Markdown pages and a menu three levels deep. Start from generated configuration, review your changes and keep the original files in version control. The examples use IDs 101 and 102 so they can be distinguished from the bundled pages.

## 1. Generate and inspect the scaffold

The scaffold includes versions 0.0.12, 0.0.11 and 0.0.10 in the version selector. All three contain the current examples; the package version is 0.0.12. Their paths and version badges are generated for the selected documentation version. Older existing version folders are not deleted.

Run \`npx --yes @gitpagedocs/cli@0.0.12 --no-interactive --owner YOUR_USER --repo YOUR_REPOSITORY\` in a new project directory. In this source repository, \`node cli/index.mjs\` runs the checked-out version. Generation writes configuration and documentation; it does not start the Next.js viewer.

Use the following complete JSON as a minimal root-config example in \`gitpagedocs/config.json\`. For an existing site, merge the relevant fields and preserve its repository identity, deployment settings, themes and other versions.

\`\`\`json
${RECIPE_ROOT_JSON}
\`\`\`

The nine entries inherit the common icon presentation from \`icons.defaults\`. To display text for one action, add \`"reactIcon": false\` to that entry. Do not change a shared default just to alter one button. Existing flat icon fields win over compact fields, so remove or update an old conflicting field deliberately.

## 2. Create the version configuration

Save the next complete JSON document at the version-config path shown above. A menu category has a title and \`submenus\`; a leaf has a localized \`path-click\`. Categories do not need a route. Markdown leaves point to actual Markdown paths rather than \`page:<id>\` aliases.

\`\`\`json
${RECIPE_VERSION_JSON}
\`\`\`

Create \`start.md\` and \`next-steps.md\` in each of the version's \`en\`, \`pt\` and \`es\` folders: six files in total. Write the corresponding language in each file and save it as UTF-8. Start each page with a heading; add \`##\` sections to exercise the focus reader. The generated \`langs/\` bundles provide interface text separately from document content.

## 3. Change presentation without losing destinations

With \`nestedMenusEnabled: true\`, readers expand Guides → Getting started → page. Setting it to \`false\` exposes the same destinations as a flat menu. Add further \`submenus\` recursively when the content justifies it; there is no fixed configured depth limit. Keep sibling identities distinct and avoid repeating the same destination merely to make the tree deeper.

Breadcrumbs use \`site.RouteGuide\`, then version \`routeDefaults.RouteGuide\`, then the individual route. The most specific explicit value wins. \`RouteguideBrand\` is the separate heading outline. Footer previous/next arrows follow available menu destinations; \`ActiveNavigation\` controls quick navigation and Ctrl+K.

## 4. Add media and verify the result

Use the PDF documents reference to add \`routes-pdf\` and \`menus-header-pdf\`; its \`page:23\` example points to the bundled English file. Preview, download and new-tab controls are independent of their icon appearance. External PDF files need CORS for all three actions; local repository PDFs under \`gitpagedocs/\` are staged during Next.js dev/build.

Check every language, expand all menu groups and follow each leaf. Try direct page URLs, text/icon overrides, focus first/previous/next/last controls and the disabled navigation boundaries. Inspect the generated version config when a label works but a destination does not. Commit the reviewed configuration together with all referenced documents and assets.
`,
  contributing: `# Contributing and testing

Work from the source repository when changing the runtime, CLI, shared tools or MCP server. A consuming documentation repository normally edits its own content and configuration instead. Keep a focused branch and describe the user-visible behavior and how it was verified.

## Work in the owning package

\`frontend/\` contains the Next.js App Router viewer and follows Feature-Sliced Design. Shared visual primitives live in \`shared\`, documentation data and schemas in \`entities\`, user capabilities in \`features\`, and the assembled reader in \`widgets\`. Keep filesystem and repository loading out of presentation components.

\`cli/\` owns the scaffold, commands, data defaults and authoring templates. \`tools/\` supplies reusable configuration, documentation and service logic. \`mcp/\` exposes the shared capabilities over Model Context Protocol. A UI fix usually belongs in frontend; a scaffold default must be changed in its CLI source and regenerated.

## Edit sources rather than generated copies

| Change | Source of truth | Generated result |
| --- | --- | --- |
| Site options and language labels | \`cli/data/\` | Root config and \`gitpagedocs/langs/\` |
| Routes and menu sections | CLI builders, route metadata, path mappings and \`menu-sections.mjs\` | Version configuration |
| Documentation prose | \`cli/content/docs-{en,pt,es}.mjs\` and imported content modules | Versioned Markdown |
| Managed repository documents | \`tools/src/documentation/sections.ts\` | README, CONTRIBUTING and SECURITY regions |
| Layout definitions | \`gitpagelayouts/v2/\` | Templates and layout documentation |

After CLI/content changes run \`node cli/index.mjs\`, copy \`gitpagedocs/\` into \`tools/gitpagedocs/\` without deleting historical versions, then run \`pnpm run baseline:create\`. Use \`node cli/index.mjs docs\` for managed regions and \`pnpm run layouts:sync\` for layout changes. Inspect the diff: generation must not silently replace custom material you intended to retain.

## Verify behavior through public interfaces

Write a failing regression before the implementation. Test the observable contract: generated configuration and files for CLI changes, tool/resource responses for MCP, rendered controls and keyboard behavior for UI, and browser interactions for navigation or media. Avoid assertions that only repeat an internal helper's algorithm.

Cover success, unavailable features, malformed inputs and meaningful boundaries. Examples include a missing translation, denied route, empty PDF title, blocked popup, CORS failure, first/last navigation limits and an empty native-voice list. Use isolated temporary output folders for generators. Mock network or browser capabilities at their public boundary; keep the project's own collaborators real when practical.

\`\`\`sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm exec vitest run
pnpm run smoke:all
pnpm run build
pnpm exec cross-env PORT=3100 pnpm run test:e2e
\`\`\`

The E2E configuration uses ports 3100 and 3101; leave port 3000's existing service alone. \`smoke:all\` includes CLI contracts, shared services, MCP discovery, documentation generation and \`baseline:check\`. \`pnpm run test:cov\` adds coverage. A local production build is distinct from the Pages static-export environment, which must also be verified for deployment-path changes.

## Review and release

Review accessibility, authorization, input validation, errors, resource cleanup and generated-file consistency. Analyze each changed source with the configured SonarQube project and the appropriate test/source scope; use the stack parser or linter for unsupported formats. Keep credentials and transient test artifacts out of commits.

Publishable packages are \`@gitpagedocs/tools\`, \`@gitpagedocs/mcp\` and \`@gitpagedocs/cli\`; root and frontend are private. Synchronize versions, internal dependency ranges and lockfile entries, inspect package contents, and finish validation before pushing. The current npm workflow runs on main pushes and publishes in dependency order when the CLI version is new. Confirm npm versions and the Pages deployment afterward; a successful local build alone is not publication.
`,
};
