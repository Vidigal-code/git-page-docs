# Troubleshooting a documentation site

Start with one failing URL, its selected version and language, the expected result and the actual result. Record the deployed commit and `gitpagedocs version`. Run `gitpagedocs doctor` from the repository root to check tools and configuration discovery. Doctor does not validate every document or prove that a deployment is healthy.

## Choose the failing environment

- **Local only:** confirm the working directory contains `gitpagedocs/config.json`. Check the dev server output and its actual port. Restart after changing build-time configuration. A local file existing elsewhere on disk does not make it a public web asset.
- **Pages only:** inspect the latest Deploy GitPageDocs Actions run and published commit. Compare failed network requests with the expected repository subpath. HTML loading while CSS or JavaScript returns 404 usually warrants checking the build path before changing content.
- **Remote repository only:** confirm the target repository is reachable, its selected branch contains the documentation root and referenced files are committed. Repository-search mode requires `GITPAGEDOCS_REPOSITORY_SEARCH=true` locally. Test the same repository directly before debugging a different site's viewer.

For a custom mount, inspect `GITPAGEDOCS_PATH`, `GITPAGEDOCS_BASE_PATH` and the generated workflow together. Next.js embeds the base path during the build; changing an environment variable on an already exported folder does not rewrite its bundles. After a fresh deployment, try a hard reload or private window to distinguish stale browser resources from a server-side 404.

## Trace a document from configuration to bytes

Follow `VersionControl.versions[*].path` to the version config, then the route's language-specific path. Check spelling and letter case against the tracked file; deployment hosts may distinguish case even when your workstation does not. A menu label does not create a route. Use a valid destination and check that its authorization rules allow the current reader.

Confirm `site.languages`, the UI bundle in `langs/` and the document language mapping separately. PDF paths have no automatic language fallback. Preserve UTF-8 in JSON and Markdown, including `site.name` and accented titles. Compare actual saved text with the browser and terminal output before diagnosing an encoding bug; fonts and display contexts can also differ. English filenames are a project convention, not a restriction on accents in content. Do not remove accents to hide corrupted bytes.

## Diagnose PDF and reading controls

Inspect the PDF fetch status and response body. The file must begin with `%PDF-`; an HTML login screen or repository preview page is not a PDF even with status 200. Preview, download and new-tab opening all need CORS permission for external origins. A local download succeeding outside the browser does not prove browser access is allowed.

Allow popups for the site and retry the explicit open button. The viewer opens validated Blob bytes, so attachment headers from raw hosting do not directly control that new URL. Native PDF support and browser download preferences still vary. Check site and route action switches before treating a deliberately hidden control as a loading error.

For silent narration, check browser speech support, available voices, selected language, volume and system output. Voices can arrive asynchronously or depend on a remote service. Starting other audible media stops narration when `mediaExclusivePlayback` is enabled. Document or language navigation cancels the previous speech.

## Separate access and process problems

Hidden menus and client-side authorization do not protect public files on a static host. Verify confidential content's actual hosting permissions; changing UI roles cannot secure an exposed PDF URL.

An MCP process waiting on `gitpagedocs mcp start` is normal: it speaks stdio to a client, not an interactive terminal. Confirm its working directory, executable and inherited environment. Provider credentials must exist in that process; the CLI vault and `.env` are not loaded automatically. Keep stdout for protocol messages, inspect stderr and tool `isError` results, and share diagnostic excerpts without secrets.

> Version: 0.0.10
