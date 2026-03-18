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

Use the menu to open:

- **Getting Started** – Setup from zero
- **Project overview** – Stack, goals and structure
- **Functionalities** – CLI, options, configuration, deployment, themes, FAQ
- **GitHub issues and projects** – How to use Issues and Projects
- **Introduction to Git** – Basic Git concepts
- **Source code** – GitHub-style code viewer
- **Configuration** – Full `config.json` explanation
- **Deployment** – Local, server, and GitHub Pages behavior
- **Architecture** – Code map and data flow
- **Themes** – Template authoring details
- **FAQ** – Troubleshooting

## What each page covers

| Page | Description |
|------|-------------|
| Getting Started | Prerequisites, install, generate, local run, CLI behavior, repository search, troubleshooting |
| Project overview | Stack, objectives, folder structure, architecture summary |
| Functionalities | CLI commands and options, generated output, content types, source viewer, configuration keys, deployment, architecture, themes, FAQ |
| GitHub issues and projects | Issues (bugs, features, assignees), Projects (Kanban, tables), workflows |
| Introduction to Git | Basic Git concepts for beginners |
| Source code | File tree, search, syntax highlighting, copy, README preview for all `.md` files |
| Configuration | Site, layout, VersionControl sections; content types; env vars |
| Deployment | Official site, self-hosted GitHub Pages, npm publish |
| Architecture | Route parser, load-docs, docs-shell; data flow; reliability |
| Themes | Layout strategies, template model, runtime behavior |
| FAQ | Remote repos, version path, theme selection, GitHub Pages behavior |

> Version: 1.1.0
