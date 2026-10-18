import { HTML_ROUTE_JSON, RECIPE_ROOT_JSON, RECIPE_VERSION_JSON } from "./configuration-examples.mjs";

export const practicalPt = {
  htmlContainers: `# Containers HTML e exemplos interativos

Uma rota HTML exibe um documento local ou uma página externa dentro de um iframe. Use-a para uma demonstração interativa confiável que o Markdown não consegue representar. O scaffold inclui **DOOM: exemplo HTML**, rota 29. O título e a descrição pertencem ao container da documentação; o HTML contém somente o player, sem repetir títulos, instruções ou criar um botão próprio de carregamento. O jogo continua hospedado pelo provedor; o pacote npm inclui a integração HTML, não os arquivos do jogo.

## Configure uma rota HTML local

Adicione esta rota ao array \`routes-html\` existente na configuração da versão. Preserve as demais rotas e use um ID distinto para cada destino. Crie cada arquivo referenciado como HTML UTF-8 ou gere o exemplo incluído pela CLI.

\`\`\`json
${HTML_ROUTE_JSON}
\`\`\`

Adicione um item traduzido em \`menus-header-html\`. Cada \`path-click\` deve corresponder ao caminho da rota no mesmo idioma, como \`gitpagedocs/docs/versions/0.0.12/pt/doom.html\`; não substitua esse caminho HTML local por \`page:29\`. Um rótulo de menu não cria uma rota. HTML aceita a mesma estrutura recursiva \`submenus\` dos outros menus.

## Dimensões, conteúdo e URLs externas

\`container: "full"\` aplica uma altura mínima relacionada à janela; um número positivo define a altura em pixels. Omita-o para usar o container normal. \`fullscreenEnabled\` controla a ação de tela cheia do visualizador. Título e descrição da rota são independentes dos títulos escritos dentro do próprio HTML.

Para uma página hospedada, use \`url: { "en": "https://example.com/demo", "pt": "https://example.com/demo", "es": "https://example.com/demo" }\` no lugar de \`path\`. Uma rota URL navega o iframe; o HTML local é carregado em \`srcDoc\`. No conteúdo local, prefira estilos incluídos no documento e URLs HTTPS explícitas: srcDoc não resolve automaticamente os recursos relativos ao diretório do arquivo original.

O servidor externo pode impedir incorporação por CSP ou X-Frame-Options. Hosts conhecidos que bloqueiam iframe recebem uma alternativa para abrir em nova aba; falhas de qualquer servidor não são detectadas universalmente. Teste o destino real no site publicado. \`blockLink: true\` define nova aba como destino padrão dos links no HTML local; não impede navegação feita por scripts ou links com destino próprio.

## Use e mantenha o exemplo do jogo

Escolha o item HTML no menu. O SDK do player carrega quando a página abre; use o controle Play nativo para iniciar o jogo. Não há início automático nem botão de carregamento separado da documentação. É necessária conexão. Uma falha de inicialização exibe um erro que orienta recarregar a página; a visualização normal contém apenas o player. Teste foco de teclado, telas pequenas, tela cheia e retorno à documentação. Disponibilidade do player e recursos do navegador podem mudar independentemente do GitPageDocs.

Revise o HTML e suas dependências antes de publicar. O iframe atual permite scripts e conteúdo de mesma origem, portanto não funciona como barreira de segurança para HTML arbitrário não confiável. Não inclua segredos em HTML, URLs ou configuração do cliente. A hospedagem estática expõe os arquivos independentemente da visibilidade do menu ou autorização da rota. No ambiente local e no Pages, versione a página com a configuração correspondente e valide os caminhos gerados antes da publicação.
`,
  configurationRecipes: `# Receitas de configuração

Este guia monta um site pequeno em três idiomas, com duas páginas Markdown e menu com três níveis. Comece pela configuração gerada, revise as mudanças e mantenha os arquivos originais no controle de versão. Os exemplos usam os IDs 101 e 102 para distingui-los das páginas incluídas no scaffold.

## 1. Gere e confira a estrutura

O scaffold inclui as versões 0.0.12, 0.0.11 e 0.0.10 no seletor. As três contêm os exemplos atuais; a versão do pacote é 0.0.12. Caminhos e rótulos de versão são gerados para a versão correspondente da documentação. Pastas existentes de versões anteriores não são apagadas.

Execute \`npx --yes @gitpagedocs/cli@0.0.12 --no-interactive --owner SEU_USUARIO --repo SEU_REPOSITORIO\` em um diretório de projeto novo. Neste repositório de código-fonte, \`node cli/index.mjs\` executa a versão do checkout. A geração grava configuração e documentação; ela não inicia o visualizador Next.js.

O JSON completo abaixo é um exemplo mínimo de \`gitpagedocs/config.json\`. Em um site existente, mescle os campos relevantes e preserve a identidade do repositório, opções de publicação, temas e demais versões.

\`\`\`json
${RECIPE_ROOT_JSON}
\`\`\`

As nove entradas herdam a apresentação comum de \`icons.defaults\`. Para mostrar texto em uma ação, acrescente \`"reactIcon": false\` à entrada correspondente. Não altere um default compartilhado apenas para mudar um botão. Campos planos antigos de ícones prevalecem sobre os compactos; remova ou atualize um campo conflitante somente depois de confirmar sua intenção.

## 2. Crie a configuração da versão

Salve o próximo JSON completo no caminho do config da versão indicado acima. Uma categoria de menu tem título e \`submenus\`; uma folha tem \`path-click\` localizado. Categorias não precisam de rota. Destinos Markdown apontam para os caminhos reais dos arquivos, sem usar o alias \`page:<id>\`.

\`\`\`json
${RECIPE_VERSION_JSON}
\`\`\`

Crie \`start.md\` e \`next-steps.md\` nas pastas \`en\`, \`pt\` e \`es\` dessa versão: seis arquivos ao todo. Escreva no idioma correspondente e salve em UTF-8. Comece cada página com um título e acrescente seções \`##\` para testar o modo foco. Os bundles gerados em \`langs/\` contêm os textos da interface, separados do conteúdo dos documentos.

## 3. Mude a apresentação sem perder destinos

Com \`nestedMenusEnabled: true\`, o leitor expande Guias → Primeiros passos → página. Com \`false\`, os mesmos destinos aparecem em uma lista plana. Acrescente \`submenus\` recursivamente quando a organização do conteúdo justificar; não há limite fixo de profundidade configurado. Mantenha identidades distintas entre irmãos e evite repetir destinos apenas para aumentar a árvore.

Breadcrumbs usam \`site.RouteGuide\`, depois \`routeDefaults.RouteGuide\` da versão e por último a rota individual. O valor explícito mais específico prevalece. \`RouteguideBrand\` é o índice separado de títulos. As setas Voltar/Próximo do rodapé seguem os destinos disponíveis; \`ActiveNavigation\` controla a navegação rápida e Ctrl+K.

## 4. Inclua mídia e valide

Consulte Documentos PDF para adicionar \`routes-pdf\` e \`menus-header-pdf\`; o exemplo \`page:23\` aponta para o guia em inglês incluído. Prévia, download e nova aba são independentes da aparência dos ícones. PDFs externos precisam permitir CORS nas três ações; PDFs locais dentro de \`gitpagedocs/\` são preparados ao executar ou compilar o Next.js.

Confira todos os idiomas, expanda cada categoria e percorra as folhas. Teste URLs diretas, alterações entre texto e ícone, primeiro/anterior/próximo/último no foco e direções desabilitadas nas extremidades. Inspecione o config da versão quando o rótulo aparece mas o destino falha. Faça commit da configuração revisada junto com os documentos e anexos referenciados.
`,
  contributing: `# Contribuição e testes

Use o repositório de código-fonte para alterar o runtime, a CLI, as ferramentas compartilhadas ou o MCP. Um repositório que apenas consome o visualizador normalmente edita seu próprio conteúdo e configuração. Trabalhe em uma branch focada e descreva o comportamento visível ao usuário e sua validação.

## Altere o pacote responsável

\`frontend/\` contém o visualizador Next.js App Router e segue Feature-Sliced Design. Primitivos visuais compartilhados ficam em \`shared\`, dados e schemas de documentação em \`entities\`, recursos do usuário em \`features\` e a composição do leitor em \`widgets\`. Mantenha carregamento de arquivos e repositórios fora dos componentes de apresentação.

\`cli/\` é responsável pelo scaffold, comandos, defaults e templates autorais. \`tools/\` fornece lógica reutilizável de configuração, documentação e serviços. \`mcp/\` expõe essas capacidades pelo Model Context Protocol. Uma correção visual normalmente pertence ao frontend; um default do scaffold deve mudar na fonte da CLI e ser regenerado.

## Edite as fontes, não as cópias geradas

| Mudança | Fonte de verdade | Resultado gerado |
| --- | --- | --- |
| Opções do site e textos de idioma | \`cli/data/\` | Config raiz e \`gitpagedocs/langs/\` |
| Rotas e seções do menu | Builders da CLI, metadados, mapeamentos e \`menu-sections.mjs\` | Config da versão |
| Textos da documentação | \`cli/content/docs-{en,pt,es}.mjs\` e módulos importados | Markdown versionado |
| Regiões gerenciadas | \`tools/src/documentation/sections.ts\` | README, CONTRIBUTING e SECURITY |
| Definições de layouts | \`gitpagelayouts/v2/\` | Templates e documentação de layouts |

Após alterar CLI/conteúdo, execute \`node cli/index.mjs\`, copie \`gitpagedocs/\` para \`tools/gitpagedocs/\` sem excluir versões históricas e execute \`pnpm run baseline:create\`. Use \`node cli/index.mjs docs\` nas regiões gerenciadas e \`pnpm run layouts:sync\` para layouts. Revise o diff: a geração não deve substituir silenciosamente material customizado que você queria manter.

## Teste pelas interfaces públicas

Escreva uma regressão que falha antes de implementar. Teste o contrato observável: configuração e arquivos gerados na CLI, respostas de tools/resources no MCP, controles e teclado na UI, interações reais do navegador em navegação e mídia. Evite testes que apenas repetem o algoritmo de um helper interno.

Cubra sucesso, recursos indisponíveis, entradas inválidas e limites relevantes. Exemplos: tradução ausente, rota negada, título PDF vazio, pop-up bloqueado, falha CORS, limites primeiro/último e lista vazia de vozes nativas. Use pastas temporárias isoladas para geradores. Simule rede ou APIs do navegador na fronteira pública; mantenha colaboradores do projeto reais quando possível.

\`\`\`sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm exec vitest run
pnpm run smoke:all
pnpm run build
pnpm exec cross-env PORT=3100 pnpm run test:e2e
\`\`\`

A configuração E2E usa as portas 3100 e 3101; preserve o serviço existente na 3000. \`smoke:all\` inclui contratos da CLI, serviços compartilhados, descoberta MCP, documentação e \`baseline:check\`. \`pnpm run test:cov\` acrescenta cobertura. O build local de produção é diferente do ambiente de exportação estática do Pages, que também deve ser validado quando caminhos de publicação mudam.

## Revise e publique

Revise acessibilidade, autorização, validação de entrada, erros, liberação de recursos e consistência dos arquivos gerados. Análise cada fonte alterada no projeto SonarQube configurado com o escopo correto de teste ou produção; use parser/linter da stack nos formatos sem suporte. Não inclua credenciais ou artefatos temporários nos commits.

Os pacotes publicáveis são \`@gitpagedocs/tools\`, \`@gitpagedocs/mcp\` e \`@gitpagedocs/cli\`; raiz e frontend são privados. Sincronize versões, dependências internas e lockfile, inspecione os pacotes e conclua a validação antes do push. O workflow npm atual roda em pushes para main e pública em ordem de dependência quando a versão da CLI é nova. Confirme npm e Pages depois; um build local verde não equivale à publicação.
`,
};
