# Funcionalidades

Referencia completa de opcoes da CLI, chaves de configuracao e recursos do runtime.

## Comandos da CLI

| Comando | Descricao |
|---------|------------|
| `npx gitpagedocs` | Gera config e docs em `gitpagedocs/` |
| `npx gitpagedocs --layoutconfig` | Tambem gera layouts/templates locais |
| `npx gitpagedocs --home` | Distribuicao standalone (`gitpagedocshome/`) |
| `npx gitpagedocs --push --owner X --repo Y` | Configura workflow, commit, push |
| `npx gitpagedocs --interactive` / `-i` | Modo interativo com prompts |

## Opcoes da CLI

| Opcao | Descricao |
|-------|-----------|
| `--owner <user>` | Owner do GitHub |
| `--repo <repo>` | Repositorio GitHub |
| `--path <subpath>` | Subcaminho dos docs (ex: `docs`); sem ele, base path = nome do repo para CSS/JS em project sites |
| `--output <dir>` | Diretorio de saida (padrao: `gitpagedocs`) |
| `--search true|false` | Habilita/desabilita busca de repositorio (`--home`) |
| `--layoutconfig` | Gera `gitpagedocs/layouts/` |
| `--push` | Cria workflow, commit de artefatos, push |
| `--home` | Gera `gitpagedocshome/` (estatico + .env + Dockerfile) |

## Saida gerada

- `gitpagedocs/config.json` – config raiz
- `gitpagedocs/icon.svg` – icone padrao
- `gitpagedocs/docs/versions/<ver>/config.json` – rotas por versao
- `gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md` – docs em markdown
- `gitpagedocs/docs/versions/<ver>/{en,pt,es}/source-viewer` – visualizador de codigo (estilo GitHub)
- `gitpagedocs/layouts/` – apenas com `--layoutconfig`

## Tipos de conteudo

| Tipo | Chave config | Descricao |
|------|--------------|-----------|
| Markdown | `routes-md` | Arquivos .md com `path` por idioma |
| HTML | `routes-html` | `path` (ex: source-viewer) ou `url` externa |
| Video | `routes-video` | `video.pathVideo`, `video.videoType` |
| Audio | `routes-audio` | `audio.pathAudio`, `audio.audioType` |

## Visualizador de codigo fonte

A CLI gera uma pagina **Codigo fonte** por versao. Escaneia `src/`, `cli/` e arquivos raiz (README.md, package.json, next.config.ts, etc.) e constroi um visualizador estilo GitHub em modo escuro com:

- Arvore de arquivos na lateral com expandir/recolher pastas
- Filtro de busca
- Destaque de sintaxe (TypeScript, JavaScript, JSON, CSS, Markdown)
- Botao copiar, numeros de linha
- Alternar preview/codigo do README.md
- Controles Expandir tudo / Recolher tudo

## Configuracao

A configuracao de runtime fica em `gitpagedocs/config.json`.

### Secao `site`

| Chave | Descricao |
|-------|-----------|
| `name` | Nome do site |
| `defaultLanguage` | Idioma padrao (`en`, `pt`, `es`) |
| `supportedLanguages` | Lista de idiomas suportados |
| `docsVersion` | Versao padrao dos docs |
| `rendering` | URL do GitHub Pages para self-hosted |
| `ThemeDefault` | Id do tema padrao |
| `ThemeModeDefault` | Modo padrao (`dark`/`light`) |
| `ProjectLink` | Link do projeto/repo |

### Chaves de layout

| Chave | Descricao |
|-------|-----------|
| `layoutsConfigPathOficial` | `true` = layouts oficiais; `false` = locais |
| `layoutsConfigPath` | Caminho dos layouts locais |

### Secao `VersionControl`

`VersionControl.versions` define por versao: `id`, `path` e metadados opcionais.

## Publicacao

1. **Site oficial**: `https://vidigal-code.github.io/git-page-docs/` – informe owner + repositorio para carregar docs.
2. **GitHub Pages self-hosted**: Gere com `npx gitpagedocs`, defina `site.rendering` para sua URL Pages, faca build e publique via workflow.

## Arquitetura

Modulos principais: Parser de rota (`src/app/[[...repo]]/page.tsx`), Carregar docs (`src/entities/docs/api/load-docs-data.ts`), Docs shell (`src/widgets/docs-shell/docs-shell.tsx`). Fluxo: request → config → versao → markdown → layout → shell.

## Temas e layouts

Temas sao templates JSON em `layoutsConfig.json`. Modo padrao usa layouts oficiais; Modo local (`--layoutconfig`) usa `gitpagedocs/layouts/`.

## FAQ

### Por que repositorios remotos nao abrem localmente?

Verifique: `GITPAGEDOCS_REPOSITORY_SEARCH=true` no `.env`; repo alvo tem `gitpagedocs/config.json`; paths markdown batem com config de rotas.

### Por que rota de versao mostra conteudo errado?

Verifique: `VersionControl.versions[*].path` no config; config da versao tem `routes` e `menus-header` validos; arquivos markdown existem por idioma.

### Por que tema nao aplica corretamente?

Verifique: `layoutsConfig.json` referencia templates validos; ids sao unicos; tema selecionado existe no mapa de temas.

### Por que GitHub Pages pode se comportar diferente do local?

O modo build GitHub Pages habilita pagina de busca e comportamento especifico de export estatico.

## Variaveis de ambiente

| Variavel | Descricao |
|----------|-----------|
| `GITPAGEDOCS_REPOSITORY_SEARCH` | Ativa/desativa busca remota (local) |
| `GITHUB_ACTIONS` | Modo build GitHub Pages |

> Versao: 1.1.1
