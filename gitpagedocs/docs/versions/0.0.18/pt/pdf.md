# Documentos PDF

PDF é um tipo de conteúdo próprio, junto com Markdown, HTML, código-fonte, vídeo e áudio. A prévia usa o visualizador nativo de PDF do navegador. As ações de baixar e abrir em nova aba são configuráveis de forma independente.

## Guia do projeto em inglês

O scaffold inclui o [Guia do projeto GitPageDocs (PDF, inglês)](https://github.com/Vidigal-code/git-page-docs/blob/main/cli/content/assets/gitpagedocs-project-guide.pdf). Ele explica o projeto, pacotes, configuração, ícones, modo foco, narração, CLI, MCP e publicação. O PDF está em inglês; esta referência possui versões em português, inglês e espanhol.

A CLI copia os bytes do anexo para `gitpagedocs/docs/versions/<versão>/en/gitpagedocs-project-guide.pdf`. Os três caminhos de idioma do exemplo apontam para esse arquivo em inglês. Para oferecer traduções, adicione os PDFs traduzidos e altere o caminho de cada idioma.

## Padrões do site

Adicione este bloco dentro de `site` em `gitpagedocs/config.json`:

```json
{
  "pdf": {
    "enabled": true,
    "previewEnabled": true,
    "downloadEnabled": true,
    "openInNewTabEnabled": true
  }
}
```

`enabled` é a chave geral do conteúdo PDF. Os demais campos controlam a prévia, o botão de download e o botão de nova aba. Todo campo omitido assume `true`, inclusive em configurações antigas.

A precedência das ações é `rota.pdf.<flag>` > `site.pdf.<flag>` > `true`. Um `true` explícito na rota habilita aquela ação mesmo quando o padrão do site é `false`; `site.pdf.enabled: false` continua desabilitando todos os PDFs. Sem caminho para o idioma selecionado, o PDF fica indisponível; não há fallback automático de idioma.

As ações PDF usam ícones por padrão. Configure `site.icons.PdfDownload` (`LuDownload`) e `site.icons.PdfOpenInNewTab` (`LuExternalLink`) individualmente com `reactIcon`, `tag`, `size`, `colorDark` e `colorLight`. Por exemplo, `"PdfDownload": { "reactIcon": false }` exibe texto no download enquanto a nova aba continua com ícone. A aparência não altera as opções de habilitação acima.

## Exemplo de rota e menu

Em `gitpagedocs/docs/versions/0.0.18/config.json`, mantenha as listas de rotas e menus no nível principal:

```json
{
  "routes-pdf": [{
    "id": 23,
    "title": { "en": "Project guide (English)", "pt": "Guia do projeto (inglês)", "es": "Guía del proyecto (inglés)" },
    "pdf": {
      "pathPdf": {
        "en": "gitpagedocs/docs/versions/0.0.18/en/gitpagedocs-project-guide.pdf",
        "pt": "gitpagedocs/docs/versions/0.0.18/en/gitpagedocs-project-guide.pdf",
        "es": "gitpagedocs/docs/versions/0.0.18/en/gitpagedocs-project-guide.pdf"
      },
      "previewEnabled": true,
      "downloadEnabled": true,
      "openInNewTabEnabled": true
    }
  }],
  "menus-header-pdf": [{
    "id": 23,
    "en": { "title": "Project guide (English)", "path-click": "page:23" },
    "pt": { "title": "Guia do projeto (inglês)", "path-click": "page:23" },
    "es": { "title": "Guía del proyecto (inglés)", "path-click": "page:23" }
  }]
}
```

O mapa `pdf.pathPdf` seleciona o arquivo do idioma atual. Use `page:<id>` nos destinos dos menus PDF. A mesma estrutura recursiva de `submenus` dos outros menus está disponível. O scaffold reserva o ID 23 para o exemplo PDF e o ID 24 para esta referência Markdown; use IDs únicos para páginas adicionais.

As flags opcionais da rota ficam dentro de `pdf`. Apresentação compartilhada, `container`, `RouteGuide` e autorização continuam no nível da rota. `routeDefaults` também atende rotas PDF. Adicione `"pdf": 5` em `hierarchyPage` e `hierarchyMenu` para posicionar PDFs depois do áudio; ajuste os valores conforme a ordem desejada.

## Arquivos e publicação

PDFs e arquivos nativos de áudio/vídeo suportados dentro de `gitpagedocs/` são copiados para os assets públicos do visualizador ao iniciar ou compilar o Next.js. A URL respeita o subdiretório de publicação no GitHub Pages. Versione esses arquivos no Git e publique-os junto com a documentação gerada. Arquivos fora de `gitpagedocs/` devem estar em `frontend/public/` do visualizador ou acessíveis por uma URL HTTP(S).

Use a URL do PDF binário, não uma página HTML de prévia do repositório. Em repositórios remotos, o caminho configurado é resolvido nesse repositório. Prévia, download e abertura em nova aba buscam os bytes do arquivo, portanto um servidor externo precisa permitir CORS nas três ações. O visualizador valida a assinatura PDF e cria uma URL Blob temporária com tipo `application/pdf`. A prévia e a nova aba usam o visualizador nativo de PDF do navegador; a política de incorporação e os cabeçalhos de tipo/disposição do servidor de origem não controlam essa exibição Blob.

O botão de nova aba abre o Blob PDF validado em vez de navegar para a URL raw do repositório. Isso também funciona com a prévia desabilitada: o carregamento começa quando o leitor baixa ou abre o documento. Os bytes já carregados são reutilizados para o PDF atual. Falhas de rede/CORS, PDFs inválidos e bloqueio da nova aba geram um erro visível; não há fallback automático para a URL raw. O suporte nativo a PDF e as preferências de download do navegador ainda determinam como a nova aba exibe o arquivo.

## Leitura e diagnóstico

- Os controles nativos de PDF, teclado, zoom e navegação entre páginas dependem do navegador. Alguns navegadores móveis abrem ou baixam o arquivo em vez de incorporá-lo.
- A prévia não converte PDF em Markdown. Modo foco, navegação por seção, cópia de Markdown e narração atuam em documentos Markdown, não no PDF incorporado.
- Desabilitar a prévia pode manter download e nova aba disponíveis. Desabilitar todas as ações deixa o PDF sem controle interativo.
- Ocultar um botão não controla acesso. PDFs hospedados publicamente continuam acessíveis pela URL. Documentos confidenciais precisam de hospedagem protegida.
- Se a prévia estiver vazia, confira se o caminho retorna um PDF e permite acesso por CORS; depois tente a nova aba. Permita pop-ups para o site se o navegador bloquear essa ação. Falhas de download e abertura são informadas na página.

> Versão: 0.0.18
