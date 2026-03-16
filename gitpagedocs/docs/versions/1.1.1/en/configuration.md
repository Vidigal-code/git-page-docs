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
- `menus-header-md`, `menus-header-html`, `menus-header-video`: menus per type
- `hierarchyPage`: container order on page `{ md: 0, html: 1, video: 2 }`
- `hierarchyMenu`: menu section order `{ md: 0, html: 1, video: 2 }`

Each route can include `title`, `description` (per language), `titleCss`, `titlePosition: "center"`, `descriptionPosition: "center"`, `titleIsVisible`, `descriptionIsVisible`.

## Environment variables

- `GITPAGEDOCS_REPOSITORY_SEARCH`: enable/disable remote repository search in local runtime
- `GITHUB_ACTIONS`: enables GitHub Pages specific runtime behavior

> Version: 1.1.1
