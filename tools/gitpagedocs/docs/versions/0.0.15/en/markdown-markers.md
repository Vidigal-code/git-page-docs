# Markdown markers

A marker highlights a text phrase or an HTML element inside rendered Markdown and adds a clickable entry to the document index. Clicking the entry scrolls to that highlighted target. Highlighting and navigation always work together; there are no separate highlight-only or index-only modes.

## Keep the heading outline

`RouteguideBrand` enables the existing heading outline. `RouteGuideSpeciFicbrand` remains a list of heading IDs to include: an empty array includes every heading. Markers are configured separately in `routes-md[].markdownMarkers`; they do not change that filter. Marker entries can appear even when `RouteguideBrand: false`. The index follows document order and reuses an existing target ID when available.

## Site defaults

Set shared enablement and colors in `gitpagedocs/config.json`:

```json
{
  "site": {
    "markdownMarkers": {
      "enabled": true,
      "style": {
        "background": "color-mix(in srgb, var(--primary) 24%, transparent)",
        "color": "var(--text)",
        "outlineColor": "var(--primary)"
      }
    }
  }
}
```

A route's `enabled` overrides the site default. Set `markdownMarkers.enabled: false` on a route to disable its markers, or `enabled: false` on an individual item to skip only that marker. Disabling markers does not disable the existing heading outline.

## Route example

Merge these fields into an existing Markdown route in the version configuration. The first target exists in the bundled pagination example; add a table to your Markdown before enabling the second target.

```json
{
  "id": 51,
  "RouteguideBrand": true,
  "RouteGuideSpeciFicbrand": [],
  "markdownMarkers": {
    "enabled": true,
    "items": [
      {
        "id": "reading-target",
        "text": {
          "en": "This highlighted sentence is a navigation target.",
          "pt": "Esta frase realçada é um destino de navegação.",
          "es": "Esta frase resaltada es un destino de navegación."
        },
        "label": {
          "en": "Important detail",
          "pt": "Detalhe importante",
          "es": "Detalle importante"
        }
      },
      {
        "id": "second-cell",
        "selector": "td",
        "occurrence": 2,
        "label": {
          "en": "Second table cell",
          "pt": "Segunda célula da tabela",
          "es": "Segunda celda de la tabla"
        },
        "style": {
          "outlineColor": "var(--secondary)"
        }
      }
    ]
  }
}
```

| Field | Behavior |
| --- | --- |
| `id` | Required nonempty string, unique within the route's marker list. |
| `text` | An exact, case-sensitive phrase in visible Markdown text. It can span inline formatting; whitespace and Unicode normalization are handled without changing the displayed text. |
| `selector` | A CSS selector for an element inside this Markdown document, such as `blockquote`, `td` or `#example`. |
| `occurrence` | Which match to use, counting from `1`; defaults to the first. Useful for repeated phrases or elements. |
| `label` | Index text; omitted or unavailable labels fall back to the marker ID. |
| `style` | Optional `background`, `color` and `outlineColor` CSS colors. |

Provide exactly one of `text` and `selector`. Text, selectors and labels accept a string or a language map; the current language is used first, then English. CSS selectors only search the current Markdown fragment, not the surrounding application. Hidden and executable content is excluded.

## Theme colors, repeated content and diagnostics

Styles merge in this order: site defaults, route options, then the marker. Theme variables such as `var(--primary)`, `var(--secondary)` and `var(--text)` follow the active light or dark palette. These fields accept colors, not arbitrary stylesheets or image URLs. Each valid marker always receives a visible theme-based highlight, even without a custom style.

Content blocks keep marker and heading targets unique for each Markdown instance. Copy/download actions preserve the original Markdown source. Invalid selectors, duplicate IDs, invalid occurrences and missing targets are reported in the browser console and do not add dead index links. Invalid colors are reported and the normal styling remains available.

Open Guides > Read and explore > Paginated containers example, then choose the highlighted index entry in its first Markdown file. Use the same approach for paragraphs, list items, quotations, tables and code elements.

> Version: 0.0.15
