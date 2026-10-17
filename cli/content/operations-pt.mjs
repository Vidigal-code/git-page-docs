export const operationsPt = {
  migration: `# Migrar uma documentação existente

O GitPageDocs oferece compatibilidade com configurações e dados desde a versão oficial 0.0.1. Os formatos experimentais anteriores, numerados 1.1.x, estão fora desse contrato. Atualizar o pacote e reescrever a documentação são operações diferentes: o gerador não combina automaticamente suas páginas, rotas, traduções ou temas personalizados.

## Salve um ponto de recuperação

Anote o commit publicado, a versão da CLI e a revisão do workflow. Execute \`git status --short\`, revise alterações pendentes e salve os arquivos de origem desejados em um commit específico. Guarde também uma cópia dos documentos e recursos personalizados ainda não rastreados; não adicione credenciais apenas para completar o backup. Crie uma branch com \`git switch -c docs/upgrade-0.0.10\`.

Para uma comparação reproduzível, invoque explicitamente o pacote desejado:

\`\`\`sh
npx --yes @gitpagedocs/cli@0.0.11 version
npx --yes @gitpagedocs/cli@0.0.11 --no-interactive --owner SEU_USUARIO --repo SEU_REPOSITORIO --output gitpagedocs-candidate
git diff --no-index -- gitpagedocs gitpagedocs-candidate
\`\`\`

O último comando retorna código 1 quando existem diferenças; isso é esperado. A pasta candidata serve para revisão e não se torna o site ativo automaticamente. As configurações geradas ainda descrevem caminhos canônicos em \`gitpagedocs/\`. Alterar a pasta de saída não significa reescrever todos os caminhos usados pelo visualizador.

## Combine as configurações com cuidado

Preserve a identidade do site, as opções de publicação e as entradas de \`VersionControl.versions\` em \`gitpagedocs/config.json\`. Cada versão aponta para seu próprio \`docs/versions/<version>/config.json\`; mantenha os arquivos, IDs de documentos, caminhos de rotas e destinos de menus consistentes. Conserve as versões históricas necessárias aos links existentes. Arrays de rotas são conteúdo e não padrões reconstruídos pelo visualizador.

Copie somente as novas opções desejadas. O \`routeDefaults\` da versão fornece configurações comuns; um campo explícito na rota prevalece sobre esse padrão. Preserve Markdown, PDFs e os pacotes \`gitpagedocs/langs/<idioma>.json\` de cada idioma. A opção \`site.languages\` habilita idiomas na interface, mas não cria traduções dos documentos.

O formato compacto \`site.icons.defaults\` compartilha valores entre ícones, e cada entrada pode sobrescrevê-los. Campos planos \`Icon*ReactIcones\` existentes prevalecem sobre as entradas compactas. Remova duplicatas conflitantes apenas depois de confirmar o efeito desejado. Na versão 0.0.10, LanguageSelector, ThemeSelector, FocusMode, QuickNavigation, PdfDownload, PdfOpenInNewTab, DocumentPrevious e DocumentNext usam ícones por padrão; defina \`reactIcon: false\` na entrada para manter texto.

A abertura de PDF agora busca bytes validados e abre um Blob \`application/pdf\` em nova guia. Servidores externos precisam permitir CORS mesmo com a prévia desativada. Revise separadamente as três ações de PDF, teste a permissão de popups e preserve as mensagens traduzidas. As preferências do navegador para PDFs continuam valendo.

## Valide e publique o resultado revisado

Neste repositório de runtime, altere as fontes de geração antes de compilar: o build gera a documentação novamente. Execute \`pnpm run typecheck\`, \`pnpm run lint\`, \`pnpm exec vitest run\`, \`pnpm run smoke:all\` e \`pnpm run build\`. Execute \`pnpm run test:e2e\` com \`PORT=3100\` definido no shell. Um repositório consumidor precisa de verificações equivalentes próprias.

Teste todas as versões e idiomas preservados, links diretos, menus aninhados, ícones/texto, ações de PDF e autorização. Confira a exportação no subcaminho real do Pages. Faça commit dos arquivos revisados e envie pelo workflow existente. O comando inicial \`pages deploy\` gera arquivos, cria commit e faz push; não o repita sem revisão sobre documentação personalizada.

Registre o commit publicado após o sucesso no Actions. Se a verificação falhar, reverta o commit específico com \`git revert COMMIT_DA_ATUALIZACAO\`, restaure a versão anterior do runtime quando aplicável, envie e execute a publicação novamente. Confirme o conteúdo restaurado na URL pública; o revert sozinho não pública o site.
`,
  troubleshooting: `# Diagnosticar problemas na documentação

Comece com uma URL que falha, a versão e o idioma selecionados, o resultado esperado e o observado. Registre o commit publicado e a saída de \`gitpagedocs version\`. Execute \`gitpagedocs doctor\` na raiz do repositório para verificar ferramentas e descoberta da configuração. O doctor não valida cada documento nem comprova o funcionamento da publicação.

## Identifique o ambiente afetado

- **Somente local:** confirme que o diretório atual contém \`gitpagedocs/config.json\`. Confira a saída do servidor e a porta utilizada. Reinicie após mudar configurações usadas no build. Um arquivo presente em outra pasta do computador não se torna um recurso web público.
- **Somente Pages:** confira a execução mais recente de Deploy GitPageDocs no Actions e o commit publicado. Compare requisições que falham com o subcaminho esperado do repositório. Se o HTML abre, mas CSS ou JavaScript retornam 404, verifique o caminho do build antes de alterar o conteúdo.
- **Somente repositório remoto:** confirme o acesso ao repositório, a pasta de documentação na branch consultada e os arquivos enviados ao Git. Localmente, a busca de repositórios exige \`GITPAGEDOCS_REPOSITORY_SEARCH=true\`. Teste o mesmo repositório diretamente antes de investigar outro visualizador.

Para publicação em subpasta, confira \`GITPAGEDOCS_PATH\`, \`GITPAGEDOCS_BASE_PATH\` e o workflow gerado em conjunto. O Next.js incorpora o caminho base durante o build; mudar uma variável depois da exportação não reescreve os bundles. Após publicar novamente, faça uma recarga completa ou use uma janela privada para distinguir cache antigo de um 404 do servidor.

## Siga a configuração até o arquivo

Siga \`VersionControl.versions[*].path\` até a configuração da versão e depois o caminho da rota no idioma escolhido. Compare a grafia e as letras maiúsculas com o arquivo rastreado; o servidor pode diferenciar maiúsculas mesmo quando sua máquina não diferencia. Um título de menu não cria uma rota. Verifique o destino e se a autorização permite acesso ao leitor atual.

Confira separadamente \`site.languages\`, o pacote da interface em \`langs/\` e o mapa de idiomas do documento. PDFs não têm fallback automático de idioma. Preserve UTF-8 no JSON e no Markdown, incluindo \`site.name\` e títulos acentuados. Compare o texto salvo com o navegador e o terminal antes de diagnosticar um defeito de codificação; fontes e contextos de exibição também podem diferir. Nomes de arquivos em inglês são convenção, não uma restrição aos acentos no conteúdo. Não remova acentos para esconder bytes corrompidos.

## Investigue PDFs e controles de leitura

Confira o status da requisição e o corpo retornado pelo PDF. O arquivo deve começar com \`%PDF-\`; uma tela HTML de login ou prévia do repositório não é PDF, mesmo com status 200. Prévia, download e nova guia exigem permissão CORS para origens externas. Baixar fora do navegador não comprova que o navegador tenha acesso.

Permita popups para o site e tente novamente o botão de abertura. O visualizador abre bytes validados em Blob; os cabeçalhos de download da hospedagem original não controlam diretamente essa nova URL. O suporte nativo e as preferências de download variam. Confira as opções do site e da rota antes de tratar um controle desativado como erro de carga.

Para narração silenciosa, confira suporte de fala, vozes disponíveis, idioma, volume e saída de áudio. As vozes podem chegar depois da carga ou depender de um serviço remoto. Outra mídia audível interrompe a narração quando \`mediaExclusivePlayback\` está habilitado. Trocar documento ou idioma cancela a fala anterior.

## Separe acesso e processos

Menus ocultos e autorização no navegador não protegem arquivos públicos em hospedagem estática. Verifique as permissões reais da hospedagem confidencial; alterar perfis na interface não protege uma URL de PDF exposta.

O processo \`gitpagedocs mcp start\` aguardando é normal: ele conversa por stdio com um cliente, não com um terminal interativo. Confira diretório, executável e ambiente herdado. As credenciais devem existir nesse processo; o cofre da CLI e o \`.env\` não são carregados automaticamente. Reserve stdout ao protocolo, consulte stderr e resultados \`isError\`, compartilhando diagnósticos sem segredos.
`,
};
