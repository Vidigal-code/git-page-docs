# Diagnosticar problemas na documentação

Comece com uma URL que falha, a versão e o idioma selecionados, o resultado esperado e o observado. Registre o commit publicado e a saída de `gitpagedocs version`. Execute `gitpagedocs doctor` na raiz do repositório para verificar ferramentas e descoberta da configuração. O doctor não valida cada documento nem comprova o funcionamento da publicação.

## Identifique o ambiente afetado

- **Somente local:** confirme que o diretório atual contém `gitpagedocs/config.json`. Confira a saída do servidor e a porta utilizada. Reinicie após mudar configurações usadas no build. Um arquivo presente em outra pasta do computador não se torna um recurso web público.
- **Somente Pages:** confira a execução mais recente de Deploy GitPageDocs no Actions e o commit publicado. Compare requisições que falham com o subcaminho esperado do repositório. Se o HTML abre, mas CSS ou JavaScript retornam 404, verifique o caminho do build antes de alterar o conteúdo.
- **Somente repositório remoto:** confirme o acesso ao repositório, a pasta de documentação na branch consultada e os arquivos enviados ao Git. Localmente, a busca de repositórios exige `GITPAGEDOCS_REPOSITORY_SEARCH=true`. Teste o mesmo repositório diretamente antes de investigar outro visualizador.

Para publicação em subpasta, confira `GITPAGEDOCS_PATH`, `GITPAGEDOCS_BASE_PATH` e o workflow gerado em conjunto. O Next.js incorpora o caminho base durante o build; mudar uma variável depois da exportação não reescreve os bundles. Após publicar novamente, faça uma recarga completa ou use uma janela privada para distinguir cache antigo de um 404 do servidor.

## Siga a configuração até o arquivo

Siga `VersionControl.versions[*].path` até a configuração da versão e depois o caminho da rota no idioma escolhido. Compare a grafia e as letras maiúsculas com o arquivo rastreado; o servidor pode diferenciar maiúsculas mesmo quando sua máquina não diferencia. Um título de menu não cria uma rota. Verifique o destino e se a autorização permite acesso ao leitor atual.

Confira separadamente `site.languages`, o pacote da interface em `langs/` e o mapa de idiomas do documento. PDFs não têm fallback automático de idioma. Preserve UTF-8 no JSON e no Markdown, incluindo `site.name` e títulos acentuados. Compare o texto salvo com o navegador e o terminal antes de diagnosticar um defeito de codificação; fontes e contextos de exibição também podem diferir. Nomes de arquivos em inglês são convenção, não uma restrição aos acentos no conteúdo. Não remova acentos para esconder bytes corrompidos.

## Investigue PDFs e controles de leitura

Confira o status da requisição e o corpo retornado pelo PDF. O arquivo deve começar com `%PDF-`; uma tela HTML de login ou prévia do repositório não é PDF, mesmo com status 200. Prévia, download e nova guia exigem permissão CORS para origens externas. Baixar fora do navegador não comprova que o navegador tenha acesso.

Permita popups para o site e tente novamente o botão de abertura. O visualizador abre bytes validados em Blob; os cabeçalhos de download da hospedagem original não controlam diretamente essa nova URL. O suporte nativo e as preferências de download variam. Confira as opções do site e da rota antes de tratar um controle desativado como erro de carga.

Para narração silenciosa, confira suporte de fala, vozes disponíveis, idioma, volume e saída de áudio. As vozes podem chegar depois da carga ou depender de um serviço remoto. Outra mídia audível interrompe a narração quando `mediaExclusivePlayback` está habilitado. Trocar documento ou idioma cancela a fala anterior.

## Separe acesso e processos

Menus ocultos e autorização no navegador não protegem arquivos públicos em hospedagem estática. Verifique as permissões reais da hospedagem confidencial; alterar perfis na interface não protege uma URL de PDF exposta.

O processo `gitpagedocs mcp start` aguardando é normal: ele conversa por stdio com um cliente, não com um terminal interativo. Confira diretório, executável e ambiente herdado. As credenciais devem existir nesse processo; o cofre da CLI e o `.env` não são carregados automaticamente. Reserve stdout ao protocolo, consulte stderr e resultados `isError`, compartilhando diagnósticos sem segredos.

> Versao: 0.0.10
