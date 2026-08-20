# Funcionalidades

Referencia completa de opcoes da CLI, chaves de configuracao e recursos do runtime.

## Comandos da CLI

| Comando | Descricao |
|---------|------------|
| `npx @gitpagedocs/cli` | Gera config e docs em `gitpagedocs/` |
| `npx @gitpagedocs/cli --layoutconfig` | Tambem gera layouts/templates locais em `gitpagelayouts/` |
| `npx @gitpagedocs/cli --home` | Distribuicao standalone (`gitpagedocshome/`) |
| `npx @gitpagedocs/cli --push --owner X --repo Y` | Configura workflow, commit, push |
| `npx @gitpagedocs/cli --interactive` / `-i` | Modo interativo com prompts (padrao em um terminal) |
| `npx @gitpagedocs/cli --no-interactive` / `-y` | Nunca pergunta; usa flags e padroes |

## Opcoes da CLI

| Opcao | Descricao |
|-------|-----------|
| `--owner <user>` | Owner do GitHub |
| `--repo <repo>` | Repositorio GitHub |
| `--path <subpath>` | Subcaminho dos docs (ex: `docs`); sem ele, base path = nome do repo para CSS/JS em project sites |
| `--output <dir>` | Diretorio de saida (padrao: `gitpagedocs`) |
| `--search true|false` | Habilita/desabilita busca de repositorio (`--home`) |
| `--layoutconfig` | Gera layouts locais em `gitpagelayouts/` |
| `--layouts-dir <dir>` | Pasta dos layouts locais (padrao: `gitpagelayouts`) |
| `--push` | Cria workflow, commit de artefatos, push |
| `--home` | Gera `gitpagedocshome/` (estatico + .env + Dockerfile) |

## Saida gerada

- `gitpagedocs/config.json` – config raiz
- `gitpagedocs/icon.svg` – icone padrao
- `gitpagedocs/docs/versions/<ver>/config.json` – rotas por versao
- `gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md` – docs em markdown
- `gitpagelayouts/` – apenas com `--layoutconfig` (pasta configuravel com `--layouts-dir`)

## Tipos de conteudo

| Tipo | Chave config | Descricao |
|------|--------------|-----------|
| Markdown | `routes-md` | Arquivos .md com `path` por idioma |
| HTML | `routes-html` | `path` local ou `url` externa |
| Video | `routes-video` | `video.pathVideo`, `video.videoType` |
| Audio | `routes-audio` | `audio.pathAudio`, `audio.audioType` |

## Visualizador de codigo fonte

O config da versao pode renderizar um container **Codigo fonte** via `routes-source-viewer` e `menus-header-source-viewer`. O viewer le a arvore do repositorio no GitHub em tempo de execucao e aplica o tema atual da documentacao.

- Arvore do repositorio a partir de `source-viewer-path`; a branch padrao e `main`
- Navegacao por pastas e filtro de arquivos
- Listagem de diretorios no estilo GitHub
- Renderizacao de codigo com numeros de linha
- Alternancia preview/codigo para Markdown, incluindo `README.md`
- Pastas recolhiveis na lateral

## Chaves de config (site)

- `name`, `defaultLanguage`, `supportedLanguages`
- `docsVersion`, `rendering`, `ThemeDefault`, `ThemeModeDefault`
- `ProjectLink`, `layoutsConfigPathOficial`, `layoutsConfigPath`

## Variaveis de ambiente

- `GITPAGEDOCS_REPOSITORY_SEARCH` – busca de repositorio (local)
- `GITHUB_ACTIONS` – modo build GitHub Pages

> Versao: 1.1.62
