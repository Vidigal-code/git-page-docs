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
- `gitpagelayouts/layoutsConfig.json`
- `gitpagelayouts/templates/*.json`

## Navegacao rapida

- Abra **Primeiros passos** para setup local.
- Abra **Configuracao** para detalhes completos do `config.json`.
- Abra **Publicacao** para comportamento local/producao/GitHub Pages.
- Abra **Arquitetura** para mapa de codigo e fluxo de dados.
- Abra **Temas e layouts** para autoria de templates.
- Abra **Rotas autorizadas** para configurar chave, papeis e autenticacao externa.
- Abra **FAQ** para troubleshooting.

## Referências detalhadas

- **Referência da CLI**: instalação, todos os comandos e flags de compatibilidade.
- **Servidor MCP**: cliente, 20 tools, 7 resources e configuração de provedores.
- **Navegação e submenus**: árvores recursivas, URLs e sobrescritas dos breadcrumbs.
- **Modo foco**: copiar/baixar Markdown e navegar por seção/documento.
- **Acessibilidade e narração**: vozes do navegador, controles e interação com mídias.
- **Documentos PDF**: prévia nativa, download/nova aba e o guia incluído em inglês.
- **Receitas de configuração**: um site multilíngue completo e um menu com seções dentro de seções.
- **Migração e compatibilidade**: atualizar configurações desde a versão 0.0.1 preservando seu conteúdo.
- **Solução de problemas**: UTF-8, caminhos locais e do Pages, carregamento de PDF, vozes e inicialização do MCP.
- **Contribuição e validação**: arquivos fonte, geração, contratos públicos e verificações de publicação.

O menu gerado mantém Visão geral e Primeiros passos no início. Guias contém Configure seu site, Leia e explore e Automatize e integre; cada categoria contém suas páginas relacionadas. Operação e desenvolvimento agrupa publicação, manutenção e contribuição. Git e GitHub contém os exemplos de repositório. As categorias podem conter outras categorias sem um limite fixo de níveis.

> Versao: 0.0.10
