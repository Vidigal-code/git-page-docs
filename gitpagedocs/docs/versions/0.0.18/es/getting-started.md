# Primeros pasos

Git Page Docs separa los archivos de documentación del visor. Instala la CLI para crear los archivos; utiliza el visor oficial, GitHub Pages o un checkout del runtime para mostrarlos.

## Requisitos e instalación

Utiliza Node.js 20 o posterior. Git es necesario para publicar; GitHub CLI es necesario cuando la CLI configura Pages automáticamente.

```bash
npm install --save-dev @gitpagedocs/cli
npx gitpagedocs --no-interactive --owner TU_USUARIO --repo TU_REPOSITORIO
```

Para una ejecución sin instalación local, utiliza `npx --yes @gitpagedocs/cli --no-interactive --owner TU_USUARIO --repo TU_REPOSITORIO`. Para instalar globalmente, utiliza `npm install -g @gitpagedocs/cli` y después `gitpagedocs`. Ejecuta desde la raíz del repositorio.

## Contrato generado

- `gitpagedocs/config.json`: opciones del sitio y referencias de versiones.
- `gitpagedocs/langs/{en,pt,es}.json`: textos de la interfaz.
- `gitpagedocs/docs/versions/<version>/config.json`: rutas y menús.
- `gitpagedocs/docs/versions/<version>/{en,pt,es}/*.md`: contenido; los nombres de archivo permanecen en inglés en los tres idiomas.
- `gitpagedocs/icon.svg`: icono del sitio.
- `--layoutconfig` también escribe `gitpagelayouts/`; `--layouts-dir` cambia esa carpeta.

El generador escribe configuración y contenido; no instala una aplicación Next.js en tu repositorio. Ejecutarlo de nuevo vuelve a escribir los archivos del scaffold: revisa el diff de Git antes de conservar cambios en documentación editada manualmente.

## Leer y publicar

Haz commit y push de la carpeta generada y abre `https://vidigal-code.github.io/git-page-docs/TU_USUARIO/TU_REPOSITORIO/` para un repositorio público. Para publicar tu propio sitio, autentícate con `gh auth login` y ejecuta `npx gitpagedocs pages deploy --owner TU_USUARIO --repo TU_REPOSITORIO`. Esto genera archivos, hace commit y push; revisa la ejecución de GitHub Actions. Consulta Publicación para subrutas y el contrato del workflow.

## Desarrollar el visor localmente

Los siguientes comandos pertenecen a un checkout de Git Page Docs, no a un repositorio que solo contiene archivos generados:

```bash
git clone https://github.com/Vidigal-code/git-page-docs.git
cd git-page-docs
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

El repositorio fija pnpm en `packageManager`. `pnpm dev` activa la búsqueda de repositorios; `pnpm dev:e2e` utiliza la documentación local. Para producción local, ejecuta `pnpm build` y `pnpm start`; el script start recompila antes de iniciar. Configura `PORT=3100` en el entorno del proceso cuando el puerto 3000 esté ocupado.

## Siguientes pasos

Usa Configuración para idiomas, iconos, navegación, foco y narración; Funcionalidades para CLI y MCP; Temas y diseños para tokens visuales; Preguntas frecuentes para diagnóstico.

> Versión: 0.0.18
