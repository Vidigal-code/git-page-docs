# Configuration

Runtime configuration lives in `gitpagedocs/config.json`.

## `site` section

Main keys:

- `name`: project title shown in UI
- `defaultLanguage`: default docs language
- `supportedLanguages`: available language list
- `HideThemeSelector`: hide/show theme selector
- `ThemeDefault`: initial theme id
- `ThemeModeDefault`: initial mode (`light` or `dark`)
- `ProjectLink`: repository URL used by header actions
- `docsVersion`: default selected docs version
- `ActiveNavigation`: enable previous/next behavior
- `FocusMode`: enable focus/reader mode
- `IconImageMenuHeader`: top-left icon path
- `layoutsConfigPath`: remote layouts config URL fallback
- `rendering`: canonical published runtime URL

## `VersionControl` section

`VersionControl.versions` defines:

- `id`: version identifier
- `path`: version config path
- optional links (`ProjectLink`, `branch`, `release`, `commit`)

## Navigation and routes

- `routes`: markdown paths per language
- `menus-header`: hierarchical menu model
- `translations`: UI labels for not-found and navigation

## Environment variables

- `GITPAGEDOCS_REPOSITORY_SEARCH`: toggles remote repository search in local runtime
- `GITHUB_ACTIONS`: when true, enables GitHub Pages specific behavior

> Version: 1.1.1
