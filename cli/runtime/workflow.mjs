function sanitizeDocsPath(docsPath) {
  if (!docsPath || typeof docsPath !== "string") return "";
  const segment = docsPath.replace(/^\/+|\/+$/g, "").trim();
  return /^[A-Za-z0-9._-]+$/.test(segment) ? segment : "";
}

export async function ensureGitHubPagesWorkflow(getCurrentGitBranch, writeText, docsPath = "") {
  const pathSegment = sanitizeDocsPath(docsPath);
  const buildEnvBlock =
    pathSegment
      ? `        env:
          GITHUB_ACTIONS: "true"
          GITHUB_REPOSITORY: \${{ github.repository }}
          GITPAGEDOCS_BASE_PATH: "/${pathSegment}"`
      : `        env:
          GITHUB_ACTIONS: "true"
          GITHUB_REPOSITORY: \${{ github.repository }}`;
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
    steps:
      - name: Checkout target repository
        uses: actions/checkout@v4

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
        run: npm ci
        working-directory: .gitpagedocs-runtime

      - name: Build static site with target repository path
        run: npx next build
        working-directory: .gitpagedocs-runtime
${buildEnvBlock}

      - name: Force root URL to docs entrypoint
        env:
          GITHUB_REPOSITORY: \${{ github.repository }}
        run: |
          node <<'NODE'
          const fs = require('fs');
          const path = require('path');
          const pathSegment = ${JSON.stringify(pathSegment)};
          const repoName = (process.env.GITHUB_REPOSITORY || '').split('/')[1] || '';
          const effectiveBase = pathSegment || repoName;
          const cfgPath = path.join('.gitpagedocs-runtime', 'gitpagedocs', 'config.json');
          if (!fs.existsSync(cfgPath)) process.exit(0);
          const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
          const defaultVersion = cfg?.site?.docsVersion || cfg?.VersionControl?.versions?.[0]?.id || '1.1.0';
          const defaultLang = cfg?.site?.defaultLanguage || 'en';
          const redirectTargetRoot = effectiveBase
            ? './' + effectiveBase + '/v/' + defaultVersion + '/?lang=' + defaultLang
            : './v/' + defaultVersion + '/?lang=' + defaultLang;
          const redirectTargetProject = './v/' + defaultVersion + '/?lang=' + defaultLang;
          const rootHtml = '<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=' + redirectTargetRoot + '"/><script>window.location.replace("' + redirectTargetRoot + '" + (window.location.search || ""));</script></head><body>Redirecting...</body></html>';
          fs.writeFileSync(path.join('.gitpagedocs-runtime', 'out', 'index.html'), rootHtml);
          if (pathSegment) {
            const projectIndexPath = path.join('.gitpagedocs-runtime', 'out', pathSegment, 'index.html');
            if (fs.existsSync(path.dirname(projectIndexPath))) {
              const projectHtml = '<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=' + redirectTargetProject + '"/><script>window.location.replace("' + redirectTargetProject + '" + (window.location.search || ""));</script></head><body>Redirecting...</body></html>';
              fs.writeFileSync(projectIndexPath, projectHtml);
            }
          }
          NODE

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
