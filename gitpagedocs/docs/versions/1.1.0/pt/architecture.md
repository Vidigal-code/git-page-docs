# Arquitetura

O projeto e organizado por fronteiras de feature e responsabilidades do runtime.

## Modulos principais

- `src/app/[[...repo]]/page.tsx`
  - parser de rota
  - generateStaticParams
  - selecao de shell (docs vs repository search)
- `src/entities/docs/api/load-docs-data.ts`
  - carga de config local/remota
  - resolucao de versao
  - pipeline de fetch + parse markdown
  - carga de layouts + temas
- `src/widgets/docs-shell/docs-shell.tsx`
  - renderizacao da UI
  - estado de idioma/versao/tema
  - sincronizacao de URL

## Fluxo de dados

1. A rota chega (`/owner/repo/v/x.y.z` ou equivalente local)
2. O config e resolvido (local ou remoto)
3. Config de versao sobrescreve rotas/menus base
4. Markdown e carregado e convertido para HTML
5. Template de layout e resolvido e aplicado em CSS vars
6. Shell renderiza conteudo e controles

## Pontos de resiliencia

- fallback de carga para layouts/templates
- carregamento de markdown por idioma com fallback de erro
- sincronizacao de linguagem/versao/tema via localStorage

> Versao: 1.1.0
