# Contribuição e testes

Use o repositório de código-fonte para alterar o runtime, a CLI, as ferramentas compartilhadas ou o MCP. Um repositório que apenas consome o visualizador normalmente edita seu próprio conteúdo e configuração. Trabalhe em uma branch focada e descreva o comportamento visível ao usuário e sua validação.

## Altere o pacote responsável

`frontend/` contém o visualizador Next.js App Router e segue Feature-Sliced Design. Primitivos visuais compartilhados ficam em `shared`, dados e schemas de documentação em `entities`, recursos do usuário em `features` e a composição do leitor em `widgets`. Mantenha carregamento de arquivos e repositórios fora dos componentes de apresentação.

`cli/` é responsável pelo scaffold, comandos, defaults e templates autorais. `tools/` fornece lógica reutilizável de configuração, documentação e serviços. `mcp/` expõe essas capacidades pelo Model Context Protocol. Uma correção visual normalmente pertence ao frontend; um default do scaffold deve mudar na fonte da CLI e ser regenerado.

## Edite as fontes, não as cópias geradas

| Mudança | Fonte de verdade | Resultado gerado |
| --- | --- | --- |
| Opções do site e textos de idioma | `cli/data/` | Config raiz e `gitpagedocs/langs/` |
| Rotas e seções do menu | Builders da CLI, metadados, mapeamentos e `menu-sections.mjs` | Config da versão |
| Textos da documentação | `cli/content/docs-{en,pt,es}.mjs` e módulos importados | Markdown versionado |
| Regiões gerenciadas | `tools/src/documentation/sections.ts` | README, CONTRIBUTING e SECURITY |
| Definições de layouts | `gitpagelayouts/v2/` | Templates e documentação de layouts |

Após alterar CLI/conteúdo, execute `node cli/index.mjs`, copie `gitpagedocs/` para `tools/gitpagedocs/` sem excluir versões históricas e execute `pnpm run baseline:create`. Use `node cli/index.mjs docs` nas regiões gerenciadas e `pnpm run layouts:sync` para layouts. Revise o diff: a geração não deve substituir silenciosamente material customizado que você queria manter.

## Teste pelas interfaces públicas

Escreva uma regressão que falha antes de implementar. Teste o contrato observável: configuração e arquivos gerados na CLI, respostas de tools/resources no MCP, controles e teclado na UI, interações reais do navegador em navegação e mídia. Evite testes que apenas repetem o algoritmo de um helper interno.

Cubra sucesso, recursos indisponíveis, entradas inválidas e limites relevantes. Exemplos: tradução ausente, rota negada, título PDF vazio, pop-up bloqueado, falha CORS, limites primeiro/último e lista vazia de vozes nativas. Use pastas temporárias isoladas para geradores. Simule rede ou APIs do navegador na fronteira pública; mantenha colaboradores do projeto reais quando possível.

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm exec vitest run
pnpm run smoke:all
pnpm run build
pnpm exec cross-env PORT=3100 pnpm run test:e2e
```

A configuração E2E usa as portas 3100 e 3101; preserve o serviço existente na 3000. `smoke:all` inclui contratos da CLI, serviços compartilhados, descoberta MCP, documentação e `baseline:check`. `pnpm run test:cov` acrescenta cobertura. O build local de produção é diferente do ambiente de exportação estática do Pages, que também deve ser validado quando caminhos de publicação mudam.

## Revise e publique

Revise acessibilidade, autorização, validação de entrada, erros, liberação de recursos e consistência dos arquivos gerados. Analise cada fonte alterada no projeto SonarQube configurado com o escopo correto de teste ou produção; use parser/linter da stack nos formatos sem suporte. Não inclua credenciais ou artefatos temporários nos commits.

Os pacotes publicáveis são `@gitpagedocs/tools`, `@gitpagedocs/mcp` e `@gitpagedocs/cli`; raiz e frontend são privados. Sincronize versões, dependências internas e lockfile, inspecione os pacotes e conclua a validação antes do push. O workflow npm atual roda em pushes para main e publica em ordem de dependência quando a versão da CLI é nova. Confirme npm e Pages depois; um build local verde não equivale à publicação.

> Versao: 0.0.10
