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
- `gitpagelayouts/layoutsConfig.json` (only with `--layoutconfig`)
- `gitpagelayouts/templates/*.json` (only with `--layoutconfig`)

## Quick navigation

- Open **Getting Started** for local setup.
- Open **Configuration** for full `config.json` explanation.
- Open **Deployment** for local, server, and GitHub Pages behavior.
- Open **Architecture** for code map and data flow.
- Open **Themes and layouts** for template authoring details.
- Open **Authorized routes** for key, roles, and external auth setup.
- Open **FAQ** for troubleshooting.

## Detailed references

- **CLI reference**: installation, every command and compatibility flags.
- **MCP server**: client setup, all 20 tools, 7 resources and provider configuration.
- **Navigation and nested menus**: recursive trees, URLs and breadcrumb overrides.
- **Ordered content blocks**: repeat and reorder Markdown, HTML, video, audio and PDF in one page; independently position configured titles and descriptions.
- **Focus mode**: copy/download Markdown and section/document navigation.
- **Accessibility and narration**: browser voices, controls and media interaction.
- **PDF documents**: native previews, download/new-tab controls and the included English guide.
- **Configuration recipes**: a complete multilingual site and a menu with sections inside sections.
- **Migration and compatibility**: upgrade configurations from 0.0.1 onward while preserving your content.
- **Troubleshooting**: UTF-8, local and Pages paths, PDF loading, browser voices and MCP startup.
- **Contributing and validation**: source files, generation, public contracts and release checks.
- **HTML containers**: local and external pages, route/menu configuration and the interactive DOOM example.

The generated menu keeps Getting Started and Project overview first. Guides contains Configure your site, Read and explore, and Automate and integrate; each category contains its related pages. Operations and development groups publishing, maintenance and contribution guides. Git and GitHub contains the repository examples. Categories can contain further categories without a fixed nesting limit.

> Version: 0.0.9
