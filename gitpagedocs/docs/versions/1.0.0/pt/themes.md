# Temas e layouts

Os temas sao definidos por templates JSON e carregados dinamicamente.

## Onde os temas ficam

- Catalogo principal: `public/layouts/layoutsConfig.json`
- Templates principais: `public/layouts/templates/*.json`
- Catalogo fallback: `gitpagedocs/layouts/layoutsConfig.json`
- Templates fallback: `gitpagedocs/layouts/templates/*.json`

## Estrutura do tema

Cada tema controla:

- Cores (`background`, `primary`, `secondary`, `text`, etc.)
- Tipografia
- Estilo de componentes (`header`, `card`, `button`, `select`)
- Efeitos opcionais (`animations`)

## Suporte claro/escuro

- Quando `supportsLightAndDarkModes: true`, o toggle de modo aparece.
- O pareamento claro/escuro usa `supportsLightAndDarkModesReference`.
