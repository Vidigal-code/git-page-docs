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
- `menus-header-md`, `menus-header-html`, `menus-header-video`: menus por tipo
- `hierarchyPage`: ordem dos containers na pagina `{ md: 0, html: 1, video: 2 }`
- `hierarchyMenu`: ordem das secoes do menu `{ md: 0, html: 1, video: 2 }`

Cada rota pode incluir `title`, `description` (por idioma), `titleCss`, `titlePosition: "center"`, `descriptionPosition: "center"`, `titleIsVisible`, `descriptionIsVisible`.

## Variaveis de ambiente

- `GITPAGEDOCS_REPOSITORY_SEARCH`: ativa/desativa busca remota localmente
- `GITHUB_ACTIONS`: ativa comportamento especifico de GitHub Pages

> Versao: 1.0.0
