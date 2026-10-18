# PDF documents

PDF is a first-class content type alongside Markdown, HTML, source code, video and audio. The viewer uses the browser's native PDF preview. Download and open-in-new-tab actions remain independently configurable.

## Included English project guide

The scaffold includes [GitPageDocs project guide (PDF, English)](https://github.com/Vidigal-code/git-page-docs/blob/main/cli/content/assets/gitpagedocs-project-guide.pdf). It explains the project, packages, configuration, icons, focus mode, narration, CLI, MCP and deployment. The PDF is in English; the reference page is translated into English, Portuguese and Spanish.

The CLI copies the bundled PDF bytes into `gitpagedocs/docs/versions/<version>/en/gitpagedocs-project-guide.pdf`. All three language paths in the example point to this English file. To provide translations, add the translated PDFs and change each language path.

## Site defaults

Add this block inside `site` in `gitpagedocs/config.json`:

```json
{
  "pdf": {
    "enabled": true,
    "previewEnabled": true,
    "downloadEnabled": true,
    "openInNewTabEnabled": true
  }
}
```

`enabled` is the master switch for PDF content. The other fields control the preview, download button and new-tab button. Every field defaults to `true` when omitted, including older configurations.

Action precedence is `route.pdf.<flag>` > `site.pdf.<flag>` > `true`. An explicit route `true` enables that action even when its site default is `false`; `site.pdf.enabled: false` still disables PDF content everywhere. A missing path for the selected language makes the PDF unavailable; there is no automatic language fallback.

PDF actions use icons by default. Configure `site.icons.PdfDownload` (`LuDownload`) and `site.icons.PdfOpenInNewTab` (`LuExternalLink`) independently with `reactIcon`, `tag`, `size`, `colorDark` and `colorLight`. For example, `"PdfDownload": { "reactIcon": false }` shows download text while the new-tab action remains an icon. Changing appearance does not change the action flags above.

## Route and menu example

In `gitpagedocs/docs/versions/0.0.9/config.json`, keep route and menu arrays at the top level:

```json
{
  "routes-pdf": [{
    "id": 23,
    "title": { "en": "Project guide (English)", "pt": "Guia do projeto (inglês)", "es": "Guía del proyecto (inglés)" },
    "pdf": {
      "pathPdf": {
        "en": "gitpagedocs/docs/versions/0.0.9/en/gitpagedocs-project-guide.pdf",
        "pt": "gitpagedocs/docs/versions/0.0.9/en/gitpagedocs-project-guide.pdf",
        "es": "gitpagedocs/docs/versions/0.0.9/en/gitpagedocs-project-guide.pdf"
      },
      "previewEnabled": true,
      "downloadEnabled": true,
      "openInNewTabEnabled": true
    }
  }],
  "menus-header-pdf": [{
    "id": 23,
    "en": { "title": "Project guide (English)", "path-click": "page:23" },
    "pt": { "title": "Guia do projeto (inglês)", "path-click": "page:23" },
    "es": { "title": "Guía del proyecto (inglés)", "path-click": "page:23" }
  }]
}
```

The `pdf.pathPdf` map selects the file for the current language. Use `page:<id>` in PDF menu destinations. The same recursive `submenus` structure used by other menus is supported. The scaffold reserves ID 23 for the PDF example and ID 24 for this Markdown reference; use unique IDs for additional pages.

The optional route flags live inside `pdf`. Shared presentation, `container`, `RouteGuide` and authorization options remain route-level fields. `routeDefaults` also applies to PDF routes. Add `"pdf": 5` to `hierarchyPage` and `hierarchyMenu` to position PDFs after audio; change the order values to suit your site.

## Files and deployment

Repository-root paths beginning with `gitpagedocs/` are copied into the viewer's public assets when Next.js starts or builds. The URL respects the configured deployment subpath on GitHub Pages. Keep the PDF tracked in Git and publish it with the generated documentation. Assets outside `gitpagedocs/` must already be in the viewer's `frontend/public/` directory or be reachable through an HTTP(S) URL.

Use the binary PDF URL, not an HTML repository preview URL. For remote repositories, the configured path resolves against that repository. Preview, download and opening a new tab fetch the file bytes, so an external server must allow CORS for all three actions. The viewer validates the PDF signature and creates a temporary `application/pdf` Blob URL. Preview and new-tab viewing use the browser's native PDF viewer; the origin server's framing policy and MIME/disposition headers do not control the Blob view.

The new-tab button opens the validated PDF Blob instead of navigating to the raw repository URL. This also works when preview is disabled: loading starts when the reader downloads or opens the document. Previously loaded bytes are reused for the current PDF. Network/CORS failures, invalid PDFs and blocked new tabs produce a visible error; there is no automatic fallback to the raw URL. Native PDF support and the browser's own download preferences still determine how the new tab displays the file.

## Reading and troubleshooting

- Native PDF controls, keyboard support, zoom and page navigation depend on the browser's PDF viewer. Some mobile browsers open or download the file instead of embedding it.
- Preview does not convert the PDF to Markdown. Markdown focus mode, section navigation, copy-as-Markdown and narration operate on Markdown documents, not the embedded PDF.
- Disabling preview can keep the download and new-tab actions available. Turning off every PDF action leaves no interactive PDF control.
- A disabled button is not access control. Publicly hosted PDFs remain downloadable by URL. Use protected hosting for confidential documents.
- If a preview is blank, verify that the path returns a PDF and that CORS permits access, then try the new-tab action. Allow pop-ups for the site if the browser blocks that action. Download and new-tab failures are reported on the page.

> Version: 0.0.9
