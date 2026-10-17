# Temas e layouts

Temas são templates JSON mapeados por `layoutsConfig.json`.

## Arquivos

- `gitpagelayouts/layoutsConfig.json`
- `gitpagelayouts/layoutsFallbackConfig.json`
- `gitpagelayouts/templates/*.json`

## Modelo de template

Cada template normalmente contem:

- `id`, `name`, `author`, `version`
- `mode` e metadados de par dark/light
- `colors`
- `typography`
- tokens de `components`
- `animations`

## Comportamento em runtime

- tema ativo vem de config/usuário
- toggle light/dark resolve o tema pareado por referência
- variáveis CSS são geradas dos tokens do template

## Boas praticas

- mantenha contraste acessivel
- padronize escala de espaco e borda
- ofereca variantes dark e light quando possível

## Escolher e personalizar

Escolha um tema pelo seletor ou configure `site.ThemeDefault` com seu ID exato. `ThemeModeDefault` define o modo inicial claro/escuro. `HideThemeSelector` esconde o seletor; o tema selecionado continua aplicado.

No seu repositório, execute a CLI com `--layoutconfig`, edite o template gerado e mantenha o ID coerente com `layoutsConfig.json`. O conteúdo da rota e `site.icons` são independentes do catálogo de temas. Use `currentColor` para ícones que herdam a cor do texto ou configure cores claras/escuras com contraste suficiente.

Ao contribuir no Git Page Docs, a fonte autoral é `gitpagelayouts/v2/base.json` com `gitpagelayouts/v2/layouts/<id>.json`. Execute `pnpm layouts:sync` para gerar templates e documentação. Edições diretas nos templates gerados podem ser substituídas pela sincronização.

> Versão: 0.0.8
