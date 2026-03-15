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

- `routes`: markdown paths per language
- `menus-header`: hierarchical menu model
- `translations`: UI labels

## Environment variables

- `GITPAGEDOCS_REPOSITORY_SEARCH`: enable/disable remote repository search in local runtime
- `GITHUB_ACTIONS`: enables GitHub Pages specific runtime behavior

> Version: 1.1.0
