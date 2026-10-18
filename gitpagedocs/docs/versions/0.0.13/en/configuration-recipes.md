# Configuration recipes

This guide builds a small multilingual documentation site with two Markdown pages and a menu three levels deep. Start from generated configuration, review your changes and keep the original files in version control. The examples use IDs 101 and 102 so they can be distinguished from the bundled pages.

## 1. Generate and inspect the scaffold

The scaffold includes versions 0.0.14, 0.0.13, 0.0.12, 0.0.11, 0.0.10 and 0.0.9 in the version selector, newest first. All six contain the current examples; the package version is 0.0.14. Their paths and version badges are generated for the selected documentation version. Older existing version folders are not deleted.

Run `npx --yes @gitpagedocs/cli@0.0.14 --no-interactive --owner YOUR_USER --repo YOUR_REPOSITORY` in a new project directory. In this source repository, `node cli/index.mjs` runs the checked-out version. Generation writes configuration and documentation; it does not start the Next.js viewer.

Use the following complete JSON as a minimal root-config example in `gitpagedocs/config.json`. For an existing site, merge the relevant fields and preserve its repository identity, deployment settings, themes and other versions.

```json
{
  "site": {
    "name": "Documentação • Guía • Documentation",
    "docsVersion": "0.0.14",
    "languages": {
      "en": true,
      "pt": true,
      "es": true
    },
    "nestedMenusEnabled": true,
    "ActiveNavigation": true,
    "RouteGuide": true,
    "FocusMode": true,
    "focusMode": {
      "copyEnabled": true,
      "downloadEnabled": true,
      "sectionNavigationEnabled": true,
      "documentNavigationEnabled": true
    },
    "icons": {
      "defaults": {
        "reactIcon": true,
        "size": "22px",
        "colorDark": "currentColor",
        "colorLight": "currentColor"
      },
      "LanguageSelector": {
        "tag": "SiGoogletranslate"
      },
      "ThemeSelector": {
        "tag": "LuPencil"
      },
      "VersionSelector": {
        "tag": "LuGitBranch"
      },
      "FocusMode": {
        "tag": "LuBookOpen"
      },
      "QuickNavigation": {
        "tag": "LuSearch"
      },
      "PdfDownload": {
        "tag": "LuDownload"
      },
      "PdfOpenInNewTab": {
        "tag": "LuExternalLink"
      },
      "DocumentPrevious": {
        "tag": "LuChevronLeft"
      },
      "DocumentNext": {
        "tag": "LuChevronRight"
      }
    },
    "pdf": {
      "enabled": true,
      "previewEnabled": true,
      "downloadEnabled": true,
      "openInNewTabEnabled": true
    }
  },
  "VersionControl": {
    "versions": [
      {
        "id": "0.0.14",
        "path": "gitpagedocs/docs/versions/0.0.13/config.json"
      }
    ]
  }
}
```

The nine entries inherit the common icon presentation from `icons.defaults`. To display text for one action, add `"reactIcon": false` to that entry. Do not change a shared default just to alter one button. Existing flat icon fields win over compact fields, so remove or update an old conflicting field deliberately.

## 2. Create the version configuration

Save the next complete JSON document at the version-config path shown above. A menu category has a title and `submenus`; a leaf has a localized `path-click`. Categories do not need a route. Markdown leaves point to actual Markdown paths rather than `page:<id>` aliases.

```json
{
  "routeDefaults": {
    "RouteGuide": true
  },
  "routes-md": [
    {
      "id": 101,
      "title": {
        "en": "Start",
        "pt": "Início",
        "es": "Inicio"
      },
      "path": {
        "en": "gitpagedocs/docs/versions/0.0.13/en/start.md",
        "pt": "gitpagedocs/docs/versions/0.0.13/pt/start.md",
        "es": "gitpagedocs/docs/versions/0.0.13/es/start.md"
      }
    },
    {
      "id": 102,
      "title": {
        "en": "Next steps",
        "pt": "Próximos passos",
        "es": "Próximos pasos"
      },
      "path": {
        "en": "gitpagedocs/docs/versions/0.0.13/en/next-steps.md",
        "pt": "gitpagedocs/docs/versions/0.0.13/pt/next-steps.md",
        "es": "gitpagedocs/docs/versions/0.0.13/es/next-steps.md"
      }
    }
  ],
  "menus-header-md": [
    {
      "id": 3100,
      "en": {
        "title": "Guides"
      },
      "pt": {
        "title": "Guias"
      },
      "es": {
        "title": "Guías"
      },
      "submenus": [
        {
          "id": 3101,
          "en": {
            "title": "Getting started"
          },
          "pt": {
            "title": "Primeiros passos"
          },
          "es": {
            "title": "Primeros pasos"
          },
          "submenus": [
            {
              "id": 101,
              "en": {
                "title": "Start",
                "path-click": "gitpagedocs/docs/versions/0.0.13/en/start.md"
              },
              "pt": {
                "title": "Início",
                "path-click": "gitpagedocs/docs/versions/0.0.13/pt/start.md"
              },
              "es": {
                "title": "Inicio",
                "path-click": "gitpagedocs/docs/versions/0.0.13/es/start.md"
              }
            },
            {
              "id": 102,
              "en": {
                "title": "Next steps",
                "path-click": "gitpagedocs/docs/versions/0.0.13/en/next-steps.md"
              },
              "pt": {
                "title": "Próximos passos",
                "path-click": "gitpagedocs/docs/versions/0.0.13/pt/next-steps.md"
              },
              "es": {
                "title": "Próximos pasos",
                "path-click": "gitpagedocs/docs/versions/0.0.13/es/next-steps.md"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

Create `start.md` and `next-steps.md` in each of the version's `en`, `pt` and `es` folders: six files in total. Write the corresponding language in each file and save it as UTF-8. Start each page with a heading; add `##` sections to exercise the focus reader. The generated `langs/` bundles provide interface text separately from document content.

## 3. Change presentation without losing destinations

With `nestedMenusEnabled: true`, readers expand Guides → Getting started → page. Setting it to `false` exposes the same destinations as a flat menu. Add further `submenus` recursively when the content justifies it; there is no fixed configured depth limit. Keep sibling identities distinct and avoid repeating the same destination merely to make the tree deeper.

Breadcrumbs use `site.RouteGuide`, then version `routeDefaults.RouteGuide`, then the individual route. The most specific explicit value wins. `RouteguideBrand` is the separate heading outline. Footer previous/next arrows follow available menu destinations; `ActiveNavigation` controls quick navigation and Ctrl+K.

## 4. Add media and verify the result

Use the PDF documents reference to add `routes-pdf` and `menus-header-pdf`; its `page:23` example points to the bundled English file. Preview, download and new-tab controls are independent of their icon appearance. External PDF files need CORS for all three actions; local repository PDFs under `gitpagedocs/` are staged during Next.js dev/build.

Check every language, expand all menu groups and follow each leaf. Try direct page URLs, text/icon overrides, focus first/previous/next/last controls and the disabled navigation boundaries. Inspect the generated version config when a label works but a destination does not. Commit the reviewed configuration together with all referenced documents and assets.

> Version: 0.0.13
