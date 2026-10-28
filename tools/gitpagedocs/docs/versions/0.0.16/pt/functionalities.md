# Funcionalidades

Referência completa de opções da CLI, chaves de configuração e recursos do runtime.

## Linha de comando

Consulte **Referência da CLI** para comandos, flags, exemplos e compatibilidade. Consulte **Servidor MCP** para integração com editores.

## Tipos de conteúdo

| Tipo | Chave config | Descrição |
|------|--------------|-----------|
| Markdown | `routes-md` | Arquivos .md com `path` por idioma |
| HTML | `routes-html` | `path` local ou `url` externa |
| Vídeo | `routes-video` | `video.pathVideo`, `video.videoType` |
| Áudio | `routes-audio` | `audio.pathAudio`, `audio.audioType` |
| PDF | `routes-pdf` | `pdf.pathPdf` por idioma; prévia nativa e download |

## Visualizador de código fonte

O config da versão pode renderizar um container **Código fonte** via `routes-source-viewer` e `menus-header-source-viewer`. O viewer lê a árvore do repositório no GitHub em tempo de execução e aplica o tema atual da documentação.

- Árvore do repositório a partir de `source-viewer-path`; a branch padrão é `main`
- Navegação por pastas e filtro de arquivos
- Listagem de diretórios no estilo GitHub
- Renderização de código com números de linha
- Alternância preview/código para Markdown, incluindo `README.md`
- Pastas recolhiveis na lateral

## Chaves de config (site)

- `name`, `defaultLanguage`
- `docsVersion`, `rendering`, `ThemeDefault`, `ThemeModeDefault`
- `ProjectLink`, `layoutsConfigPathOficial`, `layoutsConfigPath`
- Idiomas: `site.languages` (liga/desliga cada um); textos da UI: `gitpagedocs/langs/<lang>.json`

## Reprodução de midia (um som por vez)

`site.mediaExclusivePlayback` (padrão `true`): dar play num vídeo de rota pausa o rádio e as trilhas de áudio, e dar play no rádio ou numa trilha de áudio pausa o vídeo. Funciona com YouTube e Vimeo (pelas APIs dos players), arquivos nativos (`mp4`, `webm`, …) e qualquer outro embed.

Para mostrar um vídeo sem som enquanto o rádio ou uma trilha de áudio o explica, use `"muted": true` no objeto `video` da rota: o vídeo roda só a imagem e fica fora da regra. `"mediaExclusivePlayback": false` desliga a regra no site inteiro.

## Variáveis de ambiente

- `GITPAGEDOCS_REPOSITORY_SEARCH` – busca de repositório (local)
- `GITHUB_ACTIONS` – modo build GitHub Pages

## Assistente de IA

Os docs trazem um assistente de IA em duas superfícies: um **chat drawer** dentro dos docs (botão de chat de IA na barra lateral, ativado por `site.AiChatEnabled`) e uma página **console `/ai`** dedicada.

- **14 provedores** em um único core compartilhado: OpenAI, Anthropic, Gemini, OpenRouter, Ollama, Azure OpenAI, Mistral, DeepSeek, Cohere, Groq, xAI, Together, Fireworks, Perplexity.
- **Escolha de modelo** — a partir do catálogo de cada provedor (`gitpagedocs models <provedor>`); um id de modelo salvo que o provedor aposentou é trocado pelo padrão do provedor automaticamente.
- **Criptografia em repouso** — sua chave de API e selada com AES-256-GCM atras de uma **senha local** e nunca fica em texto puro nem em logs.
- **Bloqueio por inatividade** — o chat drawer se bloqueia sozinho após `site.AiChatAutoLockSeconds` segundos sem uso (padrão 30, `0` desativa): um modal centralizado com contagem regressiva, no seu idioma, permite cancelar ou bloquear agora, e desbloquear pede a senha de novo.
- **Provedores resilientes** — erros transitórios do provedor são repetidos (3 tentativas) e uma falha final vira uma mensagem simples terminando em "Tente novamente!".
- **Geração de documentação com IA** — `gitpagedocs ai` varre os caminhos escolhidos e escreve markdown multilíngue (pt/en/es); reutilizável via `.gitpagedocsconfig`, cuja chave de API fica selada no cofre criptografado `.gitpagedocsvault` (a senha do cofre é pedida em toda execução). `gitpagedocs chat` leva o mesmo assistente ao terminal.

## Servidor MCP

`gitpagedocs mcp start` sobe um servidor Model Context Protocol (stdio) expondo **20 tools** (sistema de arquivos, IA, geração/análise de docs) e **7 resources** (`project://structure|docs|config|repository|readme|ai/providers|ai/models`) para editores e agentes de IA.

> Versão: 0.0.16
