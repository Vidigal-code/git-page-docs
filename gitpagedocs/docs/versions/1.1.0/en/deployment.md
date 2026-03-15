# Deployment

Git Page Docs runs as a Next.js app with two major targets: local server and GitHub Pages.

## Local deployment

Use:

1. `npm run build`
2. `npm start`

This runs Node + Next.js runtime with the local `gitpagedocs/` folder.

## GitHub Pages deployment

In GitHub Actions builds:

- `GITHUB_ACTIONS=true`
- static export behavior is enabled by configuration
- repository search home is always enabled

## Publish flow

Package publish:

- bump version in `package.json`
- run `npm publish --access public`
- ensure npm auth is valid (`npm whoami`)

If publishing prebuilt artifacts on Windows is skipped, use CI for `build:prebuilt`.
