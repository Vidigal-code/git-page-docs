# Paginated containers

Show several files in one Markdown, HTML, video, audio or PDF container. Add the files to the matching route collection, then reference their IDs in an ordered `pagination.items` array on the container's route. Each container has an independent selection. Use ordered content blocks when one page needs several containers or different content types.

## Site defaults

Configure `site.containerPagination` in `gitpagedocs/config.json`. All four controls are enabled by default: first, previous, next and last. They appear below the content, aligned right, with icons and a current/total counter.

```json
{
  "site": {
    "containerPagination": {
      "enabled": true,
      "alignment": "right",
      "placement": "bottom",
      "display": "icon",
      "showCount": true,
      "controls": {
        "first": true,
        "previous": true,
        "next": true,
        "last": true
      },
      "icons": {
        "first": "FiSkipBack",
        "previous": "FiChevronLeft",
        "next": "FiChevronRight",
        "last": "FiSkipForward"
      },
      "iconSize": "20px",
      "labels": {
        "pages": {
          "en": "Pages",
          "pt": "Páginas",
          "es": "Páginas"
        },
        "first": {
          "en": "First page",
          "pt": "Primeira página",
          "es": "Primera página"
        },
        "previous": {
          "en": "Previous page",
          "pt": "Página anterior",
          "es": "Página anterior"
        },
        "next": {
          "en": "Next page",
          "pt": "Próxima página",
          "es": "Página siguiente"
        },
        "last": {
          "en": "Last page",
          "pt": "Última página",
          "es": "Última página"
        }
      }
    }
  }
}
```

## Per-route files and metadata

Add the following to `routes-md` in the version configuration. Route 1 must already exist. The first item may reference the owner route itself. For HTML, video, audio and PDF, use the same pagination structure inside the corresponding `routes-*` collection.

```json
{
  "id": 51,
  "path": {
    "en": "gitpagedocs/docs/versions/<version>/en/pagination-first.md",
    "pt": "gitpagedocs/docs/versions/<version>/pt/pagination-first.md",
    "es": "gitpagedocs/docs/versions/<version>/es/pagination-first.md"
  },
  "pagination": {
    "items": [
      {
        "routeId": 51,
        "title": {
          "en": "First lesson",
          "pt": "Primeira lição",
          "es": "Primera lección"
        }
      },
      {
        "routeId": 1,
        "title": {
          "en": "Getting started",
          "pt": "Primeiros passos",
          "es": "Primeros pasos"
        },
        "description": {
          "en": "Configure your project",
          "pt": "Configure seu projeto",
          "es": "Configura tu proyecto"
        }
      }
    ]
  }
}
```

| Option | Values and behavior |
| --- | --- |
| `enabled` | Enable or disable pagination; the route overrides the site default. |
| `alignment` | `left`, `center`, `right`; default `right`. |
| `placement` | `top`, `bottom`, `both`; default `bottom`. |
| `display` | `icon` or `text`; default `icon`. |
| `showCount` | Show the current item and total; default `true`. |
| `controls` | Independently enable `first`, `previous`, `next`, `last`. |
| `icons` / `iconSize` | React Icons tags for those actions and a CSS size. Colors follow the active theme. |
| `labels` | Strings or language maps for each action and `pages`; accessible names remain in icon mode. |
| `items` | Ordered entries with an integer `routeId` from the same content type. |
| `items[].title` / `description` | Language maps overriding metadata for that item. Omitted fields use the route metadata. |

Controls, icons and labels merge with site defaults. Endpoint buttons disable when their destination is unavailable. Disabled pagination shows the original route. Unknown or malformed references are reported in the browser console; inaccessible sources are excluded. Pagination does not recursively expand another route's pagination.

## Focus mode, search and media

Markdown containers retain their pagination inside focus mode. Changing a file keeps focus open, updates the title, description and source actions, and returns to the first section. Ctrl+K indexes every available item of a container with a menu destination; selecting a result opens that item inside its owner page. The current selection is kept while navigating the loaded documentation and resets on a language/version change or reload.

The selected route keeps the existing metadata layout options. Markdown title and description remain outside its rendered Markdown. Media changes replace the previous player, preserving the site's exclusive-playback behavior. Normal footer navigation is separate: `site.documentNavigation.position` still defaults to `center`.

## Included validation example

Open Guides > Read and explore > Paginated containers example (page 50). It contains a three-file Markdown sequence, two HTML files, MP4/WebM versions of the public MDN flower clip, two local two-second WAV tones and two different English PDFs. The video requires internet access. The other sample files ship with the documentation. Change each container independently, try Ctrl+K, then open the Markdown sequence in focus mode.

> Version: 0.0.16
