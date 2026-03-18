# Primeros pasos

Esta guia lleva el proyecto desde cero hasta docs corriendo.

## Requisitos

- Node.js 20+
- npm 10+ (o pnpm)

## Setup local

1. Instala dependencias:
   - `npm install`
2. Genera/actualiza artefactos de docs:
   - `npm run gitpagedocs`
3. Inicia desarrollo:
   - `npm run dev`
4. Build + ejecucion local de produccion:
   - `npm run build`
   - `npm start`

## Comportamiento de la CLI

`npx gitpagedocs` (o `npm run gitpagedocs`) genera artefactos en la carpeta oficial `gitpagedocs/`.

- Genera solo markdown/json
- No genera `index.html`
- No genera `index.js`
- No ejecuta comandos de instalacion

## Modo de busqueda por repositorio

En local, se controla por variable:

- `GITPAGEDOCS_REPOSITORY_SEARCH=true`
- `GITPAGEDOCS_REPOSITORY_SEARCH=false`

En build de GitHub Pages (`GITHUB_ACTIONS=true`), la busqueda de repositorio siempre esta activa.

> Version (ES): 1.1.1
