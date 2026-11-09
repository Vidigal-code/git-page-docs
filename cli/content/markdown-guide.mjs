export const MARKDOWN_GUIDE_DOCS = {
  en: `# Configure the document guide

The document guide is the outline of the current Markdown document. It is separate from the site menu, breadcrumbs and the introductory GitPageDocs guide. Configure it on the corresponding item in \`routes-md\` inside the version configuration.

On desktop screens wider than 1024 CSS pixels, the side guide ends after its last entry instead of stretching to the article height. Since 0.0.25, it can grow to the available viewport height below the header before its entries need internal scrolling. This side layout takes precedence over \`TocScrollMaxHeightDesktop\`; centered guides above the content and layouts at 1024 pixels and below retain their previous sizing rules. A small bar in the active entry's theme color follows the section marked while scrolling. The indicator uses the existing section tracking without continuous animation.

## Select the indexed elements

Starting with 0.0.21, \`RouteGuideTags\` chooses which HTML element types become automatic guide entries after Markdown is rendered. This site explicitly uses \`h1\`, \`h2\` and \`h3\` to keep long reference pages navigable. The original spelling and capitalization of each JSON field matter.

\`\`\`json
{
  "id": 43,
  "RouteguideBrand": true,
  "RouteGuideTags": ["h1", "h2", "h3"],
  "RouteGuideSpeciFicbrand": [],
  "RouteguideBrandPosition": "left",
  "RouteguideBrandContainerTop": false
}
\`\`\`

Merge these options into an existing Markdown route, preserving its \`path\`, title and translated descriptions. The fragment alone does not define document sources.

| Setting | Effect |
| --- | --- |
| \`RouteguideBrand: true\` | Enables automatic document-guide entries. |
| \`RouteguideBrand: false\` | Disables automatic entries without removing content or explicit markers. |
| \`RouteGuideTags: ["h1", "h2", "h3"]\` | Indexes those heading levels automatically. |
| Omitted \`RouteGuideTags\` | Preserves the legacy \`h1\` through \`h6\` behavior. |
| \`RouteGuideTags: []\` | Disables automatic indexing; explicit Markdown markers remain available. |
| \`RouteGuideSpeciFicbrand\` | Filters eligible automatic entries by element ID. An empty list does not narrow them. |
| \`RouteguideBrandPosition\` | Aligns the guide content: \`left\`, \`center\` or \`right\`. |
| \`RouteguideBrandContainerTop\` | Places the guide above the document when true; false allows the beside-content layout on wider screens. |

## Use semantic headings first

Write one \`#\` title and use \`##\` and \`###\` for the main sections and subsections. Heading levels express the document hierarchy; do not select them only to change font sizes. With the default shown above, fourth-level and deeper headings still render in the document but do not add automatic guide entries.

The option accepts safe HTML tags supported by the Markdown sanitizer. For example, selecting \`p\` can index paragraphs; adding it to a long reference can make the outline much larger. A tag selection does not allow scripts, embeds or other removed HTML to survive sanitization. Use explicit tag names; there is no wildcard configuration.

## Filter by an element ID

\`RouteGuideTags\` selects element types. \`RouteGuideSpeciFicbrand\` selects IDs among eligible entries; it does not independently enable a tag excluded by \`RouteGuideTags\`. Check the rendered ID or copy the element link before adding it. Heading text, accents and duplicate headings can affect generated IDs. Translations can have different IDs, so test every enabled language.

\`\`\`json
{
  "RouteGuideTags": ["h2"],
  "RouteGuideSpeciFicbrand": ["select-the-indexed-elements", "use-semantic-headings-first"]
}
\`\`\`

This example refers to two headings in the English version of this page. Do not paste the same IDs into an unrelated document and expect entries to appear.

## Keep deliberate Markdown markers

Use the explicit \`markdownMarkers\` feature when an important sentence or element needs a named destination without changing the document's heading hierarchy. See [Markdown markers](markdown-markers.md) for matching rules and style configuration. Selecting \`[]\` for automatic tags does not erase those markers; \`RouteguideBrand\` enables or disables automatic indexing; explicit markers remain available when it is false.

## Distinguish three navigation layers

- The menu selects documents and categories through localized \`path-click\` and \`submenus\`.
- \`RouteGuide\` controls breadcrumb navigation and inherits through site, version defaults and route configuration.
- \`RouteguideBrand\` and \`RouteGuideTags\` control this document's automatic outline entries.

For a narrow viewport, begin with three heading levels, concise headings and left-aligned guide text. See [Narrow and foldable screens](responsive-layout.md) for a practical configuration and verification sequence.

## Labels, empty elements and stable destinations

For an indexed element, the guide chooses its label from \`title\`, then \`alt\`, then normalized visible text. Long text is limited to 96 characters followed by an ellipsis, so indexing a paragraph does not copy an entire section into the guide. An explicit Markdown marker keeps its configured label when it targets the same element.

Textless \`br\`, \`hr\`, \`img\` and \`input\` elements use the tag name when no better label is available. Empty containers are ignored. Only the Markdown sanitizer's safe tag set is eligible; adding a tag to the list never allows unsafe HTML through.

The renderer resolves duplicate IDs so guide destinations stay distinguishable. IDs are document destinations, not menu page IDs. Recheck an ID filter after changing repeated headings, custom HTML or document structure. Clicking a target inside collapsed \`details\` opens its containing disclosure elements so the destination can be seen.

## Verify the result

Open the page in each language; compare entries with the visible headings, click the first and last entries, and check keyboard focus. Try the route with an explicit tag list, an omitted list and an empty list with a marker. Then resize the viewport while keeping the same document open. A missing entry should lead you to its tag, ID, marker rule and route switch before changing the Markdown renderer.


## Index other Markdown elements

Use the HTML tag produced by Markdown: \`p\` for paragraphs, \`li\` for list items, \`blockquote\` for quotations, \`pre\` for fenced blocks, \`table\` for tables and \`img\` for images. For example:

\`\`\`json
{ "RouteGuideTags": ["h1", "h2", "h3", "p", "li", "blockquote", "pre", "table", "img"] }
\`\`\`

Selecting both a container and its children can create several entries for the same passage. Prefer the few element types that help readers navigate. Tags are trimmed, matched case-insensitively and deduplicated. Unsupported tags are skipped and reported in the browser console. A value that is not an array is reported and falls back to the legacy heading levels; correct the configuration instead of relying on that fallback.
`,
  pt: `# Configure o guia do documento

O guia do documento é o índice do Markdown atual. Ele é separado do menu do site, dos breadcrumbs e do guia introdutório do GitPageDocs. Configure-o no item correspondente de \`routes-md\`, na configuração da versão.

Em telas desktop com mais de 1024 pixels CSS, o guia lateral termina após o último item, sem se estender até o fim do artigo. Desde a 0.0.25, ele pode crescer até a altura disponível da janela abaixo do cabeçalho antes de precisar de rolagem interna. Esse layout lateral tem prioridade sobre \`TocScrollMaxHeightDesktop\`; o guia centralizado acima do conteúdo e os layouts de até 1024 pixels mantêm suas regras anteriores de dimensionamento. Uma pequena barra na cor do item ativo acompanha a seção marcada durante a rolagem. O indicador usa o acompanhamento de seções existente, sem animação contínua.

## Selecione os elementos indexados

A partir da 0.0.21, \`RouteGuideTags\` escolhe quais tipos de elementos HTML viram entradas automáticas do guia depois da renderização do Markdown. Este site usa explicitamente \`h1\`, \`h2\` e \`h3\` para facilitar a navegação em referências extensas. Preserve a grafia e as maiúsculas de cada campo JSON.

\`\`\`json
{
  "id": 43,
  "RouteguideBrand": true,
  "RouteGuideTags": ["h1", "h2", "h3"],
  "RouteGuideSpeciFicbrand": [],
  "RouteguideBrandPosition": "left",
  "RouteguideBrandContainerTop": false
}
\`\`\`

Mescle essas opções em uma rota Markdown existente, preservando \`path\`, título e descrições traduzidas. O fragmento sozinho não define os arquivos do documento.

| Configuração | Efeito |
| --- | --- |
| \`RouteguideBrand: true\` | Habilita as entradas automáticas do guia. |
| \`RouteguideBrand: false\` | Desativa as entradas automáticas sem remover conteúdo nem marcadores explícitos. |
| \`RouteGuideTags: ["h1", "h2", "h3"]\` | Indexa automaticamente esses níveis de título. |
| \`RouteGuideTags\` omitida | Preserva o comportamento legado de \`h1\` a \`h6\`. |
| \`RouteGuideTags: []\` | Desabilita a indexação automática; os marcadores Markdown explícitos continuam disponíveis. |
| \`RouteGuideSpeciFicbrand\` | Filtra as entradas automáticas elegíveis pelo ID do elemento. Uma lista vazia não restringe essas entradas. |
| \`RouteguideBrandPosition\` | Alinha o conteúdo do guia: \`left\`, \`center\` ou \`right\`. |
| \`RouteguideBrandContainerTop\` | Quando true, posiciona o guia acima do documento; false permite o posicionamento ao lado do conteúdo em telas mais largas. |

## Prefira títulos semânticos

Escreva um título \`#\` e use \`##\` e \`###\` para seções e subseções principais. Os níveis expressam a hierarquia do documento; não devem servir apenas para mudar o tamanho da fonte. No padrão acima, títulos de quarto nível em diante continuam no texto, mas não geram entradas automáticas do guia.

A opção aceita tags HTML seguras suportadas pelo sanitizador do Markdown. Selecionar \`p\`, por exemplo, pode indexar parágrafos; acrescentá-lo a uma referência longa pode deixar o índice muito extenso. A seleção não permite que scripts, incorporações ou outro HTML removido ultrapassem a sanitização. Informe nomes explícitos de tags; não existe configuração por curinga.

## Filtre pelo ID do elemento

\`RouteGuideTags\` seleciona tipos de elementos. \`RouteGuideSpeciFicbrand\` seleciona IDs entre as entradas elegíveis; não habilita uma tag excluída por \`RouteGuideTags\`. Confira o ID renderizado ou copie o link do elemento antes de configurá-lo. Texto, acentos e títulos repetidos podem afetar os IDs gerados. Traduções podem ter IDs diferentes, portanto teste todos os idiomas habilitados.

\`\`\`json
{
  "RouteGuideTags": ["h2"],
  "RouteGuideSpeciFicbrand": ["selecione-os-elementos-indexados", "prefira-títulos-semânticos"]
}
\`\`\`

O exemplo se refere a dois títulos desta página em português. Não reutilize os mesmos IDs em um documento diferente esperando que as entradas existam.

## Preserve marcadores Markdown intencionais

Use \`markdownMarkers\` explícitos quando uma frase ou um elemento importante precisar de destino nomeado sem alterar a hierarquia de títulos. Consulte [Marcadores Markdown](markdown-markers.md) para regras de correspondência e estilo. Selecionar \`[]\` nas tags automáticas não elimina esses marcadores; \`RouteguideBrand\` habilita ou desabilita a indexação automática; marcadores explícitos continuam disponíveis quando ele é false.

## Distinga as três camadas de navegação

- O menu seleciona documentos e categorias por \`path-click\` traduzido e \`submenus\`.
- \`RouteGuide\` controla os breadcrumbs e herda opções do site, dos padrões da versão e da rota.
- \`RouteguideBrand\` e \`RouteGuideTags\` controlam as entradas automáticas do índice deste documento.

Em uma janela estreita, comece com três níveis de título, títulos concisos e guia alinhado à esquerda. Consulte [Telas estreitas e dobráveis](responsive-layout.md) para uma configuração prática e a sequência de verificação.

## Rótulos, elementos vazios e destinos distintos

Para um elemento indexado, o guia escolhe o rótulo por \`title\`, depois \`alt\` e então pelo texto visível normalizado. Textos longos ficam limitados a 96 caracteres seguidos de reticência, evitando copiar um parágrafo inteiro para o índice. Um marcador Markdown explícito mantém seu rótulo configurado quando aponta para o mesmo elemento.

Elementos \`br\`, \`hr\`, \`img\` e \`input\` sem texto usam o nome da tag quando não existe um rótulo melhor. Containers vazios são ignorados. Somente as tags seguras aceitas pelo sanitizador Markdown podem participar; acrescentar uma tag à lista não permite HTML inseguro.

O renderizador resolve IDs duplicados para distinguir os destinos do guia. Esses IDs identificam elementos do documento, não páginas do menu. Confira novamente o filtro depois de alterar títulos repetidos, HTML personalizado ou a estrutura do documento. Ao clicar em um destino dentro de \`details\` recolhido, os elementos de expansão ancestrais são abertos para tornar o destino visível.

## Confira o resultado

Abra a página em cada idioma, compare as entradas com os títulos visíveis, acione a primeira e a última entrada e confira o foco pelo teclado. Experimente a rota com lista explícita, lista omitida e lista vazia com um marcador. Depois redimensione a janela mantendo o documento aberto. Para uma entrada ausente, confira tag, ID, regra do marcador e habilitador da rota antes de alterar o renderizador Markdown.


## Indexe outros elementos Markdown

Use a tag HTML produzida pelo Markdown: \`p\` para parágrafos, \`li\` para itens de lista, \`blockquote\` para citações, \`pre\` para blocos de código, \`table\` para tabelas e \`img\` para imagens. Por exemplo:

\`\`\`json
{ "RouteGuideTags": ["h1", "h2", "h3", "p", "li", "blockquote", "pre", "table", "img"] }
\`\`\`

Selecionar um contêiner e seus filhos pode criar várias entradas para o mesmo trecho. Prefira os tipos de elemento que ajudam o leitor a navegar. As tags têm espaços externos removidos, ignoram maiúsculas/minúsculas e não se repetem. Tags não suportadas são ignoradas e informadas no console do navegador. Um valor que não seja array é informado e usa os níveis de título legados; corrija a configuração em vez de depender dessa alternativa.
`,
  es: `# Configura la guía del documento

La guía del documento es el índice del Markdown actual. Es independiente del menú del sitio, de las rutas de navegación y de la guía introductoria de GitPageDocs. Configúrala en el elemento correspondiente de \`routes-md\`, dentro de la configuración de la versión.

En pantallas de escritorio con más de 1024 píxeles CSS, la guía lateral termina después de su última entrada, sin extenderse hasta el final del artículo. Desde 0.0.25, puede crecer hasta la altura disponible de la ventana debajo de la cabecera antes de necesitar desplazamiento interno. Este diseño lateral tiene prioridad sobre \`TocScrollMaxHeightDesktop\`; la guía centrada encima del contenido y los diseños de hasta 1024 píxeles mantienen sus reglas de tamaño anteriores. Una pequeña barra con el color de la entrada activa sigue la sección marcada al desplazarse. El indicador utiliza el seguimiento de secciones existente, sin animación continua.

## Selecciona los elementos indexados

Desde 0.0.21, \`RouteGuideTags\` selecciona qué tipos de elementos HTML se convierten en entradas automáticas después de renderizar Markdown. Este sitio usa explícitamente \`h1\`, \`h2\` y \`h3\` para facilitar la navegación de referencias extensas. Respeta la escritura y las mayúsculas de cada campo JSON.

\`\`\`json
{
  "id": 43,
  "RouteguideBrand": true,
  "RouteGuideTags": ["h1", "h2", "h3"],
  "RouteGuideSpeciFicbrand": [],
  "RouteguideBrandPosition": "left",
  "RouteguideBrandContainerTop": false
}
\`\`\`

Combina estas opciones con una ruta Markdown existente y conserva su \`path\`, título y descripciones traducidas. El fragmento por sí solo no define los archivos del documento.

| Configuración | Efecto |
| --- | --- |
| \`RouteguideBrand: true\` | Habilita las entradas automáticas de la guía. |
| \`RouteguideBrand: false\` | Desactiva las entradas automáticas sin borrar contenido ni marcadores explícitos. |
| \`RouteGuideTags: ["h1", "h2", "h3"]\` | Indexa automáticamente esos niveles de título. |
| \`RouteGuideTags\` omitida | Conserva el comportamiento anterior de \`h1\` a \`h6\`. |
| \`RouteGuideTags: []\` | Desactiva la indexación automática; los marcadores Markdown explícitos siguen disponibles. |
| \`RouteGuideSpeciFicbrand\` | Filtra las entradas automáticas elegibles por ID del elemento. Una lista vacía no las restringe. |
| \`RouteguideBrandPosition\` | Alinea el contenido de la guía: \`left\`, \`center\` o \`right\`. |
| \`RouteguideBrandContainerTop\` | Con true coloca la guía encima del documento; false permite situarla junto al contenido en pantallas más anchas. |

## Usa títulos semánticos

Escribe un título \`#\` y usa \`##\` y \`###\` para las secciones y subsecciones principales. Los niveles expresan la jerarquía del documento; no deben elegirse solo para cambiar el tamaño de letra. Con el valor anterior, los títulos de cuarto nivel y posteriores siguen en el contenido, pero no añaden entradas automáticas.

La opción acepta etiquetas HTML seguras compatibles con el sanitizador de Markdown. Seleccionar \`p\`, por ejemplo, puede indexar párrafos; añadirla a una referencia larga puede generar un índice excesivo. La selección no permite conservar scripts, incrustaciones u otro HTML eliminado por la sanitización. Usa nombres explícitos de etiquetas; no existe una configuración con comodín.

## Filtra por ID del elemento

\`RouteGuideTags\` selecciona tipos de elementos. \`RouteGuideSpeciFicbrand\` selecciona IDs entre las entradas elegibles; no habilita una etiqueta excluida por \`RouteGuideTags\`. Comprueba el ID renderizado o copia el enlace del elemento antes de configurarlo. El texto, los acentos y los títulos repetidos pueden afectar los IDs generados. Las traducciones pueden tener IDs diferentes; comprueba cada idioma habilitado.

\`\`\`json
{
  "RouteGuideTags": ["h2"],
  "RouteGuideSpeciFicbrand": ["selecciona-los-elementos-indexados", "usa-títulos-semánticos"]
}
\`\`\`

El ejemplo corresponde a dos títulos de esta página en español. No reutilices esos IDs en otro documento esperando que existan sus entradas.

## Conserva los marcadores deliberados

Usa \`markdownMarkers\` explícitos cuando una frase o un elemento importante necesite un destino con nombre sin cambiar la jerarquía de títulos. Consulta [Marcadores Markdown](markdown-markers.md) para las reglas de coincidencia y estilo. Seleccionar \`[]\` para las etiquetas automáticas no borra esos marcadores; \`RouteguideBrand\` activa o desactiva la indexación automática; los marcadores explícitos siguen disponibles cuando es false.

## Distingue tres capas de navegación

- El menú selecciona documentos y categorías mediante \`path-click\` traducido y \`submenus\`.
- \`RouteGuide\` controla las rutas de navegación y hereda opciones del sitio, los valores de la versión y la ruta.
- \`RouteguideBrand\` y \`RouteGuideTags\` controlan las entradas automáticas del índice de este documento.

En ventanas estrechas, comienza con tres niveles de títulos, nombres concisos y el índice alineado a la izquierda. Consulta [Pantallas estrechas y plegables](responsive-layout.md) para una configuración práctica y una secuencia de comprobación.

## Etiquetas, elementos vacíos y destinos distintos

Para un elemento indexado, la guía elige su etiqueta a partir de \`title\`, después \`alt\` y finalmente el texto visible normalizado. Los textos largos se limitan a 96 caracteres seguidos de puntos suspensivos, evitando copiar un párrafo completo al índice. Un marcador Markdown explícito conserva su etiqueta configurada cuando apunta al mismo elemento.

Los elementos \`br\`, \`hr\`, \`img\` e \`input\` sin texto usan el nombre de la etiqueta cuando no existe una opción mejor. Los contenedores vacíos se ignoran. Solo pueden participar las etiquetas seguras aceptadas por el sanitizador Markdown; añadir una etiqueta a la lista no permite HTML inseguro.

El renderizador resuelve IDs duplicados para distinguir los destinos de la guía. Estos IDs identifican elementos del documento, no páginas del menú. Comprueba de nuevo el filtro después de cambiar títulos repetidos, HTML personalizado o la estructura. Al activar un destino dentro de \`details\` contraído, sus elementos de expansión antecesores se abren para mostrarlo.

## Comprueba el resultado

Abre la página en cada idioma; compara las entradas con los títulos, activa la primera y la última y revisa el foco del teclado. Prueba una lista explícita, una lista omitida y una lista vacía con un marcador. Después cambia el tamaño de la ventana sin cerrar el documento. Si falta una entrada, revisa su etiqueta, ID, regla de marcador e interruptor de la ruta antes de modificar el renderizador Markdown.


## Indexa otros elementos Markdown

Usa la etiqueta HTML producida por Markdown: \`p\` para párrafos, \`li\` para elementos de lista, \`blockquote\` para citas, \`pre\` para bloques de código, \`table\` para tablas e \`img\` para imágenes. Por ejemplo:

\`\`\`json
{ "RouteGuideTags": ["h1", "h2", "h3", "p", "li", "blockquote", "pre", "table", "img"] }
\`\`\`

Seleccionar un contenedor y sus hijos puede crear varias entradas para el mismo pasaje. Prefiere los tipos de elemento que ayuden a navegar. Las etiquetas se recortan, se comparan sin distinguir mayúsculas y se deduplican. Las etiquetas no compatibles se omiten y se notifican en la consola. Un valor que no sea un array se notifica y usa los niveles de títulos heredados; corrige la configuración en lugar de depender de esa alternativa.
`,
};

export const RESPONSIVE_LAYOUT_DOCS = {
  en: `# Narrow and foldable screens

A GitPageDocs document should remain readable when the available browser width changes. A foldable phone can expose a narrow cover screen, a wider inner screen, split-screen mode and either orientation. The CSS viewport matters more than a device name: do not assume every Galaxy Z Fold has the same visible width.

## Configure a manageable menu

Use concise translated labels and group related pages under meaningful parents. A parent may open its own introductory page while its separate expansion control opens its children. Keep important destinations near the top of the tree. If a deep hierarchy makes a small site harder to use, set \`nestedMenusEnabled\` to false to present the existing destinations as a flat menu.

The following fragment belongs inside \`site\` in \`gitpagedocs/config.json\`:

\`\`\`json
{
  "nestedMenusEnabled": true,
  "RouteGuide": true,
  "ActiveNavigation": true,
  "documentNavigation": { "position": "center" },
  "RouteguideBrandPositionDefault": "left",
  "RouteguideBrandContainerTopDefault": false,
  "backgroundEffects": {
    "enabled": true,
    "overrides": { "accessibility": { "showPauseButton": true } }
  }
}
\`\`\`

\`RouteGuide\` keeps breadcrumbs available; \`ActiveNavigation\` enables quick navigation. These settings do not define a device breakpoint. The viewer handles its layout based on the available space. Use the mobile menu control to reach language, theme and animation actions when the header is collapsed.

## Limit the outline deliberately

For a long Markdown reference, index the main heading hierarchy instead of every paragraph. Add this fragment to the corresponding \`routes-md\` item:

\`\`\`json
{
  "RouteguideBrand": true,
  "RouteGuideTags": ["h1", "h2", "h3"],
  "RouteguideBrandPosition": "left"
}
\`\`\`

Headings below the chosen levels remain visible in the document. If a particular document benefits from an outline above its content at all widths, set \`RouteguideBrandContainerTop\` to true on that route and test the resulting reading order. See [Configure the document guide](route-guide.md) for empty lists, legacy behavior, ID filters and explicit markers.

## Write content that can reflow

Prefer short link labels to raw URLs, narrow tables to many unrelated columns, and fenced code blocks with a language. Keep long commands intact for copying; horizontal scrolling inside a code block is different from unwanted horizontal scrolling of the whole page. Split large configuration examples into focused fragments and identify where each fragment belongs.

For local HTML demos, include the viewport meta tag, use relative widths, allow text wrapping and avoid fixed minimum widths wider than the iframe. Check its keyboard and touch behavior separately from the surrounding viewer. The native PDF viewer, browser voices and external media players have their own mobile limitations; provide useful document text and alternative actions where available.

## Check folding and resizing

Use this repeatable sequence with viewport widths of 280, 320, 344, 390 and 768 CSS pixels, then repeat the important paths on an actual device:

1. Open a long reference directly and confirm that the document body does not overflow the viewport.
2. Open and close the main menu; expand a parent, follow a nested page and return through its breadcrumb.
3. Switch language and theme; verify that translated labels and focus indicators stay visible.
4. Open the document guide, follow an entry near the bottom and return to the top.
5. Open focus mode; try its section and document controls, then close it without losing orientation.
6. Change the viewport width while the menu or guide is open. On a foldable device, also open and close the device and change orientation.
7. Repeat with enlarged text, keyboard navigation and the operating system's reduced-motion preference.

These widths are a verification matrix, not a claim that all browsers, fold states, zoom levels or Galaxy Z Fold models have been certified. Record the browser, viewport, orientation, route, language and observed behavior for a reproducible report.

## Keep animations optional

The header pause action controls decorative animation without hiding the documentation. The operating system's reduced-motion preference takes precedence. To disable theme background effects for the entire site, set \`site.backgroundEffects.enabled\` to false. Test a long page while scrolling and opening menus; visual effects should not delay access to content. See [Themes and layouts](themes.md) for per-theme and performance settings.


## Follow the active page in the menu

With the navigation padlock unlocked, Previous and Next center the current destination inside the menu's own scrolling area. Opening or unlocking the menu also brings that destination into view. This applies to the desktop sidebar and mobile drawer; the available scroll range limits centering near the start or end. The document itself does not move when the menu recenters.

Manual menu scrolling is preserved between page changes. Resizing or unfolding the viewport recenters the active item; locking the menu preserves its position and disables automatic following. Test both lock states when moving from 344 to 768 CSS pixels and back, including landscape orientation.

## Show controls from the first render

Language, theme and animation controls use the official icon defaults while standalone shell settings load or cannot be retrieved. Repository search, documentation loading, repository opening, the introduction guide, source viewer and not-found views keep accessible button names. An explicit \`reactIcon: false\` remains a valid preference for localized text after the configuration loads; icon defaults do not override it.

The breadcrumb trail has \`1.75rem\` of space above and below (28 CSS pixels at the default root font size). Mobile selectors fill their menu rows with centered icons; desktop header selectors retain their compact dimensions.

Since 0.0.22, documentation header controls show a built-in fallback while a configured icon loads, so the control does not appear empty. The configured icon replaces that fallback when ready; an explicit text preference remains text. On narrow screens, Markdown action controls reserve their own space before the document heading instead of covering it.
`,
  pt: `# Telas estreitas e dobráveis

Um documento do GitPageDocs deve continuar legível quando a largura disponível do navegador muda. Um celular dobrável pode oferecer tela externa estreita, tela interna ampla, modo de tela dividida e diferentes orientações. A largura da janela em pixels CSS importa mais que o nome do aparelho: não presuma que todo Galaxy Z Fold tenha a mesma largura visível.

## Configure um menu fácil de percorrer

Use rótulos traduzidos concisos e agrupe páginas relacionadas em categorias claras. Um pai pode abrir sua introdução enquanto o controle separado de expansão mostra os filhos. Mantenha os destinos importantes perto do início da árvore. Se uma hierarquia profunda dificultar um site pequeno, defina \`nestedMenusEnabled\` como false para exibir os destinos existentes em uma lista plana.

O fragmento abaixo fica dentro de \`site\`, em \`gitpagedocs/config.json\`:

\`\`\`json
{
  "nestedMenusEnabled": true,
  "RouteGuide": true,
  "ActiveNavigation": true,
  "documentNavigation": { "position": "center" },
  "RouteguideBrandPositionDefault": "left",
  "RouteguideBrandContainerTopDefault": false,
  "backgroundEffects": {
    "enabled": true,
    "overrides": { "accessibility": { "showPauseButton": true } }
  }
}
\`\`\`

\`RouteGuide\` mantém os breadcrumbs disponíveis; \`ActiveNavigation\` habilita a navegação rápida. Essas opções não definem um breakpoint por aparelho. O visualizador adapta o layout ao espaço disponível. Use o controle do menu móvel para acessar idioma, tema e animações quando o cabeçalho estiver recolhido.

## Limite o índice de forma intencional

Em uma referência Markdown extensa, indexe a hierarquia principal de títulos em vez de todos os parágrafos. Adicione o fragmento é rota correspondente de \`routes-md\`:

\`\`\`json
{
  "RouteguideBrand": true,
  "RouteGuideTags": ["h1", "h2", "h3"],
  "RouteguideBrandPosition": "left"
}
\`\`\`

Títulos abaixo dos níveis escolhidos continuam visíveis no documento. Se uma página se beneficiar do índice acima do conteúdo em todas as larguras, configure \`RouteguideBrandContainerTop\` como true nessa rota e confira a ordem de leitura. Consulte [Configure o guia do documento](route-guide.md) para listas vazias, comportamento legado, filtros de ID e marcadores explícitos.

## Escreva conteúdo que se adapte

Prefira links com rótulos curtos a URLs expostas, tabelas estreitas a muitas colunas sem relação e blocos de código com a linguagem indicada. Preserve comandos longos para cópia; a rolagem horizontal dentro de um bloco é diferente de uma página inteira transbordando. Divida exemplos grandes em fragmentos focados e identifique onde cada fragmento deve ser aplicado.

Em demonstrações HTML locais, inclua a meta tag de viewport, use larguras relativas, permita quebra de texto e evite larguras mínimas fixas maiores que o iframe. Confira teclado e toque separadamente do visualizador. O leitor PDF nativo, as vozes do navegador e os players externos têm limitações móveis próprias; ofereça texto útil e ações alternativas quando disponíveis.

## Confira dobra e redimensionamento

Use esta sequência com larguras de 280, 320, 344, 390 e 768 pixels CSS; depois repita os caminhos importantes em um aparelho real:

1. Abra diretamente uma referência longa e confira se o corpo do documento não transborda a janela.
2. Abra e feche o menu principal, expanda um pai, siga uma página aninhada e retorne pelo breadcrumb.
3. Troque idioma e tema; confira se os rótulos traduzidos e indicadores de foco permanecem visíveis.
4. Abra o guia do documento, siga uma entrada próxima do fim e retorne ao topo.
5. Abra o modo foco, use os controles de seção e documento e feche-o sem perder a orientação.
6. Mude a largura com o menu ou guia aberto. No aparelho dobrável, também abra e feche o dispositivo e altere a orientação.
7. Repita com texto ampliado, navegação por teclado e preferência de redução de movimento do sistema.

Essas larguras formam uma matriz de verificação, não uma certificação de todos os navegadores, estados de dobra, níveis de zoom ou modelos Galaxy Z Fold. Registre navegador, largura, orientação, rota, idioma e comportamento observado para produzir um relato reproduzível.

## Mantenha animações opcionais

A ação de pausa do cabeçalho controla a animação decorativa sem ocultar a documentação. A preferência de redução de movimento do sistema tem prioridade. Para desabilitar os efeitos de fundo em todo o site, configure \`site.backgroundEffects.enabled\` como false. Teste uma página longa durante rolagem e abertura de menus; os efeitos visuais não devem atrasar o acesso ao conteúdo. Consulte [Temas e layouts](themes.md) para opções por tema e de desempenho.


## Acompanhe a página ativa no menu

Com o cadeado de navegação destravado, Anterior e Próximo centralizam o destino atual na área de rolagem do próprio menu. Abrir ou destravar o menu também revela esse destino. O comportamento vale para a barra lateral desktop e a gaveta móvel; o limite de rolagem restringe a centralização perto do início ou fim. O documento não se move quando o menu é centralizado.

A rolagem manual do menu permanece entre mudanças de página. Redimensionar ou desdobrar a tela centraliza o item ativo; travar o menu preserva sua posição e desativa o acompanhamento automático. Teste os dois estados do cadeado ao passar de 344 para 768 pixels CSS e voltar, inclusive na orientação horizontal.

## Exiba os controles desde a primeira renderização

Os controles de idioma, tema e animação usam os ícones oficiais padrão enquanto a configuração do shell independente carrega ou não pode ser obtida. Busca de repositórios, carregamento da documentação, abertura de repositório, guia introdutório, visualizador de código e páginas não encontradas mantêm nomes acessíveis nos botões. A opção explícita \`reactIcon: false\` continua válida para texto localizado depois que a configuração carrega; os padrões de ícone não a substituem.

A trilha de navegação tem \`1.75rem\` de espaço acima e abaixo (28 pixels CSS no tamanho padrão da fonte raiz). Os seletores móveis preenchem as linhas do menu com ícones centralizados; os seletores do cabeçalho desktop mantêm dimensões compactas.

Desde a 0.0.22, os controles do cabeçalho da documentação exibem um ícone padrão enquanto o ícone configurado carrega, evitando controles vazios. O ícone configurado substitui esse padrão quando está pronto; uma preferência explícita por texto continua como texto. Em telas estreitas, os controles de ações Markdown reservam espaço próprio antes do título do documento, sem cobri-lo.
`,
  es: `# Pantallas estrechas y plegables

Un documento de GitPageDocs debe seguir siendo legible cuando cambia el ancho disponible del navegador. Un teléfono plegable puede ofrecer una pantalla exterior estrecha, una pantalla interior más amplia, modo de pantalla dividida y distintas orientaciones. El ancho en píxeles CSS importa más que el nombre del dispositivo: no supongas que todos los Galaxy Z Fold muestran el mismo ancho.

## Configura un menú fácil de recorrer

Usa etiquetas traducidas concisas y agrupa las páginas relacionadas bajo categorías claras. Un padre puede abrir su introducción mientras un control separado despliega sus hijos. Mantén los destinos importantes cerca del principio. Si una jerarquía profunda dificulta un sitio pequeño, configura \`nestedMenusEnabled\` como false para mostrar los destinos existentes en una lista plana.

El siguiente fragmento pertenece a \`site\`, en \`gitpagedocs/config.json\`:

\`\`\`json
{
  "nestedMenusEnabled": true,
  "RouteGuide": true,
  "ActiveNavigation": true,
  "documentNavigation": { "position": "center" },
  "RouteguideBrandPositionDefault": "left",
  "RouteguideBrandContainerTopDefault": false,
  "backgroundEffects": {
    "enabled": true,
    "overrides": { "accessibility": { "showPauseButton": true } }
  }
}
\`\`\`

\`RouteGuide\` mantiene disponibles las rutas de navegación; \`ActiveNavigation\` habilita la navegación rápida. Estas opciones no definen un breakpoint por dispositivo. El visor adapta el diseño al espacio disponible. Usa el control del menú móvil para acceder al idioma, tema y animaciones cuando la cabecera esté contraída.

## Limita el índice de forma deliberada

En una referencia Markdown extensa, indexa la jerarquía principal de títulos en lugar de todos los párrafos. Añade el fragmento a la ruta correspondiente en \`routes-md\`:

\`\`\`json
{
  "RouteguideBrand": true,
  "RouteGuideTags": ["h1", "h2", "h3"],
  "RouteguideBrandPosition": "left"
}
\`\`\`

Los títulos inferiores a los niveles elegidos siguen visibles en el documento. Si una página necesita el índice sobre el contenido en todos los anchos, configura \`RouteguideBrandContainerTop\` como true en esa ruta y revisa el orden de lectura. Consulta [Configura la guía del documento](route-guide.md) para listas vacías, comportamiento anterior, filtros por ID y marcadores explícitos.

## Escribe contenido adaptable

Prefiere enlaces con etiquetas breves a URLs completas, tablas estrechas a muchas columnas y bloques de código con su lenguaje indicado. Conserva los comandos largos para copiarlos; el desplazamiento horizontal dentro de un bloque es distinto del desbordamiento de toda la página. Divide ejemplos grandes en fragmentos concretos e indica dónde debe aplicarse cada uno.

En demostraciones HTML locales, incluye la metaetiqueta viewport, usa anchos relativos, permite saltos de texto y evita anchos mínimos mayores que el iframe. Comprueba el teclado y los gestos táctiles aparte del visor. El lector PDF nativo, las voces del navegador y los reproductores externos tienen limitaciones móviles propias; ofrece texto útil y acciones alternativas cuando estén disponibles.

## Comprueba el plegado y los cambios de tamaño

Usa esta secuencia con anchos de 280, 320, 344, 390 y 768 píxeles CSS; después repite los recorridos importantes en un dispositivo real:

1. Abre directamente una referencia larga y comprueba que el cuerpo del documento no desborde la ventana.
2. Abre y cierra el menú principal, expande un padre, sigue una página anidada y regresa por su ruta de navegación.
3. Cambia idioma y tema; comprueba que las etiquetas traducidas y los indicadores de foco sigan visibles.
4. Abre la guía, sigue una entrada cercana al final y vuelve al principio.
5. Abre el modo enfoque, usa los controles de sección y documento y ciérralo sin perder la orientación.
6. Cambia el ancho con el menú o la guía abiertos. En un dispositivo plegable, también abre y cierra el dispositivo y cambia su orientación.
7. Repite con texto ampliado, navegación por teclado y la preferencia del sistema de movimiento reducido.

Estos anchos forman una matriz de comprobación, no una certificación de todos los navegadores, estados de plegado, niveles de zoom o modelos Galaxy Z Fold. Registra navegador, ancho, orientación, ruta, idioma y comportamiento observado para obtener un informe reproducible.

## Mantén las animaciones opcionales

La acción de pausa de la cabecera controla la animación decorativa sin ocultar la documentación. La preferencia del sistema de movimiento reducido tiene prioridad. Para desactivar los efectos de fondo del sitio, configura \`site.backgroundEffects.enabled\` como false. Prueba una página larga al desplazarte y abrir menús; los efectos no deben retrasar el acceso al contenido. Consulta [Temas y diseños](themes.md) para las opciones por tema y de rendimiento.


## Sigue la página activa en el menú

Con el candado de navegación desbloqueado, Anterior y Siguiente centran el destino actual dentro del área de desplazamiento del propio menú. Abrir o desbloquear el menú también muestra ese destino. Se aplica a la barra lateral de escritorio y al panel móvil; el rango disponible limita el centrado cerca del inicio o final. El documento no se mueve cuando se centra el menú.

El desplazamiento manual del menú se conserva entre cambios de página. Redimensionar o desplegar la pantalla centra el elemento activo; bloquear el menú conserva su posición y desactiva el seguimiento automático. Prueba ambos estados del candado al pasar de 344 a 768 píxeles CSS y volver, también en orientación horizontal.

## Muestra los controles desde el primer renderizado

Los controles de idioma, tema y animación usan los iconos oficiales predeterminados mientras la configuración del shell independiente carga o no está disponible. La búsqueda de repositorios, la carga de documentación, la apertura del repositorio, la guía introductoria, el visor de código y las páginas no encontradas conservan nombres accesibles en los botones. La opción explícita \`reactIcon: false\` sigue siendo válida para texto localizado al cargar la configuración; los valores de iconos predeterminados no la reemplazan.

Los breadcrumbs tienen \`1.75rem\` de espacio arriba y abajo (28 píxeles CSS con el tamaño raíz predeterminado). Los selectores móviles llenan las filas del menú con iconos centrados; los del encabezado de escritorio conservan dimensiones compactas.

Desde 0.0.22, los controles del encabezado de la documentación muestran un icono predeterminado mientras carga el icono configurado, evitando controles vacíos. El icono configurado sustituye ese valor cuando está listo; una preferencia explícita por texto conserva el texto. En pantallas estrechas, los controles de acciones Markdown reservan su propio espacio antes del título del documento, sin cubrirlo.
`,
};
