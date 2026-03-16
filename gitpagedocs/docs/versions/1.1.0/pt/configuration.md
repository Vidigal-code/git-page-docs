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

- `routes`: caminhos markdown por idioma
- `menus-header`: menu hierarquico
- `translations`: labels de UI para not-found e navegacao

## Variaveis de ambiente

- `GITPAGEDOCS_REPOSITORY_SEARCH`: ativa/desativa busca remota localmente
- `GITHUB_ACTIONS`: ativa comportamento especifico de GitHub Pages

> Versao: 1.1.0
