# Funcionalidades

Referencia completa de opcoes da CLI, chaves de configuracao e recursos do runtime.

## Linha de comando

Consulte **Referência da CLI** para comandos, flags, exemplos e compatibilidade. Consulte **Servidor MCP** para integração com editores.

## Tipos de conteudo

| Tipo | Chave config | Descricao |
|------|--------------|-----------|
| Markdown | `routes-md` | Arquivos .md com `path` por idioma |
| HTML | `routes-html` | `path` local ou `url` externa |
| Video | `routes-video` | `video.pathVideo`, `video.videoType` |
| Audio | `routes-audio` | `audio.pathAudio`, `audio.audioType` |
| PDF | `routes-pdf` | `pdf.pathPdf` por idioma; prévia nativa e download |

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

## Reproducao de midia (um som por vez)

`site.mediaExclusivePlayback` (padrao `true`): dar play num video de rota pausa o radio e as trilhas de audio, e dar play no radio ou numa trilha de audio pausa o video. Funciona com YouTube e Vimeo (pelas APIs dos players), arquivos nativos (`mp4`, `webm`, …) e qualquer outro embed.

Para mostrar um video sem som enquanto o radio ou uma trilha de audio o explica, use `"muted": true` no objeto `video` da rota: o video roda so a imagem e fica fora da regra. `"mediaExclusivePlayback": false` desliga a regra no site inteiro.

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

> Versao: 0.0.10
