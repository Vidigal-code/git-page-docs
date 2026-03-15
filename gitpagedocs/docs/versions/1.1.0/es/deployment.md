# Publicacion

Git Page Docs corre como app Next.js con dos objetivos: servidor local y GitHub Pages.

## Publicacion local

Usa:

1. `npm run build`
2. `npm start`

Esto inicia runtime Node + Next.js usando `gitpagedocs/` local.

## Publicacion en GitHub Pages

En build de GitHub Actions:

- `GITHUB_ACTIONS=true`
- el comportamiento de export estatico se habilita por configuracion
- la pagina inicial de busqueda de repositorios queda activa

## Flujo de publish del paquete

Para publicar en npm:

- actualiza version en `package.json`
- ejecuta `npm publish --access public`
- valida autenticacion con `npm whoami`

Si `build:prebuilt` se omite en Windows, usa CI para generar artefactos prebuilt.

> Version (ES): 1.1.0
