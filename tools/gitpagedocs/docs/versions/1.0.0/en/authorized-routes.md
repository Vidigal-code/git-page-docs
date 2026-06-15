# Authorized Routes

Protect routes by access key, required roles, and external authentication providers.

## Version config location

Configure this at:

- `gitpagedocs/docs/versions/<version>/config.json`

## Global auth section

Use top-level `auth` in version config:

- `accessKeys`: map of key ids to expected secrets
- `rolesStorageKey`: localStorage key for role bootstrap
- `providers`: external providers list (`authjs`, `clerk`, `firebase`, `jwt`)

## Route-level authorization

Inside each route (`routes-md`, `routes-html`, `routes-video`):

- `authorization.accessKeyId`
- `authorization.requiredRoles`
- `authorization.requireExternalAuth`
- `authorization.allowedProviders`

## Phases

### Phase A - Access key

Set `authorization.accessKeyId` and define that key in `auth.accessKeys`.

### Phase B - Roles

Set `authorization.requiredRoles` with one or more roles.

Roles can come from:

- query param `?authRoles=admin,maintainer`
- localStorage (`rolesStorageKey`)
- external provider claims

### Phase C - External providers

Set `authorization.requireExternalAuth=true` and optionally `allowedProviders`.

Supported adapters:

- Auth.js (`type: "authjs"`)
- Clerk (`type: "clerk"`)
- Firebase Auth (`type: "firebase"`)
- Custom JWT (`type: "jwt"`)

## Example

```json
{
  "auth": {
    "accessKeys": {
      "docs-key": "open-gitpagedocs-docs"
    },
    "providers": [
      { "type": "authjs", "enabled": true, "sessionEndpoint": "/api/auth/session" },
      { "type": "jwt", "enabled": true, "tokenStorageKey": "git-page-docs:jwt-token" }
    ]
  },
  "routes-md": [
    {
      "id": 6,
      "path": {
        "en": "gitpagedocs/docs/versions/1.1.1/en/authorized-routes.md",
        "pt": "gitpagedocs/docs/versions/1.1.1/pt/authorized-routes.md",
        "es": "gitpagedocs/docs/versions/1.1.1/es/authorized-routes.md"
      },
      "authorization": {
        "accessKeyId": "docs-key",
        "requiredRoles": ["maintainer"],
        "requireExternalAuth": true,
        "allowedProviders": ["authjs", "jwt"]
      }
    }
  ]
}
```

> Version: 1.0.0
