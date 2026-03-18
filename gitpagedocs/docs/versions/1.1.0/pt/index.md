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

Use o menu para abrir:

- **Primeiros passos** – Setup do zero
- **Visao geral do projeto** – Stack, objetivos e estrutura
- **Funcionalidades** – CLI, opcoes, configuracao, publicacao, temas, FAQ
- **GitHub Issues e Projects** – Como usar Issues e Projects
- **Introducao ao Git** – Conceitos basicos de Git
- **Codigo fonte** – Visualizador estilo GitHub
- **Configuracao** – Explicacao completa do `config.json`
- **Publicacao** – Comportamento local/servidor/GitHub Pages
- **Arquitectura** – Mapa de codigo e fluxo de dados
- **Temas** – Detalhes de templates
- **FAQ** – Troubleshooting

## O que cada pagina cobre

| Pagina | Descricao |
|--------|-----------|
| Primeiros passos | Pre-requisitos, instalar, gerar, execucao local, comportamento da CLI, busca de repositorio, troubleshooting |
| Visao geral do projeto | Stack, objetivos, estrutura de pastas, resumo de arquitectura |
| Funcionalidades | Comandos e opcoes da CLI, saida gerada, tipos de conteudo, visualizador de codigo, chaves de config, publicacao, arquitectura, temas, FAQ |
| GitHub Issues e Projects | Issues (bugs, features, assignees), Projects (Kanban, tabelas), fluxos |
| Introducao ao Git | Conceitos basicos de Git para iniciantes |
| Codigo fonte | Arvore de ficheiros, busca, destaque de sintaxe, copiar, preview de README para todos os `.md` |
| Configuracao | Secoes site, layout, VersionControl; tipos de conteudo; var de ambiente |
| Publicacao | Site oficial, GitHub Pages self-hosted, npm publish |
| Arquitectura | Route parser, load-docs, docs-shell; fluxo de dados; confiabilidade |
| Temas | Estrategias de layout, modelo de template, comportamento do runtime |
| FAQ | Repos remotos, rota de versao, tema, comportamento GitHub Pages |

> Versao: 1.1.0
