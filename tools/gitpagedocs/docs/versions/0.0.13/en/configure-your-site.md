# Configure your site

Separate site-wide presentation from the content of a documentation version. The root `gitpagedocs/config.json` selects languages, themes and reading controls. The version configuration defines routes, their language-specific files and the menu tree.

## Configure in a practical order

1. Read **Configuration** to locate the setting you need and its default.
2. Use **Configuration recipes** for complete JSON examples and a multilingual starter structure.
3. Choose **Themes and layouts** for visual tokens and template changes.
4. Read **Navigation and nested menus** to connect routes, parent documents, submenus and breadcrumbs.

## Check the result

Keep an existing file for every enabled language and menu destination. A title alone does not create a document. Give a parent its own Markdown path when it needs an introduction, and keep its children in `submenus`. Validate one language first, then check the others, the flat-menu setting and a direct link to a nested page. Preserve repository-specific configuration when regenerating examples.

> Version: 0.0.13
