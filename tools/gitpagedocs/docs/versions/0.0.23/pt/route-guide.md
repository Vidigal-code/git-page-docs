# Configure o guia do documento

O guia do documento é o índice do Markdown atual. Ele é separado do menu do site, dos breadcrumbs e do guia introdutório do GitPageDocs. Configure-o no item correspondente de `routes-md`, na configuração da versão.

Em telas desktop com mais de 1024 pixels CSS, o guia lateral termina após o último item, sem se estender até o fim do artigo. Uma pequena barra na cor do item ativo acompanha a seção marcada durante a rolagem. O indicador usa o acompanhamento de seções existente, sem animação contínua. Em larguras de até 1024 pixels, o guia mantém suas dimensões e aparência atuais.

## Selecione os elementos indexados

A partir da 0.0.21, `RouteGuideTags` escolhe quais tipos de elementos HTML viram entradas automáticas do guia depois da renderização do Markdown. Este site usa explicitamente `h1`, `h2` e `h3` para facilitar a navegação em referências extensas. Preserve a grafia e as maiúsculas de cada campo JSON.

```json
{
  "id": 43,
  "RouteguideBrand": true,
  "RouteGuideTags": ["h1", "h2", "h3"],
  "RouteGuideSpeciFicbrand": [],
  "RouteguideBrandPosition": "left",
  "RouteguideBrandContainerTop": false
}
```

Mescle essas opções em uma rota Markdown existente, preservando `path`, título e descrições traduzidas. O fragmento sozinho não define os arquivos do documento.

| Configuração | Efeito |
| --- | --- |
| `RouteguideBrand: true` | Habilita as entradas automáticas do guia. |
| `RouteguideBrand: false` | Desativa as entradas automáticas sem remover conteúdo nem marcadores explícitos. |
| `RouteGuideTags: ["h1", "h2", "h3"]` | Indexa automaticamente esses níveis de título. |
| `RouteGuideTags` omitida | Preserva o comportamento legado de `h1` a `h6`. |
| `RouteGuideTags: []` | Desabilita a indexação automática; os marcadores Markdown explícitos continuam disponíveis. |
| `RouteGuideSpeciFicbrand` | Filtra as entradas automáticas elegíveis pelo ID do elemento. Uma lista vazia não restringe essas entradas. |
| `RouteguideBrandPosition` | Alinha o conteúdo do guia: `left`, `center` ou `right`. |
| `RouteguideBrandContainerTop` | Quando true, posiciona o guia acima do documento; false permite o posicionamento ao lado do conteúdo em telas mais largas. |

## Prefira títulos semânticos

Escreva um título `#` e use `##` e `###` para seções e subseções principais. Os níveis expressam a hierarquia do documento; não devem servir apenas para mudar o tamanho da fonte. No padrão acima, títulos de quarto nível em diante continuam no texto, mas não geram entradas automáticas do guia.

A opção aceita tags HTML seguras suportadas pelo sanitizador do Markdown. Selecionar `p`, por exemplo, pode indexar parágrafos; acrescentá-lo a uma referência longa pode deixar o índice muito extenso. A seleção não permite que scripts, incorporações ou outro HTML removido ultrapassem a sanitização. Informe nomes explícitos de tags; não existe configuração por curinga.

## Filtre pelo ID do elemento

`RouteGuideTags` seleciona tipos de elementos. `RouteGuideSpeciFicbrand` seleciona IDs entre as entradas elegíveis; não habilita uma tag excluída por `RouteGuideTags`. Confira o ID renderizado ou copie o link do elemento antes de configurá-lo. Texto, acentos e títulos repetidos podem afetar os IDs gerados. Traduções podem ter IDs diferentes, portanto teste todos os idiomas habilitados.

```json
{
  "RouteGuideTags": ["h2"],
  "RouteGuideSpeciFicbrand": ["selecione-os-elementos-indexados", "prefira-títulos-semânticos"]
}
```

O exemplo se refere a dois títulos desta página em português. Não reutilize os mesmos IDs em um documento diferente esperando que as entradas existam.

## Preserve marcadores Markdown intencionais

Use `markdownMarkers` explícitos quando uma frase ou um elemento importante precisar de destino nomeado sem alterar a hierarquia de títulos. Consulte [Marcadores Markdown](markdown-markers.md) para regras de correspondência e estilo. Selecionar `[]` nas tags automáticas não elimina esses marcadores; `RouteguideBrand` habilita ou desabilita a indexação automática; marcadores explícitos continuam disponíveis quando ele é false.

## Distinga as três camadas de navegação

- O menu seleciona documentos e categorias por `path-click` traduzido e `submenus`.
- `RouteGuide` controla os breadcrumbs e herda opções do site, dos padrões da versão e da rota.
- `RouteguideBrand` e `RouteGuideTags` controlam as entradas automáticas do índice deste documento.

Em uma janela estreita, comece com três níveis de título, títulos concisos e guia alinhado à esquerda. Consulte [Telas estreitas e dobráveis](responsive-layout.md) para uma configuração prática e a sequência de verificação.

## Rótulos, elementos vazios e destinos distintos

Para um elemento indexado, o guia escolhe o rótulo por `title`, depois `alt` e então pelo texto visível normalizado. Textos longos ficam limitados a 96 caracteres seguidos de reticência, evitando copiar um parágrafo inteiro para o índice. Um marcador Markdown explícito mantém seu rótulo configurado quando aponta para o mesmo elemento.

Elementos `br`, `hr`, `img` e `input` sem texto usam o nome da tag quando não existe um rótulo melhor. Containers vazios são ignorados. Somente as tags seguras aceitas pelo sanitizador Markdown podem participar; acrescentar uma tag à lista não permite HTML inseguro.

O renderizador resolve IDs duplicados para distinguir os destinos do guia. Esses IDs identificam elementos do documento, não páginas do menu. Confira novamente o filtro depois de alterar títulos repetidos, HTML personalizado ou a estrutura do documento. Ao clicar em um destino dentro de `details` recolhido, os elementos de expansão ancestrais são abertos para tornar o destino visível.

## Confira o resultado

Abra a página em cada idioma, compare as entradas com os títulos visíveis, acione a primeira e a última entrada e confira o foco pelo teclado. Experimente a rota com lista explícita, lista omitida e lista vazia com um marcador. Depois redimensione a janela mantendo o documento aberto. Para uma entrada ausente, confira tag, ID, regra do marcador e habilitador da rota antes de alterar o renderizador Markdown.


## Indexe outros elementos Markdown

Use a tag HTML produzida pelo Markdown: `p` para parágrafos, `li` para itens de lista, `blockquote` para citações, `pre` para blocos de código, `table` para tabelas e `img` para imagens. Por exemplo:

```json
{ "RouteGuideTags": ["h1", "h2", "h3", "p", "li", "blockquote", "pre", "table", "img"] }
```

Selecionar um contêiner e seus filhos pode criar várias entradas para o mesmo trecho. Prefira os tipos de elemento que ajudam o leitor a navegar. As tags têm espaços externos removidos, ignoram maiúsculas/minúsculas e não se repetem. Tags não suportadas são ignoradas e informadas no console do navegador. Um valor que não seja array é informado e usa os níveis de título legados; corrija a configuração em vez de depender dessa alternativa.

> Versão: 0.0.23
