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
| `npx @gitpagedocs/cli --no-interactive` / `--yes` / `-y` | Nunca pergunta; usa flags e padroes |
| `gitpagedocs ai` | Gerador interativo de documentacao com IA |
| `gitpagedocs chat [pergunta]` | Chat de IA com streaming no terminal (REPL em TTY; resposta unica com pergunta ou stdin) |
| `gitpagedocs provider [id]` / `models [provider]` | Lista provedores de IA / modelos do catalogo |
| `gitpagedocs document[:repo\|:file\|:folder]` | Gera documentacao com IA |
| `gitpagedocs deploy` / `pages [actions\|deploy]` | Configura GitHub Pages via Actions + push |
| `gitpagedocs docs` | Atualiza as regioes gerenciadas de README/CONTRIBUTING/SECURITY |
| `gitpagedocs password` | Define a senha de acesso a documentacao (chave publica em `site.docsAccess`) |
| `gitpagedocs config` / `config clear` | Mostra a config resolvida / apaga a config salva e o cofre de chaves |
| `gitpagedocs doctor` / `version` / `update` | Diagnostico / versao / verificacao de atualizacao no registro |
| `gitpagedocs mcp start` | Inicia o servidor MCP via stdio |

Instale globalmente com `npm install -g @gitpagedocs/cli` ou rode sem instalar com `npx @gitpagedocs/cli`.

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
| `--pages-actions` | Apenas muda a fonte do GitHub Pages para GitHub Actions (igual a `pages actions`) |
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

- `name`, `defaultLanguage`
- `docsVersion`, `rendering`, `ThemeDefault`, `ThemeModeDefault`
- `ProjectLink`, `layoutsConfigPathOficial`, `layoutsConfigPath`
- Idiomas: `site.languages` (liga/desliga cada um); textos da UI: `gitpagedocs/langs/<lang>.json`

## Variaveis de ambiente

- `GITPAGEDOCS_REPOSITORY_SEARCH` – busca de repositorio (local)
- `GITHUB_ACTIONS` – modo build GitHub Pages

## Assistente de IA

Os docs trazem um assistente de IA em duas superficies: um **chat drawer** dentro dos docs (botao de chat de IA na barra lateral, ativado por `site.AiChatEnabled`) e uma pagina **console `/ai`** dedicada.

- **14 provedores** em um unico core compartilhado: OpenAI, Anthropic, Gemini, OpenRouter, Ollama, Azure OpenAI, Mistral, DeepSeek, Cohere, Groq, xAI, Together, Fireworks, Perplexity.
- **Escolha de modelo** — a partir do catalogo de cada provedor (`gitpagedocs models <provedor>`); um id de modelo salvo que o provedor aposentou e trocado pelo padrao do provedor automaticamente.
- **Criptografia em repouso** — sua chave de API e selada com AES-256-GCM atras de uma **senha local** e nunca fica em texto puro nem em logs.
- **Bloqueio por inatividade** — o chat drawer se bloqueia sozinho apos `site.AiChatAutoLockSeconds` segundos sem uso (padrao 30, `0` desativa): um modal centralizado com contagem regressiva, no seu idioma, permite cancelar ou bloquear agora, e desbloquear pede a senha de novo.
- **Provedores resilientes** — erros transitorios do provedor sao repetidos (3 tentativas) e uma falha final vira uma mensagem simples terminando em "Tente novamente!".
- **Geracao de documentacao com IA** — `gitpagedocs ai` varre os caminhos escolhidos e escreve markdown multilingue (pt/en/es); reutilizavel via `.gitpagedocsconfig`, cuja chave de API fica selada no cofre criptografado `.gitpagedocsvault` (a senha do cofre e pedida em toda execucao). `gitpagedocs chat` leva o mesmo assistente ao terminal.

## Servidor MCP

`gitpagedocs mcp start` sobe um servidor Model Context Protocol (stdio) expondo **20 tools** (sistema de arquivos, IA, geracao/analise de docs) e **7 resources** (`project://structure|docs|config|repository|readme|ai/providers|ai/models`) para editores e agentes de IA.

> Versao: 0.0.7
