# Publicacao

Git Page Docs roda como app Next.js com dois alvos: servidor local e GitHub Pages.

## Publicacao local

Use:

1. `npm run build`
2. `npm start`

Isso sobe runtime Node + Next.js usando a pasta local `gitpagedocs/`.

## Publicacao em GitHub Pages

Em build de GitHub Actions:

- `GITHUB_ACTIONS=true`
- comportamento de export estatico e habilitado pela configuracao
- pagina inicial de busca de repositorio fica ativa

## Fluxo de publish do pacote

Para publicar no npm:

- atualize versao no `package.json`
- execute `npm publish --access public`
- valide autenticacao com `npm whoami`

Se `build:prebuilt` for pulado no Windows, use CI para gerar artefatos prebuilt.

> Versao: 1.1.0
