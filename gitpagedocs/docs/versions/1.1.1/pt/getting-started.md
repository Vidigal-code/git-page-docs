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

## Troubleshooting

### Busca por repositorio nao funciona localmente

- Defina `GITPAGEDOCS_REPOSITORY_SEARCH=true` no `.env` (crie na raiz do projeto se nao existir).
- Garanta que o repo alvo contem `gitpagedocs/config.json`.
- Verifique se os paths markdown no repo alvo batem com o config de rotas.

### Build falha ou docs nao carregam

- Execute `npm run lint` para detectar erros de config ou paths.
- Garanta que `gitpagedocs/config.json` existe e tem `VersionControl.versions` validos.
- Verifique se existem arquivos markdown para cada idioma (`en`, `pt`, `es`) nas pastas de versao.

### Rota de versao retorna conteudo errado ou vazio

- Verifique `VersionControl.versions[*].path` em `gitpagedocs/config.json`.
- Garanta que o config da versao tem `routes` e `menus-header` validos.
- Regenere com `npx gitpagedocs` para atualizar os artefatos.

## Proximos passos

- **Configuracao e publicacao**: Veja **Funcionalidades** para chaves do `config.json`, GitHub Pages self-hosted e publish no npm.
- **Publicar no GitHub Pages**: Execute `npx gitpagedocs --push --owner <user> --repo <repo>` para criar o workflow, commitar artefatos e enviar.

> Versao: 1.1.1
