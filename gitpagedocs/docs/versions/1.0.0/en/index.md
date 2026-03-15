# Git Page Docs

Git Page Docs is a multilingual documentation runtime for repositories that ship a `gitpagedocs/` folder.

## What this project delivers

- Multilingual markdown rendering (`en`, `pt`, `es`)
- Version-aware docs routing (`/v/:version`)
- Theme system with JSON templates
- Local and GitHub Pages execution modes
- Optional repository search + remote rendering

## Folder contract

The runtime expects this structure:

- `gitpagedocs/config.json`
- `gitpagedocs/docs/<lang>/*.md`
- `gitpagedocs/docs/versions/<version>/config.json`
- `gitpagedocs/docs/versions/<version>/<lang>/*.md`
- `gitpagedocs/layouts/layoutsConfig.json`
- `gitpagedocs/layouts/templates/*.json`

## Quick navigation

- Open **Getting Started** for local setup.
- Open **Configuration** for full `config.json` explanation.
- Open **Deployment** for local, server, and GitHub Pages behavior.
- Open **Architecture** for code map and data flow.
- Open **Themes and layouts** for template authoring details.
- Open **FAQ** for troubleshooting.

> Version: 1.0.0
