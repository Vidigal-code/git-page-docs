# Publicacao

Este projeto esta pronto para deploy como aplicacao Next.js.

## Build de producao

1. Execute: `npm run build`
2. Inicie servidor: `npm start` ou `pnpm start`

## Modo de renderizacao por repositorio

- Se `RendertoanyRepositoryviaSearch` for `true`, URLs como `/owner/repo` podem renderizar markdown remoto.
- Se for `false`, a aplicacao sempre renderiza markdown local deste repositorio.

## Validacoes recomendadas

- Verifique todos os caminhos markdown em `routes`
- Confirme que os temas existem em `public/layouts/templates`
- Garanta que `layoutsConfigPath` esteja valido se fallback remoto for necessario
