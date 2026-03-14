# Deployment

This project is ready to deploy as a Next.js application.

## Production build

1. Run: `npm run build`
2. Start server: `npm start` or `pnpm start`

## Repository rendering mode

- If `RendertoanyRepositoryviaSearch` is `true`, URLs like `/owner/repo` can render markdown from remote repositories.
- If `false`, the app always renders local markdown from this repository.

## Recommended checks

- Validate all markdown paths in `routes`
- Confirm themes exist in `public/layouts/templates`
- Ensure `layoutsConfigPath` is valid if remote fallback is required
