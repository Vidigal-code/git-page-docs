export const docsPt = {
    index: `# Git Page Docs

Git Page Docs e um runtime de documentacao multi-idioma para repositorios que possuem a pasta \`gitpagedocs/\`.

## O que este projeto entrega

- Renderizacao markdown em varios idiomas (\`en\`, \`pt\`, \`es\`)
- Roteamento por versao (\`/v/:versao\`)
- Sistema de temas por templates JSON
- Execucao local e em GitHub Pages
- Busca de repositorio + renderizacao remota opcional

## Contrato de pastas

O runtime espera esta estrutura:

- \`gitpagedocs/config.json\`
- \`gitpagedocs/docs/<lang>/*.md\`
- \`gitpagedocs/docs/versions/<versao>/config.json\`
- \`gitpagedocs/docs/versions/<versao>/<lang>/*.md\`
- \`gitpagelayouts/layoutsConfig.json\`
- \`gitpagelayouts/templates/*.json\`

## Navegacao rapida

- Abra **Primeiros passos** para setup local.
- Abra **Configuracao** para detalhes completos do \`config.json\`.
- Abra **Publicacao** para comportamento local/producao/GitHub Pages.
- Abra **Arquitetura** para mapa de codigo e fluxo de dados.
- Abra **Temas e layouts** para autoria de templates.
- Abra **Rotas autorizadas** para configurar chave, papeis e autenticacao externa.
- Abra **FAQ** para troubleshooting.
`,
    gettingStarted: `# Primeiros passos

Este guia leva o projeto do zero ate docs rodando.

## Pre-requisitos

- Node.js 20+
- npm 10+ (ou pnpm)

## Setup local

1. Instale dependencias:
   - \`npm install\`
2. Gere/atualize os artefatos de docs:
   - \`npm run gitpagedocs\`
3. Inicie o desenvolvimento:
   - \`npm run dev\`
4. Build e execucao local de producao:
   - \`npm run build\`
   - \`npm start\`

## Comportamento da CLI

\`npx @gitpagedocs/cli\` (ou \`npm run gitpagedocs\`) gera os artefatos na pasta oficial \`gitpagedocs/\`.

- Gera somente markdown/json
- Nao gera \`index.html\`
- Nao gera \`index.js\`
- Nao executa comandos de instalacao

## Modo de busca por repositorio

No ambiente local, o controle e por variavel:

- \`GITPAGEDOCS_REPOSITORY_SEARCH=true\`
- \`GITPAGEDOCS_REPOSITORY_SEARCH=false\`

Em build de GitHub Pages (\`GITHUB_ACTIONS=true\`), a busca de repositorio fica sempre ativa.
`,
    projectOverview: `# Visao geral do projeto

Git Page Docs e um monorepo pnpm + turborepo que transforma a pasta \`gitpagedocs/\` de um repositorio em um site de documentacao multilinguagem e versionado — com assistente de IA integrado e um servidor MCP (Model Context Protocol).

## Pacotes do monorepo

- **frontend/** — visualizador Next.js 15 (App Router, React 19), exportado estaticamente para o GitHub Pages.
- **cli/** — o pacote npm publicado \`@gitpagedocs/cli\` (\`npm install -g @gitpagedocs/cli\`): gera a estrutura de docs, documenta com IA, configura o Pages e roda o servidor MCP.
- **tools/** — \`@gitpagedocs/tools\`, o nucleo de logica compartilhado: sistema de IA com 14 provedores, cofre de credenciais criptografado, loader de config, caches e logger.
- **mcp/** — \`@gitpagedocs/mcp\`, servidor Model Context Protocol (20 ferramentas + 7 recursos).
- **gitpagedocs/** — o contrato do usuario: \`config.json\`, docs versionados e layouts.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript; exportacao estatica para GitHub Pages
- gray-matter + marked para Markdown; react-icons
- pnpm workspaces + turborepo; Vitest + Playwright; ESLint

## Destaques

- Multilinguagem (\`en\`, \`pt\`, \`es\`) e rotas por versao (\`/v/:version\`)
- Sistema de IA com 14 provedores (OpenAI, Anthropic, Gemini, Ollama, Mistral, DeepSeek, Cohere, Groq, xAI e mais) com streaming
- Chaves de IA **criptografadas em repouso** (AES-256-GCM) atras de uma senha local — nunca em texto puro
- **Drawer de chat de IA** nos docs + um **console \`/ai\`** dedicado
- Sistema de 64 temas (variantes escuras e claras); execucao local e no GitHub Pages
`,
    functionalities: `# Funcionalidades

Referencia completa de opcoes da CLI, chaves de configuracao e recursos do runtime.

## Comandos da CLI

| Comando | Descricao |
|---------|------------|
| \`npx @gitpagedocs/cli\` | Gera config e docs em \`gitpagedocs/\` |
| \`npx @gitpagedocs/cli --layoutconfig\` | Tambem gera layouts/templates locais em \`gitpagelayouts/\` |
| \`npx @gitpagedocs/cli --home\` | Distribuicao standalone (\`gitpagedocshome/\`) |
| \`npx @gitpagedocs/cli --push --owner X --repo Y\` | Configura workflow, commit, push |
| \`npx @gitpagedocs/cli --interactive\` / \`-i\` | Modo interativo com prompts (padrao em um terminal) |
| \`npx @gitpagedocs/cli --no-interactive\` / \`--yes\` / \`-y\` | Nunca pergunta; usa flags e padroes |
| \`gitpagedocs ai\` | Gerador interativo de documentacao com IA |
| \`gitpagedocs chat [pergunta]\` | Chat de IA com streaming no terminal (REPL em TTY; resposta unica com pergunta ou stdin) |
| \`gitpagedocs provider [id]\` / \`models [provider]\` | Lista provedores de IA / modelos do catalogo |
| \`gitpagedocs document[:repo\\|:file\\|:folder]\` | Gera documentacao com IA |
| \`gitpagedocs deploy\` / \`pages [actions\\|deploy]\` | Configura GitHub Pages via Actions + push |
| \`gitpagedocs docs\` | Atualiza as regioes gerenciadas de README/CONTRIBUTING/SECURITY |
| \`gitpagedocs password\` | Define a senha de acesso a documentacao (chave publica em \`site.docsAccess\`) |
| \`gitpagedocs config\` / \`config clear\` | Mostra a config resolvida / apaga a config salva e o cofre de chaves |
| \`gitpagedocs doctor\` / \`version\` / \`update\` | Diagnostico / versao / verificacao de atualizacao no registro |
| \`gitpagedocs mcp start\` | Inicia o servidor MCP via stdio |

Instale globalmente com \`npm install -g @gitpagedocs/cli\` ou rode sem instalar com \`npx @gitpagedocs/cli\`.

## Opcoes da CLI

| Opcao | Descricao |
|-------|-----------|
| \`--owner <user>\` | Owner do GitHub |
| \`--repo <repo>\` | Repositorio GitHub |
| \`--path <subpath>\` | Subcaminho dos docs (ex: \`docs\`); sem ele, base path = nome do repo para CSS/JS em project sites |
| \`--output <dir>\` | Diretorio de saida (padrao: \`gitpagedocs\`) |
| \`--search true|false\` | Habilita/desabilita busca de repositorio (\`--home\`) |
| \`--layoutconfig\` | Gera layouts locais em \`gitpagelayouts/\` |
| \`--layouts-dir <dir>\` | Pasta dos layouts locais (padrao: \`gitpagelayouts\`) |
| \`--push\` | Cria workflow, commit de artefatos, push |
| \`--pages-actions\` | Apenas muda a fonte do GitHub Pages para GitHub Actions (igual a \`pages actions\`) |
| \`--home\` | Gera \`gitpagedocshome/\` (estatico + .env + Dockerfile) |

## Saida gerada

- \`gitpagedocs/config.json\` – config raiz
- \`gitpagedocs/icon.svg\` – icone padrao
- \`gitpagedocs/docs/versions/<ver>/config.json\` – rotas por versao
- \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md\` – docs em markdown
- \`gitpagelayouts/\` – apenas com \`--layoutconfig\` (pasta configuravel com \`--layouts-dir\`)

## Tipos de conteudo

| Tipo | Chave config | Descricao |
|------|--------------|-----------|
| Markdown | \`routes-md\` | Arquivos .md com \`path\` por idioma |
| HTML | \`routes-html\` | \`path\` local ou \`url\` externa |
| Video | \`routes-video\` | \`video.pathVideo\`, \`video.videoType\` |
| Audio | \`routes-audio\` | \`audio.pathAudio\`, \`audio.audioType\` |

## Visualizador de codigo fonte

O config da versao pode renderizar um container **Codigo fonte** via \`routes-source-viewer\` e \`menus-header-source-viewer\`. O viewer le a arvore do repositorio no GitHub em tempo de execucao e aplica o tema atual da documentacao.

- Arvore do repositorio a partir de \`source-viewer-path\`; a branch padrao e \`main\`
- Navegacao por pastas e filtro de arquivos
- Listagem de diretorios no estilo GitHub
- Renderizacao de codigo com numeros de linha
- Alternancia preview/codigo para Markdown, incluindo \`README.md\`
- Pastas recolhiveis na lateral

## Chaves de config (site)

- \`name\`, \`defaultLanguage\`
- \`docsVersion\`, \`rendering\`, \`ThemeDefault\`, \`ThemeModeDefault\`
- \`ProjectLink\`, \`layoutsConfigPathOficial\`, \`layoutsConfigPath\`
- Idiomas: \`site.languages\` (liga/desliga cada um); textos da UI: \`gitpagedocs/langs/<lang>.json\`

## Variaveis de ambiente

- \`GITPAGEDOCS_REPOSITORY_SEARCH\` – busca de repositorio (local)
- \`GITHUB_ACTIONS\` – modo build GitHub Pages

## Assistente de IA

Os docs trazem um assistente de IA em duas superficies: um **chat drawer** dentro dos docs (botao de chat de IA na barra lateral, ativado por \`site.AiChatEnabled\`) e uma pagina **console \`/ai\`** dedicada.

- **14 provedores** em um unico core compartilhado: OpenAI, Anthropic, Gemini, OpenRouter, Ollama, Azure OpenAI, Mistral, DeepSeek, Cohere, Groq, xAI, Together, Fireworks, Perplexity.
- **Escolha de modelo** — a partir do catalogo de cada provedor (\`gitpagedocs models <provedor>\`); um id de modelo salvo que o provedor aposentou e trocado pelo padrao do provedor automaticamente.
- **Criptografia em repouso** — sua chave de API e selada com AES-256-GCM atras de uma **senha local** e nunca fica em texto puro nem em logs.
- **Bloqueio por inatividade** — o chat drawer se bloqueia sozinho apos \`site.AiChatAutoLockSeconds\` segundos sem uso (padrao 30, \`0\` desativa): um modal centralizado com contagem regressiva, no seu idioma, permite cancelar ou bloquear agora, e desbloquear pede a senha de novo.
- **Provedores resilientes** — erros transitorios do provedor sao repetidos (3 tentativas) e uma falha final vira uma mensagem simples terminando em "Tente novamente!".
- **Geracao de documentacao com IA** — \`gitpagedocs ai\` varre os caminhos escolhidos e escreve markdown multilingue (pt/en/es); reutilizavel via \`.gitpagedocsconfig\`, cuja chave de API fica selada no cofre criptografado \`.gitpagedocsvault\` (a senha do cofre e pedida em toda execucao). \`gitpagedocs chat\` leva o mesmo assistente ao terminal.

## Servidor MCP

\`gitpagedocs mcp start\` sobe um servidor Model Context Protocol (stdio) expondo **20 tools** (sistema de arquivos, IA, geracao/analise de docs) e **7 resources** (\`project://structure|docs|config|repository|readme|ai/providers|ai/models\`) para editores e agentes de IA.
`,
    configuration: `# Configuracao

A configuracao de runtime fica em \`gitpagedocs/config.json\`. Os textos da UI ficam ao lado, um arquivo por idioma.

## Idiomas (\`site.languages\` + \`langs/\`)

- \`site.languages\` em \`gitpagedocs/config.json\` liga (\`true\`) ou desliga (\`false\`) cada idioma, na ordem do menu: \`{ "languages": { "en": true, "pt": true, "es": false } }\`. Um idioma em \`false\` some do seletor de idiomas e seus textos nao sao carregados, mesmo que os docs existam.
- \`gitpagedocs/langs/<lang>.json\` guarda os textos daquele idioma: \`langmenu\` (cabecalho, busca, visualizador de codigo, player de audio, chat de IA e acesso aos docs) e \`translations\` (\`notFound\`, \`navigation\`, \`footer\`).
- Para adicionar um idioma, crie \`langs/<lang>.json\` e inclua \`"<lang>": true\` em \`site.languages\`.
- Arquivos \`config.json\` antigos que ainda trazem \`site.langmenu\` / \`translations\` inline continuam funcionando; quando os dois existem, os arquivos de \`langs/\` prevalecem e qualquer chave ausente e preenchida a partir da versao atual.

## Secao \`site\`

Principais chaves:

- \`name\`: titulo do projeto no UI
- \`defaultLanguage\`: idioma padrao
- \`HideThemeSelector\`: esconde/mostra seletor de tema
- \`ThemeDefault\`: id do tema inicial
- \`ThemeModeDefault\`: modo inicial (\`light\` ou \`dark\`)
- \`ProjectLink\`: URL de repositorio para acoes no cabecalho
- \`docsVersion\`: versao inicial selecionada
- \`ActiveNavigation\`: habilita comportamento de anterior/proximo
- \`FocusMode\`: habilita modo foco/leitura
- \`icons\`: icones do cabecalho. \`icons.defaults\` guarda o que todos compartilham (\`reactIcon\`, \`colorDark\`, \`colorLight\`, \`size\`, \`imgDark\`, \`imgLight\`, \`imgWidth\`, \`imgHeight\`) e cada icone define seu \`tag\` e o que muda (\`null\` remove um campo). As chaves planas abaixo continuam valendo e vencem quando as duas formas existem.
- \`IconImageMenuHeaderImgWidth\`, \`IconImageMenuHeaderImgHeight\`: tamanho do icone principal
- \`IconImageMenuHeaderLightImg\`, \`IconImageMenuHeaderDarkImg\`: icone principal (light/dark)
- \`IconProjectLinkImgWidth\`, \`IconProjectLinkImgHeight\`: tamanho do icone link do projeto
- \`IconProjectLinkLightImg\`, \`IconProjectLinkDarkImg\`: icone link do projeto
- \`IconVersionLinksImgWidth\`, \`IconVersionLinksImgHeight\`: tamanho do icone links de versao
- \`IconVersionLinksLightImg\`, \`IconVersionLinksDarkImg\`: icone links de versao
- \`IconInfoHeaderMenuImgWidth\`, \`IconInfoHeaderMenuImgHeight\`: tamanho do icone info
- \`IconInfoHeaderMenuLightImg\`, \`IconInfoHeaderMenuDarkImg\`: icone info
- \`IconPreviewProjectLinkImgWidth\`, \`IconPreviewProjectLinkImgHeight\`: tamanho do icone preview
- \`IconPreviewProjectLinkLightImg\`, \`IconPreviewProjectLinkDarkImg\`: icone preview
- \`layoutsConfigPath\`: fallback remoto para layouts
- \`rendering\`: URL canonica publicada

## Secao \`VersionControl\`

\`VersionControl.versions\` define:

- \`id\`: identificador da versao
- \`path\`: caminho do config da versao
- links opcionais (\`ProjectLink\`, \`branch\`, \`release\`, \`commit\`)
- metadados opcionais do source viewer (\`source-viewer\`, \`source-viewer-path\`)

## Navegacao e rotas

- \`routes\`: caminhos markdown por idioma (legado)
- \`menus-header\`: menu hierarquico
- \`translations\`: labels de UI para not-found e navegacao

## Autorizacao (config de versao)

- \`auth\`: configuracoes globais de autorizacao para a versao
- \`auth.accessKeys\`: mapa de chaves usado por \`authorization.accessKeyId\`
- \`auth.rolesStorageKey\`: chave de localStorage para bootstrap de papeis
- \`auth.providers\`: adaptadores de provedor (\`authjs\`, \`clerk\`, \`firebase\`, \`jwt\`)

## Tipos de conteudo (config de versao)

Configs de versao suportam multiplos tipos:

- \`routes-md\`: Rotas markdown com \`title\`, \`description\` (centralizados via \`titlePosition\`, \`descriptionPosition\`)
- \`routes-source-viewer\`: Containers de codigo fonte com \`source-viewer: true\` e \`source-viewer-path\`
- \`routes-html\`: Caminhos de paginas HTML por idioma
- \`routes-video\`: Config de video com \`video.videoType\` (youtube, vimeo, mp4, etc.) e \`video.pathVideo\`
- \`routes-audio\`: Config de audio com \`audio.audioType\` (youtube, mp3, etc.) e \`audio.pathAudio\`
- \`authorization\` (md/html/video): guarda de acesso por chave, papeis e autenticacao externa
- \`menus-header-md\`, \`menus-header-source-viewer\`, \`menus-header-html\`, \`menus-header-video\`, \`menus-header-audio\`: menus por tipo
- \`hierarchyPage\`: ordem dos containers na pagina \`{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4 }\`
- \`hierarchyMenu\`: ordem das secoes do menu \`{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4 }\`

Cada rota pode incluir \`title\`, \`description\` (por idioma), \`titleCss\`, \`titlePosition: "center"\`, \`descriptionPosition: "center"\`, \`titleIsVisible\`, \`descriptionIsVisible\`.

Configuracoes que todas as rotas compartilham ficam uma unica vez em \`routeDefaults\`, no topo do config da versao; cada rota guarda so os proprios valores, e um valor escrito na rota vence o \`routeDefaults\`.

## Variaveis por rota (blockLink, container, url, browseAll)

Opcoes por rota em \`routes-md\`, \`routes-html\` e \`routes-video\`:

- **\`blockLink\`** (padrao: true) – Para HTML: se true, links abrem em nova aba (\`target="_blank"\`); se false, no proprio contexto.
- **\`container\`** – \`"full"\` = altura automatica; numero (ex: \`500\`) = altura fixa em px com overflow auto. Aplica-se a md, html e video.
- **\`url\`** – Apenas em \`routes-html\`: \`Record<LanguageCode, string>\` com URLs externas. Quando definido, o iframe usa \`src={url}\` em vez de HTML local via \`srcDoc\`. Rotas com \`url\` nao geram arquivos HTML locais.
- **\`browseAll\`** (padrao: false) – Se true, o container mostra botoes Anterior/Proximo para navegar entre todos os itens daquele tipo.

## Tipos de conteudo: path vs url (HTML)

- **Markdown (\`routes-md\`)**: usa \`path\` apontando para arquivos \`.md\` locais.
- **HTML (\`routes-html\`)**: usa \`path\` para arquivos HTML locais (sem extensao .html no config) ou \`url\` para URLs externas. Com \`url\`, o iframe carrega a pagina externa; nenhum arquivo local e gerado.
- **Video (\`routes-video\`)**: usa \`video.pathVideo\` e \`video.videoType\` (youtube, vimeo, mp4, etc.).

## Variaveis de ambiente

- \`GITPAGEDOCS_REPOSITORY_SEARCH\`: ativa/desativa busca remota localmente
- \`GITHUB_ACTIONS\`: ativa comportamento especifico de GitHub Pages
`,
    deployment: `# Publicacao

Git Page Docs roda como app Next.js com dois alvos: servidor local e GitHub Pages.

## Publicacao local

Use:

1. \`npm run build\`
2. \`npm start\`

Isso sobe runtime Node + Next.js usando a pasta local \`gitpagedocs/\`.

## Publicacao em GitHub Pages

Em build de GitHub Actions:

- \`GITHUB_ACTIONS=true\`
- comportamento de export estatico e habilitado pela configuracao
- pagina inicial de busca de repositorio fica ativa

## Fluxo de publish do pacote

Para publicar no npm:

- atualize versao no \`package.json\`
- execute \`npm publish --access public\`
- valide autenticacao com \`npm whoami\`

Se \`build:prebuilt\` for pulado no Windows, use CI para gerar artefatos prebuilt.
`,
    architecture: `# Arquitetura

O projeto e organizado por fronteiras de feature e responsabilidades do runtime.

## Pacotes

- **frontend/** — visualizador Next.js (Feature-Sliced: app / widgets / features / entities / shared); export estatico.
- **cli/** — o bin publicado \`gitpagedocs\` (hexagonal) + \`cli/ai/\` (CLI de documentacao com IA).
- **tools/** — \`@gitpagedocs/tools\`: ai/ security/ crypto/ cache/ config/ logger/ errors/ filesystem/ documentation/ i18n/ ports/.
- **mcp/** — \`@gitpagedocs/mcp\`: ferramentas + recursos MCP que delegam ao tools/.

## Modulos principais (frontend)

- \`frontend/src/app/[[...repo]]/page.tsx\` — parser de rota, generateStaticParams, selecao de shell.
- \`frontend/src/entities/docs/api/load-docs-data.ts\` — config local/remota, versao, parse markdown, layouts + temas.
- \`frontend/src/widgets/docs-shell/docs-shell.tsx\` — UI, estado idioma/versao/tema, sync de URL, montagem do chat de IA.

## Seguranca: credenciais de IA criptografadas

O console \`/ai\` e o chat drawer exigem uma senha local que deriva (PBKDF2) uma chave AES-256-GCM; as chaves ficam criptografadas no \`localStorage\` e so sao descriptografadas durante a sessao (\`@gitpagedocs/tools/security\`). O drawer se bloqueia sozinho apos \`site.AiChatAutoLockSeconds\` segundos sem uso (padrao 30; \`0\` desativa): um modal centralizado com contagem regressiva, no idioma selecionado, permite cancelar ou bloquear agora, e voltar exige a senha de novo. Na CLI, a chave de \`.gitpagedocsconfig\` fica selada no cofre criptografado \`.gitpagedocsvault\` e a senha do cofre e pedida em toda execucao.

## Fluxo de dados

1. A rota chega (\`/owner/repo/v/x.y.z\` ou equivalente local)
2. O config e resolvido (local ou remoto)
3. Config de versao sobrescreve rotas/menus base
4. Markdown e carregado e convertido para HTML
5. Template de layout e resolvido e aplicado em CSS vars
6. Shell renderiza conteudo e controles

## Pontos de resiliencia

- fallback de carga para layouts/templates
- carregamento de markdown por idioma com fallback de erro
- sincronizacao de linguagem/versao/tema via localStorage
`,
    githubIssuesProjects: `# GitHub Issues e Projects

Aprenda a usar GitHub Issues e Projects para gerenciar seu trabalho.

## Conceitos

- Issues para rastrear tarefas e bugs
- Projects para visualizar e organizar o trabalho
- Workflows recomendados para equipes
`,
    gitIntroduction: `# Introducao ao Git

Conceitos basicos de Git para iniciantes.

## Comandos essenciais

- \`git init\` - iniciar repositorio
- \`git add\` - preparar alteracoes
- \`git commit\` - registrar commit
- \`git push\` - enviar para remoto
`,
    authorizedRoutes: `# Rotas autorizadas

Proteja rotas por chave de acesso, papeis obrigatorios e provedores externos.

## Local do config de versao

Configure em:

- \`gitpagedocs/docs/versions/<versao>/config.json\`

## Secao global auth

Use \`auth\` no topo do config de versao:

- \`accessKeys\`: mapa de ids de chave para segredo esperado
- \`rolesStorageKey\`: chave de localStorage para bootstrap de papeis
- \`providers\`: lista de provedores externos (\`authjs\`, \`clerk\`, \`firebase\`, \`jwt\`)

## Autorizacao por rota

Dentro de cada rota (\`routes-md\`, \`routes-html\`, \`routes-video\`):

- \`authorization.accessKeyId\`
- \`authorization.requiredRoles\`
- \`authorization.requireExternalAuth\`
- \`authorization.allowedProviders\`

## Fases

### Fase A - Chave de acesso

Defina \`authorization.accessKeyId\` e a chave correspondente em \`auth.accessKeys\`.

### Fase B - Papeis

Defina \`authorization.requiredRoles\` com um ou mais papeis.

Os papeis podem vir de:

- query param \`?authRoles=admin,maintainer\`
- localStorage (\`rolesStorageKey\`)
- claims de provedores externos

### Fase C - Provedores externos

Defina \`authorization.requireExternalAuth=true\` e opcionalmente \`allowedProviders\`.

Adaptadores suportados:

- Auth.js (\`type: "authjs"\`)
- Clerk (\`type: "clerk"\`)
- Firebase Auth (\`type: "firebase"\`)
- JWT custom (\`type: "jwt"\`)
`,
    themes: `# Temas e layouts

Temas sao templates JSON mapeados por \`layoutsConfig.json\`.

## Arquivos

- \`gitpagelayouts/layoutsConfig.json\`
- \`gitpagelayouts/layoutsFallbackConfig.json\`
- \`gitpagelayouts/templates/*.json\`

## Modelo de template

Cada template normalmente contem:

- \`id\`, \`name\`, \`author\`, \`version\`
- \`mode\` e metadados de par dark/light
- \`colors\`
- \`typography\`
- tokens de \`components\`
- \`animations\`

## Comportamento em runtime

- tema ativo vem de config/usuario
- toggle light/dark resolve o tema pareado por referencia
- variaveis CSS sao geradas dos tokens do template

## Boas praticas

- mantenha contraste acessivel
- padronize escala de espaco e borda
- ofereca variantes dark e light quando possivel
`,
    faq: `# FAQ

## Por que repositorios remotos nao abrem localmente?

Verifique:

- \`GITPAGEDOCS_REPOSITORY_SEARCH=true\` no \`.env\`
- repositorio alvo contem \`gitpagedocs/config.json\`
- paths markdown do repositorio batem com seu config de rotas

## Por que rota de versao mostra conteudo errado?

Verifique:

- \`VersionControl.versions[*].path\` em \`gitpagedocs/config.json\`
- config da versao possui \`routes\` e \`menus-header\` validos
- markdown existe para cada idioma

## Por que tema nao aplica corretamente?

Verifique:

- \`layoutsConfig.json\` referencia templates validos
- ids de template sao unicos
- tema selecionado existe no mapa de temas carregados

## Por que GitHub Pages pode se comportar diferente do local?

Porque o build de GitHub Pages habilita pagina inicial de busca e comportamento especifico de exportacao.
`,
  };
