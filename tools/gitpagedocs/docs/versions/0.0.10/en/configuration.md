# Configuration

Runtime configuration lives in `gitpagedocs/config.json`. UI text lives next to it, one file per language.

## Languages (`site.languages` + `langs/`)

- `site.languages` in `gitpagedocs/config.json` switches each language on (`true`) or off (`false`), in menu order: `{ "languages": { "en": true, "pt": true, "es": false } }`. A language set to `false` disappears from the language selector and its strings are not loaded, even when its docs exist.
- `gitpagedocs/langs/<lang>.json` holds that language's strings: `langmenu` (header, search, source viewer, audio player, AI chat and docs-access labels) and `translations` (`notFound`, `navigation`, `footer`).
- To add a language, create `langs/<lang>.json` and add `"<lang>": true` to `site.languages`.
- Older `config.json` files that still inline `site.langmenu` / `translations` keep working; when both exist, the `langs/` files win and any missing key is backfilled from the current release.

## `site` section

Important keys:

- `name`
- `defaultLanguage`
- `docsVersion`
- `rendering`
- `ThemeDefault`
- `ThemeModeDefault`
- `ProjectLink`

## Back to top on long pages

The back-to-top arrow on documentation pages and `/introduction-guide` is controlled by `site.backToTop` in `gitpagedocs/config.json`:

```json
{ "site": { "backToTop": { "enabled": true, "minPageHeightViewports": 3 } } }
```

The default enables the arrow only on a scrollable page whose total height is at least three viewport heights. Set `enabled: false` to hide it. `minPageHeightViewports` accepts a finite number greater than `1`; omitted or invalid values use `3`. For example, `4` requires a page at least four viewport heights tall. The threshold measures total page height, not distance already scrolled. The same setting controls documentation pages and the introduction guide.

## Layout source keys

- `layoutsConfigPathOficial`
- `layoutsConfigPathOficialUrl`
- `layoutsConfigPathTemplatesOficial`
- `layoutsConfigPath`
- `layoutsConfigPathTemplates`

Behavior:

- If `layoutsConfigPathOficial=true`, runtime prefers official layout/template sources.
- If `layoutsConfigPathOficial=false`, runtime prefers repository-local/custom layout sources.

## Language, theme, focus, quick navigation, PDF and document controls

In `gitpagedocs/config.json`, these `site.icons` entries configure the language selector, theme selector, focus, Ctrl+K navigation, PDF actions and document-footer navigation. All nine controls use React Icons by default:

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
      "VersionSelector": {
        "reactIcon": true, "tag": "LuGitBranch", "size": "22px",
        "colorDark": "currentColor", "colorLight": "currentColor"
      },
      "FocusMode": {
        "reactIcon": true, "tag": "LuBookOpen", "size": "22px",
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

Each control is independent: `reactIcon: true` shows its icon (the default); `false` displays text. Customize `tag`, `size`, `colorDark` and `colorLight` per control; `currentColor` follows the active theme. Icon controls keep their accessible names, and selectors keep their menus. The Ctrl+K shortcut remains available. `site.FocusMode` still enables focus mode; `site.icons.FocusMode` only changes the button's appearance. `site.icons.PdfDownload` and `site.icons.PdfOpenInNewTab` independently select text or icons; the corresponding `site.pdf` and route `pdf` flags control whether each action is available.

Compact configs may move shared values into `site.icons.defaults`; omitted fields inherit those defaults. Set `reactIcon: false` on a specific entry to override the default icon presentation with text.

## `VersionControl` section

`site.icons.VersionSelector` uses `LuGitBranch` by default. Set `reactIcon: false` to display the selected version as text; `true` displays its icon. Customize the same `tag`, `size`, `colorDark` and `colorLight` fields. The selector appears only when more than one documentation version is available, retains the localized accessible name of the selector and shows the selected version in its tooltip.

`VersionControl.versions` defines:

- `id`
- `path`
- optional metadata links (`ProjectLink`, `branch`, `release`, `commit`)
- optional source viewer metadata (`source-viewer`, `source-viewer-path`)

## Navigation

- `routes`: markdown paths per language (legacy)
- `menus-header`: hierarchical menu model
- `translations`: UI labels

## Authorization (version config)

- `auth`: global authorization runtime settings for that version
- `auth.accessKeys`: key map used by `authorization.accessKeyId`
- `auth.rolesStorageKey`: localStorage key for role bootstrap
- `auth.providers`: provider adapters (`authjs`, `clerk`, `firebase`, `jwt`)

## Content types (version config)

Version configs support multiple content types:

- `routes-md`: Markdown routes with optional `title`, `description` (centered via `titlePosition`, `descriptionPosition`)
- `routes-source-viewer`: Source viewer containers with `source-viewer: true` and `source-viewer-path`
- `routes-html`: HTML page paths per language
- `routes-video`: Video config with `video.videoType` (youtube, vimeo, mp4, etc.) and `video.pathVideo`
- `routes-audio`: Audio config with `audio.audioType` (youtube, mp3, etc.) and `audio.pathAudio`
- `routes-pdf`: PDF config with `pdf.pathPdf` per language; see PDF documents.
- `authorization` (md/html/video): route guard by access key, roles, and external auth
- `menus-header-md`, `menus-header-source-viewer`, `menus-header-html`, `menus-header-video`, `menus-header-audio`, `menus-header-pdf`: menus per type
- `hierarchyPage`: container order on page `{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4, pdf: 5 }`
- `hierarchyMenu`: menu section order `{ md: 0, "source-viewer": 1, html: 2, video: 3, audio: 4, pdf: 5 }`

Each route can include `title`, `description` (per language), `titleCss`, `titlePosition: "center"`, `descriptionPosition: "center"`, `titleIsVisible`, `descriptionIsVisible`.

Settings every route shares are written once in `routeDefaults` at the top of the version config; each route keeps only its own values, and a value written on a route wins over `routeDefaults`.

Header icons live in `site.icons`: `defaults` holds what all icons share (`reactIcon`, `colorDark`, `colorLight`, `size`, `imgDark`, `imgLight`, `imgWidth`, `imgHeight`) and each icon entry sets its `tag` plus any difference (`null` removes a field). The older flat keys (`IconNavMenuOpenReactIconesTag`, …) still work and win when both are present.

## Route-level variables (blockLink, container, url, browseAll)

Per-route options for `routes-md`, `routes-html`, `routes-video`, and `routes-audio`:

- **`blockLink`** (default: true) – For HTML: if true, links open in a new tab (`target="_blank"`); if false, links open in the same context.
- **`container`** – `"full"` = auto-extend height; number (e.g. `500`) = fixed height in px with overflow auto. Applies to md, html, video, and audio containers.
- **`url`** – For `routes-html` only: `Record<LanguageCode, string>` with external URLs. When set, the iframe uses `src={url}` instead of local HTML via `srcDoc`. Routes with `url` do not generate local HTML files.
- **`browseAll`** (default: false) – If true, the container shows Previous/Next buttons to browse all items of that type without changing the page.

## Content types: path vs url (HTML)

- **Markdown (`routes-md`)**: always uses `path` pointing to local `.md` files.
- **HTML (`routes-html`)**: uses `path` for local HTML files (no `.html` extension in config) or `url` for external URLs. When `url` is set, the iframe loads the external page; no local file is generated.
- **Video (`routes-video`)**: uses `video.pathVideo` and `video.videoType` (youtube, vimeo, mp4, etc.).
- **Audio (`routes-audio`)**: uses `audio.pathAudio` and `audio.audioType` (youtube, mp3, etc.). No autoplay by default.

## Environment variables

- `GITPAGEDOCS_REPOSITORY_SEARCH`: enable/disable remote repository search in local runtime
- `GITHUB_ACTIONS`: enables GitHub Pages specific runtime behavior

## Site behavior and defaults

| Key | Default / purpose |
| --- | --- |
| `ActiveNavigation` | true; quick-navigation control and Ctrl+K shortcut |
| `FocusMode / focusMode` | Master switch (true) and independent copy, download, section and document controls; see Focus mode |
| `pdf` | PDF master switch, preview, download and new-tab defaults; all true |
| `nestedMenusEnabled` | true; recursive menu tree, or flat destinations when false |
| `RouteGuide` | true; breadcrumbs, overridable by version defaults and individual Markdown routes |
| `accessibility` | Enabled by default; narration settings are explained in Accessibility |
| `HideThemeSelector` | false; true hides the theme selector |
| `FooterEnabled` | true; show the footer |
| `FooterLinkName / FooterLinkUrl` | Footer link label and destination |
| `FooterDateMode / FooterDateCustom` | browser, year or custom; custom uses the configured text |
| `SiteHeaderName / SiteIconPath` | Header brand and site icon path |
| `audioPlayerEnabled` | true; background audio controls |
| `audioAutoPlayOnLoad` | false; autoplay remains subject to browser policy |
| `audioLoopEnabled / audioSequentialPlayback` | false; loop current track / advance native tracks |
| `audioAllowUserChoice` | Allow track selection when a playlist has multiple entries |
| `audioTracks` | Track objects: url, type and localized title |
| `audioPopoverHideSource / audioPopoverShowMinutes` | false / true; source label and native-track duration |
| `audioPopoverSourceCustomLabel` | Optional localized source label |
| `mediaExclusivePlayback` | true; only one audible source among narration, radio, audio and video |
| `AiChatEnabled / AiChatAutoLockSeconds` | true / 30; show the chat and lock after inactivity (0 disables the timer) |
| `docsAccess` | enabled and publicKey configure the documentation gate; public files remain public |
| `RouteguideBrandPositionDefault / RouteguideBrandContainerTopDefault` | center / false; heading-outline layout, distinct from breadcrumbs |
| `TocScrollMaxHeightDesktop / TocScrollMaxHeightMobile` | Heading-outline scroll limits; CSS lengths such as min(65vh, 400px) |

## Adding a version or document

Create a version directory and its config, then register it in `VersionControl.versions` with `id` and `path`. Add a `routes-md` entry with a unique page ID and localized paths; add matching menu destinations. Keep `routeDefaults` for values shared by all routes; explicit route fields win. See Navigation for recursive menus and `RouteGuide` overrides.

Display settings are public configuration. Never store provider credentials or private keys in site JSON. The examples in Authorized routes demonstrate client-side controls, not server-side protection of downloadable files.

The `QuickNavigation` entry controls the Ctrl+K button's icon/text appearance. The keyboard shortcut and search panel remain available.

> Version: 0.0.10
