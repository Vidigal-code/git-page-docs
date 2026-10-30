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

## Introduction guide

The `/introduction-guide` route is available in repository-search builds. Its chapter tour follows native page scrolling. Starting with viewer version 0.0.16, stopping at a chapter transition keeps the text readable without adjacent chapters overlapping. Parallax effects, reduced-motion preferences and the stacked layout for short landscape viewports remain supported.

Viewer version 0.0.18 advances or returns one chapter per wheel/trackpad gesture, keyboard step or vertical swipe. Chapter changes and chapter-rail selections are immediate, so text does not stop between scenes. Back to top also jumps immediately and focuses the hero. Short landscape viewports retain the stacked reading layout.

One play/pause button in the header controls the guide effects and the selected theme's animated background together, including the fallback backdrop for legacy themes. Effects start enabled; pausing preserves the current chapter and content. The operating system's reduced-motion preference always takes precedence; the disabled control explains when the system has reduced animations. The title is visible from the first render without animated blur or per-character stagger; optional parallax uses small offsets and section reveals are brief. The controls do not alter existing theme palettes.

Expanding video, audio or HTML preserves the selected file and the same player or iframe instance when opening and closing. The viewer requests native fullscreen when available; Escape or browser controls close it and synchronize the URL. If fullscreen is unavailable or denied, the same content expands inside the page without a modal, with a close button and Escape handling within the expanded region. Markdown and PDF keep their existing viewing behavior.

## Build a menu tree

Each `menus-header-md` entry has an `id` and localized `pt`, `en`, `es` objects with `title` and optional `path-click`. Add `submenus` containing more entries to nest the tree. A language object may also contain localized `submenus` with the same title/path structure. Use one form consistently to avoid listing the same child twice.

Groups without `path-click` organize children. For a Markdown route destination, use its actual localized path from `routes-md[].path`. Source-viewer, video, audio, PDF and explicitly composed `pages` register `page:<id>`; a plain Markdown route uses its file path. The example below uses version `0.0.8`: replace that segment with the version you are editing and create the three chapter files.

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

A parent can be both a document and a group. Keep its localized `path-click` together with `submenus`: the title opens its Markdown page, while the separate arrow expands or collapses children. The scaffold includes useful overviews for all eight parent groups. Breadcrumb ancestors link to those documents; the current destination remains the current breadcrumb. A group without a path can still organize children, but has no destination to open.

The following excerpt uses the scaffold's existing Markdown routes 31, 32 and 13. Merge it into `menus-header-md` and retain the matching `routes-md` definitions and files:

```json
{
  "id": 1000,
  "en": {
    "title": "Guides",
    "path-click": "gitpagedocs/docs/versions/0.0.17/en/guides.md"
  },
  "pt": {
    "title": "Guias",
    "path-click": "gitpagedocs/docs/versions/0.0.17/pt/guides.md"
  },
  "es": {
    "title": "Guías",
    "path-click": "gitpagedocs/docs/versions/0.0.17/es/guides.md"
  },
  "submenus": [
    {
      "id": 1001,
      "en": {
        "title": "Configure your site",
        "path-click": "gitpagedocs/docs/versions/0.0.17/en/configure-your-site.md"
      },
      "pt": {
        "title": "Configure seu site",
        "path-click": "gitpagedocs/docs/versions/0.0.17/pt/configure-your-site.md"
      },
      "es": {
        "title": "Configura tu sitio",
        "path-click": "gitpagedocs/docs/versions/0.0.17/es/configure-your-site.md"
      },
      "submenus": [
        {
          "id": 13,
          "en": {
            "title": "Configuration",
            "path-click": "gitpagedocs/docs/versions/0.0.17/en/configuration.md"
          },
          "pt": {
            "title": "Configuração",
            "path-click": "gitpagedocs/docs/versions/0.0.17/pt/configuration.md"
          },
          "es": {
            "title": "Configuración",
            "path-click": "gitpagedocs/docs/versions/0.0.17/es/configuration.md"
          }
        }
      ]
    }
  ]
}
```

`site.nestedMenusEnabled: true` renders expandable recursive menus. You may add another `submenus` array at any node: there is no fixed application depth limit. The configuration must remain finite and practical for browser memory and usability. Setting it to `false` displays destinations as a flat list; it does not remove nested pages.

The tree supplies sidebar navigation, search labels, parent expansion and breadcrumb trails. Keep IDs stable and unambiguous; nodes pointing at a protected page follow its authorization rules. Apply the same structure to `menus-header-source-viewer`, `menus-header-html`, `menus-header-video` , `menus-header-audio` and `menus-header-pdf`. `hierarchyMenu` orders the type sections; `hierarchyPage` orders content containers that share a page ID.

## Breadcrumbs: RouteGuide

The breadcrumb trail has 12 px of spacing above and below it, separating the navigation path from the surrounding content.

`RouteGuide` controls the breadcrumb trail. Resolution order is the page's `routes-md[].RouteGuide`, then the version's `routeDefaults.RouteGuide`, then `site.RouteGuide`, with `true` as the fallback. The example disables breadcrumbs for the version and enables them for chapter 101. Existing version `0.0.8` files can use the same fields.

`RouteguideBrand` and `RouteguideBrandPosition` are separate settings for the document's heading outline/table of contents; they do not control breadcrumbs.

## URLs and previous/next

Versioned URLs use `/v/<version>/`; `?lang=pt` selects a language and `?id=101` selects a page ID. `?name=chapter` selects the document slug. Keep `VersionControl.versions[].path` pointing at the matching version config. `site.ActiveNavigation` enables quick navigation and its Ctrl+K shortcut. Footer previous/next controls follow available menu destinations; focus-mode document navigation has its own option. See Focus mode for its section and document controls.

Footer previous/next buttons use `site.icons.DocumentPrevious` (`LuChevronLeft`) and `site.icons.DocumentNext` (`LuChevronRight`) by default. Set `reactIcon: false` on either entry to show its translated text; each entry also accepts `tag`, `size`, `colorDark` and `colorLight`. Appearance does not change navigation: the footer appears when more than one menu destination is available, and the unavailable direction stays disabled at the ends.

Test a new menu from the sidebar, by direct URL and in each enabled language; verify the destination exists and is allowed for the current reader.

> Version: 0.0.17
