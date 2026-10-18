export const overviewsEn = {
  guides: `# Guides

Choose a route through the documentation according to what you need to accomplish. This page is also the destination of the Guides menu item: selecting its title opens this document, while its separate arrow expands or collapses the submenus.

## Choose your next step

- **Configure your site** connects root settings, version routes, themes and navigation. Start here when adapting the generated scaffold to your repository.
- **Read and explore** explains focus mode, browser narration, PDF documents and interactive HTML.
- **Automate and integrate** covers CLI commands, the MCP server and route authorization.

## Move through a section

Parent entries can contain both a localized \`path-click\` and \`submenus\`. Their children keep their own destinations. The breadcrumb follows the same hierarchy: an ancestor with an available document is clickable, and the current page marks your position. For example, Guides → Configure your site → Configuration lets you return to either overview without losing the menu structure.
`,
  configureYourSite: `# Configure your site

Separate site-wide presentation from the content of a documentation version. The root \`gitpagedocs/config.json\` selects languages, themes and reading controls. The version configuration defines routes, their language-specific files and the menu tree.

## Configure in a practical order

1. Read **Configuration** to locate the setting you need and its default.
2. Use **Configuration recipes** for complete JSON examples and a multilingual starter structure.
3. Choose **Themes and layouts** for visual tokens and template changes.
4. Read **Navigation and nested menus** to connect routes, parent documents, submenus and breadcrumbs.

## Check the result

Keep an existing file for every enabled language and menu destination. A title alone does not create a document. Give a parent its own Markdown path when it needs an introduction, and keep its children in \`submenus\`. Validate one language first, then check the others, the flat-menu setting and a direct link to a nested page. Preserve repository-specific configuration when regenerating examples.
`,
  readAndExplore: `# Read and explore

Choose a reading surface that matches the document. Markdown supports headings, links and the table of contents; PDF uses the browser's native viewer; HTML can host a trusted interactive demonstration. All remain reachable through the same documentation menu.

## Reading options

- **Focus mode** keeps Markdown in a dialog with copy/download and first, previous, next and last navigation for documents and sections.
- **Accessibility and narration** explains voice selection, playback controls and browser support.
- **PDF documents** covers previews, downloads, opening a new tab and external-host CORS requirements.
- **HTML containers** explains local files, hosted pages and the DOOM example.
- **Paginated containers** explains independent file sequences for Markdown, HTML, video, audio and PDF; try all five in the bundled example.
- **Markdown markers** highlights selected text or elements and adds index links without changing the existing heading filter.

## Keep control of playback

Narration starts only when requested. Audible media coordinates with narration through \`site.mediaExclusivePlayback\`; native browser voices and external players depend on their providers. For the HTML game, use its own Play control. Parent documents such as this one also participate in document navigation when their Markdown is available and access is allowed.
`,
  automateAndIntegrate: `# Automate and integrate

Use automation for repeatable tasks, with the repository as the source of truth. The CLI generates configuration and documentation files. The MCP server exposes project operations to an MCP client. Route authorization governs the viewer's access experience.

## Select the appropriate interface

- **CLI reference** lists installation, commands, flags and which operations write or publish files.
- **MCP server** describes stdio setup, every tool and resource, provider variables and filesystem boundaries.
- **Authorized routes** explains keys, roles and external identity providers.

## Review before publishing

Keep credentials in the intended environment or credential storage, never in generated configuration. Inspect changed files before committing and validate paths for the selected version and language. Public static files remain accessible from their hosting URLs even when the menu hides them. Start with informational commands and explicit output directories when comparing a generated candidate with an existing site.
`,
  operationsAndDevelopment: `# Operations and development

Maintaining a documentation site involves both its published content and the runtime that displays it. Choose the branch below that matches the change; a content update does not always require changing the frontend, and a viewer fix should not rewrite historical documents unnecessarily.

## Two paths through the project

- **Ship and maintain** groups deployment, migration, troubleshooting and frequently asked questions. Use it to prepare an upgrade or investigate a published-site failure.
- **Develop the project** groups architecture, contributing/testing and feature references. Use it to locate the correct source module and its validation boundary.

## Keep releases traceable

Record the intended version, review generated changes and preserve documents used by existing links. Validate local behavior and the deployed base path separately. When an external player, browser voice or hosting policy changes, distinguish that dependency from repository behavior before modifying the implementation. The child guides provide the concrete commands and checks for each task.
`,
  shipAndMaintain: `# Ship and maintain

Treat publication as a verified change to a specific version. Build and inspect the site before relying on a successful workflow status; a deployed page can still reference the wrong path or an unavailable external resource.

## Before and after deployment

1. Read **Deployment** for local runtime, GitHub Pages paths and workflow setup.
2. Use **Migration and compatibility** to compare an upgrade while preserving custom content and supported historical configuration.
3. Follow **Troubleshooting** when a document, PDF, narration control or integration behaves differently across environments.
4. Check **FAQ** for concise answers to common configuration questions.

## Verify a useful sample

Open a nested Markdown page directly, switch languages, follow its breadcrumb and test enabled PDF actions. Confirm the deployed commit and package version. Keep a recoverable commit for upgrades and verify the public URL after a rollback. Do not regenerate a customized repository merely to retry a failed deployment without first reviewing what the generator will replace.
`,
  developTheProject: `# Develop the project

Start with the module that owns the behavior you want to change. The frontend uses Feature-Sliced Design; the CLI owns scaffold templates; shared tools provide configuration and documentation services; the MCP package exposes those services through its protocol.

## Locate the source and test boundary

- **Architecture** maps packages, responsibilities and data flow.
- **Contributing and testing** identifies authoritative templates, generated outputs and the validation commands.
- **Functionalities** provides a broad reference for existing capabilities and configuration.

## Make a reviewable change

Describe the observable behavior, reproduce it through a public interface and update the source before regenerating artifacts. Keep tests about rendered controls, returned configuration or written files instead of private helpers. Review translations and accessibility when changing a user-facing control. Run the checks appropriate to the affected packages, then inspect the generated diff before committing. Existing version directories should remain intact unless the change explicitly requires updating their content.
`,
  gitAndGitHub: `# Git and GitHub

Version control connects the documentation files, review history and deployment workflow. These examples introduce the repository practices used throughout the project; they complement the GitPageDocs configuration guides rather than replace them.

## Start with the appropriate guide

- **Introduction to Git** explains commits, branches and the basic collaboration model, with an accompanying video example.
- **GitHub Issues and Projects** shows how to record work and organize its progress.

## Apply the workflow to documentation

Keep related source and generated changes together in a reviewed commit. Use a branch for a configuration migration, inspect differences before publishing and record the commit deployed by Actions. Describe a documentation defect with its version, language, URL and expected result so another contributor can reproduce it. Before sharing logs or examples, remove credentials and private content; a public repository and its Pages site expose committed files.
`,
};
