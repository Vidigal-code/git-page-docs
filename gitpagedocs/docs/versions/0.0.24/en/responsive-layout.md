# Narrow and foldable screens

A GitPageDocs document should remain readable when the available browser width changes. A foldable phone can expose a narrow cover screen, a wider inner screen, split-screen mode and either orientation. The CSS viewport matters more than a device name: do not assume every Galaxy Z Fold has the same visible width.

## Configure a manageable menu

Use concise translated labels and group related pages under meaningful parents. A parent may open its own introductory page while its separate expansion control opens its children. Keep important destinations near the top of the tree. If a deep hierarchy makes a small site harder to use, set `nestedMenusEnabled` to false to present the existing destinations as a flat menu.

The following fragment belongs inside `site` in `gitpagedocs/config.json`:

```json
{
  "nestedMenusEnabled": true,
  "RouteGuide": true,
  "ActiveNavigation": true,
  "documentNavigation": { "position": "center" },
  "RouteguideBrandPositionDefault": "left",
  "RouteguideBrandContainerTopDefault": false,
  "backgroundEffects": {
    "enabled": true,
    "overrides": { "accessibility": { "showPauseButton": true } }
  }
}
```

`RouteGuide` keeps breadcrumbs available; `ActiveNavigation` enables quick navigation. These settings do not define a device breakpoint. The viewer handles its layout based on the available space. Use the mobile menu control to reach language, theme and animation actions when the header is collapsed.

## Limit the outline deliberately

For a long Markdown reference, index the main heading hierarchy instead of every paragraph. Add this fragment to the corresponding `routes-md` item:

```json
{
  "RouteguideBrand": true,
  "RouteGuideTags": ["h1", "h2", "h3"],
  "RouteguideBrandPosition": "left"
}
```

Headings below the chosen levels remain visible in the document. If a particular document benefits from an outline above its content at all widths, set `RouteguideBrandContainerTop` to true on that route and test the resulting reading order. See [Configure the document guide](route-guide.md) for empty lists, legacy behavior, ID filters and explicit markers.

## Write content that can reflow

Prefer short link labels to raw URLs, narrow tables to many unrelated columns, and fenced code blocks with a language. Keep long commands intact for copying; horizontal scrolling inside a code block is different from unwanted horizontal scrolling of the whole page. Split large configuration examples into focused fragments and identify where each fragment belongs.

For local HTML demos, include the viewport meta tag, use relative widths, allow text wrapping and avoid fixed minimum widths wider than the iframe. Check its keyboard and touch behavior separately from the surrounding viewer. The native PDF viewer, browser voices and external media players have their own mobile limitations; provide useful document text and alternative actions where available.

## Check folding and resizing

Use this repeatable sequence with viewport widths of 280, 320, 344, 390 and 768 CSS pixels, then repeat the important paths on an actual device:

1. Open a long reference directly and confirm that the document body does not overflow the viewport.
2. Open and close the main menu; expand a parent, follow a nested page and return through its breadcrumb.
3. Switch language and theme; verify that translated labels and focus indicators stay visible.
4. Open the document guide, follow an entry near the bottom and return to the top.
5. Open focus mode; try its section and document controls, then close it without losing orientation.
6. Change the viewport width while the menu or guide is open. On a foldable device, also open and close the device and change orientation.
7. Repeat with enlarged text, keyboard navigation and the operating system's reduced-motion preference.

These widths are a verification matrix, not a claim that all browsers, fold states, zoom levels or Galaxy Z Fold models have been certified. Record the browser, viewport, orientation, route, language and observed behavior for a reproducible report.

## Keep animations optional

The header pause action controls decorative animation without hiding the documentation. The operating system's reduced-motion preference takes precedence. To disable theme background effects for the entire site, set `site.backgroundEffects.enabled` to false. Test a long page while scrolling and opening menus; visual effects should not delay access to content. See [Themes and layouts](themes.md) for per-theme and performance settings.


## Follow the active page in the menu

With the navigation padlock unlocked, Previous and Next center the current destination inside the menu's own scrolling area. Opening or unlocking the menu also brings that destination into view. This applies to the desktop sidebar and mobile drawer; the available scroll range limits centering near the start or end. The document itself does not move when the menu recenters.

Manual menu scrolling is preserved between page changes. Resizing or unfolding the viewport recenters the active item; locking the menu preserves its position and disables automatic following. Test both lock states when moving from 344 to 768 CSS pixels and back, including landscape orientation.

## Show controls from the first render

Language, theme and animation controls use the official icon defaults while standalone shell settings load or cannot be retrieved. Repository search, documentation loading, repository opening, the introduction guide, source viewer and not-found views keep accessible button names. An explicit `reactIcon: false` remains a valid preference for localized text after the configuration loads; icon defaults do not override it.

The breadcrumb trail has `1.75rem` of space above and below (28 CSS pixels at the default root font size). Mobile selectors fill their menu rows with centered icons; desktop header selectors retain their compact dimensions.

Since 0.0.22, documentation header controls show a built-in fallback while a configured icon loads, so the control does not appear empty. The configured icon replaces that fallback when ready; an explicit text preference remains text. On narrow screens, Markdown action controls reserve their own space before the document heading instead of covering it.

> Version: 0.0.24
