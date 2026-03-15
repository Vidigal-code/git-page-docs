# Deployment

Git Page Docs supports two usage models:

1. Use the official viewer site
2. Self-host your own GitHub Pages runtime

## Official viewer site

Use:

- `https://vidigal-code.github.io/git-page-docs/`

Provide owner + repository to load docs from repositories that contain `gitpagedocs/`.

## Self-hosted GitHub Pages

1. Generate docs:
   - `npx gitpagedocs`
   - or `npx gitpagedocs --layoutconfig` for local templates
2. Set `site.rendering` in `gitpagedocs/config.json`:
   - `https://<your-user>.github.io/<your-repo>/`
3. Build and validate:
   - `npm run lint`
   - `npm run build`
4. Deploy with GitHub Pages workflow.

When `GITHUB_ACTIONS=true`, runtime applies GitHub Pages behavior.

## npm publish flows

Recommended: GitHub Release + CI publish.

Manual fallback:

1. `npm whoami`
2. `npm run lint`
3. `npm run build`
4. `npm pack --ignore-scripts`
5. `npm version patch`
6. `npm publish --access public`

> Version: 1.0.0
