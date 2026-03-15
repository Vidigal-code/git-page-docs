# Git Page Docs

Git Page Docs e um runtime de documentacao multi-idioma para repositorios que possuem a pasta `gitpagedocs/`.

## O que este projeto entrega

- Renderizacao markdown em varios idiomas (`en`, `pt`, `es`)
- Roteamento por versao (`/v/:versao`)
- Sistema de temas por templates JSON
- Execucao local e em GitHub Pages
- Busca de repositorio + renderizacao remota opcional

## Contrato de pastas

O runtime espera esta estrutura:

- `gitpagedocs/config.json`
- `gitpagedocs/docs/<lang>/*.md`
- `gitpagedocs/docs/versions/<versao>/config.json`
- `gitpagedocs/docs/versions/<versao>/<lang>/*.md`
- `gitpagedocs/layouts/layoutsConfig.json`
- `gitpagedocs/layouts/templates/*.json`

## Navegacao rapida

- Abra **Primeiros passos** para setup local.
- Abra **Configuracao** para detalhes completos do `config.json`.
- Abra **Publicacao** para comportamento local/producao/GitHub Pages.
- Abra **Arquitetura** para mapa de codigo e fluxo de dados.
- Abra **Temas e layouts** para autoria de templates.
- Abra **FAQ** para troubleshooting.

> Versao: 1.0.0
