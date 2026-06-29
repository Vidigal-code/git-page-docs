function sanitizeDocsPath(docsPath) {
  if (!docsPath || typeof docsPath !== "string") return "";
  const segment = docsPath.replace(/^\/+|\/+$/g, "").trim();
  return /^[A-Za-z0-9._-]+$/.test(segment) ? segment : "";
}

export async function ensureGitHubPagesWorkflow(getCurrentGitBranch, writeText, docsPath = "") {
  const pathSegment = sanitizeDocsPath(docsPath);
  const buildStepsBlock =
    pathSegment
      ? `      - name: Build static site with target repository path
        run: pnpm exec next build frontend && mv frontend/out out
        working-directory: .gitpagedocs-runtime
        env:
          GITPAGEDOCS_PATH: "${pathSegment}"

      - name: Relocate output to custom docs path
        run: |
          mkdir -p .gitpagedocs-runtime/out_new/${pathSegment}
          mv .gitpagedocs-runtime/out/* .gitpagedocs-runtime/out_new/${pathSegment}/
          rm -rf .gitpagedocs-runtime/out
          mv .gitpagedocs-runtime/out_new .gitpagedocs-runtime/out`
      : `      - name: Build static site with target repository path
        run: pnpm exec next build frontend && mv frontend/out out
        working-directory: .gitpagedocs-runtime`;
  const currentBranch = getCurrentGitBranch();
  const workflowPath = ".github/workflows/gitpagedocs-pages.yml";
  const workflowContent = `name: Deploy GitPageDocs

on:
  push:
    branches: ["${currentBranch}"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      GITHUB_ACTIONS: "true"
      GITHUB_REPOSITORY: \${{ github.repository }}
      GITPAGEDOCS_REPOSITORY_SEARCH: "true"
    steps:
      - name: Checkout target repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Prepare runtime source
        run: |
          git clone --depth 1 https://github.com/Vidigal-code/git-page-docs.git .gitpagedocs-runtime
          cp .gitpagedocs-runtime/gitpagedocs/icon.svg /tmp/default-icon.svg 2>/dev/null || true
          if [ -d gitpagedocs ]; then
            rm -rf .gitpagedocs-runtime/gitpagedocs
            cp -R gitpagedocs .gitpagedocs-runtime/gitpagedocs
          fi
          mkdir -p .gitpagedocs-runtime/public
          if [ -f icon.svg ]; then
            cp icon.svg .gitpagedocs-runtime/public/icon.svg
          elif [ -f gitpagedocs/icon.svg ]; then
            cp gitpagedocs/icon.svg .gitpagedocs-runtime/public/icon.svg
          elif [ -f /tmp/default-icon.svg ]; then
            cp /tmp/default-icon.svg .gitpagedocs-runtime/public/icon.svg
          fi

      - name: Install runtime dependencies
        run: pnpm install --frozen-lockfile
        working-directory: .gitpagedocs-runtime

${buildStepsBlock}

      - name: Add .nojekyll
        run: touch .gitpagedocs-runtime/out/.nojekyll 2>/dev/null || mkdir -p .gitpagedocs-runtime/out && touch .gitpagedocs-runtime/out/.nojekyll

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./.gitpagedocs-runtime/out

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
  await writeText(workflowPath, workflowContent);
}
