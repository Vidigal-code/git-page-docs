# Temas e layouts

Temas sao templates JSON mapeados por `layoutsConfig.json`.

## Arquivos

- `gitpagedocs/layouts/layoutsConfig.json`
- `gitpagedocs/layouts/layoutsFallbackConfig.json`
- `gitpagedocs/layouts/templates/*.json`

## Modelo de template

Cada template normalmente contem:

- `id`, `name`, `author`, `version`
- `mode` e metadados de par dark/light
- `colors`
- `typography`
- tokens de `components`
- `animations`

## Comportamento em runtime

- tema ativo vem de config/usuario
- toggle light/dark resolve o tema pareado por referencia
- variaveis CSS sao geradas dos tokens do template

## Boas praticas

- mantenha contraste acessivel
- padronize escala de espaco e borda
- ofereca variantes dark e light quando possivel

> Versao: 1.1.0
