# HTML containers and interactive examples

An HTML route displays a local document or an external web page inside an iframe. Use it for a trusted interactive demonstration that Markdown cannot express. The scaffold includes **DOOM: HTML example**, route 29. Its title and description belong to the documentation container; the HTML itself contains only the game player, without repeated headings, instructions or a custom load button. The game remains hosted by its provider; the npm package contains the HTML integration, not the game assets.

## Configure a local HTML route

Add this route to the version configuration's existing `routes-html` array. Keep other routes and give each destination a distinct ID. Create each referenced file as UTF-8 HTML, or generate the bundled example with the CLI.

```json
{
  "id": 29,
  "title": {
    "en": "DOOM: HTML example",
    "pt": "DOOM: exemplo HTML",
    "es": "DOOM: ejemplo HTML"
  },
  "description": {
    "en": "An interactive HTML container",
    "pt": "Um container HTML interativo",
    "es": "Un contenedor HTML interactivo"
  },
  "titleIsVisible": true,
  "descriptionIsVisible": true,
  "path": {
    "en": "gitpagedocs/docs/versions/0.0.15/en/doom.html",
    "pt": "gitpagedocs/docs/versions/0.0.15/pt/doom.html",
    "es": "gitpagedocs/docs/versions/0.0.15/es/doom.html"
  },
  "container": "full",
  "fullscreenEnabled": true,
  "blockLink": true
}
```

Add a localized item in `menus-header-html`. Each `path-click` must match its language's route path, such as `gitpagedocs/docs/versions/0.0.15/en/doom.html`; do not substitute `page:29` for this local HTML path. Menu labels do not create routes. HTML uses the same recursive `submenus` structure as other menus.

## Size, content and external URLs

`container: "full"` gives the content a viewport-related minimum height; a positive number sets its height in pixels. Omit it for the normal container. `fullscreenEnabled` controls the viewer's fullscreen action. Route title and description remain separate from any heading authored inside the HTML document.

For a hosted page, use `url: { "en": "https://example.com/demo", "pt": "https://example.com/demo", "es": "https://example.com/demo" }` instead of `path`. A URL route uses iframe navigation; local HTML is loaded into `srcDoc`. For local content, prefer self-contained styling and explicit HTTPS asset URLs: a srcDoc document does not automatically resolve assets relative to the original file's directory.

The external host can prevent framing through CSP or X-Frame-Options. Known blocked hosts receive an open-in-new-tab alternative; arbitrary hosting failures are not universally detectable. Test the actual target in the deployed site. `blockLink: true` sets the default target of links in local HTML to a new tab; it does not prevent navigation performed by scripts or links that set their own target.

## Use and maintain the game example

Select the HTML menu entry. The player SDK loads when the page opens; use its native Play control to start the game. There is no automatic game start or separate documentation load button. Network access is required. A bootstrap failure displays an error asking you to reload the page; the normal view contains only the player. Test keyboard focus, small screens, fullscreen and returning to the documentation. Third-party player availability and browser capabilities can change independently of GitPageDocs.

Review HTML and dependencies before publishing. The current iframe permits scripts and same-origin content, so it is not a security boundary for arbitrary untrusted HTML. Do not put secrets in HTML, URLs or client configuration. Static hosting exposes the files independently of menu visibility or route authorization. For local development and Pages, commit the wrapper alongside its version configuration and validate the generated paths before deployment.

> Version: 0.0.15
