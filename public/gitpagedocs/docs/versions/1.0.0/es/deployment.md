# Publicacion

Este proyecto esta listo para despliegue como aplicacion Next.js.

## Build de produccion

1. Ejecuta: `npm run build`
2. Inicia servidor: `npm start` o `pnpm start`

## Modo de renderizado por repositorio

- Si `RendertoanyRepositoryviaSearch` es `true`, URLs como `/owner/repo` pueden renderizar markdown remoto.
- Si es `false`, la aplicacion siempre renderiza markdown local de este repositorio.

## Validaciones recomendadas

- Verifica todas las rutas markdown en `routes`
- Confirma que los temas existen en `public/layouts/templates`
- Asegura que `layoutsConfigPath` sea valido si se necesita fallback remoto
