# Git Page Docs

CLI that generates `out/` **identical to the GitHub Pages site** (Next.js static export). Same layout, themes, and behavior.

```bash
npm install gitpagedocs
npx gitpagedocs --serve
```

Opens the URL automatically (e.g. http://localhost:3000). Or generate only: `npx gitpagedocs` then `npx serve out`.

The package includes a pre-built Next.js static export (`basePath: ""`) so the output matches the production site exactly.
