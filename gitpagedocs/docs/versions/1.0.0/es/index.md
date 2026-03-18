# Git Page Docs

Git Page Docs es un runtime de documentacion multilenguaje para repositorios que incluyen la carpeta `gitpagedocs/`.

## Que entrega este proyecto

- Renderizado markdown multilenguaje (`en`, `pt`, `es`)
- Ruteo por version (`/v/:version`)
- Sistema de temas con templates JSON
- Ejecucion local y en GitHub Pages
- Busqueda de repositorio + render remoto opcional

## Contrato de carpetas

El runtime espera esta estructura:

- `gitpagedocs/config.json`
- `gitpagedocs/docs/<lang>/*.md`
- `gitpagedocs/docs/versions/<version>/config.json`
- `gitpagedocs/docs/versions/<version>/<lang>/*.md`
- `gitpagedocs/layouts/layoutsConfig.json`
- `gitpagedocs/layouts/templates/*.json`

## Navegacion rapida

Use el menu para abrir:

- **Primeros pasos** – Setup desde cero
- **Vision general del proyecto** – Stack, objetivos y estructura
- **Funcionalidades** – CLI, opciones, configuracion, publicacion, temas, FAQ
- **GitHub issues y projects** – Como usar Issues y Projects
- **Introduccion a Git** – Conceptos basicos de Git
- **Codigo fuente** – Visor estilo GitHub
- **Configuracion** – Explicacion completa de `config.json`
- **Publicacion** – Comportamiento local/servidor/GitHub Pages
- **Arquitectura** – Mapa de codigo y flujo de datos
- **Temas** – Detalles de templates
- **FAQ** – Troubleshooting

## Que cubre cada pagina

| Pagina | Descripcion |
|--------|-------------|
| Primeros pasos | Prerrequisitos, instalar, generar, ejecucion local, comportamiento CLI, busqueda de repositorio, troubleshooting |
| Vision general del proyecto | Stack, objetivos, estructura de carpetas, resumen de arquitectura |
| Funcionalidades | Comandos y opciones CLI, salida generada, tipos de contenido, visor de codigo, claves de config, publicacion, arquitectura, temas, FAQ |
| GitHub issues y projects | Issues (bugs, features, assignees), Projects (Kanban, tablas), flujos |
| Introduccion a Git | Conceptos basicos de Git para principiantes |
| Codigo fuente | Arbol de archivos, busqueda, resaltado de sintaxis, copiar, vista previa de README para todos los `.md` |
| Configuracion | Secciones site, layout, VersionControl; tipos de contenido; variables de entorno |
| Publicacion | Site oficial, GitHub Pages self-hosted, npm publish |
| Arquitectura | Route parser, load-docs, docs-shell; flujo de datos; confiabilidad |
| Temas | Estrategias de layout, modelo de template, comportamiento del runtime |
| FAQ | Repos remotos, ruta de version, tema, comportamiento GitHub Pages |

> Version (ES): 1.0.0
