import { getDefaultSiteConfig } from "../data/default-site-config.mjs";

const defaults = JSON.stringify({ site: { markdownMarkers: getDefaultSiteConfig("").markdownMarkers } }, null, 2);
const example = JSON.stringify({
  id: 51,
  RouteguideBrand: true,
  RouteGuideSpeciFicbrand: [],
  markdownMarkers: {
    enabled: true,
    items: [
      { id: "reading-target", text: { en: "This highlighted sentence is a navigation target.", pt: "Esta frase realçada é um destino de navegação.", es: "Esta frase resaltada es un destino de navegación." }, label: { en: "Important detail", pt: "Detalhe importante", es: "Detalle importante" } },
      { id: "second-cell", selector: "td", occurrence: 2, label: { en: "Second table cell", pt: "Segunda célula da tabela", es: "Segunda celda de la tabla" }, style: { outlineColor: "var(--secondary)" } },
    ],
  },
}, null, 2);

export const MARKDOWN_MARKER_DOCS = {
  en: `# Markdown markers

A marker highlights a text phrase or an HTML element inside rendered Markdown and adds a clickable entry to the document index. Clicking the entry scrolls to that highlighted target. Highlighting and navigation always work together; there are no separate highlight-only or index-only modes.

## Keep the heading outline

\`RouteguideBrand\` enables the existing heading outline. \`RouteGuideSpeciFicbrand\` remains a list of heading IDs to include: an empty array includes every heading. Markers are configured separately in \`routes-md[].markdownMarkers\`; they do not change that filter. Marker entries can appear even when \`RouteguideBrand: false\`. The index follows document order and reuses an existing target ID when available.

## Site defaults

Set shared enablement and colors in \`gitpagedocs/config.json\`:

\`\`\`json
${defaults}
\`\`\`

A route's \`enabled\` overrides the site default. Set \`markdownMarkers.enabled: false\` on a route to disable its markers, or \`enabled: false\` on an individual item to skip only that marker. Disabling markers does not disable the existing heading outline.

## Route example

Merge these fields into an existing Markdown route in the version configuration. The first target exists in the bundled pagination example; add a table to your Markdown before enabling the second target.

\`\`\`json
${example}
\`\`\`

| Field | Behavior |
| --- | --- |
| \`id\` | Required nonempty string, unique within the route's marker list. |
| \`text\` | An exact, case-sensitive phrase in visible Markdown text. It can span inline formatting; whitespace and Unicode normalization are handled without changing the displayed text. |
| \`selector\` | A CSS selector for an element inside this Markdown document, such as \`blockquote\`, \`td\` or \`#example\`. |
| \`occurrence\` | Which match to use, counting from \`1\`; defaults to the first. Useful for repeated phrases or elements. |
| \`label\` | Index text; omitted or unavailable labels fall back to the marker ID. |
| \`style\` | Optional \`background\`, \`color\` and \`outlineColor\` CSS colors. |

Provide exactly one of \`text\` and \`selector\`. Text, selectors and labels accept a string or a language map; the current language is used first, then English. CSS selectors only search the current Markdown fragment, not the surrounding application. Hidden and executable content is excluded.

## Theme colors, repeated content and diagnostics

Styles merge in this order: site defaults, route options, then the marker. Theme variables such as \`var(--primary)\`, \`var(--secondary)\` and \`var(--text)\` follow the active light or dark palette. These fields accept colors, not arbitrary stylesheets or image URLs. Each valid marker always receives a visible theme-based highlight, even without a custom style.

Content blocks keep marker and heading targets unique for each Markdown instance. Copy/download actions preserve the original Markdown source. Invalid selectors, duplicate IDs, invalid occurrences and missing targets are reported in the browser console and do not add dead index links. Invalid colors are reported and the normal styling remains available.

Open Guides > Read and explore > Paginated containers example, then choose the highlighted index entry in its first Markdown file. Use the same approach for paragraphs, list items, quotations, tables and code elements.
`,
  pt: `# Marcadores de Markdown

Um marcador realça uma frase ou um elemento HTML dentro do Markdown renderizado e acrescenta uma entrada clicável ao índice. Clicar nessa entrada rola até o alvo realçado. Destaque e navegação sempre funcionam juntos; não existem modos separados de somente destaque ou somente índice.

## Preserve o sumário de títulos

\`RouteguideBrand\` ativa o sumário existente. \`RouteGuideSpeciFicbrand\` continua sendo a lista de IDs dos títulos incluídos: um array vazio inclui todos. Os marcadores são configurados separadamente em \`routes-md[].markdownMarkers\` e não mudam esse filtro. As entradas dos marcadores podem aparecer mesmo com \`RouteguideBrand: false\`. O índice acompanha a ordem do documento e reutiliza o ID existente do alvo quando disponível.

## Padrões do site

Defina ativação e cores comuns em \`gitpagedocs/config.json\`:

\`\`\`json
${defaults}
\`\`\`

O \`enabled\` da rota tem prioridade sobre o padrão do site. Use \`markdownMarkers.enabled: false\` na rota para desativar seus marcadores ou \`enabled: false\` em um item para ignorar apenas aquele marcador. Isso não desativa o sumário de títulos existente.

## Exemplo por rota

Acrescente estes campos a uma rota Markdown existente na configuração da versão. O primeiro alvo existe no exemplo de paginação incluído; adicione uma tabela ao Markdown antes de ativar o segundo.

\`\`\`json
${example}
\`\`\`

| Campo | Comportamento |
| --- | --- |
| \`id\` | Texto obrigatório, não vazio e único na lista de marcadores da rota. |
| \`text\` | Frase exata, sensível a maiúsculas, no texto visível. Pode atravessar formatação inline; espaços e normalização Unicode são tratados sem alterar o texto exibido. |
| \`selector\` | Seletor CSS de um elemento desse Markdown, como \`blockquote\`, \`td\` ou \`#exemplo\`. |
| \`occurrence\` | Ocorrência escolhida, contando a partir de \`1\`; o padrão é a primeira. Útil para frases ou elementos repetidos. |
| \`label\` | Texto do índice; quando ausente ou indisponível, usa o ID do marcador. |
| \`style\` | Cores CSS opcionais \`background\`, \`color\` e \`outlineColor\`. |

Informe exatamente um alvo: \`text\` ou \`selector\`. Textos, seletores e rótulos aceitam uma string ou mapa de idiomas; o idioma atual tem prioridade, seguido pelo inglês. Seletores procuram apenas no fragmento Markdown atual, sem acessar a aplicação ao redor. Conteúdo oculto ou executável é excluído.

## Cores, repetições e diagnóstico

A prioridade dos estilos é: padrões do site, opções da rota e, por último, marcador. Variáveis como \`var(--primary)\`, \`var(--secondary)\` e \`var(--text)\` acompanham o tema claro ou escuro. Os campos aceitam cores, não folhas de estilo arbitrárias nem URLs de imagens. Todo marcador válido recebe um destaque visível do tema, mesmo sem estilo personalizado.

Em páginas compostas, cada instância Markdown mantém destinos próprios para títulos e marcadores. Copiar/baixar preserva o Markdown original. Seletores inválidos, IDs duplicados, ocorrências inválidas e alvos ausentes são informados no console e não criam links sem destino. Cores inválidas são informadas, mantendo o estilo normal disponível.

Abra Guias > Leia e explore > Exemplo de containers paginados e escolha a entrada realçada do índice no primeiro Markdown. O mesmo mecanismo atende a parágrafos, listas, citações, tabelas e elementos de código.
`,
  es: `# Marcadores de Markdown

Un marcador resalta una frase o un elemento HTML dentro del Markdown renderizado y añade una entrada enlazada al índice. Al pulsarla, la página se desplaza hasta el destino resaltado. Resaltado y navegación siempre funcionan juntos; no hay modos independientes de solo resaltado o solo índice.

## Conserva el índice de títulos

\`RouteguideBrand\` activa el índice existente. \`RouteGuideSpeciFicbrand\` sigue siendo una lista de IDs de títulos: un array vacío incluye todos. Los marcadores se configuran por separado en \`routes-md[].markdownMarkers\` y no cambian ese filtro. Sus entradas pueden aparecer incluso con \`RouteguideBrand: false\`. El índice sigue el orden del documento y reutiliza el ID del destino cuando existe.

## Valores del sitio

Configura la activación y los colores comunes en \`gitpagedocs/config.json\`:

\`\`\`json
${defaults}
\`\`\`

El \`enabled\` de la ruta tiene prioridad sobre el sitio. Usa \`markdownMarkers.enabled: false\` en una ruta para desactivar sus marcadores, o \`enabled: false\` en un elemento para omitir solo ese marcador. Esto no desactiva el índice de títulos existente.

## Ejemplo por ruta

Añade estos campos a una ruta Markdown existente en la configuración de la versión. El primer destino existe en el ejemplo de paginación incluido; añade una tabla al Markdown antes de activar el segundo.

\`\`\`json
${example}
\`\`\`

| Campo | Comportamiento |
| --- | --- |
| \`id\` | Texto obligatorio, no vacío y único en la lista de marcadores de la ruta. |
| \`text\` | Frase exacta, sensible a mayúsculas, del texto visible. Puede atravesar formato inline; se normalizan espacios y Unicode sin cambiar el texto mostrado. |
| \`selector\` | Selector CSS de un elemento del Markdown, como \`blockquote\`, \`td\` o \`#ejemplo\`. |
| \`occurrence\` | Coincidencia elegida, contando desde \`1\`; por defecto la primera. Útil para texto o elementos repetidos. |
| \`label\` | Texto del índice; si falta o no está disponible, se usa el ID del marcador. |
| \`style\` | Colores CSS opcionales \`background\`, \`color\` y \`outlineColor\`. |

Indica exactamente un destino: \`text\` o \`selector\`. Textos, selectores y etiquetas admiten una cadena o un mapa de idiomas; primero se usa el idioma actual y después el inglés. Los selectores solo buscan en el fragmento Markdown actual, no en la aplicación. Se excluye el contenido oculto o ejecutable.

## Colores, repeticiones y diagnóstico

Los estilos se combinan en este orden: sitio, ruta y marcador. Variables como \`var(--primary)\`, \`var(--secondary)\` y \`var(--text)\` siguen el tema claro u oscuro. Los campos admiten colores, no hojas de estilo arbitrarias ni URLs de imágenes. Todo marcador válido recibe un resaltado visible del tema, incluso sin un estilo personalizado.

Cada instancia Markdown de una página compuesta conserva destinos únicos para títulos y marcadores. Copiar/descargar mantiene el Markdown original. Los selectores no válidos, IDs duplicados, ocurrencias incorrectas y destinos ausentes se notifican en la consola sin crear enlaces sin destino. Los colores no válidos se notifican y el estilo normal sigue disponible.

Abre Guías > Lee y explora > Ejemplo de contenedores paginados y elige la entrada resaltada del índice en su primer Markdown. El mismo mecanismo sirve para párrafos, listas, citas, tablas y elementos de código.
`,
};
