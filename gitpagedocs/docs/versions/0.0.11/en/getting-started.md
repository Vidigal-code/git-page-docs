# Getting Started

Git Page Docs separates the documentation files from the viewer. Install the CLI to create the files; use the official viewer, GitHub Pages or a checkout of the runtime to display them.

## Requirements and installation

Use Node.js 20 or newer. Git is needed for publishing; GitHub CLI is needed when asking the CLI to configure Pages automatically.

```bash
npm install --save-dev @gitpagedocs/cli
npx gitpagedocs --no-interactive --owner YOUR_USER --repo YOUR_REPOSITORY
```

For a one-off run, use `npx --yes @gitpagedocs/cli --no-interactive --owner YOUR_USER --repo YOUR_REPOSITORY`. For a global command, use `npm install -g @gitpagedocs/cli`, then `gitpagedocs`. Run from the repository root.

## Generated contract

- `gitpagedocs/config.json`: site options and version references.
- `gitpagedocs/langs/{en,pt,es}.json`: UI strings.
- `gitpagedocs/docs/versions/<version>/config.json`: routes and menus.
- `gitpagedocs/docs/versions/<version>/{en,pt,es}/*.md`: page content; filenames stay in English across languages.
- `gitpagedocs/icon.svg`: site icon.
- `--layoutconfig` additionally writes `gitpagelayouts/`; use `--layouts-dir` to change that directory.

The generator writes configuration and content; it does not install a Next.js application into your repository. Rerunning it writes the scaffold files again: review the Git diff before keeping changes to hand-edited documentation.

## Read and publish

Commit and push the generated folder, then open `https://vidigal-code.github.io/git-page-docs/YOUR_USER/YOUR_REPOSITORY/` for a public repository. To publish your own site, authenticate with `gh auth login`, then run `npx gitpagedocs pages deploy --owner YOUR_USER --repo YOUR_REPOSITORY`. This generates files, commits and pushes; inspect the resulting GitHub Actions run. See Deployment for the subpath and workflow contract.

## Develop the viewer locally

The following commands belong to a checkout of Git Page Docs, not to a repository containing only generated files:

```bash
git clone https://github.com/Vidigal-code/git-page-docs.git
cd git-page-docs
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

The repository pins pnpm in `packageManager`. `pnpm dev` enables repository search; `pnpm dev:e2e` uses the local documentation. For a production build, run `pnpm build` and `pnpm start`; the start script rebuilds before starting. Use `PORT=3100` in the process environment when port 3000 is occupied.

## Next steps

Use Configuration for languages, icons, navigation, focus and narration; Functionalities for CLI and MCP; Themes and layouts for visual tokens; FAQ for diagnostics.

> Version: 0.0.11
