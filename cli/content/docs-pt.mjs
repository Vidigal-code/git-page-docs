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
- \`gitpagedocs/layouts/layoutsConfig.json\`
- \`gitpagedocs/layouts/templates/*.json\`

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

\`npx gitpagedocs\` (ou \`npm run gitpagedocs\`) gera os artefatos na pasta oficial \`gitpagedocs/\`.

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
- **cli/** — o pacote npm publicado \`gitpagedocs\` (\`npm install -g gitpagedocs\`): gera a estrutura de docs, documenta com IA, configura o Pages e roda o servidor MCP.
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
- Sistema de 36 temas; execucao local e no GitHub Pages
`,
    functionalities: `# Funcionalidades

Referencia completa de opcoes da CLI, chaves de configuracao e recursos do runtime.

## Comandos da CLI

| Comando | Descricao |
|---------|------------|
| \`npx gitpagedocs\` | Gera config e docs em \`gitpagedocs/\` |
| \`npx gitpagedocs --layoutconfig\` | Tambem gera layouts/templates locais |
| \`npx gitpagedocs --home\` | Distribuicao standalone (\`gitpagedocshome/\`) |
| \`npx gitpagedocs --push --owner X --repo Y\` | Configura workflow, commit, push |
| \`npx gitpagedocs --interactive\` / \`-i\` | Modo interativo com prompts |

## Opcoes da CLI

| Opcao | Descricao |
|-------|-----------|
| \`--owner <user>\` | Owner do GitHub |
| \`--repo <repo>\` | Repositorio GitHub |
| \`--path <subpath>\` | Subcaminho dos docs (ex: \`docs\`); sem ele, base path = nome do repo para CSS/JS em project sites |
| \`--output <dir>\` | Diretorio de saida (padrao: \`gitpagedocs\`) |
| \`--search true|false\` | Habilita/desabilita busca de repositorio (\`--home\`) |
| \`--layoutconfig\` | Gera \`gitpagedocs/layouts/\` |
| \`--push\` | Cria workflow, commit de artefatos, push |
| \`--home\` | Gera \`gitpagedocshome/\` (estatico + .env + Dockerfile) |

## Saida gerada

- \`gitpagedocs/config.json\` – config raiz
- \`gitpagedocs/icon.svg\` – icone padrao
- \`gitpagedocs/docs/versions/<ver>/config.json\` – rotas por versao
- \`gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md\` – docs em markdown
- \`gitpagedocs/layouts/\` – apenas com \`--layoutconfig\`

## Tipos de conteudo

| Tipo | Chave config | Descricao |
|------|--------------|-----------|
| Markdown | \`routes-md\` | Arquivos .md com \`path\` por idioma |
| HTML | \`routes-html\` | \`path\` local ou \`url\` externa |
| Video | \`routes-video\` | \`video.pathVideo\`, \`video.videoType\` |
| Audio | \`routes-audio\` | \`audio.pathAudio\`, \`audio.audioType\` |

## Visualizador de codigo fonte

Quando \`GITPAGEDOCS_REPOSITORY_SEARCH=true\`, o runtime expoe \`/source-viewer\` e caminhos de repositorio como \`/source-viewer/<owner>/<repo>/tree/<branch>\`. O viewer le a arvore do repositorio no GitHub em tempo de execucao e aplica o tema atual da documentacao.

- Inputs de owner, repositorio e branch; a branch padrao e \`main\`
- Navegacao por pastas e filtro de arquivos
- Listagem de diretorios no estilo GitHub
- Renderizacao de codigo com numeros de linha
- Alternancia preview/codigo para Markdown, incluindo \`README.md\`
- Os metadados de versao controlam o atalho do cabecalho via \`source-viewer\` e \`source-viewer-path\`

## Chaves de config (site)

- \`name\`, \`defaultLanguage\`, \`supportedLanguages\`
- \`docsVersion\`, \`rendering\`, \`ThemeDefault\`, \`ThemeModeDefault\`
- \`ProjectLink\`, \`layoutsConfigPathOficial\`, \`layoutsConfigPath\`

## Variaveis de ambiente

- \`GITPAGEDOCS_REPOSITORY_SEARCH\` – busca de repositorio (local)
- \`GITHUB_ACTIONS\` – modo build GitHub Pages
`,
    configuration: `# Configuracao

A configuracao de runtime fica em \`gitpagedocs/config.json\`.

## Secao \`site\`

Principais chaves:

- \`name\`: titulo do projeto no UI
- \`defaultLanguage\`: idioma padrao
- \`supportedLanguages\`: lista de idiomas disponiveis
- \`HideThemeSelector\`: esconde/mostra seletor de tema
- \`ThemeDefault\`: id do tema inicial
- \`ThemeModeDefault\`: modo inicial (\`light\` ou \`dark\`)
- \`ProjectLink\`: URL de repositorio para acoes no cabecalho
- \`docsVersion\`: versao inicial selecionada
- \`ActiveNavigation\`: habilita comportamento de anterior/proximo
- \`FocusMode\`: habilita modo foco/leitura
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
- \`routes-html\`: Caminhos de paginas HTML por idioma
- \`routes-video\`: Config de video com \`video.videoType\` (youtube, vimeo, mp4, etc.) e \`video.pathVideo\`
- \`routes-audio\`: Config de audio com \`audio.audioType\` (youtube, mp3, etc.) e \`audio.pathAudio\`
- \`authorization\` (md/html/video): guarda de acesso por chave, papeis e autenticacao externa
- \`menus-header-md\`, \`menus-header-html\`, \`menus-header-video\`, \`menus-header-audio\`: menus por tipo
- \`hierarchyPage\`: ordem dos containers na pagina \`{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4 }\`
- \`hierarchyMenu\`: ordem das secoes do menu \`{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4 }\`

Cada rota pode incluir \`title\`, \`description\` (por idioma), \`titleCss\`, \`titlePosition: "center"\`, \`descriptionPosition: "center"\`, \`titleIsVisible\`, \`descriptionIsVisible\`.

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
- **tools/** — \`@gitpagedocs/tools\`: ai/ security/ crypto/ cache/ config/ logger/ errors/ filesystem/ documentation/ ports/.
- **mcp/** — \`@gitpagedocs/mcp\`: ferramentas + recursos MCP que delegam ao tools/.

## Modulos principais (frontend)

- \`frontend/src/app/[[...repo]]/page.tsx\` — parser de rota, generateStaticParams, selecao de shell.
- \`frontend/src/entities/docs/api/load-docs-data.ts\` — config local/remota, versao, parse markdown, layouts + temas.
- \`frontend/src/widgets/docs-shell/docs-shell.tsx\` — UI, estado idioma/versao/tema, sync de URL, montagem do chat de IA.

## Seguranca: credenciais de IA criptografadas

O console \`/ai\` e o chat drawer exigem uma senha local que deriva (PBKDF2) uma chave AES-256-GCM; as chaves ficam criptografadas no \`localStorage\` e so sao descriptografadas durante a sessao (\`@gitpagedocs/tools/security\`).

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

- \`gitpagedocs/layouts/layoutsConfig.json\`
- \`gitpagedocs/layouts/layoutsFallbackConfig.json\`
- \`gitpagedocs/layouts/templates/*.json\`

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
