# FAQ

## Por que repositorios remotos nao abrem localmente?

Verifique:

- `GITPAGEDOCS_REPOSITORY_SEARCH=true` no `.env`
- repositorio alvo contem `gitpagedocs/config.json`
- paths markdown do repositorio batem com seu config de rotas

## Por que rota de versao mostra conteudo errado?

Verifique:

- `VersionControl.versions[*].path` em `gitpagedocs/config.json`
- config da versao possui `routes` e `menus-header` validos
- markdown existe para cada idioma

## Por que tema nao aplica corretamente?

Verifique:

- `layoutsConfig.json` referencia templates validos
- ids de template sao unicos
- tema selecionado existe no mapa de temas carregados

## Por que GitHub Pages pode se comportar diferente do local?

Porque o build de GitHub Pages habilita pagina inicial de busca e comportamento especifico de exportacao.

> Versao: 1.0.0
