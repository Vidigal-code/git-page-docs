# Visión general del proyecto

Git Page Docs es un monorepo pnpm + turborepo que convierte la carpeta `gitpagedocs/` de un repositorio en un sitio de documentación multilingüe y versionado — con un asistente de IA integrado y un servidor MCP (Model Context Protocol).

## Paquetes del monorepo

- **frontend/** — visor Next.js 15 (App Router, React 19), exportado estáticamente para GitHub Pages.
- **cli/** — el paquete npm publicado `@gitpagedocs/cli` (`npm install -g @gitpagedocs/cli`): genera la estructura de docs, documenta con IA, configura Pages y ejecuta el servidor MCP.
- **tools/** — `@gitpagedocs/tools`, el núcleo de lógica compartido: sistema de IA con 14 proveedores, bóveda de credenciales cifrada, cargador de config, caches y logger.
- **mcp/** — `@gitpagedocs/mcp`, servidor Model Context Protocol (20 herramientas + 7 recursos).
- **gitpagedocs/** — el contrato del usuario: `config.json`, docs versionados y layouts.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript; exportación estática para GitHub Pages
- gray-matter + marked para Markdown; react-icons
- pnpm workspaces + turborepo; Vitest + Playwright; ESLint

## Destacados

- Multilingüe (`en`, `pt`, `es`) y rutas por versión (`/v/:version`)
- Sistema de IA con 14 proveedores (OpenAI, Anthropic, Gemini, Ollama, Mistral, DeepSeek, Cohere, Groq, xAI y más) con streaming
- Claves de IA **cifradas en reposo** (AES-256-GCM) detrás de una contraseña local — nunca en texto plano
- **Panel de chat de IA** en los docs + una **consola `/ai`** dedicada
- Sistema de 124 temas (variantes oscuras y claras); ejecución local y en GitHub Pages

> Versión: 0.0.11
