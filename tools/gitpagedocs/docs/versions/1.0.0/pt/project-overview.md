# Visao geral do projeto

Git Page Docs e um monorepo pnpm + turborepo que transforma a pasta `gitpagedocs/` de um repositorio em um site de documentacao multilinguagem e versionado — com assistente de IA integrado e um servidor MCP (Model Context Protocol).

## Pacotes do monorepo

- **frontend/** — visualizador Next.js 15 (App Router, React 19), exportado estaticamente para o GitHub Pages.
- **cli/** — o pacote npm publicado `gitpagedocs` (`npm install -g gitpagedocs`): gera a estrutura de docs, documenta com IA, configura o Pages e roda o servidor MCP.
- **tools/** — `@gitpagedocs/tools`, o nucleo de logica compartilhado: sistema de IA com 14 provedores, cofre de credenciais criptografado, loader de config, caches e logger.
- **mcp/** — `@gitpagedocs/mcp`, servidor Model Context Protocol (20 ferramentas + 7 recursos).
- **gitpagedocs/** — o contrato do usuario: `config.json`, docs versionados e layouts.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript; exportacao estatica para GitHub Pages
- gray-matter + marked para Markdown; react-icons
- pnpm workspaces + turborepo; Vitest + Playwright; ESLint

## Destaques

- Multilinguagem (`en`, `pt`, `es`) e rotas por versao (`/v/:version`)
- Sistema de IA com 14 provedores (OpenAI, Anthropic, Gemini, Ollama, Mistral, DeepSeek, Cohere, Groq, xAI e mais) com streaming
- Chaves de IA **criptografadas em repouso** (AES-256-GCM) atras de uma senha local — nunca em texto puro
- **Drawer de chat de IA** nos docs + um **console `/ai`** dedicado
- Sistema de 36 temas; execucao local e no GitHub Pages

> Versao: 1.0.0
