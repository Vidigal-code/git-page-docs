# Configuracion

La configuracion de runtime esta en `gitpagedocs/config.json`.

## Seccion `site`

Claves principales:

- `name`: titulo del proyecto en UI
- `defaultLanguage`: idioma por defecto
- `supportedLanguages`: lista de idiomas disponibles
- `HideThemeSelector`: ocultar/mostrar selector de tema
- `ThemeDefault`: id del tema inicial
- `ThemeModeDefault`: modo inicial (`light` o `dark`)
- `ProjectLink`: URL de repositorio para acciones de cabecera
- `docsVersion`: version seleccionada por defecto
- `ActiveNavigation`: habilita anterior/siguiente
- `FocusMode`: habilita modo foco/lectura
- `IconImageMenuHeaderImgWidth`, `IconImageMenuHeaderImgHeight`: tamano del icono principal
- `IconImageMenuHeaderLightImg`, `IconImageMenuHeaderDarkImg`: icono principal (light/dark)
- `IconProjectLinkImgWidth`, `IconProjectLinkImgHeight`: tamano del icono enlace del proyecto
- `IconProjectLinkLightImg`, `IconProjectLinkDarkImg`: icono enlace del proyecto
- `IconVersionLinksImgWidth`, `IconVersionLinksImgHeight`: tamano del icono enlaces de version
- `IconVersionLinksLightImg`, `IconVersionLinksDarkImg`: icono enlaces de version
- `IconInfoHeaderMenuImgWidth`, `IconInfoHeaderMenuImgHeight`: tamano del icono info
- `IconInfoHeaderMenuLightImg`, `IconInfoHeaderMenuDarkImg`: icono info
- `IconPreviewProjectLinkImgWidth`, `IconPreviewProjectLinkImgHeight`: tamano del icono preview
- `IconPreviewProjectLinkLightImg`, `IconPreviewProjectLinkDarkImg`: icono preview
- `layoutsConfigPath`: fallback remoto de layouts
- `rendering`: URL canonica publicada

## Seccion `VersionControl`

`VersionControl.versions` define:

- `id`: identificador de version
- `path`: ruta de config de version
- links opcionales (`ProjectLink`, `branch`, `release`, `commit`)

## Navegacion y rutas

- `routes`: rutas markdown por idioma
- `menus-header`: menu jerarquico
- `translations`: etiquetas UI para not-found y navegacion

## Variables de entorno

- `GITPAGEDOCS_REPOSITORY_SEARCH`: activa/desactiva busqueda remota en local
- `GITHUB_ACTIONS`: habilita comportamiento especifico de GitHub Pages

> Version (ES): 1.0.0
