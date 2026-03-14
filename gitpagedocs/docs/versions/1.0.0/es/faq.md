# FAQ

## Por que mi repositorio remoto no renderiza?

Verifica:

- `RendertoanyRepositoryviaSearch` esta en `true`
- el repositorio remoto tiene `gitpagedocs/config.json`
- las rutas markdown en `routes` son validas

## Por que desaparecio el selector de tema?

Probablemente `HideThemeSelector` esta en `true` en `config.json`.

## Por que el idioma se reinicia?

El idioma se guarda en localStorage; limpia el storage para resetear.

## Por que solo veo temas fallback?

No se encontraron layouts principales local/remoto. La app usa:

- `aurora-dark`
- `aurora-light`
