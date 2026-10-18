export const overviewsPt = {
  guides: `# Guias

Escolha um caminho pela documentação conforme o que precisa realizar. Esta página também é o destino do item Guias no menu: clicar no título abre o documento; a seta separada expande ou recolhe os submenus.

## Escolha o próximo passo

- **Configure seu site** conecta opções globais, rotas de versão, temas e navegação. Comece aqui para adaptar o scaffold ao seu repositório.
- **Leia e explore** explica modo foco, narração do navegador, documentos PDF e HTML interativo.
- **Automatize e integre** reúne comandos da CLI, servidor MCP e autorização de rotas.

## Navegue pela seção

Um item pai pode ter \`path-click\` traduzido e \`submenus\` ao mesmo tempo. Os filhos mantêm seus próprios destinos. O breadcrumb segue a mesma hierarquia: um ancestral com documento disponível pode ser aberto, e a página atual indica sua posição. Por exemplo, Guias → Configure seu site → Configuração permite voltar a qualquer introdução sem perder a estrutura do menu.
`,
  configureYourSite: `# Configure seu site

Separe a apresentação global do conteúdo de cada versão da documentação. O arquivo raiz \`gitpagedocs/config.json\` seleciona idiomas, temas e controles de leitura. A configuração da versão define rotas, arquivos por idioma e a árvore de menus.

## Configure em uma ordem prática

1. Leia **Configuração** para localizar a opção desejada e seu padrão.
2. Use **Receitas de configuração** para exemplos JSON completos e uma estrutura multilíngue inicial.
3. Escolha **Temas e layouts** para tokens visuais e alterações de templates.
4. Leia **Navegação e submenus** para conectar rotas, documentos dos pais, submenus e breadcrumbs.

## Confira o resultado

Mantenha um arquivo existente para cada idioma habilitado e destino do menu. Apenas um título não cria um documento. Dê ao pai seu próprio caminho Markdown quando precisar de uma introdução e preserve os filhos em \`submenus\`. Valide um idioma primeiro; depois confira os demais, o menu plano e um link direto para uma página aninhada. Preserve as configurações específicas do repositório ao gerar exemplos novamente.
`,
  readAndExplore: `# Leia e explore

Escolha uma forma de leitura adequada ao documento. Markdown oferece títulos, links e sumário; PDF usa o visualizador nativo do navegador; HTML pode hospedar uma demonstração interativa confiável. Todos permanecem acessíveis pelo mesmo menu da documentação.

## Opções de leitura

- **Modo foco** mantém o Markdown em um diálogo com cópia/download e navegação para primeiro, anterior, próximo e último documento ou seção.
- **Acessibilidade e narração** explica escolha de voz, controles e suporte do navegador.
- **Documentos PDF** cobre prévia, download, nova aba e exigências de CORS na hospedagem externa.
- **Containers HTML** explica arquivos locais, páginas hospedadas e o exemplo DOOM.
- **Containers paginados** explica sequências independentes de arquivos Markdown, HTML, vídeo, áudio e PDF; teste os cinco tipos no exemplo incluído.
- **Marcadores de Markdown** realça textos ou elementos e acrescenta links ao índice sem mudar o filtro de títulos existente.

## Controle a reprodução

A narração começa somente quando solicitada. Mídias audíveis se coordenam com ela por \`site.mediaExclusivePlayback\`; vozes nativas e players externos dependem de seus provedores. No jogo HTML, use o controle Play do próprio player. Documentos de itens pai, como este, também participam da navegação entre documentos quando o Markdown está disponível e o acesso é permitido.
`,
  automateAndIntegrate: `# Automatize e integre

Use automação para tarefas repetíveis, mantendo o repositório como fonte de verdade. A CLI gera arquivos de configuração e documentação. O servidor MCP oferece operações do projeto a um cliente MCP. A autorização de rotas governa a experiência de acesso no visualizador.

## Escolha a interface adequada

- **Referência da CLI** lista instalação, comandos, opções e operações que gravam ou publicam arquivos.
- **Servidor MCP** descreve configuração stdio, todas as tools e resources, variáveis de provedores e limites do sistema de arquivos.
- **Rotas autorizadas** explica chaves, roles e provedores externos de identidade.

## Revise antes de publicar

Mantenha credenciais no ambiente ou armazenamento apropriado, nunca na configuração gerada. Inspecione os arquivos alterados antes do commit e valide caminhos da versão e do idioma escolhidos. Arquivos estáticos públicos continuam acessíveis por suas URLs mesmo quando o menu os esconde. Comece por comandos informativos e diretórios de saída explícitos ao comparar uma geração candidata com um site existente.
`,
  operationsAndDevelopment: `# Operação e desenvolvimento

Manter um site de documentação envolve seu conteúdo publicado e o runtime que o apresenta. Escolha abaixo o caminho relacionado à mudança: atualizar conteúdo nem sempre exige alterar o frontend, e corrigir o visualizador não deve reescrever documentos históricos sem necessidade.

## Dois caminhos pelo projeto

- **Publique e mantenha** reúne publicação, migração, diagnóstico e perguntas frequentes. Use para preparar uma atualização ou investigar uma falha do site publicado.
- **Desenvolva o projeto** reúne arquitetura, contribuição/testes e referência de funcionalidades. Use para localizar a fonte correta e a fronteira de validação.

## Mantenha publicações rastreáveis

Registre a versão pretendida, revise os arquivos gerados e preserve documentos usados por links existentes. Valide separadamente o comportamento local e o caminho de publicação. Quando um player externo, voz do navegador ou política de hospedagem mudar, diferencie essa dependência do comportamento do repositório antes de alterar a implementação. Os guias filhos apresentam comandos e verificações para cada tarefa.
`,
  shipAndMaintain: `# Publique e mantenha

Trate a publicação como uma mudança validada em uma versão específica. Gere e inspecione o site antes de confiar apenas no sucesso do workflow; uma página publicada ainda pode apontar para um caminho incorreto ou recurso externo indisponível.

## Antes e depois da publicação

1. Leia **Publicação** para execução local, caminhos do GitHub Pages e configuração do workflow.
2. Use **Migração e compatibilidade** para comparar atualizações preservando conteúdo próprio e configurações históricas suportadas.
3. Siga **Solução de problemas** quando documentos, PDFs, narração ou integrações variarem entre ambientes.
4. Consulte **Perguntas frequentes** para respostas curtas sobre configurações comuns.

## Verifique uma amostra útil

Abra diretamente uma página Markdown aninhada, troque o idioma, siga seu breadcrumb e teste as ações de PDF habilitadas. Confirme o commit publicado e a versão do pacote. Tenha um commit recuperável para atualizações e confira a URL pública após um rollback. Não gere novamente um repositório personalizado apenas para repetir um deploy sem revisar o que será substituído.
`,
  developTheProject: `# Desenvolva o projeto

Comece pelo módulo responsável pelo comportamento que deseja alterar. O frontend segue Feature-Sliced Design; a CLI possui os templates do scaffold; tools fornece serviços compartilhados de configuração e documentação; MCP expõe esses serviços por seu protocolo.

## Localize a fonte e a fronteira de teste

- **Arquitetura** mapeia pacotes, responsabilidades e fluxo de dados.
- **Contribuição e testes** identifica templates autorais, saídas geradas e comandos de validação.
- **Funcionalidades** oferece uma referência ampla das capacidades e configurações existentes.

## Produza uma mudança revisável

Descreva o comportamento observável, reproduza-o pela interface pública e atualize a fonte antes de gerar artefatos. Teste controles renderizados, configurações retornadas ou arquivos escritos, em vez de helpers privados. Revise traduções e acessibilidade ao mudar controles visíveis. Execute as verificações adequadas aos pacotes afetados e inspecione o diff gerado antes do commit. Diretórios de versões existentes devem permanecer intactos, salvo quando a mudança exige explicitamente atualizar seu conteúdo.
`,
  gitAndGitHub: `# Git e GitHub

O controle de versão conecta arquivos da documentação, histórico de revisão e publicação. Estes exemplos apresentam práticas do repositório usadas no projeto e complementam os guias de configuração do GitPageDocs.

## Comece pelo guia adequado

- **Introdução ao Git** explica commits, branches e colaboração básica, com um exemplo de vídeo.
- **GitHub Issues e Projects** mostra como registrar trabalho e organizar seu andamento.

## Aplique o fluxo à documentação

Mantenha mudanças relacionadas de fonte e arquivos gerados no mesmo commit revisado. Use uma branch para migrar configurações, inspecione diferenças antes de publicar e registre o commit implantado pelo Actions. Descreva um defeito com versão, idioma, URL e resultado esperado para permitir reprodução por outro colaborador. Antes de compartilhar logs ou exemplos, remova credenciais e conteúdo privado: um repositório público e seu Pages expõem os arquivos versionados.
`,
};
