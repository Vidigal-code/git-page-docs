# Arquitectura

El proyecto esta organizado por fronteras de feature y responsabilidades de runtime.

## Modulos principales

- `src/app/[[...repo]]/page.tsx`
  - parser de rutas
  - generateStaticParams
  - seleccion de shell (docs vs repository search)
- `src/entities/docs/api/load-docs-data.ts`
  - carga de config local/remota
  - resolucion de version
  - pipeline fetch + parse markdown
  - carga de layouts + temas
- `src/widgets/docs-shell/docs-shell.tsx`
  - render de UI
  - estado de idioma/version/tema
  - sincronizacion de URL

## Flujo de datos

1. Llega la ruta (`/owner/repo/v/x.y.z` o equivalente local)
2. Se resuelve config (local o remoto)
3. Config de version sobreescribe rutas/menus base
4. Markdown se carga y convierte a HTML
5. Template de layout se resuelve y aplica en CSS vars
6. Shell renderiza contenido y controles

## Puntos de resiliencia

- fallback de carga para layouts/templates
- carga de markdown por idioma con fallback de error
- sincronizacion de idioma/version/tema via localStorage

> Version (ES): 1.1.1
