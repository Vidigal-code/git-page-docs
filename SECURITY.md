<!-- gitpagedocs:start -->
### API key handling

- API keys are stored **encrypted at rest** (AES-256-GCM) behind a local password — never in plaintext.
- The password gates sensitive operations and is held only in memory for the session.
- Keys are **never logged** (the logger redacts secrets) and are sent only to the AI provider you select.
- To report a vulnerability, open a security advisory or issue on the repository.
<!-- gitpagedocs:end -->
