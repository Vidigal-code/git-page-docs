# Git Page Docs

`gitpagedocs` is a CLI to initialize and maintain the official `gitpagedocs/` directory.

Current CLI behavior:
- generates only `gitpagedocs/`
- generates `.json` and `.md` files required for docs, versions, and layouts

## Official Website

You can use the official website to view remote documentation:

- Open `https://vidigal-code.github.io/git-page-docs/`
- Enter the GitHub owner (username) and repository name
- If the target repository uses `gitpagedocs`, the site loads and displays its documentation
- If the target repository does not use `gitpagedocs`, the site shows a message saying that repository is not using `gitpagedocs`

## Installation

```bash
npm install gitpagedocs
```

## CLI Usage

```bash
npx gitpagedocs
```

Supported flags (compatibility mode):
- `--build`
- `--serve`
- `--full`

Note: these flags no longer change artifact type. Output remains only `gitpagedocs/`, with no external command execution.

## Generated Structure (summary)

```text
gitpagedocs/
  config.json
  docs/
    en/*.md
    pt/*.md
    es/*.md
    versions/
      1.0.0/config.json
      1.0.0/{en,pt,es}/*.md
      1.1.0/config.json
      1.1.0/{en,pt,es}/*.md
      1.1.1/config.json
      1.1.1/{en,pt,es}/*.md
  layouts/
    layoutsConfig.json
    layoutsFallbackConfig.json
    templates/*.json
```

## Repository Search (GitHub Pages vs local)

Repository search is no longer controlled by `gitpagedocs/config.json`.

- On GitHub Pages (`GITHUB_ACTIONS=true` build):
  - repository-search home is always enabled.
- On local execution (`npm start` / `npm run dev`):
  - use `GITPAGEDOCS_REPOSITORY_SEARCH=true|false` in `.env`.
  - if `true`, it allows searching and rendering GitHub repositories.
  - if `false`, it renders only local docs from `gitpagedocs/`.

### Environment Variables

- `.env.example`: local configuration template.
- `.env`: real local runtime configuration.
- recommended value:
  - `GITPAGEDOCS_REPOSITORY_SEARCH=true`

## Project Scripts

- `npm run gitpagedocs`: runs `node scripts/gitpagedocs-init.mjs`.
- `npm run gitpagedocs:full`: alias to `node scripts/gitpagedocs-init.mjs`.
- `npm run build`: runs the CLI and then `next build`.
- `npm run build:prebuilt`: runs the CLI, then `next build`, then updates `prebuilt/` from `out/`.
- `npm run dev`: runs `next dev`.
- `npm run start`: runs `npm run build` (prestart) and starts with `next start`.
- `npm run lint`: runs `eslint .`.
