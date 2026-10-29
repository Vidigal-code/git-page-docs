# Ordered content blocks

A page can contain several Markdown documents, HTML players, videos, audio tracks and PDFs in any order. Add a top-level `pages` array to the version configuration. Each block references a route already defined in the corresponding `routes-md`, `routes-html`, `routes-video`, `routes-audio` or `routes-pdf` list. The page has one URL; blocks do not create separate navigation destinations.

## Complete repeated-block example

The scaffold's page 39 combines three Markdown blocks, two HTML blocks, two videos, two audio tracks and three PDFs. It references the included routes 1, 2, 30, 29, 11, 12 and 23. Merge the following object into `gitpagedocs/docs/versions/0.0.10/config.json` or the current version's config; retain those route definitions and their files. The same example is included in the new scaffold.

```json
{
  "pages": [
    {
      "id": 39,
      "blocks": [
        {
          "id": "getting-started",
          "type": "md",
          "routeId": 1
        },
        {
          "id": "project-overview",
          "type": "md",
          "routeId": 2
        },
        {
          "id": "html-guide",
          "type": "md",
          "routeId": 30
        },
        {
          "id": "doom-first",
          "type": "html",
          "routeId": 29
        },
        {
          "id": "doom-second",
          "type": "html",
          "routeId": 29
        },
        {
          "id": "video-first",
          "type": "video",
          "routeId": 11
        },
        {
          "id": "video-second",
          "type": "video",
          "routeId": 11
        },
        {
          "id": "audio-first",
          "type": "audio",
          "routeId": 12
        },
        {
          "id": "audio-second",
          "type": "audio",
          "routeId": 12
        },
        {
          "id": "pdf-first",
          "type": "pdf",
          "routeId": 23
        },
        {
          "id": "pdf-second",
          "type": "pdf",
          "routeId": 23
        },
        {
          "id": "pdf-third",
          "type": "pdf",
          "routeId": 23
        }
      ]
    }
  ]
}
```

Add a menu destination with `"path-click": "page:39"` in each language. The bundled entry is under Guides → Read and explore → Multiple content blocks. Its label is independent of the labels of the individual blocks.

## Ordering, repetition and individual settings

- `pages[].id` is an integer page identity. Use a new ID that does not collide with an existing route ID.
- `blocks[].id` is a nonempty string, unique within its page. Two instances may use the same `routeId`, but need different block IDs.
- `type` is exactly `md`, `html`, `video`, `audio` or `pdf`; `routeId` selects a route from that type's list.
- Array order is display order. Move a block object to reorder it, remove it to hide that instance, or copy it with a new block ID to repeat it. `hierarchyPage` still applies to legacy pages and does not reorder this array.

Each reference uses its route's source, translation, visibility, sizing, PDF actions, media controls and authorization. To give two occurrences of the same file different options, define two routes with distinct IDs and the same source path, then reference those IDs. Do not put a second copy of route parameters inside a block.

A Markdown block renders only that Markdown document; inline legacy audio attached to its route does not become an extra block. Refer to an audio route explicitly when it belongs in the sequence. Blocks select fixed routes and do not share a `browseAll` index. Media exclusivity and browser restrictions still apply; repeating a player does not start playback automatically.

Focus mode and narration read the authorized Markdown blocks available in the selected language, in array order, including repetitions. Focus copy/download joins their original sources with two newline characters and uses `page-39.md` for this example. Each visible Markdown container keeps its individual copy/download actions and original filename. Rendered heading IDs are namespaced per block to avoid duplicate anchors; the downloaded source is unchanged. Denied pages or blocks are excluded from rendering, copy, focus and narration. This client-side gate does not protect public assets or prevent the document loader from reading their sources.

## Position titles and descriptions

Every content route accepts `layout.title` and `layout.description` independently. `placement` is `outside` or `inside` the content container; `position` is `before` or `after` the content. Merge this presentation fragment into an existing route, preserving its content fields:

```json
{
  "id": 23,
  "layout": {
    "title": {
      "placement": "outside",
      "position": "before"
    },
    "description": {
      "placement": "inside",
      "position": "after"
    }
  }
}
```

For Markdown, configured title and description always remain outside the rendered document; before/after positioning is honored. Headings authored inside the Markdown remain part of that document. HTML, video, audio and PDF accept both placements. These fields change presentation, not the source file or media contents. Existing `titleIsVisible`, `descriptionIsVisible`, alignment and styling options continue to apply. Omit `layout` to preserve the existing presentation. Shared values may live in `routeDefaults`; an explicit route-level `layout` replaces that defaults object.

## Compatibility and access

Configs without `pages` keep their existing single-container or mixed-route behavior. A version-level `pages` array overrides the root array; `[]` clears it. Invalid definitions or unresolved references are ignored without preventing other pages from loading. Duplicate page or block identities keep the first valid entry, and a page ID colliding with a route is ignored so the existing route remains available. Review these mistakes in your configuration rather than relying on omission.

Page-level `authorization` protects the composed destination, and each referenced route retains its own access requirements. Hiding a block does not protect publicly hosted files. Markdown and PDF do not invent a translation when their selected-language file is absent; other types retain their existing route fallback behavior, including English fallback for video/audio and external HTML URLs. Test every block and language, direct page navigation, restricted routes, repeated media, download errors and browser resource limits before publishing. Large numbers of active embeds or PDFs consume memory and network bandwidth; include only what readers need.

> Version: 0.0.17
