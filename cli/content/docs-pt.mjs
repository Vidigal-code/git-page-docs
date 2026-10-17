export const docsPt = {
    pdf: `# Documentos PDF

PDF é um tipo de conteúdo próprio, junto com Markdown, HTML, código-fonte, vídeo e áudio. A prévia usa o visualizador nativo de PDF do navegador. As ações de baixar e abrir em nova aba são configuráveis de forma independente.

## Guia do projeto em inglês

O scaffold inclui o [Guia do projeto GitPageDocs (PDF, inglês)](https://github.com/Vidigal-code/git-page-docs/blob/main/cli/content/assets/gitpagedocs-project-guide.pdf). Ele explica o projeto, pacotes, configuração, ícones, modo foco, narração, CLI, MCP e publicação. O PDF está em inglês; esta referência possui versões em português, inglês e espanhol.

A CLI copia os bytes do anexo para \`gitpagedocs/docs/versions/<versão>/en/gitpagedocs-project-guide.pdf\`. Os três caminhos de idioma do exemplo apontam para esse arquivo em inglês. Para oferecer traduções, adicione os PDFs traduzidos e altere o caminho de cada idioma.

## Padrões do site

Adicione este bloco dentro de \`site\` em \`gitpagedocs/config.json\`:

\`\`\`json
{
  "pdf": {
    "enabled": true,
    "previewEnabled": true,
    "downloadEnabled": true,
    "openInNewTabEnabled": true
  }
}
\`\`\`

\`enabled\` é a chave geral do conteúdo PDF. Os demais campos controlam a prévia, o botão de download e o link de nova aba. Todo campo omitido assume \`true\`, inclusive em configurações antigas.

A precedência das ações é \`rota.pdf.<flag>\` > \`site.pdf.<flag>\` > \`true\`. Um \`true\` explícito na rota habilita aquela ação mesmo quando o padrão do site é \`false\`; \`site.pdf.enabled: false\` continua desabilitando todos os PDFs. Sem caminho para o idioma selecionado, o PDF fica indisponível; não há fallback automático de idioma.

## Exemplo de rota e menu

Em \`gitpagedocs/docs/versions/0.0.9/config.json\`, mantenha as listas de rotas e menus no nível principal:

\`\`\`json
{
  "routes-pdf": [{
    "id": 23,
    "title": { "en": "Project guide (English)", "pt": "Guia do projeto (inglês)", "es": "Guía del proyecto (inglés)" },
    "pdf": {
      "pathPdf": {
        "en": "gitpagedocs/docs/versions/0.0.9/en/gitpagedocs-project-guide.pdf",
        "pt": "gitpagedocs/docs/versions/0.0.9/en/gitpagedocs-project-guide.pdf",
        "es": "gitpagedocs/docs/versions/0.0.9/en/gitpagedocs-project-guide.pdf"
      },
      "previewEnabled": true,
      "downloadEnabled": true,
      "openInNewTabEnabled": true
    }
  }],
  "menus-header-pdf": [{
    "id": 23,
    "en": { "title": "Project guide (English)", "path-click": "page:23" },
    "pt": { "title": "Guia do projeto (inglês)", "path-click": "page:23" },
    "es": { "title": "Guía del proyecto (inglés)", "path-click": "page:23" }
  }]
}
\`\`\`

O mapa \`pdf.pathPdf\` seleciona o arquivo do idioma atual. Use \`page:<id>\` nos destinos dos menus PDF. A mesma estrutura recursiva de \`submenus\` dos outros menus está disponível. O scaffold reserva o ID 23 para o exemplo PDF e o ID 24 para esta referência Markdown; use IDs únicos para páginas adicionais.

As flags opcionais da rota ficam dentro de \`pdf\`. Apresentação compartilhada, \`container\`, \`RouteGuide\` e autorização continuam no nível da rota. \`routeDefaults\` também atende rotas PDF. Adicione \`"pdf": 5\` em \`hierarchyPage\` e \`hierarchyMenu\` para posicionar PDFs depois do áudio; ajuste os valores conforme a ordem desejada.

## Arquivos e publicação

Caminhos relativos à raiz do repositório que começam com \`gitpagedocs/\` são copiados para os assets públicos do visualizador ao iniciar ou compilar o Next.js. A URL respeita o subdiretório de publicação no GitHub Pages. Versione o PDF no Git e publique-o junto com a documentação gerada. Arquivos fora de \`gitpagedocs/\` devem estar em \`frontend/public/\` do visualizador ou acessíveis por uma URL HTTP(S).

Use a URL do PDF binário, não uma página HTML de prévia do repositório. Em repositórios remotos, o caminho configurado é resolvido nesse repositório. Tanto a prévia quanto o download buscam os bytes do arquivo, portanto um servidor externo precisa permitir CORS nas duas operações. O visualizador valida a assinatura PDF e cria uma URL Blob temporária com tipo \`application/pdf\` para a prévia nativa; essa URL é liberada ao trocar ou fechar o documento. A política de incorporação e os cabeçalhos de tipo/disposição do servidor de origem não controlam essa prévia Blob.

O link de nova aba abre diretamente a URL original. Seu comportamento depende do navegador e dos cabeçalhos \`Content-Type\` e \`Content-Disposition\`; uma URL raw pode baixar o arquivo em vez de exibi-lo. O link direto continua disponível se a prévia ou o download falhar, exceto quando essa ação está desabilitada.

## Leitura e diagnóstico

- Os controles nativos de PDF, teclado, zoom e navegação entre páginas dependem do navegador. Alguns navegadores móveis abrem ou baixam o arquivo em vez de incorporá-lo.
- A prévia não converte PDF em Markdown. Modo foco, navegação por seção, cópia de Markdown e narração atuam em documentos Markdown, não no PDF incorporado.
- Desabilitar a prévia pode manter download e nova aba disponíveis. Desabilitar todas as ações deixa o PDF sem controle interativo.
- Ocultar um botão não controla acesso. PDFs hospedados publicamente continuam acessíveis pela URL. Documentos confidenciais precisam de hospedagem protegida.
- Se a prévia estiver vazia, use a ação de nova aba, confira se o caminho retorna um PDF e examine os cabeçalhos do servidor. Falhas de download são informadas na página.
`,
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

## Referências detalhadas

- **Referência da CLI**: instalação, todos os comandos e flags de compatibilidade.
- **Servidor MCP**: cliente, 20 tools, 7 resources e configuração de provedores.
- **Navegação e submenus**: árvores recursivas, URLs e sobrescritas dos breadcrumbs.
- **Modo foco**: copiar/baixar Markdown e navegar por seção/documento.
- **Acessibilidade e narração**: vozes do navegador, controles e interação com mídias.
- **Documentos PDF**: prévia nativa, download/nova aba e o guia incluído em inglês.
`,
    gettingStarted: `# Primeiros passos

O Git Page Docs separa os arquivos de documentação do visualizador. Instale a CLI para criar os arquivos; use o visualizador oficial, GitHub Pages ou um checkout do runtime para exibi-los.

## Requisitos e instalação

Use Node.js 20 ou superior. Git é necessário para publicar; GitHub CLI é necessário quando a CLI configura o Pages automaticamente.

\`\`\`bash
npm install --save-dev @gitpagedocs/cli
npx gitpagedocs --no-interactive --owner SEU_USUARIO --repo SEU_REPOSITORIO
\`\`\`

Para executar sem instalação local, use \`npx --yes @gitpagedocs/cli --no-interactive --owner SEU_USUARIO --repo SEU_REPOSITORIO\`. Para instalar globalmente, use \`npm install -g @gitpagedocs/cli\` e depois \`gitpagedocs\`. Execute na raiz do repositório.

## Contrato gerado

- \`gitpagedocs/config.json\`: opções do site e referências das versões.
- \`gitpagedocs/langs/{en,pt,es}.json\`: textos da interface.
- \`gitpagedocs/docs/versions/<version>/config.json\`: rotas e menus.
- \`gitpagedocs/docs/versions/<version>/{en,pt,es}/*.md\`: conteúdo; os nomes dos arquivos permanecem em inglês nos três idiomas.
- \`gitpagedocs/icon.svg\`: ícone do site.
- \`--layoutconfig\` também grava \`gitpagelayouts/\`; \`--layouts-dir\` altera essa pasta.

O gerador escreve configuração e conteúdo; ele não instala uma aplicação Next.js no seu repositório. Executá-lo novamente regrava os arquivos do scaffold: revise o diff do Git antes de manter mudanças em documentação editada manualmente.

## Ler e publicar

Faça commit e push da pasta gerada e abra \`https://vidigal-code.github.io/git-page-docs/SEU_USUARIO/SEU_REPOSITORIO/\` para um repositório público. Para publicar seu próprio site, autentique com \`gh auth login\` e execute \`npx gitpagedocs pages deploy --owner SEU_USUARIO --repo SEU_REPOSITORIO\`. Isso gera arquivos, faz commit e push; acompanhe a execução do GitHub Actions. Consulte Publicação para subcaminhos e o contrato do workflow.

## Desenvolver o visualizador localmente

Os comandos abaixo pertencem a um checkout do Git Page Docs, não a um repositório que contém apenas arquivos gerados:

\`\`\`bash
git clone https://github.com/Vidigal-code/git-page-docs.git
cd git-page-docs
corepack enable
pnpm install --frozen-lockfile
pnpm dev
\`\`\`

O repositório fixa o pnpm em \`packageManager\`. \`pnpm dev\` ativa a busca de repositórios; \`pnpm dev:e2e\` usa a documentação local. Para produção local, execute \`pnpm build\` e \`pnpm start\`; o script start recompila antes de iniciar. Configure \`PORT=3100\` no ambiente do processo quando a porta 3000 estiver ocupada.

## Próximos passos

Use Configuração para idiomas, ícones, navegação, foco e narração; Funcionalidades para CLI e MCP; Temas e layouts para tokens visuais; Perguntas frequentes para diagnóstico.
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

## Linha de comando

Consulte **Referência da CLI** para comandos, flags, exemplos e compatibilidade. Consulte **Servidor MCP** para integração com editores.

## Tipos de conteudo

| Tipo | Chave config | Descricao |
|------|--------------|-----------|
| Markdown | \`routes-md\` | Arquivos .md com \`path\` por idioma |
| HTML | \`routes-html\` | \`path\` local ou \`url\` externa |
| Video | \`routes-video\` | \`video.pathVideo\`, \`video.videoType\` |
| Audio | \`routes-audio\` | \`audio.pathAudio\`, \`audio.audioType\` |
| PDF | \`routes-pdf\` | \`pdf.pathPdf\` por idioma; prévia nativa e download |

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

## Reproducao de midia (um som por vez)

\`site.mediaExclusivePlayback\` (padrao \`true\`): dar play num video de rota pausa o radio e as trilhas de audio, e dar play no radio ou numa trilha de audio pausa o video. Funciona com YouTube e Vimeo (pelas APIs dos players), arquivos nativos (\`mp4\`, \`webm\`, …) e qualquer outro embed.

Para mostrar um video sem som enquanto o radio ou uma trilha de audio o explica, use \`"muted": true\` no objeto \`video\` da rota: o video roda so a imagem e fica fora da regra. \`"mediaExclusivePlayback": false\` desliga a regra no site inteiro.

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

## Controles de idioma, tema e foco

Em \`gitpagedocs/config.json\`, adicione estas entradas a \`site.icons\` para usar React Icons no seletor de idioma, no seletor de tema e no botao de foco:

\`\`\`json
{
  "site": {
    "icons": {
      "LanguageSelector": {
        "reactIcon": true, "tag": "FiGlobe", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "ThemeSelector": {
        "reactIcon": true, "tag": "BsSunFill", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "FocusMode": {
        "reactIcon": true, "tag": "MdFullscreen", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "QuickNavigation": {
        "reactIcon": true, "tag": "FiSearch", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      }
    }
  }
}
\`\`\`

Cada controle e independente: \`reactIcon: false\` preserva a aparencia atual com texto (padrao); \`true\` mostra o icone. Personalize \`tag\`, \`size\`, \`colorDark\` e \`colorLight\` por controle; \`currentColor\` acompanha o tema ativo. Os seletores com icone mantem seus menus e nomes acessiveis. \`site.FocusMode\` continua controlando se o modo foco esta habilitado; \`site.icons.FocusMode\` altera apenas a aparencia do botao.

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
- \`routes-pdf\`: PDF com \`pdf.pathPdf\` por idioma; consulte Documentos PDF.
- \`authorization\` (md/html/video): guarda de acesso por chave, papeis e autenticacao externa
- \`menus-header-md\`, \`menus-header-source-viewer\`, \`menus-header-html\`, \`menus-header-video\`, \`menus-header-audio\`, \`menus-header-pdf\`: menus por tipo
- \`hierarchyPage\`: ordem dos containers na pagina \`{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4, pdf: 5 }\`
- \`hierarchyMenu\`: ordem das secoes do menu \`{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4, pdf: 5 }\`

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

## Comportamento do site e padrões

| Chave | Padrão / finalidade |
| --- | --- |
| \`ActiveNavigation\` | true; controles comuns de anterior/próximo |
| \`FocusMode / focusMode\` | Habilitação geral (true) e controles independentes de cópia, download, seção e documento; consulte Modo foco |
| \`pdf\` | Habilitação geral, prévia, download e nova aba; todos true |
| \`nestedMenusEnabled\` | true; árvore recursiva, ou destinos em lista plana quando false |
| \`RouteGuide\` | true; breadcrumbs, com sobrescrita por padrão da versão e rota Markdown |
| \`accessibility\` | Habilitado por padrão; opções de narração na página Acessibilidade |
| \`HideThemeSelector\` | false; true oculta o seletor de tema |
| \`FooterEnabled\` | true; exibe o rodapé |
| \`FooterLinkName / FooterLinkUrl\` | Texto e destino do link do rodapé |
| \`FooterDateMode / FooterDateCustom\` | browser, year ou custom; custom usa o texto configurado |
| \`SiteHeaderName / SiteIconPath\` | Marca do cabeçalho e caminho do ícone do site |
| \`audioPlayerEnabled\` | true; controles de áudio de fundo |
| \`audioAutoPlayOnLoad\` | false; autoplay depende da política do navegador |
| \`audioLoopEnabled / audioSequentialPlayback\` | false; repetir faixa / avançar faixas nativas |
| \`audioAllowUserChoice\` | Permite escolher faixa quando a playlist tem várias entradas |
| \`audioTracks\` | Objetos com url, type e title por idioma |
| \`audioPopoverHideSource / audioPopoverShowMinutes\` | false / true; origem e duração de faixas nativas |
| \`audioPopoverSourceCustomLabel\` | Texto opcional da origem por idioma |
| \`mediaExclusivePlayback\` | true; um áudio entre narração, rádio, faixas e vídeo |
| \`AiChatEnabled / AiChatAutoLockSeconds\` | true / 30; exibe chat e bloqueia por inatividade (0 desativa temporizador) |
| \`docsAccess\` | enabled e publicKey configuram o bloqueio da documentação; arquivos públicos continuam públicos |
| \`RouteguideBrandPositionDefault / RouteguideBrandContainerTopDefault\` | center / false; posição do sumário de títulos, separado dos breadcrumbs |
| \`TocScrollMaxHeightDesktop / TocScrollMaxHeightMobile\` | Limites de rolagem do sumário; comprimentos CSS como min(65vh, 400px) |

## Adicionar versão ou documento

Crie a pasta da versão com seu config e registre-a em \`VersionControl.versions\` com \`id\` e \`path\`. Adicione uma entrada \`routes-md\` com ID único e caminhos por idioma; acrescente destinos correspondentes no menu. Use \`routeDefaults\` para valores compartilhados pelas rotas; campos explícitos da rota prevalecem. Consulte Navegação para submenus e sobrescritas de \`RouteGuide\`.

Opções visuais são configuração pública. Nunca coloque credenciais de provedor ou chaves privadas no JSON do site. Os exemplos de Rotas autorizadas demonstram controles no cliente, não proteção de arquivos para download no servidor.

A entrada \`QuickNavigation\` controla a aparência em ícone/texto do botão Ctrl+K. O atalho de teclado e o painel de busca permanecem disponíveis.
`,
    deployment: `# Publicação

Escolha o visualizador oficial para um repositório público, publique seu próprio GitHub Pages ou hospede um export estático compilado do runtime.

## Visualizador oficial

Faça commit da pasta \`gitpagedocs/\` gerada no repositório público. Abra \`https://vidigal-code.github.io/git-page-docs/OWNER/REPOSITORY/\` e escolha versão e idioma. O visualizador busca configuração e conteúdo no repositório. Essa URL não torna público um repositório privado.

## Seu site no GitHub Pages

Requisitos: repositório Git, origin GitHub, permissão de push e GitHub CLI autenticado (\`gh auth login\`) quando a CLI configura o Pages.

\`\`\`bash
npx gitpagedocs pages deploy --owner OWNER --repo REPOSITORY
\`\`\`

O fluxo confirma o destino, gera docs e \`.github/workflows/gitpagedocs-pages.yml\`, faz commit e push e solicita GitHub Actions como fonte do Pages. Para mudar apenas a fonte, use \`npx gitpagedocs pages actions\`. Para publicar em subcaminho, passe \`--path docs\`.

Acompanhe o GitHub Actions até o deploy terminar; a URL impressa pela CLI pode aparecer antes do fim do build remoto. Sites de projeto normalmente usam \`https://OWNER.github.io/REPOSITORY/\`; sites de usuário/organização usam a raiz do repositório \`OWNER.github.io\`.

## Contrato do build

O workflow instala dependências do workspace com pnpm fixado, compila o visualizador e envia o artefato estático com as actions oficiais do Pages. O job de deploy exige \`pages: write\`, \`id-token: write\` e o ambiente \`github-pages\`.

- \`GITHUB_ACTIONS=true\` ativa export estático do Next.js.
- \`GITHUB_REPOSITORY=OWNER/REPOSITORY\` determina a base do repositório.
- \`GITPAGEDOCS_REPOSITORY_SEARCH=true\` ativa o build da busca inicial.
- \`GITPAGEDOCS_BASE_PATH\` sobrescreve explicitamente a base; \`GITPAGEDOCS_PATH\` define o subcaminho dos docs.
- \`GITPAGEDOCS_DIST_DIR\` separa saídas de build/dev quando há dois servidores locais.

\`pnpm build\` sem o ambiente do Pages produz um build de produção Next.js; sozinho não valida export estático. Preserve \`.nojekyll\` ao hospedar o export no Pages.

## Export independente

Em um checkout do runtime com dependências instaladas, \`node cli/index.mjs --home --output gitpagedocshome --no-interactive\` compila \`frontend/\` e empacota uma distribuição estática. \`--search true\` ativa a busca inicial de repositórios. A saída inclui arquivos estáticos, README, Dockerfile e exemplo de ambiente; a pasta de destino é recriada. Um servidor estático serve os arquivos; alterar configuração de ambiente usada no build exige nova compilação.

## Releases npm para mantenedores

O monorepo publica \`@gitpagedocs/tools\`, \`@gitpagedocs/mcp\` e \`@gitpagedocs/cli\`; raiz e frontend são privados. O \`npm-publish.yml\` atual roda em pushes para \`main\` e ignora uma versão da CLI já publicada. Usa o secret \`NPM_TOKEN\` do repositório e publica workspaces na ordem de dependência. Criar somente uma release no GitHub não é seu gatilho.

Sincronize versões e dependências internas, regenere docs/baselines, execute typecheck, lint, testes, smoke, build e Playwright e revise antes do push. Confirme as três versões no npm e o resultado do Pages. A CLI de configuração ignora \`prebuilt/\`; essa pasta não é exigida pelo workflow de publicação.
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

## Escolher e personalizar

Escolha um tema pelo seletor ou configure \`site.ThemeDefault\` com seu ID exato. \`ThemeModeDefault\` define o modo inicial claro/escuro. \`HideThemeSelector\` esconde o seletor; o tema selecionado continua aplicado.

No seu repositório, execute a CLI com \`--layoutconfig\`, edite o template gerado e mantenha o ID coerente com \`layoutsConfig.json\`. O conteúdo da rota e \`site.icons\` são independentes do catálogo de temas. Use \`currentColor\` para ícones que herdam a cor do texto ou configure cores claras/escuras com contraste suficiente.

Ao contribuir no Git Page Docs, a fonte autoral é \`gitpagelayouts/v2/base.json\` com \`gitpagelayouts/v2/layouts/<id>.json\`. Execute \`pnpm layouts:sync\` para gerar templates e documentação. Edições diretas nos templates gerados podem ser substituídas pela sincronização.
`,
    mcp: `# Servidor MCP

O servidor Model Context Protocol expõe 20 tools e 7 resources por **stdio**. Ele inicia como processo filho do cliente MCP. Não abre porta HTTP nem executa um daemon em segundo plano.

## Instalar e conectar

Use Node.js 20+. Instale a CLI no projeto com \`npm install --save-dev @gitpagedocs/cli\`; ela inclui o servidor e o runtime TypeScript. A instalação global também permite \`gitpagedocs mcp start\`. Para execução avulsa, use \`npx --yes @gitpagedocs/cli mcp start\`.

No VS Code, crie \`.vscode/mcp.json\` com a configuração abaixo. A pasta de trabalho do processo é a raiz do projeto; o comando MCP não possui flags \`--root\` ou \`--cwd\`.

\`\`\`json
{
  "servers": {
    "gitpagedocs": {
      "type": "stdio",
      "command": "node",
      "args": [
        "\${workspaceFolder}/node_modules/@gitpagedocs/cli/index.mjs",
        "mcp",
        "start"
      ],
      "cwd": "\${workspaceFolder}"
    }
  }
}
\`\`\`

Abra os controles de servidor MCP do cliente, inicie GitPageDocs e liste tools/resources. Teste \`list_files\` com \`{"path":".","recursive":false}\` e leia \`project://readme\`. Essas operações não precisam de chave de provedor. Um terminal iniciado com \`mcp start\` aguarda JSON-RPC; texto comum no stdin não é um comando de chat. Em um checkout do código, a entrada direta é \`node --import tsx mcp/src/bin.ts\`, não \`index.ts\`.

## Configurar um provedor

As chamadas de provedor leem credenciais do ambiente do processo MCP. O MCP não carrega \`.env\` nem o cofre criptografado da CLI automaticamente. Use o recurso de entrada protegida/segredos do cliente para injetar variáveis; nunca grave chaves reais em configuração versionada. Reinicie o processo MCP após alterar seu ambiente.

Selecione o provedor com \`configure_ai_provider\` ou pelo arquivo \`.gitpagedocs-mcp.json\` na raiz do projeto:

\`\`\`json
{
  "provider": "ollama",
  "model": "llama3"
}
\`\`\`

| Provider | Environment |
| --- | --- |
| \`openai\` | \`OPENAI_API_KEY\` |
| \`anthropic\` | \`ANTHROPIC_API_KEY / CLAUDE_API_KEY\` |
| \`gemini\` | \`GEMINI_API_KEY / GOOGLE_API_KEY\` |
| \`openrouter\` | \`OPENROUTER_API_KEY\` |
| \`ollama\` | \`OLLAMA_BASE_URL\` |
| \`azure-openai\` | \`AZURE_OPENAI_API_KEY + AZURE_OPENAI_BASE_URL\` |
| \`mistral\` | \`MISTRAL_API_KEY\` |
| \`deepseek\` | \`DEEPSEEK_API_KEY\` |
| \`cohere\` | \`COHERE_API_KEY\` |
| \`groq\` | \`GROQ_API_KEY\` |
| \`xai\` | \`XAI_API_KEY\` |
| \`together\` | \`TOGETHER_API_KEY\` |
| \`fireworks\` | \`FIREWORKS_API_KEY\` |
| \`perplexity\` | \`PERPLEXITY_API_KEY\` |

Sem seleção válida, o provedor padrão é OpenAI. Ollama não exige chave de API; o serviço local e o modelo escolhido precisam estar disponíveis. \`OLLAMA_BASE_URL\` é opcional. A URL base do Azure é a URL completa da operação de chat, incluindo deployment e versão da API quando exigidos. A lista de modelos é um catálogo distribuído, não uma verificação de disponibilidade em tempo real.

## Referência de tools

\`?\` indica argumento opcional. Caminhos e conteúdo são strings; \`recursive\` é booleano. Os identificadores de provedor vêm do catálogo. Execute as tools pela interface de ferramentas do cliente MCP.

| Tool | Argumentos | Comportamento |
| --- | --- | --- |
| \`list_files\` | \`path?, recursive?\` | Lista arquivos (padrão: pasta atual, sem recursão) |
| \`read_file\` | \`path\` | Lê texto UTF-8 |
| \`write_file\` | \`path, content\` | Grava o arquivo inteiro; cria pastas necessárias |
| \`search_project\` | \`query, extension?\` | Busca por trecho sem distinguir maiúsculas |
| \`list_ai_providers\` | \`—\` | Consulta o catálogo de provedores |
| \`list_ai_models\` | \`provider?\` | Consulta o catálogo local de modelos |
| \`configure_ai_provider\` | \`provider, model?\` | Salva .gitpagedocs-mcp.json |
| \`ask_ai\` | \`prompt, provider?, model?, system?\` | Retorna uma resposta, sem histórico de conversa |
| \`generate_documentation\` | \`path, provider?\` | Documenta um arquivo fonte |
| \`generate_api_docs\` | \`path, provider?\` | Descreve a API de um arquivo |
| \`generate_database_docs\` | \`path, provider?\` | Descreve modelos de dados de um arquivo |
| \`analyze_source_code\` | \`path, provider?\` | Analisa um arquivo fonte |
| \`generate_readme\` | \`provider?\` | Usa a árvore e package.json |
| \`generate_architecture_docs\` | \`provider?\` | Usa a árvore do repositório |
| \`analyze_repository\` | \`provider?\` | Analisa a árvore do repositório |
| \`analyze_project\` | \`provider?\` | Analisa a árvore e package.json |
| \`generate_changelog\` | \`provider?\` | Usa até 80 commits; usa a árvore se indisponíveis |
| \`generate_release_notes\` | \`provider?\` | Usa o mesmo contexto do changelog |
| \`validate_docs\` | \`provider?\` | Pede ao provedor uma revisão do Markdown coletado |
| \`update_documentation\` | \`path, instructions?, provider?\` | Gera e grava uma região gerenciada |

\`generate_*\`, \`analyze_*\`, \`ask_ai\` e \`validate_docs\` retornam texto; não salvam automaticamente. \`validate_docs\` é uma revisão feita pelo provedor, não um verificador determinístico de links. Somente \`write_file\`, \`configure_ai_provider\` e \`update_documentation\` gravam arquivos. \`update_documentation\` preserva texto fora de \`<!-- gitpagedocs:start -->\` / \`<!-- gitpagedocs:end -->\`; acrescenta uma região quando o par válido não existe. O servidor não exibe confirmação própria; configure permissões no cliente MCP.

## Referência de resources

| URI | Conteúdo |
| --- | --- |
| \`project://structure\` | Árvore do repositório |
| \`project://docs\` | Documentos Markdown coletados |
| \`project://config\` | Configuração resolvida e sourcePath |
| \`project://repository\` | Conteúdo de package.json |
| \`project://readme\` | README.md |
| \`project://ai/providers\` | Catálogo de provedores |
| \`project://ai/models\` | Catálogo de modelos por provedor |

## Exemplo de uso

1. Leia \`project://structure\` e \`project://readme\`.
2. Execute \`list_ai_providers\` e \`list_ai_models\` para escolher provedor/modelo.
3. Execute \`generate_api_docs\` com \`{"path":"src/index.ts"}\` e revise o texto retornado.
4. Salve o texto aprovado com \`write_file\`, ou use \`update_documentation\` com \`{"path":"docs/api.md","instructions":"Documente a API pública em português."}\` para uma região gerenciada.

A etapa de geração envia o conteúdo selecionado do projeto ao provedor configurado.

## Limites e diagnóstico

- Leitura de arquivos: até 512.000 bytes. Listagem: até 2.000 entradas; árvores coletadas do projeto: 400 entradas.
- Busca: até 5.000 entradas, 200 resultados e 240 caracteres por linha encontrada.
- Coleta de documentação: primeiros 40 arquivos Markdown entre até 2.000 entradas; arquivos acima de 40.000 bytes são ignorados. O contexto do provedor é limitado a 24.000 caracteres.
- A listagem ignora pastas de dependências/build como \`node_modules\`, \`.git\`, \`.next\`, \`out\`, \`dist\`, \`prebuilt\`, \`.turbo\` e \`coverage\`. Não interpreta \`.gitignore\`; arquivos como \`.env\` não são excluídos automaticamente. Execute somente em projeto confiável e selecione o conteúdo que será exposto.
- A verificação de caminhos é lexical; o processo não é um sandbox do sistema operacional nem garante isolamento de symlinks/junctions. Ler \`project://config\` pode importar configuração JavaScript/TypeScript.
- Falhas de tools incluem \`isError: true\`. Resources ausentes retornam \`Unavailable: ...\`. Consulte stderr no cliente para falhas de inicialização; stdout é reservado para JSON-RPC.
- Se as tools funcionam mas a geração falha, confira seleção do provedor, credenciais de ambiente, modelo e conectividade.
`,
    cli: `# Referência da CLI

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
| \`--search <true-or-false>\` | Habilita/desabilita busca de repositorio (\`--home\`) |
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

## Exemplos e limites dos comandos

\`\`\`bash
npx gitpagedocs --no-interactive --owner octocat --repo handbook
npx gitpagedocs --layoutconfig --layouts-dir assets/layouts --no-interactive
npx gitpagedocs chat "Explique este projeto" --provider ollama --model llama3
npx gitpagedocs pages deploy --owner octocat --repo handbook --path docs
npx gitpagedocs mcp start
\`\`\`

- \`init\` é um alias da geração. \`providers\` equivale a \`provider\`; \`--version\` e \`-v\` equivalem a \`version\`.
- \`document\`, \`document:repo\`, \`document:file\`, \`document:folder\` e \`--ai\` selecionam o fluxo interativo de documentação. Escolha diretórios nos prompts; esses aliases não implementam uma API separada de arquivo/pasta por argumento posicional.
- \`chat\` aceita \`--provider <id>\`, \`--model <id>\` e \`--system <prompt>\`. Com pergunta ou stdin recebe resposta única; um terminal interativo sem pergunta inicia uma conversa.
- \`--build\`, \`--serve\` e \`--full\` são flags de compatibilidade: o scaffold comum continua apenas configuração e elas não iniciam um servidor local.
- \`--home\` compila \`frontend/\` a partir de um checkout do runtime e grava o export estático com arquivos auxiliares. A pasta de saída é recriada quando diferente de \`.\`; mantenha sua documentação fonte fora dela. Instalar apenas a CLI não fornece \`frontend/\`.
- \`pages actions\` apenas configura a fonte do Pages; \`pages deploy\` e \`--push\` geram, fazem commit e push. Uma URL impressa não significa que o build remoto terminou: acompanhe o GitHub Actions.
- \`update\` consulta o npm e imprime um comando de instalação; não atualiza a CLI silenciosamente.

## Configuração e credenciais

As opções visuais ficam em \`gitpagedocs/config.json\`. O gerador interativo/chat salva \`.gitpagedocsconfig\` e o cofre criptografado \`.gitpagedocsvault\` na pasta de configuração do usuário: \`%APPDATA%/gitpagedocs\` no Windows, \`~/Library/Application Support/gitpagedocs\` no macOS e a pasta XDG no Linux. \`config clear\` remove essas configurações e o cofre. MCP usa \`.gitpagedocs-mcp.json\` na raiz do projeto e o ambiente do processo; consulte a página MCP.

\`gitpagedocs docs\` atualiza somente regiões delimitadas por marcadores em README.md, CONTRIBUTING.md e SECURITY.md, preservando o texto ao redor. \`password\` configura o par de chaves de acesso à documentação; controles de apresentação no cliente não tornam confidenciais arquivos de um repositório público.
`,
    navigation: `# Navegação e submenus

Rotas definem o conteúdo; menus definem como o leitor o encontra. Configure-os em \`gitpagedocs/docs/versions/<version>/config.json\`. Opções visuais globais ficam em \`gitpagedocs/config.json\`.

\`\`\`json
{
  "site": {
    "nestedMenusEnabled": true,
    "RouteGuide": true
  }
}
\`\`\`

## Montar a árvore de menus

Cada entrada de \`menus-header-md\` tem \`id\` e objetos \`pt\`, \`en\`, \`es\` com \`title\` e \`path-click\` opcional. Adicione \`submenus\` com novas entradas para aninhar a árvore. O objeto de um idioma também aceita \`submenus\` localizados com título/caminho. Use uma forma de maneira consistente para não listar o mesmo filho duas vezes.

Grupos sem \`path-click\` organizam os filhos. Para um destino Markdown, use seu caminho localizado real de \`routes-md[].path\`. O alias \`page:<id>\` é registrado por rotas source-viewer, vídeo, áudio e PDF; não o use em uma página somente Markdown. O exemplo usa a versão \`0.0.8\`: troque esse trecho pela versão editada e crie os três arquivos chapter.

\`\`\`json
{
  "routeDefaults": {
    "RouteGuide": false
  },
  "routes-md": [
    {
      "id": 101,
      "RouteGuide": true,
      "path": {
        "pt": "gitpagedocs/docs/versions/0.0.8/pt/chapter.md",
        "en": "gitpagedocs/docs/versions/0.0.8/en/chapter.md",
        "es": "gitpagedocs/docs/versions/0.0.8/es/chapter.md"
      }
    }
  ],
  "menus-header-md": [
    {
      "id": 900,
      "pt": {
        "title": "Guia"
      },
      "en": {
        "title": "Guide"
      },
      "es": {
        "title": "Guía"
      },
      "submenus": [
        {
          "id": 901,
          "pt": {
            "title": "Capítulos"
          },
          "en": {
            "title": "Chapters"
          },
          "es": {
            "title": "Capítulos"
          },
          "submenus": [
            {
              "id": 101,
              "pt": {
                "title": "Primeiro capítulo",
                "path-click": "gitpagedocs/docs/versions/0.0.8/pt/chapter.md"
              },
              "en": {
                "title": "First chapter",
                "path-click": "gitpagedocs/docs/versions/0.0.8/en/chapter.md"
              },
              "es": {
                "title": "Primer capítulo",
                "path-click": "gitpagedocs/docs/versions/0.0.8/es/chapter.md"
              }
            }
          ]
        }
      ]
    }
  ]
}
\`\`\`

## Comportamento do aninhamento

\`site.nestedMenusEnabled: true\` exibe menus recursivos expansíveis. Você pode acrescentar \`submenus\` em qualquer nó: não há limite fixo de profundidade na aplicação. A configuração deve ser finita e adequada à memória do navegador e à usabilidade. Com \`false\`, os destinos aparecem em uma lista plana; as páginas aninhadas não são removidas.

A árvore atende à navegação lateral, aos rótulos de busca, à expansão dos pais e à trilha de navegação. Mantenha IDs estáveis e sem ambiguidade; destinos protegidos seguem as regras de autorização da página. A mesma estrutura vale para \`menus-header-source-viewer\`, \`menus-header-html\`, \`menus-header-video\`, \`menus-header-audio\` e \`menus-header-pdf\`. \`hierarchyMenu\` ordena as seções por tipo; \`hierarchyPage\` ordena os containers que compartilham o ID da página.

## Trilha de navegação: RouteGuide

\`RouteGuide\` controla os breadcrumbs. A prioridade é \`routes-md[].RouteGuide\` da página, depois \`routeDefaults.RouteGuide\` da versão, depois \`site.RouteGuide\`, usando \`true\` como padrão final. O exemplo desliga a trilha na versão e a liga no capítulo 101. Arquivos existentes da versão \`0.0.8\` aceitam os mesmos campos.

\`RouteguideBrand\` e \`RouteguideBrandPosition\` são configurações separadas do sumário de títulos do documento; não controlam os breadcrumbs.

## URLs e anterior/próximo

URLs versionadas usam \`/v/<version>/\`; \`?lang=pt\` escolhe o idioma e \`?id=101\` escolhe a página. \`?name=chapter\` seleciona o slug do documento. Mantenha \`VersionControl.versions[].path\` apontando para o config da versão correspondente. \`site.ActiveNavigation\` ativa anterior/próximo comum; a navegação entre documentos no modo foco possui opção própria. Consulte Modo foco para os controles de seção e documento.

Teste um menu novo pela lateral, por URL direta e em cada idioma habilitado; confirme que o destino existe e é permitido para o leitor atual.
`,
    focusMode: `# Modo foco

O modo foco abre o documento Markdown atual em um diálogo de leitura. Ative-o com \`site.FocusMode\`; o controle aparece apenas para uma página Markdown real. \`site.icons.FocusMode\` muda a aparência em ícone/texto e não habilita ou desabilita o recurso.

## Configurar os controles

Mescle este fragmento em \`gitpagedocs/config.json\`:

\`\`\`json
{
  "site": {
    "FocusMode": true,
    "focusMode": {
      "copyEnabled": true,
      "downloadEnabled": true,
      "sectionNavigationEnabled": true,
      "documentNavigationEnabled": true
    }
  }
}
\`\`\`

Cada opção tem padrão \`true\`; \`false\` oculta seu controle correspondente. Com \`sectionNavigationEnabled: false\`, o modo foco exibe o documento inteiro sem paginação por seções. Configurações existentes sem o novo objeto \`focusMode\` mantêm os controles habilitados.

## Seções e documentos

- Os controles anterior/próximo de seta simples mudam de seção no mesmo documento.
- Os controles anterior/próximo de seta dupla mudam de documento Markdown na ordem dos menus, incluindo submenus.
- Documentos sem tradução no idioma ativo, destinos sem Markdown e páginas sem permissão são ignorados.
- Trocar de documento mantém o diálogo aberto e volta à primeira seção. Contadores de seção/documento mostram a posição atual.
- \`site.ActiveNavigation\` controla a navegação comum da página; não desabilita a navegação de documentos no modo foco.

## Copiar e baixar

Copiar e baixar usam o **Markdown original inteiro no idioma selecionado**, incluindo seções que não estão visíveis no momento. Não exportam o HTML renderizado nem apenas a seção atual.

O download conserva o nome-base Markdown do \`path\` localizado da rota; quando indisponível, o nome do arquivo é \`document.md\`. A área de transferência segue as permissões e regras de contexto seguro do navegador. Se a cópia falhar, use o download e confira o erro exibido.

## Teclado e leitura

O diálogo possui nome acessível, gerenciamento de foco do teclado e controle de fechar. Use Tab para percorrer controles e Escape para fechar. Controles só com ícone continuam com seus nomes traduzidos acessíveis. Fechar o diálogo retorna à documentação.

A narração é configurada separadamente em Acessibilidade. Trocar documento ou idioma cancela a narração anterior, evitando continuar a leitura de conteúdo antigo.
`,
    accessibility: `# Acessibilidade e narração

Os controles de acessibilidade incluem narração nativa do navegador para o documento Markdown atual. A narração usa a Web Speech API (\`speechSynthesis\`); não exige chave de API nem serviço externo de voz do GitPageDocs.

## Configuração

Mescle estas opções em \`gitpagedocs/config.json\`:

\`\`\`json
{
  "site": {
    "accessibility": {
      "enabled": true,
      "narration": {
        "enabled": true,
        "defaultRate": 1,
        "defaultVolume": 1
      }
    },
    "mediaExclusivePlayback": true
  }
}
\`\`\`

- \`site.accessibility.enabled\`: habilita a interface de acessibilidade.
- \`site.accessibility.narration.enabled\`: habilita a narração do documento.
- \`defaultRate\`: velocidade inicial de \`0.5\` a \`2\`, em passos de \`0.25\`; o padrão é \`1\`.
- \`defaultVolume\`: volume inicial de \`0\` (silencioso) a \`1\` (máximo), em passos de \`0.1\`; o padrão é \`1\`.
- Todos os controles de habilitação têm padrão \`true\`; opções ausentes usam os padrões distribuídos.

## Ler um documento em voz alta

1. Abra uma página Markdown e os controles de acessibilidade/narração.
2. Escolha voz e idioma entre os disponibilizados pelo navegador; ajuste velocidade e volume.
3. Inicie a leitura. Pause temporariamente, continue a fala pausada ou encerre a sessão.
4. Para alterar opções de leitura de forma previsível, pare, ajuste os controles e inicie novamente.

A narração começa somente após sua ação; não há reprodução automática. A seleção automática de voz acompanha o idioma do documento; escolher uma voz explicitamente utiliza o idioma dessa voz. A narração não traduz o documento.

A fala usa texto legível extraído do Markdown renderizado. Scripts, estilos, conteúdo SVG e elementos ocultos para tecnologias assistivas são excluídos. Documentos longos são lidos por inteiro em blocos sucessivos. Trocar documento ou idioma, desabilitar a narração ou sair da página cancela a fala anterior.

A visualização comum e o modo foco compartilham preferências de voz, velocidade e volume enquanto a página permanece montada. As preferências não são salvas entre recarregamentos. Valores não numéricos de velocidade ou volume usam \`1\`; valores numéricos fora das faixas suportadas são limitados ao extremo mais próximo.

## Um áudio por vez

Com \`site.mediaExclusivePlayback: true\` (padrão), iniciar ou continuar a narração pausa rádio, faixas de áudio e vídeos de rota. Iniciar essas mídias encerra a narração. Vídeos sem som ficam fora dessa regra. Use \`false\` quando a reprodução simultânea for intencional.

Essa configuração é compartilhada com a reprodução de mídia existente; não há uma segunda flag de exclusividade para narração. A página continua legível quando a narração está desabilitada.

## Disponibilidade de navegador e vozes

O suporte a fala e as vozes dependem do navegador, do sistema operacional e das vozes instaladas ou fornecidas remotamente. A lista pode chegar depois de a página carregar. Navegadores e dispositivos diferentes podem oferecer idiomas diferentes.

Ausência de suporte e erros de reprodução são informados na interface. Verifique se há uma voz disponível, se o áudio do sistema está ativo e se houve interação do usuário com a página. Lista de vozes vazia não significa falha ao carregar o documento.

Não presuma que toda voz funciona offline: as vozes podem ser locais ou remotas. O recurso fala texto; não grava o microfone. A narração complementa a navegação por teclado e leitores de tela, sem substituí-los.

Consulte a [referência da Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) para o comportamento do navegador.
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

## Por que o ícone ainda mostra texto?

Defina \`site.icons.<Controle>.reactIcon\` como booleano \`true\`, com o nome exato exportado por React Icons em \`tag\`. Os controles incluem LanguageSelector, ThemeSelector, FocusMode e QuickNavigation. Campos planos \`Icon*ReactIcones\` prevalecem se os dois formatos existirem. Confira se o próprio recurso está desabilitado por opções como \`HideThemeSelector\` ou \`FocusMode\`.

## Por que filhos de menus ou breadcrumbs aparecem diferentes?

\`nestedMenusEnabled: false\` achata os destinos intencionalmente. Confira \`submenus\`, objetos de idioma e \`path-click\`; confirme que as páginas existem e são acessíveis. Breadcrumbs usam \`RouteGuide\`, com prioridade rota > versão > site. \`RouteguideBrand\` controla o sumário de títulos.

## Por que a narração fica muda ou é interrompida?

Confira suporte do navegador, voz disponível, idioma, volume e saída de áudio. Vozes podem carregar depois ou exigir serviço remoto. Com \`mediaExclusivePlayback: true\`, outra fonte de áudio/vídeo encerra a narração por definição. Trocar de documento cancela a fala antiga. Consulte Acessibilidade.

## Por que o MCP fica aguardando ou uma tool falha?

\`mcp start\` aguarda um cliente MCP por stdio; não é um prompt de chat de terminal. Confira o cwd e use a entrada da CLI publicada ou \`mcp/src/bin.ts\`. Tools de arquivos/catálogo não precisam de provedor; geração exige credenciais no ambiente do processo MCP. O cofre da CLI e \`.env\` não são carregados automaticamente; inspecione \`isError\` e o stderr do cliente.

## Por que a regeneração mudou minhas páginas?

O scaffold regrava rotas, configs e documentação gerada. Revise o Git e mantenha conteúdo específico nas fontes escolhidas. Neste repositório, edite \`cli/content/docs-{en,pt,es}.mjs\` e metadados de rotas antes de regenerar; não use as cópias geradas como única fonte.
`,
  };
