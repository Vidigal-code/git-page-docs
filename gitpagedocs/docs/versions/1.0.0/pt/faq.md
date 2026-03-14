# FAQ

## Por que meu repositorio remoto nao renderiza?

Verifique:

- `RendertoanyRepositoryviaSearch` esta `true`
- repositorio remoto possui `gitpagedocs/config.json`
- caminhos markdown em `routes` estao corretos

## Por que o seletor de tema sumiu?

Provavelmente `HideThemeSelector` esta `true` no `config.json`.

## Por que o idioma reinicia?

O idioma fica no localStorage; limpe o storage do navegador para resetar.

## Por que aparecem so temas fallback?

Layouts principais local/remoto nao foram encontrados. A app usa:

- `aurora-dark`
- `aurora-light`
