# Git Page Docs

Git Page Docs é um runtime de documentação multi-idioma para repositórios que possuem a pasta `gitpagedocs/`.

## O que este projeto entrega

- Renderização markdown em varios idiomas (`en`, `pt`, `es`)
- Roteamento por versão (`/v/:versao`)
- Sistema de temas por templates JSON
- Execução local e em GitHub Pages
- Busca de repositório + renderização remota opcional

## Contrato de pastas

O runtime espera esta estrutura:

- `gitpagedocs/config.json`
- `gitpagedocs/docs/<lang>/*.md`
- `gitpagedocs/docs/versions/<versao>/config.json`
- `gitpagedocs/docs/versions/<versao>/<lang>/*.md`
- `gitpagelayouts/layoutsConfig.json`
- `gitpagelayouts/templates/*.json`

## Navegação rápida

- Abra **Primeiros passos** para setup local.
- Abra **Configuração** para detalhes completos do `config.json`.
- Abra **Publicação** para comportamento local/produção/GitHub Pages.
- Abra **Arquitetura** para mapa de código e fluxo de dados.
- Abra **Temas e layouts** para autoria de templates.
- Abra **Rotas autorizadas** para configurar chave, papeis e autenticação externa.
- Abra **FAQ** para troubleshooting.

> Versão: 0.0.8
