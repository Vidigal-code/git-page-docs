# Focus mode

Focus mode opens the current Markdown document in a reading dialog. Enable it with `site.FocusMode`; the control is available only for a real Markdown page. `site.icons.FocusMode` changes its icon/text appearance and does not enable or disable the feature.

## Configure the controls

Merge this fragment into `gitpagedocs/config.json`:

```json
{
  "site": {
    "FocusMode": true,
    "focusMode": {
      "copyEnabled": true,
      "downloadEnabled": true,
      "sectionNavigationEnabled": true,
      "documentNavigationEnabled": true
    }
  }
}
```

Each option defaults to `true`; setting one to `false` hides its corresponding action or navigation group. With `sectionNavigationEnabled: false`, focus mode displays the entire document without section pagination. Existing configurations without the new `focusMode` object keep the controls enabled.

## Sections and documents

- Section navigation has four buttons: first section, previous section, next section and last section of the current document.
- Document navigation has four buttons: first document, previous document, next document and last document in menu order, including nested menus.
- `sectionNavigationEnabled` controls the four section buttons; `documentNavigationEnabled` controls the four document buttons. Unavailable directions are disabled at the ends.
- Documents without a translation in the active language, non-Markdown destinations and inaccessible pages are skipped.
- Switching documents keeps the dialog open and starts at the first section. Section/document counters show the current position.
- `site.ActiveNavigation` controls the quick-navigation interface; it does not disable focus-mode document navigation.

## Copy and download

On a composed page, focus reads the authorized Markdown blocks in order, including repetitions. Its copy/download actions join those sources and use `page-<id>.md`; individual block actions retain their original filenames. See Ordered content blocks for the full contract.

Copy and download use the **entire original Markdown document in the selected language**, including sections not currently visible. They do not export the rendered HTML or only the current reading section.

The download keeps the Markdown basename from the route's localized `path`; if unavailable, the filename is `document.md`. Clipboard access follows the browser's permission and secure-context rules. If copying fails, use download instead and check the displayed error.

## Keyboard and reading

The dialog has an accessible name, keyboard focus management and a close control. Use Tab to move through controls and Escape to close it. Keep icon-only controls accessible by retaining their translated names. Closing the dialog returns to the documentation view.

Narration is configured separately in Accessibility. In focus mode, it reads only the section currently displayed. Changing the section, document or language, or entering or leaving focus mode, stops the previous speech; the next reading starts from the visible content. Voice, speed and volume preferences are retained. With `sectionNavigationEnabled: false`, the entire document is visible and available for narration. Copy/download still includes the complete original source.

> Version: 0.0.16
