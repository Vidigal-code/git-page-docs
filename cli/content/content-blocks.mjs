import { COMPOSED_PAGES } from "../data/composed-pages.mjs";

const blocksExample = JSON.stringify({ pages: COMPOSED_PAGES }, null, 2);
const layoutExample = JSON.stringify({
  id: 23,
  layout: {
    title: { placement: "outside", position: "before" },
    description: { placement: "inside", position: "after" },
  },
}, null, 2);

export const CONTENT_BLOCKS_DOCS = {
  en: `# Ordered content blocks

A page can contain several Markdown documents, HTML players, videos, audio tracks and PDFs in any order. Add a top-level \`pages\` array to the version configuration. Each block references a route already defined in the corresponding \`routes-md\`, \`routes-html\`, \`routes-video\`, \`routes-audio\` or \`routes-pdf\` list. The page has one URL; blocks do not create separate navigation destinations.

## Complete repeated-block example

The scaffold's page 39 combines three Markdown blocks, two HTML blocks, two videos, two audio tracks and three PDFs. It references the included routes 1, 2, 30, 29, 11, 12 and 23. Merge the following object into \`gitpagedocs/docs/versions/0.0.10/config.json\` or the current version's config; retain those route definitions and their files. The same example is included in the new scaffold.

\`\`\`json
${blocksExample}
\`\`\`

Add a menu destination with \`"path-click": "page:39"\` in each language. The bundled entry is under Guides → Read and explore → Multiple content blocks. Its label is independent of the labels of the individual blocks.

## Ordering, repetition and individual settings

- \`pages[].id\` is an integer page identity. Use a new ID that does not collide with an existing route ID.
- \`blocks[].id\` is a nonempty string, unique within its page. Two instances may use the same \`routeId\`, but need different block IDs.
- \`type\` is exactly \`md\`, \`html\`, \`video\`, \`audio\` or \`pdf\`; \`routeId\` selects a route from that type's list.
- Array order is display order. Move a block object to reorder it, remove it to hide that instance, or copy it with a new block ID to repeat it. \`hierarchyPage\` still applies to legacy pages and does not reorder this array.

Each reference uses its route's source, translation, visibility, sizing, PDF actions, media controls and authorization. To give two occurrences of the same file different options, define two routes with distinct IDs and the same source path, then reference those IDs. Do not put a second copy of route parameters inside a block.

A Markdown block renders only that Markdown document; inline legacy audio attached to its route does not become an extra block. Refer to an audio route explicitly when it belongs in the sequence. Blocks select fixed routes and do not share a \`browseAll\` index. Media exclusivity and browser restrictions still apply; repeating a player does not start playback automatically.

Focus mode and narration read the authorized Markdown blocks available in the selected language, in array order, including repetitions. Focus copy/download joins their original sources with two newline characters and uses \`page-39.md\` for this example. Each visible Markdown container keeps its individual copy/download actions and original filename. Rendered heading IDs are namespaced per block to avoid duplicate anchors; the downloaded source is unchanged. Denied pages or blocks are excluded from rendering, copy, focus and narration. This client-side gate does not protect public assets or prevent the document loader from reading their sources.

## Position titles and descriptions

Every content route accepts \`layout.title\` and \`layout.description\` independently. \`placement\` is \`outside\` or \`inside\` the content container; \`position\` is \`before\` or \`after\` the content. Merge this presentation fragment into an existing route, preserving its content fields:

\`\`\`json
${layoutExample}
\`\`\`

For Markdown, configured title and description always remain outside the rendered document; before/after positioning is honored. Headings authored inside the Markdown remain part of that document. HTML, video, audio and PDF accept both placements. These fields change presentation, not the source file or media contents. Existing \`titleIsVisible\`, \`descriptionIsVisible\`, alignment and styling options continue to apply. Omit \`layout\` to preserve the existing presentation. Shared values may live in \`routeDefaults\`; an explicit route-level \`layout\` replaces that defaults object.

## Compatibility and access

Configs without \`pages\` keep their existing single-container or mixed-route behavior. A version-level \`pages\` array overrides the root array; \`[]\` clears it. Invalid definitions or unresolved references are ignored without preventing other pages from loading. Duplicate page or block identities keep the first valid entry, and a page ID colliding with a route is ignored so the existing route remains available. Review these mistakes in your configuration rather than relying on omission.

Page-level \`authorization\` protects the composed destination, and each referenced route retains its own access requirements. Hiding a block does not protect publicly hosted files. Markdown and PDF do not invent a translation when their selected-language file is absent; other types retain their existing route fallback behavior, including English fallback for video/audio and external HTML URLs. Test every block and language, direct page navigation, restricted routes, repeated media, download errors and browser resource limits before publishing. Large numbers of active embeds or PDFs consume memory and network bandwidth; include only what readers need.
`,
  pt: `# Blocos de conteúdo ordenados

Uma página pode conter vários documentos Markdown, players HTML, vídeos, faixas de áudio e PDFs em qualquer ordem. Adicione um array \`pages\` no nível principal do config da versão. Cada bloco referencia uma rota já definida em \`routes-md\`, \`routes-html\`, \`routes-video\`, \`routes-audio\` ou \`routes-pdf\`. A página possui uma única URL; os blocos não criam destinos de navegação separados.

## Exemplo completo com repetições

A página 39 do scaffold reúne três blocos Markdown, dois HTML, dois vídeos, dois áudios e três PDFs. Ela referencia as rotas incluídas 1, 2, 30, 29, 11, 12 e 23. Combine o objeto abaixo com \`gitpagedocs/docs/versions/0.0.10/config.json\` ou com o config da versão atual; preserve as definições dessas rotas e seus arquivos. O mesmo exemplo acompanha o novo scaffold.

\`\`\`json
${blocksExample}
\`\`\`

Adicione um destino de menu com \`"path-click": "page:39"\` em cada idioma. A entrada incluída fica em Guias → Leia e explore → Múltiplos blocos de conteúdo. Seu rótulo é independente dos rótulos de cada bloco.

## Ordem, repetição e opções individuais

- \`pages[].id\` é um identificador inteiro da página. Use um ID novo que não coincida com um ID de rota existente.
- \`blocks[].id\` é uma string não vazia, única dentro da página. Duas instâncias podem usar o mesmo \`routeId\`, mas precisam de IDs de bloco diferentes.
- \`type\` aceita exatamente \`md\`, \`html\`, \`video\`, \`audio\` ou \`pdf\`; \`routeId\` seleciona uma rota da lista desse tipo.
- A ordem do array é a ordem de exibição. Mova um objeto para reordená-lo, remova-o para ocultar aquela instância ou copie-o com um ID novo para repetir. \`hierarchyPage\` continua valendo para páginas legadas e não reordena esse array.

Cada referência usa a origem, tradução, visibilidade, dimensões, ações PDF, controles de mídia e autorização da sua rota. Para dar opções diferentes a duas ocorrências do mesmo arquivo, defina duas rotas com IDs distintos e o mesmo caminho de origem; depois referencie esses IDs. Não duplique parâmetros de rota dentro do bloco.

Um bloco Markdown renderiza apenas seu documento; um áudio inline legado da rota não se transforma em bloco extra. Referencie uma rota de áudio explicitamente quando ela fizer parte da sequência. Os blocos selecionam rotas fixas e não compartilham um índice de \`browseAll\`. A exclusividade de mídia e as restrições do navegador continuam valendo; repetir um player não inicia reprodução automaticamente.

Modo foco e narração leem os blocos Markdown autorizados e disponíveis no idioma selecionado, na ordem do array, incluindo repetições. Copiar/baixar no foco reúne as fontes originais com duas quebras de linha e usa \`page-39.md\` neste exemplo. Cada container Markdown visível mantém suas ações individuais de cópia/download e o nome original do arquivo. IDs de títulos renderizados recebem um prefixo por bloco para evitar âncoras duplicadas; a fonte baixada não muda. Páginas ou blocos negados são excluídos da renderização, cópia, foco e narração. Esse controle no cliente não protege arquivos públicos nem impede o carregador de documentos de ler suas fontes.

## Posicionar títulos e descrições

Toda rota de conteúdo aceita \`layout.title\` e \`layout.description\` independentemente. \`placement\` vale \`outside\` ou \`inside\` do container; \`position\` vale \`before\` ou \`after\` do conteúdo. Combine este fragmento de apresentação com uma rota existente, preservando os campos do conteúdo:

\`\`\`json
${layoutExample}
\`\`\`

No Markdown, título e descrição configurados sempre ficam fora do documento renderizado; a posição antes/depois é respeitada. Títulos escritos dentro do Markdown continuam pertencendo ao documento. HTML, vídeo, áudio e PDF aceitam as duas posições de container. Esses campos mudam a apresentação, não o arquivo de origem nem o conteúdo da mídia. \`titleIsVisible\`, \`descriptionIsVisible\`, alinhamento e estilos existentes continuam valendo. Omita \`layout\` para manter a apresentação atual. Valores compartilhados podem ficar em \`routeDefaults\`; um \`layout\` explícito da rota substitui esse objeto dos defaults.

## Compatibilidade e acesso

Configs sem \`pages\` mantêm o comportamento existente de containers únicos ou rotas mistas. O array \`pages\` da versão sobrescreve o array raiz; \`[]\` limpa a lista. Definições inválidas ou referências inexistentes são ignoradas sem impedir o carregamento das outras páginas. IDs duplicados de página ou bloco preservam a primeira entrada válida; um ID de página que coincide com uma rota é ignorado para preservar a rota existente. Corrija esses erros na configuração em vez de depender da omissão.

O campo \`authorization\` da página protege o destino composto, e cada rota referenciada mantém suas próprias exigências de acesso. Ocultar um bloco não protege arquivos públicos. Markdown e PDF não inventam uma tradução quando falta o arquivo do idioma selecionado; os outros tipos preservam o fallback existente da rota, incluindo inglês para vídeo/áudio e URLs HTML externas. Teste todos os blocos e idiomas, navegação direta, rotas protegidas, mídias repetidas, erros de download e limites do navegador antes de publicar. Muitos embeds ou PDFs ativos consomem memória e rede; inclua apenas o que o leitor precisa.
`,
  es: `# Bloques de contenido ordenados

Una página puede contener varios documentos Markdown, reproductores HTML, vídeos, pistas de audio y PDFs en cualquier orden. Añade un array \`pages\` en el nivel principal del config de la versión. Cada bloque referencia una ruta ya definida en \`routes-md\`, \`routes-html\`, \`routes-video\`, \`routes-audio\` o \`routes-pdf\`. La página tiene una sola URL; los bloques no crean destinos de navegación separados.

## Ejemplo completo con repeticiones

La página 39 del scaffold combina tres bloques Markdown, dos HTML, dos vídeos, dos audios y tres PDFs. Referencia las rutas incluidas 1, 2, 30, 29, 11, 12 y 23. Combina el siguiente objeto con \`gitpagedocs/docs/versions/0.0.10/config.json\` o con el config de la versión actual; conserva las definiciones de esas rutas y sus archivos. El mismo ejemplo se incluye en el nuevo scaffold.

\`\`\`json
${blocksExample}
\`\`\`

Añade un destino de menú con \`"path-click": "page:39"\` en cada idioma. La entrada incluida está en Guías → Lee y explora → Múltiples bloques de contenido. Su etiqueta es independiente de las etiquetas de cada bloque.

## Orden, repetición y opciones individuales

- \`pages[].id\` es un identificador entero de página. Usa un ID nuevo que no coincida con una ruta existente.
- \`blocks[].id\` es una cadena no vacía, única dentro de su página. Dos instancias pueden usar el mismo \`routeId\`, pero necesitan IDs de bloque distintos.
- \`type\` acepta exactamente \`md\`, \`html\`, \`video\`, \`audio\` o \`pdf\`; \`routeId\` selecciona una ruta de la lista correspondiente.
- El orden del array determina el orden de presentación. Mueve un objeto para reordenarlo, elimínalo para ocultar esa instancia o cópialo con un ID nuevo para repetirlo. \`hierarchyPage\` sigue aplicándose a las páginas anteriores y no reordena este array.

Cada referencia utiliza el origen, traducción, visibilidad, dimensiones, acciones PDF, controles multimedia y autorización de su ruta. Para asignar opciones diferentes a dos apariciones del mismo archivo, define dos rutas con IDs distintos y la misma ruta de origen; después referencia esos IDs. No dupliques parámetros de ruta dentro del bloque.

Un bloque Markdown renderiza solo su documento; el audio inline antiguo de su ruta no se convierte en un bloque adicional. Referencia explícitamente una ruta de audio cuando forme parte de la secuencia. Los bloques seleccionan rutas fijas y no comparten un índice de \`browseAll\`. La exclusividad multimedia y las restricciones del navegador siguen aplicándose; repetir un reproductor no inicia la reproducción automáticamente.

El modo foco y la narración leen los bloques Markdown autorizados y disponibles en el idioma seleccionado, en el orden del array, incluidas las repeticiones. Copiar/descargar desde foco une sus fuentes originales con dos saltos de línea y utiliza \`page-39.md\` en este ejemplo. Cada contenedor Markdown visible conserva sus acciones individuales de copia/descarga y el nombre original. Los IDs de encabezados renderizados reciben un prefijo por bloque para evitar anclas duplicadas; la fuente descargada no cambia. Las páginas o bloques denegados se excluyen de renderización, copia, foco y narración. Este control del cliente no protege archivos públicos ni impide que el cargador de documentos lea sus fuentes.

## Posicionar títulos y descripciones

Cada ruta de contenido acepta \`layout.title\` y \`layout.description\` independientemente. \`placement\` admite \`outside\` o \`inside\` del contenedor; \`position\` admite \`before\` o \`after\` del contenido. Combina este fragmento de presentación con una ruta existente, conservando sus campos de contenido:

\`\`\`json
${layoutExample}
\`\`\`

En Markdown, el título y la descripción configurados siempre permanecen fuera del documento renderizado; se respeta su posición anterior/posterior. Los encabezados escritos en Markdown siguen perteneciendo al documento. HTML, vídeo, audio y PDF admiten ambas ubicaciones. Estos campos cambian la presentación, no el archivo de origen ni el contenido multimedia. \`titleIsVisible\`, \`descriptionIsVisible\`, alineación y estilos existentes siguen aplicándose. Omite \`layout\` para conservar la presentación actual. Los valores compartidos pueden estar en \`routeDefaults\`; un \`layout\` explícito de la ruta sustituye ese objeto de defaults.

## Compatibilidad y acceso

Los configs sin \`pages\` mantienen su comportamiento de contenedor único o rutas mixtas. El array \`pages\` de la versión sustituye al array raíz; \`[]\` lo vacía. Las definiciones inválidas o referencias inexistentes se ignoran sin impedir que carguen las otras páginas. Las identidades duplicadas de página o bloque conservan la primera entrada válida; un ID de página que coincide con una ruta se ignora para conservar la ruta existente. Corrige esos errores en la configuración en lugar de depender de su omisión.

El campo \`authorization\` de la página protege el destino compuesto, y cada ruta referenciada mantiene sus propios requisitos de acceso. Ocultar un bloque no protege archivos públicos. Markdown y PDF no inventan traducciones cuando falta el archivo del idioma seleccionado; los demás tipos conservan el fallback de la ruta, incluido inglés para vídeo/audio y URLs HTML externas. Prueba todos los bloques e idiomas, navegación directa, rutas protegidas, medios repetidos, errores de descarga y límites del navegador antes de publicar. Muchos embeds o PDFs activos consumen memoria y red; incluye solo lo que necesita el lector.
`,
};
