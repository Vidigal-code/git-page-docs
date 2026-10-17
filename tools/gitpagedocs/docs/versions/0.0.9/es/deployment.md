# Publicación

Elige el visor oficial para un repositorio público, publica tu propio GitHub Pages o aloja un export estático compilado desde el runtime.

## Visor oficial

Haz commit de la carpeta `gitpagedocs/` generada en tu repositorio público. Abre `https://vidigal-code.github.io/git-page-docs/OWNER/REPOSITORY/` y elige versión e idioma. El visor obtiene configuración y contenido del repositorio. Esta URL no convierte un repositorio privado en público.

## Tu sitio en GitHub Pages

Requisitos: repositorio Git, origin GitHub, permiso de push y GitHub CLI autenticado (`gh auth login`) cuando la CLI configura Pages.

```bash
npx gitpagedocs pages deploy --owner OWNER --repo REPOSITORY
```

El flujo confirma el destino, genera docs y `.github/workflows/gitpagedocs-pages.yml`, hace commit y push y solicita GitHub Actions como fuente de Pages. Para cambiar solo la fuente, utiliza `npx gitpagedocs pages actions`. Para publicar en una subruta, pasa `--path docs`.

Revisa GitHub Actions hasta que termine el despliegue; la URL impresa por la CLI puede aparecer antes de finalizar el build remoto. Los sitios de proyecto normalmente utilizan `https://OWNER.github.io/REPOSITORY/`; los sitios de usuario/organización utilizan la raíz del repositorio `OWNER.github.io`.

## Contrato del build

El workflow instala las dependencias del workspace con pnpm fijado, compila el visor y sube el artefacto estático mediante las actions oficiales de Pages. El job de despliegue necesita `pages: write`, `id-token: write` y el entorno `github-pages`.

- `GITHUB_ACTIONS=true` activa el export estático de Next.js.
- `GITHUB_REPOSITORY=OWNER/REPOSITORY` determina la base del repositorio.
- `GITPAGEDOCS_REPOSITORY_SEARCH=true` activa el build de búsqueda inicial.
- `GITPAGEDOCS_BASE_PATH` sobrescribe explícitamente la base; `GITPAGEDOCS_PATH` define la subruta de docs.
- `GITPAGEDOCS_DIST_DIR` separa las salidas de build/dev para dos servidores locales.

`pnpm build` sin el entorno de Pages produce un build de producción Next.js; por sí solo no verifica un export estático. Conserva `.nojekyll` al alojar el export en Pages.

## Export independiente

En un checkout del runtime con dependencias instaladas, `node cli/index.mjs --home --output gitpagedocshome --no-interactive` compila `frontend/` y empaqueta una distribución estática. `--search true` activa la búsqueda inicial de repositorios. La salida incluye archivos estáticos, README, Dockerfile y ejemplo de entorno; la carpeta de destino se recrea. Un servidor estático sirve los archivos; cambiar una opción de entorno utilizada en el build requiere compilar de nuevo.

## Releases npm para mantenedores

El monorepo publica `@gitpagedocs/tools`, `@gitpagedocs/mcp` y `@gitpagedocs/cli`; raíz y frontend son privados. El `npm-publish.yml` actual se ejecuta en pushes a `main` y omite una versión de CLI ya publicada. Utiliza el secret `NPM_TOKEN` del repositorio y publica workspaces en orden de dependencia. Crear solo una release de GitHub no es su disparador.

Sincroniza versiones y dependencias internas, regenera docs/baselines, ejecuta typecheck, lint, pruebas, smoke, build y Playwright y revisa antes del push. Confirma las tres versiones en npm y el resultado de Pages. La CLI de configuración ignora `prebuilt/`; el workflow de publicación no requiere esa carpeta.

> Version (ES): 0.0.9
