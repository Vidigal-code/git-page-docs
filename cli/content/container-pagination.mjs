import { getDefaultSiteConfig } from "../data/default-site-config.mjs";

const defaults = JSON.stringify({ site: { containerPagination: getDefaultSiteConfig("").containerPagination } }, null, 2);
const route = JSON.stringify({
  id: 51,
  path: { en: "gitpagedocs/docs/versions/<version>/en/pagination-first.md", pt: "gitpagedocs/docs/versions/<version>/pt/pagination-first.md", es: "gitpagedocs/docs/versions/<version>/es/pagination-first.md" },
  pagination: { items: [
    { routeId: 51, title: { en: "First lesson", pt: "Primeira lição", es: "Primera lección" } },
    { routeId: 1, title: { en: "Getting started", pt: "Primeiros passos", es: "Primeros pasos" }, description: { en: "Configure your project", pt: "Configure seu projeto", es: "Configura tu proyecto" } },
  ] },
}, null, 2);

export const PAGINATION_DOCS = {
  en: `# Paginated containers

Show several files in one Markdown, HTML, video, audio or PDF container. Add the files to the matching route collection, then reference their IDs in an ordered \`pagination.items\` array on the container's route. Each container has an independent selection. Use ordered content blocks when one page needs several containers or different content types.

## Site defaults

Configure \`site.containerPagination\` in \`gitpagedocs/config.json\`. All four controls are enabled by default: first, previous, next and last. They appear below the content, aligned right, with icons and a current/total counter.

\`\`\`json
${defaults}
\`\`\`

## Per-route files and metadata

Add the following to \`routes-md\` in the version configuration. Route 1 must already exist. The first item may reference the owner route itself. For HTML, video, audio and PDF, use the same pagination structure inside the corresponding \`routes-*\` collection.

\`\`\`json
${route}
\`\`\`

| Option | Values and behavior |
| --- | --- |
| \`enabled\` | Enable or disable pagination; the route overrides the site default. |
| \`alignment\` | \`left\`, \`center\`, \`right\`; default \`right\`. |
| \`placement\` | \`top\`, \`bottom\`, \`both\`; default \`bottom\`. |
| \`display\` | \`icon\` or \`text\`; default \`icon\`. |
| \`showCount\` | Show the current item and total; default \`true\`. |
| \`controls\` | Independently enable \`first\`, \`previous\`, \`next\`, \`last\`. |
| \`icons\` / \`iconSize\` | React Icons tags for those actions and a CSS size. Colors follow the active theme. |
| \`labels\` | Strings or language maps for each action and \`pages\`; accessible names remain in icon mode. |
| \`items\` | Ordered entries with an integer \`routeId\` from the same content type. |
| \`items[].title\` / \`description\` | Language maps overriding metadata for that item. Omitted fields use the route metadata. |

Controls, icons and labels merge with site defaults. Endpoint buttons disable when their destination is unavailable. Disabled pagination shows the original route. Unknown or malformed references are reported in the browser console; inaccessible sources are excluded. Pagination does not recursively expand another route's pagination.

## Focus mode, search and media

Markdown containers retain their pagination inside focus mode. Changing a file keeps focus open, updates the title, description and source actions, and returns to the first section. Ctrl+K indexes every available item of a container with a menu destination; selecting a result opens that item inside its owner page. The current selection is kept while navigating the loaded documentation and resets on a language/version change or reload.

The selected route keeps the existing metadata layout options. Markdown title and description remain outside its rendered Markdown. Media changes replace the previous player, preserving the site's exclusive-playback behavior. Normal footer navigation is separate: \`site.documentNavigation.position\` still defaults to \`center\`.

## Included validation example

Open Guides > Read and explore > Paginated containers example (page 50). It contains a three-file Markdown sequence, two HTML files, MP4/WebM versions of the public MDN flower clip, two local two-second WAV tones and two different English PDFs. The video requires internet access. The other sample files ship with the documentation. Change each container independently, try Ctrl+K, then open the Markdown sequence in focus mode.
`,
  pt: `# Containers paginados

Mostre vários arquivos em um único container Markdown, HTML, vídeo, áudio ou PDF. Cadastre os arquivos na coleção de rotas correspondente e informe os IDs, na ordem desejada, em \`pagination.items\` na rota do container. Cada container mantém sua própria seleção. Use blocos de conteúdo ordenados para combinar vários containers e tipos em uma página.

## Padrões do site

Configure \`site.containerPagination\` em \`gitpagedocs/config.json\`. Os quatro controles ficam ativos por padrão: primeira página, anterior, próxima e última. Aparecem abaixo do conteúdo, à direita, com ícones e contador de página atual/total.

\`\`\`json
${defaults}
\`\`\`

## Arquivos e metadados por rota

Adicione este exemplo a \`routes-md\` na configuração da versão. A rota 1 já deve existir. O primeiro item pode apontar para a própria rota. HTML, vídeo, áudio e PDF utilizam a mesma estrutura na coleção \`routes-*\` correspondente.

\`\`\`json
${route}
\`\`\`

| Opção | Valores e comportamento |
| --- | --- |
| \`enabled\` | Ativa ou desativa; a rota tem prioridade sobre o padrão do site. |
| \`alignment\` | \`left\`, \`center\` ou \`right\`; padrão \`right\`. |
| \`placement\` | \`top\`, \`bottom\` ou \`both\`; padrão \`bottom\`. |
| \`display\` | \`icon\` ou \`text\`; padrão \`icon\`. |
| \`showCount\` | Exibe página atual e total; padrão \`true\`. |
| \`controls\` | Ativa individualmente \`first\`, \`previous\`, \`next\` e \`last\`. |
| \`icons\` / \`iconSize\` | Tags do React Icons e tamanho CSS; cores acompanham o tema. |
| \`labels\` | Texto ou mapa de idiomas para as ações e \`pages\`; nomes acessíveis permanecem no modo ícone. |
| \`items\` | Lista ordenada com \`routeId\` inteiro do mesmo tipo de conteúdo. |
| \`items[].title\` / \`description\` | Mapas de idiomas que substituem os metadados do item; campos omitidos usam os metadados da rota. |

Controles, ícones e rótulos complementam os padrões globais. Botões sem destino disponível ficam desabilitados. Desativar a paginação mostra a rota original. Referências inválidas são informadas no console; fontes sem autorização são excluídas. A paginação de outra rota não é expandida recursivamente.

## Foco, busca e mídia

A paginação Markdown aparece no modo foco. Trocar de arquivo mantém o foco aberto, atualiza título, descrição e ações de origem, e retorna à primeira seção. O Ctrl+K inclui os itens disponíveis de containers com destino no menu; o resultado abre o item na página proprietária. A seleção é mantida durante a navegação na documentação carregada e reiniciada ao mudar idioma, versão ou recarregar.

O arquivo selecionado utiliza as opções existentes de disposição dos metadados. Título e descrição do Markdown permanecem fora do Markdown renderizado. A troca de mídia substitui o player anterior e preserva a reprodução exclusiva. A navegação geral do rodapé é independente: \`site.documentNavigation.position\` continua com padrão \`center\`.

## Exemplo para validar

Abra Guias > Leia e explore > Exemplo de containers paginados (página 50). Há três arquivos Markdown, dois HTML, versões MP4/WebM do vídeo público de flores da MDN, dois tons WAV locais de dois segundos e dois PDFs diferentes em inglês. O vídeo precisa de internet; os demais arquivos acompanham a documentação. Navegue em cada container, teste o Ctrl+K e abra a sequência Markdown no modo foco.
`,
  es: `# Contenedores paginados

Muestra varios archivos en un único contenedor Markdown, HTML, vídeo, audio o PDF. Registra los archivos en la colección de rutas correspondiente y añade sus IDs, en orden, a \`pagination.items\` en la ruta del contenedor. Cada contenedor conserva su propia selección. Usa bloques de contenido ordenados para combinar varios contenedores y tipos en una página.

## Valores del sitio

Configura \`site.containerPagination\` en \`gitpagedocs/config.json\`. Los cuatro controles están activos: primera página, anterior, siguiente y última. Aparecen debajo del contenido, a la derecha, con iconos y contador de página actual/total.

\`\`\`json
${defaults}
\`\`\`

## Archivos y metadatos por ruta

Añade este ejemplo a \`routes-md\` en la configuración de la versión. La ruta 1 debe existir. El primer elemento puede apuntar a la propia ruta. HTML, vídeo, audio y PDF usan la misma estructura en la colección \`routes-*\` correspondiente.

\`\`\`json
${route}
\`\`\`

| Opción | Valores y comportamiento |
| --- | --- |
| \`enabled\` | Activa o desactiva; la ruta tiene prioridad sobre el sitio. |
| \`alignment\` | \`left\`, \`center\` o \`right\`; predeterminado \`right\`. |
| \`placement\` | \`top\`, \`bottom\` o \`both\`; predeterminado \`bottom\`. |
| \`display\` | \`icon\` o \`text\`; predeterminado \`icon\`. |
| \`showCount\` | Muestra la página actual y el total; predeterminado \`true\`. |
| \`controls\` | Activa individualmente \`first\`, \`previous\`, \`next\` y \`last\`. |
| \`icons\` / \`iconSize\` | Tags de React Icons y tamaño CSS; colores del tema activo. |
| \`labels\` | Texto o mapas de idiomas para acciones y \`pages\`; conserva nombres accesibles con iconos. |
| \`items\` | Lista ordenada con \`routeId\` entero del mismo tipo de contenido. |
| \`items[].title\` / \`description\` | Mapas de idiomas que sustituyen los metadatos; los campos omitidos usan los de la ruta. |

Controles, iconos y etiquetas complementan los valores globales. Los botones sin destino disponible se deshabilitan. Desactivar la paginación muestra la ruta original. Las referencias inválidas se notifican en la consola; las fuentes sin autorización se excluyen. No se expande recursivamente la paginación de otra ruta.

## Enfoque, búsqueda y medios

La paginación Markdown aparece en el modo enfoque. Cambiar el archivo mantiene el enfoque abierto, actualiza título, descripción y acciones del archivo, y vuelve a la primera sección. Ctrl+K incluye los elementos disponibles de contenedores con un destino en el menú; abre el elemento dentro de su página. La selección se conserva durante la navegación y se reinicia al cambiar idioma, versión o recargar.

El archivo seleccionado utiliza la disposición de metadatos existente. Título y descripción de Markdown permanecen fuera del Markdown renderizado. Cambiar de medio sustituye el reproductor anterior y conserva la reproducción exclusiva. La navegación general es independiente: \`site.documentNavigation.position\` mantiene \`center\` como valor predeterminado.

## Ejemplo de validación

Abre Guías > Lee y explora > Ejemplo de contenedores paginados (página 50). Incluye tres archivos Markdown, dos HTML, MP4/WebM del vídeo público de flores de MDN, dos tonos WAV locales de dos segundos y dos PDF diferentes en inglés. El vídeo requiere internet; los demás archivos vienen con la documentación. Navega en cada contenedor, prueba Ctrl+K y abre la secuencia Markdown en modo enfoque.
`,
};

export const PAGINATION_FIRST_DOCS = {
  en: "# Try container pagination\n\nThis highlighted sentence is a navigation target.\n\nUse the index to scroll to the highlight. The four buttons below this container move to the first, previous, next or last file.\n\n## Keep reading in focus mode\n\nOpen focus mode and change the container page. The overlay remains open and starts the selected file at its first section. Use Ctrl+K to find Lesson 2 or Lesson 3 directly.",
  pt: "# Experimente a paginação\n\nEsta frase realçada é um destino de navegação.\n\nUse o índice para rolar até o destaque. Os quatro botões abaixo do container levam ao primeiro, anterior, próximo ou último arquivo.\n\n## Continue no modo foco\n\nAbra o modo foco e mude a página do container. A janela permanece aberta e inicia o arquivo selecionado na primeira seção. Use Ctrl+K para encontrar a Lição 2 ou a Lição 3 diretamente.",
  es: "# Prueba la paginación\n\nEsta frase resaltada es un destino de navegación.\n\nUsa el índice para desplazarte al resaltado. Los cuatro botones debajo del contenedor llevan al primer archivo, al anterior, al siguiente o al último.\n\n## Continúa en modo enfoque\n\nAbre el modo enfoque y cambia la página del contenedor. La ventana permanece abierta y comienza el archivo seleccionado en su primera sección. Usa Ctrl+K para encontrar la Lección 2 o la Lección 3 directamente.",
};
