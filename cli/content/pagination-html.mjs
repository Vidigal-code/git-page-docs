const copy = {
  en: [
    { title: "First HTML file", body: "This is the first page of an independent HTML container.", next: "Use Next page below the container to open the second file." },
    { title: "Second HTML file", body: "This is a different HTML file in the same container.", next: "Use First page or Previous page to return without changing the other containers." },
  ],
  pt: [
    { title: "Primeiro arquivo HTML", body: "Esta é a primeira página de um container HTML independente.", next: "Use Próxima página abaixo do container para abrir o segundo arquivo." },
    { title: "Segundo arquivo HTML", body: "Este é outro arquivo HTML no mesmo container.", next: "Use Primeira página ou Página anterior para voltar sem mudar os outros containers." },
  ],
  es: [
    { title: "Primer archivo HTML", body: "Esta es la primera página de un contenedor HTML independiente.", next: "Usa Página siguiente debajo del contenedor para abrir el segundo archivo." },
    { title: "Segundo archivo HTML", body: "Este es otro archivo HTML en el mismo contenedor.", next: "Usa Primera página o Página anterior para volver sin cambiar los demás contenedores." },
  ],
};

function renderPage(language, content) {
  return `<!doctype html>
<html lang="${language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${content.title}</title>
<style>
:root { color-scheme: light dark; font-family: system-ui, sans-serif; }
body { margin: 0; padding: 2rem; background: Canvas; color: CanvasText; }
main { max-width: 48rem; margin-inline: auto; padding: 1.5rem; border: 1px solid GrayText; border-radius: 1rem; }
h1 { margin-block-start: 0; font-size: clamp(1.5rem, 5vw, 2rem); }
p { line-height: 1.6; overflow-wrap: anywhere; }
</style>
</head>
<body><main><h1>${content.title}</h1><p>${content.body}</p><p>${content.next}</p></main></body>
</html>
`;
}

export const PAGINATION_HTML = {
  paginationFirst: Object.fromEntries(Object.entries(copy).map(([language, pages]) => [language, renderPage(language, pages[0])])),
  paginationSecond: Object.fromEntries(Object.entries(copy).map(([language, pages]) => [language, renderPage(language, pages[1])])),
};
