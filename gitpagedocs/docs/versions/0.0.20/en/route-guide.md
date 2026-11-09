# Configure the document guide

The document guide is the outline of the current Markdown document. It is separate from the site menu, breadcrumbs and the introductory GitPageDocs guide. Configure it on the corresponding item in `routes-md` inside the version configuration.

On desktop screens wider than 1024 CSS pixels, the side guide ends after its last entry instead of stretching to the article height. Since 0.0.25, it can grow to the available viewport height below the header before its entries need internal scrolling. This side layout takes precedence over `TocScrollMaxHeightDesktop`; centered guides above the content and layouts at 1024 pixels and below retain their previous sizing rules. A small bar in the active entry's theme color follows the section marked while scrolling. The indicator uses the existing section tracking without continuous animation.

## Select the indexed elements

Starting with 0.0.21, `RouteGuideTags` chooses which HTML element types become automatic guide entries after Markdown is rendered. This site explicitly uses `h1`, `h2` and `h3` to keep long reference pages navigable. The original spelling and capitalization of each JSON field matter.

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

Merge these options into an existing Markdown route, preserving its `path`, title and translated descriptions. The fragment alone does not define document sources.

| Setting | Effect |
| --- | --- |
| `RouteguideBrand: true` | Enables automatic document-guide entries. |
| `RouteguideBrand: false` | Disables automatic entries without removing content or explicit markers. |
| `RouteGuideTags: ["h1", "h2", "h3"]` | Indexes those heading levels automatically. |
| Omitted `RouteGuideTags` | Preserves the legacy `h1` through `h6` behavior. |
| `RouteGuideTags: []` | Disables automatic indexing; explicit Markdown markers remain available. |
| `RouteGuideSpeciFicbrand` | Filters eligible automatic entries by element ID. An empty list does not narrow them. |
| `RouteguideBrandPosition` | Aligns the guide content: `left`, `center` or `right`. |
| `RouteguideBrandContainerTop` | Places the guide above the document when true; false allows the beside-content layout on wider screens. |

## Use semantic headings first

Write one `#` title and use `##` and `###` for the main sections and subsections. Heading levels express the document hierarchy; do not select them only to change font sizes. With the default shown above, fourth-level and deeper headings still render in the document but do not add automatic guide entries.

The option accepts safe HTML tags supported by the Markdown sanitizer. For example, selecting `p` can index paragraphs; adding it to a long reference can make the outline much larger. A tag selection does not allow scripts, embeds or other removed HTML to survive sanitization. Use explicit tag names; there is no wildcard configuration.

## Filter by an element ID

`RouteGuideTags` selects element types. `RouteGuideSpeciFicbrand` selects IDs among eligible entries; it does not independently enable a tag excluded by `RouteGuideTags`. Check the rendered ID or copy the element link before adding it. Heading text, accents and duplicate headings can affect generated IDs. Translations can have different IDs, so test every enabled language.

```json
{
  "RouteGuideTags": ["h2"],
  "RouteGuideSpeciFicbrand": ["select-the-indexed-elements", "use-semantic-headings-first"]
}
```

This example refers to two headings in the English version of this page. Do not paste the same IDs into an unrelated document and expect entries to appear.

## Keep deliberate Markdown markers

Use the explicit `markdownMarkers` feature when an important sentence or element needs a named destination without changing the document's heading hierarchy. See [Markdown markers](markdown-markers.md) for matching rules and style configuration. Selecting `[]` for automatic tags does not erase those markers; `RouteguideBrand` enables or disables automatic indexing; explicit markers remain available when it is false.

## Distinguish three navigation layers

- The menu selects documents and categories through localized `path-click` and `submenus`.
- `RouteGuide` controls breadcrumb navigation and inherits through site, version defaults and route configuration.
- `RouteguideBrand` and `RouteGuideTags` control this document's automatic outline entries.

For a narrow viewport, begin with three heading levels, concise headings and left-aligned guide text. See [Narrow and foldable screens](responsive-layout.md) for a practical configuration and verification sequence.

## Labels, empty elements and stable destinations

For an indexed element, the guide chooses its label from `title`, then `alt`, then normalized visible text. Long text is limited to 96 characters followed by an ellipsis, so indexing a paragraph does not copy an entire section into the guide. An explicit Markdown marker keeps its configured label when it targets the same element.

Textless `br`, `hr`, `img` and `input` elements use the tag name when no better label is available. Empty containers are ignored. Only the Markdown sanitizer's safe tag set is eligible; adding a tag to the list never allows unsafe HTML through.

The renderer resolves duplicate IDs so guide destinations stay distinguishable. IDs are document destinations, not menu page IDs. Recheck an ID filter after changing repeated headings, custom HTML or document structure. Clicking a target inside collapsed `details` opens its containing disclosure elements so the destination can be seen.

## Verify the result

Open the page in each language; compare entries with the visible headings, click the first and last entries, and check keyboard focus. Try the route with an explicit tag list, an omitted list and an empty list with a marker. Then resize the viewport while keeping the same document open. A missing entry should lead you to its tag, ID, marker rule and route switch before changing the Markdown renderer.


## Index other Markdown elements

Use the HTML tag produced by Markdown: `p` for paragraphs, `li` for list items, `blockquote` for quotations, `pre` for fenced blocks, `table` for tables and `img` for images. For example:

```json
{ "RouteGuideTags": ["h1", "h2", "h3", "p", "li", "blockquote", "pre", "table", "img"] }
```

Selecting both a container and its children can create several entries for the same passage. Prefer the few element types that help readers navigate. Tags are trimmed, matched case-insensitively and deduplicated. Unsupported tags are skipped and reported in the browser console. A value that is not an array is reported and falls back to the legacy heading levels; correct the configuration instead of relying on that fallback.

> Version: 0.0.20
