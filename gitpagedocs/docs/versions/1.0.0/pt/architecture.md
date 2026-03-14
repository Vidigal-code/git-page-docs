# Arquitetura

Este projeto usa uma arquitetura modular para separar renderizacao, carregamento de temas e UI.

## Camadas principais

- `src/app`: rotas Next.js e shell da aplicacao.
- `src/entities/docs`: modelos e logica de carregamento.
- `src/widgets/docs-shell`: composicao de UI, menu e interacoes.

## Fluxo de renderizacao

1. Carrega `gitpagedocs/config.json`.
2. Resolve rotas por idioma.
3. Busca markdown (local ou remoto) e converte para HTML.
4. Carrega tokens de layout/tema.
5. Renderiza interface responsiva desktop/mobile.

## Comportamento em runtime

- Em local, prioriza `public/layouts`.
- Em producao, pode carregar config/layout/template de repositorio remoto.
- Se falhar, usa fallback em `gitpagedocs/layouts`.
