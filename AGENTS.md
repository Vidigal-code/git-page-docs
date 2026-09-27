# git-page-docs: guia para agentes

As regras gerais de engenharia (SOLID, Clean Code, skills e SonarQube) ficam no `AGENTS.md` global; este arquivo cobre só o que é específico deste repositório.

## Stack

pnpm + turborepo: `frontend/` (Next.js App Router, export estático, Feature-Sliced Design), `cli/` (`@gitpagedocs/cli`), `tools/` (`@gitpagedocs/tools`, núcleo compartilhado), `mcp/` (`@gitpagedocs/mcp`). Scripts em `package.json`; arquitetura em `README.md` e `frontend/README.md`.

## Fluxo de mudança

1. **TDD**: o primeiro teste (red) nasce em `D:/Prompts/tdd/files` (harness Vitest com junction `node_modules` para o repo); quando fica verde, o cenário vai para o arquivo de teste do repositório e a pasta de rascunho é esvaziada.
2. **Validação**: `pnpm run typecheck`, `pnpm run lint`, `pnpm exec vitest run`, `pnpm run smoke:all` (inclui `baseline:check`), `pnpm run build` e `PORT=3100 pnpm run test:e2e` (a porta 3000 pertence ao Docker Desktop; nunca encerre esse processo).
3. **SonarQube**: `projectKey` `git-page-docs`, arquivo por arquivo, conforme o `AGENTS.md` global.
4. **Relatório**: resumo em português em `D:/Prompts/tdd/report/<data>-<tema>.md`.

## Artefatos gerados

- Textos de UI (`langmenu`) e configuração padrão vivem em `cli/data/`; depois de alterá-los rode `node cli/index.mjs`, copie `gitpagedocs/` para `tools/gitpagedocs/` e rode `pnpm run baseline:create`.
- Páginas `.md` de `gitpagedocs/docs/versions/<versão>/` são geradas de `cli/content/docs-{en,pt,es}.mjs`: edite os templates.
- Regiões gerenciadas de README, CONTRIBUTING e SECURITY vêm de `tools/src/documentation/sections.ts` via `node cli/index.mjs docs`.
- Layouts: a fonte é `gitpagelayouts/v2/` (`base.json` + `layouts/<id>.json`); `pnpm run layouts:sync` gera `templates/` e a documentação.

## Compatibilidade

A versão oficial começa em `0.0.1`: configurações e dados a partir dela continuam funcionando; formatos anteriores (1.1.x) não têm suporte.
