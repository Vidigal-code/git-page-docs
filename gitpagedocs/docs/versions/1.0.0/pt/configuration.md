# Configuracao

A configuracao de runtime fica em `gitpagedocs/config.json`.

## Secao `site`

Principais chaves:

- `name`: titulo do projeto no UI
- `defaultLanguage`: idioma padrao
- `supportedLanguages`: lista de idiomas disponiveis
- `HideThemeSelector`: esconde/mostra seletor de tema
- `ThemeDefault`: id do tema inicial
- `ThemeModeDefault`: modo inicial (`light` ou `dark`)
- `ProjectLink`: URL de repositorio para acoes no cabecalho
- `docsVersion`: versao inicial selecionada
- `ActiveNavigation`: habilita comportamento de anterior/proximo
- `FocusMode`: habilita modo foco/leitura
- `IconImageMenuHeaderImgWidth`, `IconImageMenuHeaderImgHeight`: tamanho do icone principal
- `IconImageMenuHeaderLightImg`, `IconImageMenuHeaderDarkImg`: icone principal (light/dark)
- `IconProjectLinkImgWidth`, `IconProjectLinkImgHeight`: tamanho do icone link do projeto
- `IconProjectLinkLightImg`, `IconProjectLinkDarkImg`: icone link do projeto
- `IconVersionLinksImgWidth`, `IconVersionLinksImgHeight`: tamanho do icone links de versao
- `IconVersionLinksLightImg`, `IconVersionLinksDarkImg`: icone links de versao
- `IconInfoHeaderMenuImgWidth`, `IconInfoHeaderMenuImgHeight`: tamanho do icone info
- `IconInfoHeaderMenuLightImg`, `IconInfoHeaderMenuDarkImg`: icone info
- `IconPreviewProjectLinkImgWidth`, `IconPreviewProjectLinkImgHeight`: tamanho do icone preview
- `IconPreviewProjectLinkLightImg`, `IconPreviewProjectLinkDarkImg`: icone preview
- `layoutsConfigPath`: fallback remoto para layouts
- `rendering`: URL canonica publicada

## Secao `VersionControl`

`VersionControl.versions` define:

- `id`: identificador da versao
- `path`: caminho do config da versao
- links opcionais (`ProjectLink`, `branch`, `release`, `commit`)

## Navegacao e rotas

- `routes`: caminhos markdown por idioma (legado)
- `menus-header`: menu hierarquico
- `translations`: labels de UI para not-found e navegacao

## Tipos de conteudo (config de versao)

Configs de versao suportam multiplos tipos:

- `routes-md`: Rotas markdown com `title`, `description` (centralizados via `titlePosition`, `descriptionPosition`)
- `routes-html`: Caminhos de paginas HTML por idioma
- `routes-video`: Config de video com `video.videoType` (youtube, vimeo, mp4, etc.) e `video.pathVideo`
- `routes-audio`: Config de audio com `audio.audioType` (youtube, mp3, etc.) e `audio.pathAudio`
- `menus-header-md`, `menus-header-html`, `menus-header-video`, `menus-header-audio`: menus por tipo
- `hierarchyPage`: ordem dos containers na pagina `{ md: 0, html: 1, video: 2, audio: 3 }`
- `hierarchyMenu`: ordem das secoes do menu `{ md: 0, html: 1, video: 2, audio: 3 }`

Cada rota pode incluir `title`, `description` (por idioma), `titleCss`, `titlePosition: "center"`, `descriptionPosition: "center"`, `titleIsVisible`, `descriptionIsVisible`.

## Variaveis por rota (blockLink, container, url, browseAll)

Opcoes por rota em `routes-md`, `routes-html` e `routes-video`:

- **`blockLink`** (padrao: true) – Para HTML: se true, links abrem em nova aba (`target="_blank"`); se false, no proprio contexto.
- **`container`** – `"full"` = altura automatica; numero (ex: `500`) = altura fixa em px com overflow auto. Aplica-se a md, html e video.
- **`url`** – Apenas em `routes-html`: `Record<LanguageCode, string>` com URLs externas. Quando definido, o iframe usa `src={url}` em vez de HTML local via `srcDoc`. Rotas com `url` nao geram arquivos HTML locais.
- **`browseAll`** (padrao: false) – Se true, o container mostra botoes Anterior/Proximo para navegar entre todos os itens daquele tipo.

## Tipos de conteudo: path vs url (HTML)

- **Markdown (`routes-md`)**: usa `path` apontando para arquivos `.md` locais.
- **HTML (`routes-html`)**: usa `path` para arquivos HTML locais (sem extensao .html no config, ex: `source-viewer`) ou `url` para URLs externas. Com `url`, o iframe carrega a pagina externa; nenhum arquivo local e gerado. A CLI gera um visualizador **Codigo fonte** (estilo GitHub) por versao.
- **Video (`routes-video`)**: usa `video.pathVideo` e `video.videoType` (youtube, vimeo, mp4, etc.).

## Variaveis de ambiente

- `GITPAGEDOCS_REPOSITORY_SEARCH`: ativa/desativa busca remota localmente
- `GITHUB_ACTIONS`: ativa comportamento especifico de GitHub Pages

> Versao: 1.0.0
