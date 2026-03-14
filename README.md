# Git Page Docs

Projeto base em `Next.js` para renderizar markdown multi-idioma com temas/layouts configuraveis.

## Iniciar

```bash
npm install
npm run gitpagedocs
npm run dev
```

## CLI

`npm run gitpagedocs` cria/atualiza:

- `gitpagedocs/config.json`
- `gitpagedocs/docs/en/index.md`, `gitpagedocs/docs/pt/index.md`, `gitpagedocs/docs/es/index.md`
- `public/layouts/layoutsConfig.json`
- `public/layouts/templates/*.json`

## Regras de renderizacao

- `RendertoanyRepositoryviaSearch: true`:
  - URL com `/{owner}/{repo}` tenta renderizar `owner/repo` remotamente.
  - Exemplo: `https://vidigal-code.github.io/git-page-docs/Vidigal-code/markdown-editor-pro`
- `RendertoanyRepositoryviaSearch: false`:
  - Ignora `/{owner}/{repo}` e renderiza o markdown local do proprio repositorio.

## Temas

- `HideThemeSelector: false` mostra o seletor de layouts.
- `HideThemeSelector: true` fixa o layout em `ThemeDefault`.
- Se o layout ativo suporta dark/light, aparece o botao para alternar modo.
- Se nao suporta, o botao de modo fica oculto.
