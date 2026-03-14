# Arquitectura

Este proyecto usa una arquitectura modular para separar renderizado, carga de temas e interfaz.

## Capas principales

- `src/app`: rutas Next.js y shell de la aplicacion.
- `src/entities/docs`: modelos y logica de carga.
- `src/widgets/docs-shell`: composicion de UI, menu e interacciones.

## Flujo de renderizado

1. Carga `gitpagedocs/config.json`.
2. Resuelve rutas por idioma.
3. Obtiene markdown (local o remoto) y lo convierte a HTML.
4. Carga tokens de layout/tema.
5. Renderiza UI responsiva desktop/mobile.

## Comportamiento en runtime

- En local prioriza `public/layouts`.
- En produccion puede cargar config/layout/template remoto.
- Si falla, usa fallback en `gitpagedocs/layouts`.
