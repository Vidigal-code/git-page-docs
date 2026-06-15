# Rotas autorizadas

Proteja rotas por chave de acesso, papeis obrigatorios e provedores externos.

## Local do config de versao

Configure em:

- `gitpagedocs/docs/versions/<versao>/config.json`

## Secao global auth

Use `auth` no topo do config de versao:

- `accessKeys`: mapa de ids de chave para segredo esperado
- `rolesStorageKey`: chave de localStorage para bootstrap de papeis
- `providers`: lista de provedores externos (`authjs`, `clerk`, `firebase`, `jwt`)

## Autorizacao por rota

Dentro de cada rota (`routes-md`, `routes-html`, `routes-video`):

- `authorization.accessKeyId`
- `authorization.requiredRoles`
- `authorization.requireExternalAuth`
- `authorization.allowedProviders`

## Fases

### Fase A - Chave de acesso

Defina `authorization.accessKeyId` e a chave correspondente em `auth.accessKeys`.

### Fase B - Papeis

Defina `authorization.requiredRoles` com um ou mais papeis.

Os papeis podem vir de:

- query param `?authRoles=admin,maintainer`
- localStorage (`rolesStorageKey`)
- claims de provedores externos

### Fase C - Provedores externos

Defina `authorization.requireExternalAuth=true` e opcionalmente `allowedProviders`.

Adaptadores suportados:

- Auth.js (`type: "authjs"`)
- Clerk (`type: "clerk"`)
- Firebase Auth (`type: "firebase"`)
- JWT custom (`type: "jwt"`)

> Versao: 1.1.1
