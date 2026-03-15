# FAQ

## Why are remote repositories not opening locally?

Check:

- `GITPAGEDOCS_REPOSITORY_SEARCH=true` in `.env`
- target repo contains `gitpagedocs/config.json`
- target repo markdown paths match its routes config

## Why does a version path return wrong content?

Check:

- `VersionControl.versions[*].path` in `gitpagedocs/config.json`
- that version config has valid `routes` and `menus-header`
- markdown files exist for each language

## Why does theme selection not apply correctly?

Check:

- `layoutsConfig.json` references valid template files
- template ids are unique
- selected theme exists in loaded themes map

## Why can GitHub Pages behave differently from local?

Because GitHub Pages build mode enables repository-search home and static-export specific behavior.

> Version: 1.1.1
