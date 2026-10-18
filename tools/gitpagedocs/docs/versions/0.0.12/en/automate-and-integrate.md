# Automate and integrate

Use automation for repeatable tasks, with the repository as the source of truth. The CLI generates configuration and documentation files. The MCP server exposes project operations to an MCP client. Route authorization governs the viewer's access experience.

## Select the appropriate interface

- **CLI reference** lists installation, commands, flags and which operations write or publish files.
- **MCP server** describes stdio setup, every tool and resource, provider variables and filesystem boundaries.
- **Authorized routes** explains keys, roles and external identity providers.

## Review before publishing

Keep credentials in the intended environment or credential storage, never in generated configuration. Inspect changed files before committing and validate paths for the selected version and language. Public static files remain accessible from their hosting URLs even when the menu hides them. Start with informational commands and explicit output directories when comparing a generated candidate with an existing site.

> Version: 0.0.12
