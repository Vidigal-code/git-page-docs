# Migrating an existing documentation site

GitPageDocs supports configurations and data from the official 0.0.1 release onward. Earlier experimental formats numbered 1.1.x are outside that compatibility contract. A package upgrade and a documentation rewrite are different operations: the generator does not automatically merge your custom pages, routes, translations or themes.

## Save a recoverable starting point

Record the deployed commit, CLI version and workflow revision. Run `git status --short`, review pending changes and save the intended source files in a dedicated commit. Keep a separate backup of untracked documentation and custom assets; never add credentials merely to complete the backup. Create a working branch with `git switch -c docs/upgrade-0.0.10`.

For a reproducible comparison, invoke the target package explicitly:

```sh
npx --yes @gitpagedocs/cli@0.0.11 version
npx --yes @gitpagedocs/cli@0.0.11 --no-interactive --owner YOUR_USER --repo YOUR_REPOSITORY --output gitpagedocs-candidate
git diff --no-index -- gitpagedocs gitpagedocs-candidate
```

The last command returns exit code 1 when differences exist; that is expected. The candidate is review material, not an automatically selected live site. Generated configuration still describes canonical `gitpagedocs/` paths. Do not publish the candidate as though changing the output directory also changes every runtime path.

## Merge the configuration deliberately

Preserve `gitpagedocs/config.json` site identity, deployment settings and `VersionControl.versions` entries. Each version points to its own `docs/versions/<version>/config.json`; keep those files, their document IDs, route paths and menu destinations aligned. Retain historical version directories needed by existing links. Route arrays are content, not defaults that the viewer reconstructs.

Copy only the new settings you want. Version `routeDefaults` supplies shared route settings; an explicit route field overrides its default. Keep per-language Markdown, PDFs and `gitpagedocs/langs/<language>.json` bundles. The root `site.languages` switches available languages; enabling a language does not create translated documents.

Compact `site.icons.defaults` shares icon values, and each named entry can override them. Existing flat `Icon*ReactIcones` fields take precedence over compact entries. Remove conflicting duplicates only after confirming their intended effect. Version 0.0.10 defaults LanguageSelector, ThemeSelector, FocusMode, QuickNavigation, PdfDownload, PdfOpenInNewTab, DocumentPrevious and DocumentNext to icons; set an entry's `reactIcon: false` to retain text.

PDF opening now fetches validated bytes and opens an `application/pdf` Blob in a new tab. External hosting must allow CORS even when preview is disabled. Review the three PDF action switches independently, test popup permissions and preserve translated error labels. Browser PDF preferences still apply.

## Validate and publish the reviewed result

In this runtime repository, edit generation sources before rebuilding: builds regenerate documentation. Run `pnpm run typecheck`, `pnpm run lint`, `pnpm exec vitest run`, `pnpm run smoke:all` and `pnpm run build`. Run `pnpm run test:e2e` with `PORT=3100` set in your shell. A consuming repository needs its own equivalent checks.

Test every retained version and language, direct links, nested menus, text/icon settings, PDF actions and authorization behavior. Check the export under the actual Pages subpath. Commit the reviewed files, then push through the existing deployment workflow. Initial `pages deploy` scaffolds, commits and pushes; do not rerun it casually over customized documentation.

Record the deployed commit after a successful Actions run. If verification fails, revert the dedicated upgrade commit with `git revert UPGRADE_COMMIT`, restore the previous runtime pin when applicable, push and rerun the deployment. Confirm the public URL serves the restored version; a successful revert alone does not publish it.

> Version: 0.0.10
