<!-- gitpagedocs:start -->
### API key handling

- Keys saved by the CLI or browser are **encrypted at rest** (AES-256-GCM, key derived with PBKDF2-HMAC-SHA-256) behind a local password. Keep environment-injected credentials in the host's secret facility.
- Site: the `/ai` console and the chat drawer keep the vault in `localStorage`; the drawer locks itself after `site.AiChatAutoLockSeconds` idle seconds (default 30) and asks for the password again.
- CLI: `gitpagedocs ai` / `gitpagedocs chat` seal the key in `.gitpagedocsvault` next to `.gitpagedocsconfig`; the vault password is created on first use and asked on every run (`GITPAGEDOCS_VAULT_PASSWORD` for non-interactive runs).
- MCP: provider calls read credentials from the server process environment. The server does not automatically load `.env` or unlock the CLI vault; use the MCP client's protected secret/input facility and restart it after environment changes.
- The password gates sensitive operations and is held only in memory for the session.
- Keys are **never logged** (the logger redacts secrets) and are sent only to the AI provider you select.
- To report a vulnerability, open a security advisory or issue on the repository.
<!-- gitpagedocs:end -->
