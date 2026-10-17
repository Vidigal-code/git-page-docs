# FAQ

## Por que repositórios remotos não abrem localmente?

Verifique:

- `GITPAGEDOCS_REPOSITORY_SEARCH=true` no `.env`
- repositório alvo contem `gitpagedocs/config.json`
- paths markdown do repositório batem com seu config de rotas

## Por que rota de versão mostra conteúdo errado?

Verifique:

- `VersionControl.versions[*].path` em `gitpagedocs/config.json`
- config da versão possui `routes` e `menus-header` válidos
- markdown existe para cada idioma

## Por que tema não aplica corretamente?

Verifique:

- `layoutsConfig.json` referência templates válidos
- ids de template são únicos
- tema selecionado existe no mapa de temas carregados

## Por que GitHub Pages pode se comportar diferente do local?

Porque o build de GitHub Pages habilita página inicial de busca e comportamento específico de exportação.

## Por que o ícone ainda mostra texto?

Defina `site.icons.<Controle>.reactIcon` como booleano `true`, com o nome exato exportado por React Icons em `tag`. LanguageSelector, ThemeSelector, FocusMode, QuickNavigation, PdfDownload, PdfOpenInNewTab, DocumentPrevious e DocumentNext usam ícones por padrão; altere qualquer entrada para `false` para exibir texto. Campos planos `Icon*ReactIcones` prevalecem se os dois formatos existirem. Confira se o próprio recurso está desabilitado por opções como `HideThemeSelector`, `FocusMode` ou as ações PDF.

## Por que filhos de menus ou breadcrumbs aparecem diferentes?

`nestedMenusEnabled: false` achata os destinos intencionalmente. Confira `submenus`, objetos de idioma e `path-click`; confirme que as páginas existem e são acessíveis. Breadcrumbs usam `RouteGuide`, com prioridade rota > versão > site. `RouteguideBrand` controla o sumário de títulos.

## Por que a narração fica muda ou é interrompida?

Confira suporte do navegador, voz disponível, idioma, volume e saída de áudio. Vozes podem carregar depois ou exigir serviço remoto. Com `mediaExclusivePlayback: true`, outra fonte de áudio/vídeo encerra a narração por definição. Trocar de documento cancela a fala antiga. Consulte Acessibilidade.

## Por que o MCP fica aguardando ou uma tool falha?

`mcp start` aguarda um cliente MCP por stdio; não é um prompt de chat de terminal. Confira o cwd e use a entrada da CLI publicada ou `mcp/src/bin.ts`. Tools de arquivos/catálogo não precisam de provedor; geração exige credenciais no ambiente do processo MCP. O cofre da CLI e `.env` não são carregados automaticamente; inspecione `isError` e o stderr do cliente.

## Por que a regeneração mudou minhas páginas?

O scaffold regrava rotas, configs e documentação gerada. Revise o Git e mantenha conteúdo específico nas fontes escolhidas. Neste repositório, edite `cli/content/docs-{en,pt,es}.mjs` e metadados de rotas antes de regenerar; não use as cópias geradas como única fonte.

> Versão: 0.0.11
