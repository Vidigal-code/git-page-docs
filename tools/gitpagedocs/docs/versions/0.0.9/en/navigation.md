# Navigation and nested menus

Routes define page content; menus define how readers reach it. Configure them in `gitpagedocs/docs/versions/<version>/config.json`. Site-wide presentation options belong to `gitpagedocs/config.json`.

```json
{
  "site": {
    "nestedMenusEnabled": true,
    "RouteGuide": true
  }
}
```

## Build a menu tree

Each `menus-header-md` entry has an `id` and localized `pt`, `en`, `es` objects with `title` and optional `path-click`. Add `submenus` containing more entries to nest the tree. A language object may also contain localized `submenus` with the same title/path structure. Use one form consistently to avoid listing the same child twice.

Groups without `path-click` organize children. For a Markdown destination, use its actual localized path from `routes-md[].path`. The `page:<id>` alias is registered by source-viewer, video, audio and PDF routes; do not use it for a Markdown-only page. The example below uses version `0.0.8`: replace that segment with the version you are editing and create the three chapter files.

```json
{
  "routeDefaults": {
    "RouteGuide": false
  },
  "routes-md": [
    {
      "id": 101,
      "RouteGuide": true,
      "path": {
        "pt": "gitpagedocs/docs/versions/0.0.8/pt/chapter.md",
        "en": "gitpagedocs/docs/versions/0.0.8/en/chapter.md",
        "es": "gitpagedocs/docs/versions/0.0.8/es/chapter.md"
      }
    }
  ],
  "menus-header-md": [
    {
      "id": 900,
      "pt": {
        "title": "Guia"
      },
      "en": {
        "title": "Guide"
      },
      "es": {
        "title": "Guía"
      },
      "submenus": [
        {
          "id": 901,
          "pt": {
            "title": "Capítulos"
          },
          "en": {
            "title": "Chapters"
          },
          "es": {
            "title": "Capítulos"
          },
          "submenus": [
            {
              "id": 101,
              "pt": {
                "title": "Primeiro capítulo",
                "path-click": "gitpagedocs/docs/versions/0.0.8/pt/chapter.md"
              },
              "en": {
                "title": "First chapter",
                "path-click": "gitpagedocs/docs/versions/0.0.8/en/chapter.md"
              },
              "es": {
                "title": "Primer capítulo",
                "path-click": "gitpagedocs/docs/versions/0.0.8/es/chapter.md"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## Nesting behavior

`site.nestedMenusEnabled: true` renders expandable recursive menus. You may add another `submenus` array at any node: there is no fixed application depth limit. The configuration must remain finite and practical for browser memory and usability. Setting it to `false` displays destinations as a flat list; it does not remove nested pages.

The tree supplies sidebar navigation, search labels, parent expansion and breadcrumb trails. Keep IDs stable and unambiguous; nodes pointing at a protected page follow its authorization rules. Apply the same structure to `menus-header-source-viewer`, `menus-header-html`, `menus-header-video` , `menus-header-audio` and `menus-header-pdf`. `hierarchyMenu` orders the type sections; `hierarchyPage` orders content containers that share a page ID.

## Breadcrumbs: RouteGuide

`RouteGuide` controls the breadcrumb trail. Resolution order is the page's `routes-md[].RouteGuide`, then the version's `routeDefaults.RouteGuide`, then `site.RouteGuide`, with `true` as the fallback. The example disables breadcrumbs for the version and enables them for chapter 101. Existing version `0.0.8` files can use the same fields.

`RouteguideBrand` and `RouteguideBrandPosition` are separate settings for the document's heading outline/table of contents; they do not control breadcrumbs.

## URLs and previous/next

Versioned URLs use `/v/<version>/`; `?lang=pt` selects a language and `?id=101` selects a page ID. `?name=chapter` selects the document slug. Keep `VersionControl.versions[].path` pointing at the matching version config. `site.ActiveNavigation` enables ordinary previous/next page controls; focus-mode document navigation has its own option. See Focus mode for its section and document controls.

Test a new menu from the sidebar, by direct URL and in each enabled language; verify the destination exists and is allowed for the current reader.

> Version: 0.0.9
