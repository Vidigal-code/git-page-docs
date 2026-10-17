export const operationsEn = {
  migration: `# Migrating an existing documentation site

GitPageDocs supports configurations and data from the official 0.0.1 release onward. Earlier experimental formats numbered 1.1.x are outside that compatibility contract. A package upgrade and a documentation rewrite are different operations: the generator does not automatically merge your custom pages, routes, translations or themes.

## Save a recoverable starting point

Record the deployed commit, CLI version and workflow revision. Run \`git status --short\`, review pending changes and save the intended source files in a dedicated commit. Keep a separate backup of untracked documentation and custom assets; never add credentials merely to complete the backup. Create a working branch with \`git switch -c docs/upgrade-0.0.10\`.

For a reproducible comparison, invoke the target package explicitly:

\`\`\`sh
npx --yes @gitpagedocs/cli@0.0.10 version
npx --yes @gitpagedocs/cli@0.0.10 --no-interactive --owner YOUR_USER --repo YOUR_REPOSITORY --output gitpagedocs-candidate
git diff --no-index -- gitpagedocs gitpagedocs-candidate
\`\`\`

The last command returns exit code 1 when differences exist; that is expected. The candidate is review material, not an automatically selected live site. Generated configuration still describes canonical \`gitpagedocs/\` paths. Do not publish the candidate as though changing the output directory also changes every runtime path.

## Merge the configuration deliberately

Preserve \`gitpagedocs/config.json\` site identity, deployment settings and \`VersionControl.versions\` entries. Each version points to its own \`docs/versions/<version>/config.json\`; keep those files, their document IDs, route paths and menu destinations aligned. Retain historical version directories needed by existing links. Route arrays are content, not defaults that the viewer reconstructs.

Copy only the new settings you want. Version \`routeDefaults\` supplies shared route settings; an explicit route field overrides its default. Keep per-language Markdown, PDFs and \`gitpagedocs/langs/<language>.json\` bundles. The root \`site.languages\` switches available languages; enabling a language does not create translated documents.

Compact \`site.icons.defaults\` shares icon values, and each named entry can override them. Existing flat \`Icon*ReactIcones\` fields take precedence over compact entries. Remove conflicting duplicates only after confirming their intended effect. Version 0.0.10 defaults LanguageSelector, ThemeSelector, FocusMode, QuickNavigation, PdfDownload, PdfOpenInNewTab, DocumentPrevious and DocumentNext to icons; set an entry's \`reactIcon: false\` to retain text.

PDF opening now fetches validated bytes and opens an \`application/pdf\` Blob in a new tab. External hosting must allow CORS even when preview is disabled. Review the three PDF action switches independently, test popup permissions and preserve translated error labels. Browser PDF preferences still apply.

## Validate and publish the reviewed result

In this runtime repository, edit generation sources before rebuilding: builds regenerate documentation. Run \`pnpm run typecheck\`, \`pnpm run lint\`, \`pnpm exec vitest run\`, \`pnpm run smoke:all\` and \`pnpm run build\`. Run \`pnpm run test:e2e\` with \`PORT=3100\` set in your shell. A consuming repository needs its own equivalent checks.

Test every retained version and language, direct links, nested menus, text/icon settings, PDF actions and authorization behavior. Check the export under the actual Pages subpath. Commit the reviewed files, then push through the existing deployment workflow. Initial \`pages deploy\` scaffolds, commits and pushes; do not rerun it casually over customized documentation.

Record the deployed commit after a successful Actions run. If verification fails, revert the dedicated upgrade commit with \`git revert UPGRADE_COMMIT\`, restore the previous runtime pin when applicable, push and rerun the deployment. Confirm the public URL serves the restored version; a successful revert alone does not publish it.
`,
  troubleshooting: `# Troubleshooting a documentation site

Start with one failing URL, its selected version and language, the expected result and the actual result. Record the deployed commit and \`gitpagedocs version\`. Run \`gitpagedocs doctor\` from the repository root to check tools and configuration discovery. Doctor does not validate every document or prove that a deployment is healthy.

## Choose the failing environment

- **Local only:** confirm the working directory contains \`gitpagedocs/config.json\`. Check the dev server output and its actual port. Restart after changing build-time configuration. A local file existing elsewhere on disk does not make it a public web asset.
- **Pages only:** inspect the latest Deploy GitPageDocs Actions run and published commit. Compare failed network requests with the expected repository subpath. HTML loading while CSS or JavaScript returns 404 usually warrants checking the build path before changing content.
- **Remote repository only:** confirm the target repository is reachable, its selected branch contains the documentation root and referenced files are committed. Repository-search mode requires \`GITPAGEDOCS_REPOSITORY_SEARCH=true\` locally. Test the same repository directly before debugging a different site's viewer.

For a custom mount, inspect \`GITPAGEDOCS_PATH\`, \`GITPAGEDOCS_BASE_PATH\` and the generated workflow together. Next.js embeds the base path during the build; changing an environment variable on an already exported folder does not rewrite its bundles. After a fresh deployment, try a hard reload or private window to distinguish stale browser resources from a server-side 404.

## Trace a document from configuration to bytes

Follow \`VersionControl.versions[*].path\` to the version config, then the route's language-specific path. Check spelling and letter case against the tracked file; deployment hosts may distinguish case even when your workstation does not. A menu label does not create a route. Use a valid destination and check that its authorization rules allow the current reader.

Confirm \`site.languages\`, the UI bundle in \`langs/\` and the document language mapping separately. PDF paths have no automatic language fallback. Preserve UTF-8 in JSON and Markdown, including \`site.name\` and accented titles. Compare actual saved text with the browser and terminal output before diagnosing an encoding bug; fonts and display contexts can also differ. English filenames are a project convention, not a restriction on accents in content. Do not remove accents to hide corrupted bytes.

## Diagnose PDF and reading controls

Inspect the PDF fetch status and response body. The file must begin with \`%PDF-\`; an HTML login screen or repository preview page is not a PDF even with status 200. Preview, download and new-tab opening all need CORS permission for external origins. A local download succeeding outside the browser does not prove browser access is allowed.

Allow popups for the site and retry the explicit open button. The viewer opens validated Blob bytes, so attachment headers from raw hosting do not directly control that new URL. Native PDF support and browser download preferences still vary. Check site and route action switches before treating a deliberately hidden control as a loading error.

For silent narration, check browser speech support, available voices, selected language, volume and system output. Voices can arrive asynchronously or depend on a remote service. Starting other audible media stops narration when \`mediaExclusivePlayback\` is enabled. Document or language navigation cancels the previous speech.

## Separate access and process problems

Hidden menus and client-side authorization do not protect public files on a static host. Verify confidential content's actual hosting permissions; changing UI roles cannot secure an exposed PDF URL.

An MCP process waiting on \`gitpagedocs mcp start\` is normal: it speaks stdio to a client, not an interactive terminal. Confirm its working directory, executable and inherited environment. Provider credentials must exist in that process; the CLI vault and \`.env\` are not loaded automatically. Keep stdout for protocol messages, inspect stderr and tool \`isError\` results, and share diagnostic excerpts without secrets.
`,
};
