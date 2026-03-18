# Configuration

Runtime configuration lives in `gitpagedocs/config.json`.

## `site` section

Important keys:

- `name`
- `defaultLanguage`
- `supportedLanguages`
- `docsVersion`
- `rendering`
- `ThemeDefault`
- `ThemeModeDefault`
- `ProjectLink`

## Layout source keys

- `layoutsConfigPathOficial`
- `layoutsConfigPathOficialUrl`
- `layoutsConfigPathTemplatesOficial`
- `layoutsConfigPath`
- `layoutsConfigPathTemplates`

Behavior:

- If `layoutsConfigPathOficial=true`, runtime prefers official layout/template sources.
- If `layoutsConfigPathOficial=false`, runtime prefers repository-local/custom layout sources.

## `VersionControl` section

`VersionControl.versions` defines:

- `id`
- `path`
- optional metadata links (`ProjectLink`, `branch`, `release`, `commit`)

## Navigation

- `routes`: markdown paths per language (legacy)
- `menus-header`: hierarchical menu model
- `translations`: UI labels

## Content types (version config)

Version configs support multiple content types:

- `routes-md`: Markdown routes with optional `title`, `description` (centered via `titlePosition`, `descriptionPosition`)
- `routes-html`: HTML page paths per language
- `routes-video`: Video config with `video.videoType` (youtube, vimeo, mp4, etc.) and `video.pathVideo`
- `routes-audio`: Audio config with `audio.audioType` (youtube, mp3, etc.) and `audio.pathAudio`
- `menus-header-md`, `menus-header-html`, `menus-header-video`, `menus-header-audio`: menus per type
- `hierarchyPage`: container order on page `{ md: 0, html: 1, video: 2, audio: 3 }`
- `hierarchyMenu`: menu section order `{ md: 0, html: 1, video: 2, audio: 3 }`

Each route can include `title`, `description` (per language), `titleCss`, `titlePosition: "center"`, `descriptionPosition: "center"`, `titleIsVisible`, `descriptionIsVisible`.

## Route-level variables (blockLink, container, url, browseAll)

Per-route options for `routes-md`, `routes-html`, `routes-video`, and `routes-audio`:

- **`blockLink`** (default: true) – For HTML: if true, links open in a new tab (`target="_blank"`); if false, links open in the same context.
- **`container`** – `"full"` = auto-extend height; number (e.g. `500`) = fixed height in px with overflow auto. Applies to md, html, video, and audio containers.
- **`url`** – For `routes-html` only: `Record<LanguageCode, string>` with external URLs. When set, the iframe uses `src={url}` instead of local HTML via `srcDoc`. Routes with `url` do not generate local HTML files.
- **`browseAll`** (default: false) – If true, the container shows Previous/Next buttons to browse all items of that type without changing the page.

## Content types: path vs url (HTML)

- **Markdown (`routes-md`)**: always uses `path` pointing to local `.md` files.
- **HTML (`routes-html`)**: uses `path` for local HTML files (no `.html` extension in config, e.g. `source-viewer`) or `url` for external URLs. When `url` is set, the iframe loads the external page; no local file is generated. The CLI generates a **Source code** viewer (GitHub-style) per version.
- **Video (`routes-video`)**: uses `video.pathVideo` and `video.videoType` (youtube, vimeo, mp4, etc.).
- **Audio (`routes-audio`)**: uses `audio.pathAudio` and `audio.audioType` (youtube, mp3, etc.). No autoplay by default.

## Environment variables

- `GITPAGEDOCS_REPOSITORY_SEARCH`: enable/disable remote repository search in local runtime
- `GITHUB_ACTIONS`: enables GitHub Pages specific runtime behavior

> Version: 1.0.0
