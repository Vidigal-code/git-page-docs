# Configuracao

A configuracao de runtime fica em `gitpagedocs/config.json`. Os textos da UI ficam ao lado, um arquivo por idioma.

## Idiomas (`site.languages` + `langs/`)

- `site.languages` em `gitpagedocs/config.json` liga (`true`) ou desliga (`false`) cada idioma, na ordem do menu: `{ "languages": { "en": true, "pt": true, "es": false } }`. Um idioma em `false` some do seletor de idiomas e seus textos nao sao carregados, mesmo que os docs existam.
- `gitpagedocs/langs/<lang>.json` guarda os textos daquele idioma: `langmenu` (cabecalho, busca, visualizador de codigo, player de audio, chat de IA e acesso aos docs) e `translations` (`notFound`, `navigation`, `footer`).
- Para adicionar um idioma, crie `langs/<lang>.json` e inclua `"<lang>": true` em `site.languages`.
- Arquivos `config.json` antigos que ainda trazem `site.langmenu` / `translations` inline continuam funcionando; quando os dois existem, os arquivos de `langs/` prevalecem e qualquer chave ausente e preenchida a partir da versao atual.

## Secao `site`

Principais chaves:

- `name`: titulo do projeto no UI
- `defaultLanguage`: idioma padrao
- `HideThemeSelector`: esconde/mostra seletor de tema
- `ThemeDefault`: id do tema inicial
- `ThemeModeDefault`: modo inicial (`light` ou `dark`)
- `ProjectLink`: URL de repositorio para acoes no cabecalho
- `docsVersion`: versao inicial selecionada
- `ActiveNavigation`: habilita comportamento de anterior/proximo
- `FocusMode`: habilita modo foco/leitura
- `icons`: icones do cabecalho. `icons.defaults` guarda o que todos compartilham (`reactIcon`, `colorDark`, `colorLight`, `size`, `imgDark`, `imgLight`, `imgWidth`, `imgHeight`) e cada icone define seu `tag` e o que muda (`null` remove um campo). As chaves planas abaixo continuam valendo e vencem quando as duas formas existem.
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

## Controles de idioma, tema e foco

Em `gitpagedocs/config.json`, adicione estas entradas a `site.icons` para usar React Icons no seletor de idioma, no seletor de tema e no botao de foco:

```json
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
```

Cada controle e independente: `reactIcon: false` preserva a aparencia atual com texto (padrao); `true` mostra o icone. Personalize `tag`, `size`, `colorDark` e `colorLight` por controle; `currentColor` acompanha o tema ativo. Os seletores com icone mantem seus menus e nomes acessiveis. `site.FocusMode` continua controlando se o modo foco esta habilitado; `site.icons.FocusMode` altera apenas a aparencia do botao.

## Secao `VersionControl`

`VersionControl.versions` define:

- `id`: identificador da versao
- `path`: caminho do config da versao
- links opcionais (`ProjectLink`, `branch`, `release`, `commit`)
- metadados opcionais do source viewer (`source-viewer`, `source-viewer-path`)

## Navegacao e rotas

- `routes`: caminhos markdown por idioma (legado)
- `menus-header`: menu hierarquico
- `translations`: labels de UI para not-found e navegacao

## Autorizacao (config de versao)

- `auth`: configuracoes globais de autorizacao para a versao
- `auth.accessKeys`: mapa de chaves usado por `authorization.accessKeyId`
- `auth.rolesStorageKey`: chave de localStorage para bootstrap de papeis
- `auth.providers`: adaptadores de provedor (`authjs`, `clerk`, `firebase`, `jwt`)

## Tipos de conteudo (config de versao)

Configs de versao suportam multiplos tipos:

- `routes-md`: Rotas markdown com `title`, `description` (centralizados via `titlePosition`, `descriptionPosition`)
- `routes-source-viewer`: Containers de codigo fonte com `source-viewer: true` e `source-viewer-path`
- `routes-html`: Caminhos de paginas HTML por idioma
- `routes-video`: Config de video com `video.videoType` (youtube, vimeo, mp4, etc.) e `video.pathVideo`
- `routes-audio`: Config de audio com `audio.audioType` (youtube, mp3, etc.) e `audio.pathAudio`
- `routes-pdf`: PDF com `pdf.pathPdf` por idioma; consulte Documentos PDF.
- `authorization` (md/html/video): guarda de acesso por chave, papeis e autenticacao externa
- `menus-header-md`, `menus-header-source-viewer`, `menus-header-html`, `menus-header-video`, `menus-header-audio`, `menus-header-pdf`: menus por tipo
- `hierarchyPage`: ordem dos containers na pagina `{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4, pdf: 5 }`
- `hierarchyMenu`: ordem das secoes do menu `{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4, pdf: 5 }`

Cada rota pode incluir `title`, `description` (por idioma), `titleCss`, `titlePosition: "center"`, `descriptionPosition: "center"`, `titleIsVisible`, `descriptionIsVisible`.

Configuracoes que todas as rotas compartilham ficam uma unica vez em `routeDefaults`, no topo do config da versao; cada rota guarda so os proprios valores, e um valor escrito na rota vence o `routeDefaults`.

## Variaveis por rota (blockLink, container, url, browseAll)

Opcoes por rota em `routes-md`, `routes-html` e `routes-video`:

- **`blockLink`** (padrao: true) – Para HTML: se true, links abrem em nova aba (`target="_blank"`); se false, no proprio contexto.
- **`container`** – `"full"` = altura automatica; numero (ex: `500`) = altura fixa em px com overflow auto. Aplica-se a md, html e video.
- **`url`** – Apenas em `routes-html`: `Record<LanguageCode, string>` com URLs externas. Quando definido, o iframe usa `src={url}` em vez de HTML local via `srcDoc`. Rotas com `url` nao geram arquivos HTML locais.
- **`browseAll`** (padrao: false) – Se true, o container mostra botoes Anterior/Proximo para navegar entre todos os itens daquele tipo.

## Tipos de conteudo: path vs url (HTML)

- **Markdown (`routes-md`)**: usa `path` apontando para arquivos `.md` locais.
- **HTML (`routes-html`)**: usa `path` para arquivos HTML locais (sem extensao .html no config) ou `url` para URLs externas. Com `url`, o iframe carrega a pagina externa; nenhum arquivo local e gerado.
- **Video (`routes-video`)**: usa `video.pathVideo` e `video.videoType` (youtube, vimeo, mp4, etc.).

## Variaveis de ambiente

- `GITPAGEDOCS_REPOSITORY_SEARCH`: ativa/desativa busca remota localmente
- `GITHUB_ACTIONS`: ativa comportamento especifico de GitHub Pages

## Comportamento do site e padrões

| Chave | Padrão / finalidade |
| --- | --- |
| `ActiveNavigation` | true; controles comuns de anterior/próximo |
| `FocusMode / focusMode` | Habilitação geral (true) e controles independentes de cópia, download, seção e documento; consulte Modo foco |
| `pdf` | Habilitação geral, prévia, download e nova aba; todos true |
| `nestedMenusEnabled` | true; árvore recursiva, ou destinos em lista plana quando false |
| `RouteGuide` | true; breadcrumbs, com sobrescrita por padrão da versão e rota Markdown |
| `accessibility` | Habilitado por padrão; opções de narração na página Acessibilidade |
| `HideThemeSelector` | false; true oculta o seletor de tema |
| `FooterEnabled` | true; exibe o rodapé |
| `FooterLinkName / FooterLinkUrl` | Texto e destino do link do rodapé |
| `FooterDateMode / FooterDateCustom` | browser, year ou custom; custom usa o texto configurado |
| `SiteHeaderName / SiteIconPath` | Marca do cabeçalho e caminho do ícone do site |
| `audioPlayerEnabled` | true; controles de áudio de fundo |
| `audioAutoPlayOnLoad` | false; autoplay depende da política do navegador |
| `audioLoopEnabled / audioSequentialPlayback` | false; repetir faixa / avançar faixas nativas |
| `audioAllowUserChoice` | Permite escolher faixa quando a playlist tem várias entradas |
| `audioTracks` | Objetos com url, type e title por idioma |
| `audioPopoverHideSource / audioPopoverShowMinutes` | false / true; origem e duração de faixas nativas |
| `audioPopoverSourceCustomLabel` | Texto opcional da origem por idioma |
| `mediaExclusivePlayback` | true; um áudio entre narração, rádio, faixas e vídeo |
| `AiChatEnabled / AiChatAutoLockSeconds` | true / 30; exibe chat e bloqueia por inatividade (0 desativa temporizador) |
| `docsAccess` | enabled e publicKey configuram o bloqueio da documentação; arquivos públicos continuam públicos |
| `RouteguideBrandPositionDefault / RouteguideBrandContainerTopDefault` | center / false; posição do sumário de títulos, separado dos breadcrumbs |
| `TocScrollMaxHeightDesktop / TocScrollMaxHeightMobile` | Limites de rolagem do sumário; comprimentos CSS como min(65vh, 400px) |

## Adicionar versão ou documento

Crie a pasta da versão com seu config e registre-a em `VersionControl.versions` com `id` e `path`. Adicione uma entrada `routes-md` com ID único e caminhos por idioma; acrescente destinos correspondentes no menu. Use `routeDefaults` para valores compartilhados pelas rotas; campos explícitos da rota prevalecem. Consulte Navegação para submenus e sobrescritas de `RouteGuide`.

Opções visuais são configuração pública. Nunca coloque credenciais de provedor ou chaves privadas no JSON do site. Os exemplos de Rotas autorizadas demonstram controles no cliente, não proteção de arquivos para download no servidor.

A entrada `QuickNavigation` controla a aparência em ícone/texto do botão Ctrl+K. O atalho de teclado e o painel de busca permanecem disponíveis.

> Versao: 0.0.9
