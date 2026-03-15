# FAQ

## Por que repositorios remotos no abren en local?

Verifica:

- `GITPAGEDOCS_REPOSITORY_SEARCH=true` en `.env`
- repositorio objetivo contiene `gitpagedocs/config.json`
- paths markdown del repositorio coinciden con su config de rutas

## Por que una ruta de version muestra contenido incorrecto?

Verifica:

- `VersionControl.versions[*].path` en `gitpagedocs/config.json`
- config de version tiene `routes` y `menus-header` validos
- markdown existe para cada idioma

## Por que tema no se aplica correctamente?

Verifica:

- `layoutsConfig.json` referencia templates validos
- ids de template son unicos
- tema seleccionado existe en el mapa de temas cargados

## Por que GitHub Pages puede comportarse distinto a local?

Porque el build de GitHub Pages habilita la pagina inicial de busqueda y comportamiento especifico de exportacion.
