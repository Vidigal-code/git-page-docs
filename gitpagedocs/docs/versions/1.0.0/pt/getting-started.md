# Primeiros passos

Este guia leva o projeto do zero ate docs rodando.

## Pre-requisitos

- Node.js 20+
- npm 10+ (ou pnpm)

## Setup local

1. Instale dependencias:
   - `npm install`
2. Gere/atualize os artefatos de docs:
   - `npm run gitpagedocs`
3. Inicie o desenvolvimento:
   - `npm run dev`
4. Build e execucao local de producao:
   - `npm run build`
   - `npm start`

## Comportamento da CLI

`npx gitpagedocs` (ou `npm run gitpagedocs`) gera os artefatos na pasta oficial `gitpagedocs/`.

- Gera somente markdown/json
- Nao gera `index.html`
- Nao gera `index.js`
- Nao executa comandos de instalacao

## Modo de busca por repositorio

No ambiente local, o controle e por variavel:

- `GITPAGEDOCS_REPOSITORY_SEARCH=true`
- `GITPAGEDOCS_REPOSITORY_SEARCH=false`

Em build de GitHub Pages (`GITHUB_ACTIONS=true`), a busca de repositorio fica sempre ativa.

> Versao: 1.0.0
