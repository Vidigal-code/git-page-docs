# FAQ

## Why is my remote repository not rendering?

Check if:

- `RendertoanyRepositoryviaSearch` is `true`
- remote repository has `gitpagedocs/config.json`
- markdown paths in `routes` are valid

## Why did the theme selector disappear?

`HideThemeSelector` is likely `true` in `config.json`.

## Why does language reset?

Language is stored in localStorage; clear browser storage if you need a reset.

## Why am I seeing fallback themes only?

Remote or local primary layouts were not found. The app uses fallback themes:

- `aurora-dark`
- `aurora-light`
