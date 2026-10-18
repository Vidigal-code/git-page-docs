# Configuração

A configuração de runtime fica em `gitpagedocs/config.json`. Os textos da UI ficam ao lado, um arquivo por idioma.

## Idiomas (`site.languages` + `langs/`)

- `site.languages` em `gitpagedocs/config.json` liga (`true`) ou desliga (`false`) cada idioma, na ordem do menu: `{ "languages": { "en": true, "pt": true, "es": false } }`. Um idioma em `false` some do seletor de idiomas e seus textos não são carregados, mesmo que os docs existam.
- `gitpagedocs/langs/<lang>.json` guarda os textos daquele idioma: `langmenu` (cabeçalho, busca, visualizador de código, player de áudio, chat de IA e acesso aos docs) e `translations` (`notFound`, `navigation`, `footer`).
- Para adicionar um idioma, crie `langs/<lang>.json` e inclua `"<lang>": true` em `site.languages`.
- Arquivos `config.json` antigos que ainda trazem `site.langmenu` / `translations` inline continuam funcionando; quando os dois existem, os arquivos de `langs/` prevalecem e qualquer chave ausente é preenchida a partir da versão atual.

## Seção `site`

Principais chaves:

- `name`: título do projeto no UI
- `defaultLanguage`: idioma padrão
- `HideThemeSelector`: esconde/mostra seletor de tema
- `ThemeDefault`: id do tema inicial
- `ThemeModeDefault`: modo inicial (`light` ou `dark`)
- `ProjectLink`: URL de repositório para acoes no cabeçalho
- `docsVersion`: versão inicial selecionada
- `ActiveNavigation`: habilita a navegação rápida e o atalho Ctrl+K
- `FocusMode`: habilita modo foco/leitura
- `icons`: ícones do cabeçalho. `icons.defaults` guarda o que todos compartilham (`reactIcon`, `colorDark`, `colorLight`, `size`, `imgDark`, `imgLight`, `imgWidth`, `imgHeight`) e cada ícone define seu `tag` e o que muda (`null` remove um campo). As chaves planas abaixo continuam valendo e vencem quando as duas formas existem.
- `IconImageMenuHeaderImgWidth`, `IconImageMenuHeaderImgHeight`: tamanho do ícone principal
- `IconImageMenuHeaderLightImg`, `IconImageMenuHeaderDarkImg`: ícone principal (light/dark)
- `IconProjectLinkImgWidth`, `IconProjectLinkImgHeight`: tamanho do ícone link do projeto
- `IconProjectLinkLightImg`, `IconProjectLinkDarkImg`: ícone link do projeto
- `IconVersionLinksImgWidth`, `IconVersionLinksImgHeight`: tamanho do ícone links de versão
- `IconVersionLinksLightImg`, `IconVersionLinksDarkImg`: ícone links de versão
- `IconInfoHeaderMenuImgWidth`, `IconInfoHeaderMenuImgHeight`: tamanho do ícone info
- `IconInfoHeaderMenuLightImg`, `IconInfoHeaderMenuDarkImg`: ícone info
- `IconPreviewProjectLinkImgWidth`, `IconPreviewProjectLinkImgHeight`: tamanho do ícone preview
- `IconPreviewProjectLinkLightImg`, `IconPreviewProjectLinkDarkImg`: ícone preview
- `layoutsConfigPath`: fallback remoto para layouts
- `rendering`: URL canonica publicada

## Posição da navegação de documentos

Configure o grupo de botões do rodapé em `gitpagedocs/config.json`:

```json
{ "site": { "documentNavigation": { "position": "center" } } }
```

`position` aceita `left`, `center` ou `right`; o padrão é `center` (centro). Valores ausentes ou inválidos usam esse padrão. Anterior, Próximo e Voltar ao topo permanecem juntos nessa ordem, com o mesmo alinhamento no desktop e no celular. Essa opção posiciona o grupo; `site.backToTop` continua determinando quando a seta aparece. Ela não reposiciona a seta do guia de introdução.

## Voltar ao topo em páginas longas

A seta de voltar ao topo nas páginas de documentação e em `/introduction-guide` é controlada por `site.backToTop` em `gitpagedocs/config.json`:

```json
{ "site": { "backToTop": { "enabled": true, "minPageHeightViewports": 3 } } }
```

Por padrão, a seta fica habilitada somente em uma página com rolagem cuja altura total seja pelo menos três vezes a altura da área visível do navegador. Use `enabled: false` para ocultá-la. `minPageHeightViewports` aceita um número finito maior que `1`; valores ausentes ou inválidos usam `3`. Por exemplo, `4` exige uma página com pelo menos quatro alturas da área visível. O limiar mede a altura total da página, não a distância já percorrida. A mesma configuração controla as páginas de documentação e o guia de introdução.

## Controles de idioma, tema, foco, navegação rápida, PDF e documentos

Em `gitpagedocs/config.json`, estas entradas de `site.icons` configuram idioma, tema, versão, foco, navegação Ctrl+K, ações PDF e navegação no rodapé dos documentos. Os nove controles usam React Icons por padrão:

```json
{
  "site": {
    "icons": {
      "LanguageSelector": {
        "reactIcon": true, "tag": "SiGoogletranslate", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "ThemeSelector": {
        "reactIcon": true, "tag": "LuPencil", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "FocusMode": {
        "reactIcon": true, "tag": "LuBookOpen", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "VersionSelector": {
        "reactIcon": true, "tag": "LuGitBranch", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "QuickNavigation": {
        "reactIcon": true, "tag": "LuSearch", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "PdfDownload": {
        "reactIcon": true, "tag": "LuDownload", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "PdfOpenInNewTab": {
        "reactIcon": true, "tag": "LuExternalLink", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "DocumentPrevious": {
        "reactIcon": true, "tag": "LuChevronLeft", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "DocumentNext": {
        "reactIcon": true, "tag": "LuChevronRight", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      }
    }
  }
}
```

Cada controle é independente: `reactIcon: true` mostra o ícone (padrão); `false` exibe texto. Personalize `tag`, `size`, `colorDark` e `colorLight` por controle; `currentColor` acompanha o tema ativo. Controles com ícone mantêm seus nomes acessíveis, e seletores mantêm os menus. O atalho Ctrl+K continua disponível. `site.FocusMode` ainda habilita o modo foco; `site.icons.FocusMode` só altera a aparência do botão. `site.icons.PdfDownload` e `site.icons.PdfOpenInNewTab` selecionam texto ou ícone de forma independente; as opções correspondentes em `site.pdf` e no `pdf` da rota controlam a disponibilidade de cada ação.

Configs compactos podem mover valores comuns para `site.icons.defaults`; campos omitidos herdam esses defaults. Defina `reactIcon: false` em uma entrada específica para substituir o ícone padrão por texto.

## Seção `VersionControl`

`site.icons.VersionSelector` usa `LuGitBranch` por padrão. Defina `reactIcon: false` para mostrar o texto da versão selecionada; `true` mostra o ícone. Personalize os mesmos campos `tag`, `size`, `colorDark` e `colorLight`. O seletor aparece somente quando há mais de uma versão de documentação, preserva o nome acessível localizado do seletor e mostra a versão selecionada no tooltip.

`VersionControl.versions` define:

- `id`: identificador da versão
- `path`: caminho do config da versão
- links opcionais (`ProjectLink`, `branch`, `release`, `commit`)
- metadados opcionais do source viewer (`source-viewer`, `source-viewer-path`)

## Navegação e rotas

- `routes`: caminhos markdown por idioma (legado)
- `menus-header`: menu hierarquico
- `translations`: labels de UI para not-found e navegação

## Autorização (config de versão)

- `auth`: configurações globais de autorização para a versão
- `auth.accessKeys`: mapa de chaves usado por `authorization.accessKeyId`
- `auth.rolesStorageKey`: chave de localStorage para bootstrap de papeis
- `auth.providers`: adaptadores de provedor (`authjs`, `clerk`, `firebase`, `jwt`)

## Tipos de conteúdo (config de versão)

Configs de versão suportam múltiplos tipos:

- `routes-md`: Rotas markdown com `title`, `description` (centralizados via `titlePosition`, `descriptionPosition`)
- `routes-source-viewer`: Containers de código fonte com `source-viewer: true` e `source-viewer-path`
- `routes-html`: Caminhos de páginas HTML por idioma
- `routes-video`: Config de vídeo com `video.videoType` (youtube, vimeo, mp4, etc.) e `video.pathVideo`
- `routes-audio`: Config de áudio com `audio.audioType` (youtube, mp3, etc.) e `audio.pathAudio`
- `routes-pdf`: PDF com `pdf.pathPdf` por idioma; consulte Documentos PDF.
- `authorization` (md/html/vídeo): guarda de acesso por chave, papeis e autenticação externa
- `menus-header-md`, `menus-header-source-viewer`, `menus-header-html`, `menus-header-video`, `menus-header-audio`, `menus-header-pdf`: menus por tipo
- `hierarchyPage`: ordem dos containers na página `{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4, pdf: 5 }`
- `hierarchyMenu`: ordem das seções do menu `{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4, pdf: 5 }`

Cada rota pode incluir `title`, `description` (por idioma), `titleCss`, `titlePosition: "center"`, `descriptionPosition: "center"`, `titleIsVisible`, `descriptionIsVisible`.

Configurações que todas as rotas compartilham ficam uma única vez em `routeDefaults`, no topo do config da versão; cada rota guarda só os próprios valores, e um valor escrito na rota vence o `routeDefaults`.

## Variáveis por rota (blockLink, container, url, browseAll)

Opções por rota em `routes-md`, `routes-html` e `routes-video`:

- **`blockLink`** (padrão: true) – Para HTML: se true, links abrem em nova aba (`target="_blank"`); se false, no próprio contexto.
- **`container`** – `"full"` = altura automática; numero (ex: `500`) = altura fixa em px com overflow auto. Aplica-se a md, html e vídeo.
- **`url`** – Apenas em `routes-html`: `Record<LanguageCode, string>` com URLs externas. Quando definido, o iframe usa `src={url}` em vez de HTML local via `srcDoc`. Rotas com `url` não geram arquivos HTML locais.
- **`browseAll`** (padrão: false) – Se true, o container mostra botões Anterior/Próximo para navegar entre todos os itens daquele tipo.

## Tipos de conteúdo: path vs url (HTML)

- **Markdown (`routes-md`)**: usa `path` apontando para arquivos `.md` locais.
- **HTML (`routes-html`)**: usa `path` para arquivos HTML locais (sem extensão .html no config) ou `url` para URLs externas. Com `url`, o iframe carrega a página externa; nenhum arquivo local é gerado.
- **Vídeo (`routes-video`)**: usa `video.pathVideo` e `video.videoType` (youtube, vimeo, mp4, etc.).

## Variáveis de ambiente

- `GITPAGEDOCS_REPOSITORY_SEARCH`: ativa/desativa busca remota localmente
- `GITHUB_ACTIONS`: ativa comportamento específico de GitHub Pages

## Comportamento do site e padrões

| Chave | Padrão / finalidade |
| --- | --- |
| `ActiveNavigation` | true; navegação rápida e atalho Ctrl+K |
| `FocusMode / focusMode` | Habilitação geral (true) e controles independentes de cópia, download, seção e documento; consulte Modo foco |
| `pdf` | Habilitação geral, prévia, download e nova aba; todos true |
| `containerPagination` | Ativo; abaixo/à direita, quatro ícones e contador; consulte Containers paginados |
| `markdownMarkers` | Ativo; cores do tema para alvos realçados e links no índice; consulte Marcadores de Markdown |
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

> Versão: 0.0.9
