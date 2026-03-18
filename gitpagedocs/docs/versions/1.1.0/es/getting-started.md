# Primeros pasos

Esta guia lleva el proyecto desde cero hasta docs corriendo.

## Requisitos

- Node.js 20+
- npm 10+ (o pnpm)

## Setup local

1. Instala dependencias:
   - `npm install`
2. Genera/actualiza artefactos de docs:
   - `npm run gitpagedocs`
3. Inicia desarrollo:
   - `npm run dev`
4. Build + ejecucion local de produccion:
   - `npm run build`
   - `npm start`

## Comportamiento de la CLI

`npx gitpagedocs` (o `npm run gitpagedocs`) genera artefactos en la carpeta oficial `gitpagedocs/`.

- Genera solo markdown/json
- No genera `index.html`
- No genera `index.js`
- No ejecuta comandos de instalacion

## Modo de busqueda por repositorio

En local, se controla por variable:

- `GITPAGEDOCS_REPOSITORY_SEARCH=true`
- `GITPAGEDOCS_REPOSITORY_SEARCH=false`

En build de GitHub Pages (`GITHUB_ACTIONS=true`), la busqueda de repositorio siempre esta activa.

## Troubleshooting

### La busqueda por repositorio no funciona en local

- Define `GITPAGEDOCS_REPOSITORY_SEARCH=true` en `.env` (crealo en la raiz del proyecto si no existe).
- Asegurate de que el repo objetivo contiene `gitpagedocs/config.json`.
- Verifica que los paths markdown del repo objetivo coincidan con el config de rutas.

### El build falla o los docs no cargan

- Ejecuta `npm run lint` para detectar errores de config o paths.
- Asegurate de que `gitpagedocs/config.json` existe y tiene `VersionControl.versions` validos.
- Verifica que existan archivos markdown para cada idioma (`en`, `pt`, `es`) en las carpetas de version.

### La ruta de version retorna contenido incorrecto o vacio

- Verifica `VersionControl.versions[*].path` en `gitpagedocs/config.json`.
- Asegurate de que el config de version tiene `routes` y `menus-header` validos.
- Regenera con `npx gitpagedocs` para actualizar los artefactos.

## Proximos pasos

- **Configuracion y publicacion**: Ve **Funcionalidades** para claves de `config.json`, GitHub Pages self-hosted y publicacion en npm.
- **Publicar en GitHub Pages**: Ejecuta `npx gitpagedocs --push --owner <user> --repo <repo>` para crear el workflow, hacer commit de artefactos y enviar.

> Version (ES): 1.1.0
