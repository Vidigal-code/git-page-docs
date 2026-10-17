# Rutas autorizadas

Protege rutas por clave de acceso, roles requeridos y proveedores externos.

## Ubicacion del config de versión

Configura en:

- `gitpagedocs/docs/versions/<version>/config.json`

## Sección global auth

Usa `auth` en la raiz del config de versión:

- `accessKeys`: mapa de ids de clave al secreto esperado
- `rolesStorageKey`: clave de localStorage para bootstrap de roles
- `providers`: lista de proveedores externos (`authjs`, `clerk`, `firebase`, `jwt`)

## Autorización por ruta

Dentro de cada ruta (`routes-md`, `routes-html`, `routes-video`):

- `authorization.accessKeyId`
- `authorization.requiredRoles`
- `authorization.requireExternalAuth`
- `authorization.allowedProviders`

## Fases

### Fase A - Clave de acceso

Define `authorization.accessKeyId` y la clave correspondiente en `auth.accessKeys`.

### Fase B - Roles

Define `authorization.requiredRoles` con uno o más roles.

Los roles pueden venir de:

- query param `?authRoles=admin,maintainer`
- localStorage (`rolesStorageKey`)
- claims de proveedores externos

### Fase C - Proveedores externos

Define `authorization.requireExternalAuth=true` y opcionalmente `allowedProviders`.

Adaptadores soportados:

- Auth.js (`type: "authjs"`)
- Clerk (`type: "clerk"`)
- Firebase Auth (`type: "firebase"`)
- JWT custom (`type: "jwt"`)

> Versión: 0.0.11
