# Project Overview

Git Page Docs is a **pnpm + turborepo monorepo** that turns a repository's `gitpagedocs/` folder into a multilingual, versioned documentation site — with an integrated AI assistant and a Model Context Protocol (MCP) server.

## Monorepo packages

- **frontend/** — Next.js 15 (App Router, React 19) documentation viewer, static-exported for GitHub Pages.
- **cli/** — the published `gitpagedocs` npm package (`npm install -g gitpagedocs`): scaffolds the docs contract, generates docs with AI, configures Pages, and runs the MCP server.
- **tools/** — `@gitpagedocs/tools`, the shared business-logic core: the 14-provider AI system, the encrypted credential vault, the config loader, caches, and the logger.
- **mcp/** — `@gitpagedocs/mcp`, a Model Context Protocol server (20 tools + 7 resources).
- **gitpagedocs/** — the user contract: `config.json`, versioned docs, and layouts.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript; static export for GitHub Pages
- gray-matter + marked for Markdown; react-icons
- pnpm workspaces + turborepo; Vitest + Playwright; ESLint

## Highlights

- Multilingual (`en`, `pt`, `es`) and version-aware routing (`/v/:version`)
- 14-provider AI system (OpenAI, Anthropic, Gemini, Ollama, Mistral, DeepSeek, Cohere, Groq, xAI, and more) with streaming
- AI API keys stored **encrypted at rest** (AES-256-GCM) behind a local password gate — never plaintext
- In-docs **AI chat drawer** plus a dedicated **`/ai` console**
- 36-theme layout system; local and GitHub Pages execution modes

> Version: 1.1.0
