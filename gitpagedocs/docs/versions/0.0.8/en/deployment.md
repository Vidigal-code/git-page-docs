# Deployment

Choose the official viewer for a public repository, deploy a dedicated GitHub Pages site, or host a static export built from the runtime.

## Official viewer

Commit the generated `gitpagedocs/` folder to your public repository. Open `https://vidigal-code.github.io/git-page-docs/OWNER/REPOSITORY/`; select a version and language. The viewer fetches the repository configuration and content. A private repository is not made public by using this URL.

## Your GitHub Pages site

Prerequisites: Git repository, a GitHub origin, permission to push, and authenticated GitHub CLI (`gh auth login`) when configuring Pages through the CLI.

```bash
npx gitpagedocs pages deploy --owner OWNER --repo REPOSITORY
```

This flow confirms the target, generates docs and `.github/workflows/gitpagedocs-pages.yml`, commits, pushes and requests GitHub Actions as the Pages source. To change only the source, use `npx gitpagedocs pages actions`. To publish under a subpath, pass `--path docs`.

Watch the GitHub Actions run until deployment succeeds; the CLI's printed URL can appear before the remote build finishes. Project sites normally use `https://OWNER.github.io/REPOSITORY/`; user/organization sites use the root of their `OWNER.github.io` repository.

## Build contract

The workflow installs the pinned pnpm workspace dependencies, builds the viewer and uploads the static artifact with the official Pages actions. Its deploy job needs `pages: write`, `id-token: write` and the `github-pages` environment.

- `GITHUB_ACTIONS=true` enables Next.js static export.
- `GITHUB_REPOSITORY=OWNER/REPOSITORY` supplies the repository base path.
- `GITPAGEDOCS_REPOSITORY_SEARCH=true` enables the search-home build.
- `GITPAGEDOCS_BASE_PATH` can explicitly override the base path; `GITPAGEDOCS_PATH` supplies the docs subpath.
- `GITPAGEDOCS_DIST_DIR` separates build/dev output when running two local servers.

A normal `pnpm build` without the Pages environment is a Next.js production build; it does not by itself prove the static export. Preserve `.nojekyll` when hosting the export on Pages.

## Standalone export

From a runtime checkout with installed dependencies, `node cli/index.mjs --home --output gitpagedocshome --no-interactive` builds `frontend/` and packages a static distribution. `--search true` enables its repository-search home. The output includes static files, a README, Dockerfile and environment example; its destination is recreated. A static web server serves the resulting files; changing a build-time environment option requires another build.

## npm releases for maintainers

The monorepo publishes `@gitpagedocs/tools`, `@gitpagedocs/mcp` and `@gitpagedocs/cli`; the workspace root and frontend are private. The current `npm-publish.yml` runs on pushes to `main` and skips a CLI version already on npm. It uses the repository's `NPM_TOKEN` secret and publishes workspaces in dependency order. Creating a GitHub release alone is not its trigger.

Synchronize package versions and internal dependencies, regenerate docs/baselines, run typecheck, lint, tests, smoke checks, build and Playwright, then review before pushing. Confirm all three package versions on npm and the Pages workflow result. The config-only CLI ignores `prebuilt/`; it is not required by this publishing workflow.

> Version: 0.0.8
