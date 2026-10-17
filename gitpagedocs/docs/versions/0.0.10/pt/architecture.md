# Arquitetura

O projeto e organizado por fronteiras de feature e responsabilidades do runtime.

## Pacotes

- **frontend/** — visualizador Next.js (Feature-Sliced: app / widgets / features / entities / shared); export estatico.
- **cli/** — o bin publicado `gitpagedocs` (hexagonal) + `cli/ai/` (CLI de documentacao com IA).
- **tools/** — `@gitpagedocs/tools`: ai/ security/ crypto/ cache/ config/ logger/ errors/ filesystem/ documentation/ i18n/ ports/.
- **mcp/** — `@gitpagedocs/mcp`: ferramentas + recursos MCP que delegam ao tools/.

## Modulos principais (frontend)

- `frontend/src/app/[[...repo]]/page.tsx` — parser de rota, generateStaticParams, selecao de shell.
- `frontend/src/entities/docs/api/load-docs-data.ts` — config local/remota, versao, parse markdown, layouts + temas.
- `frontend/src/widgets/docs-shell/docs-shell.tsx` — UI, estado idioma/versao/tema, sync de URL, montagem do chat de IA.

## Seguranca: credenciais de IA criptografadas

O console `/ai` e o chat drawer exigem uma senha local que deriva (PBKDF2) uma chave AES-256-GCM; as chaves ficam criptografadas no `localStorage` e so sao descriptografadas durante a sessao (`@gitpagedocs/tools/security`). O drawer se bloqueia sozinho apos `site.AiChatAutoLockSeconds` segundos sem uso (padrao 30; `0` desativa): um modal centralizado com contagem regressiva, no idioma selecionado, permite cancelar ou bloquear agora, e voltar exige a senha de novo. Na CLI, a chave de `.gitpagedocsconfig` fica selada no cofre criptografado `.gitpagedocsvault` e a senha do cofre e pedida em toda execucao.

## Fluxo de dados

1. A rota chega (`/owner/repo/v/x.y.z` ou equivalente local)
2. O config e resolvido (local ou remoto)
3. Config de versao sobrescreve rotas/menus base
4. Markdown e carregado e convertido para HTML
5. Template de layout e resolvido e aplicado em CSS vars
6. Shell renderiza conteudo e controles

## Pontos de resiliencia

- fallback de carga para layouts/templates
- carregamento de markdown por idioma com fallback de erro
- sincronizacao de linguagem/versao/tema via localStorage

> Versao: 0.0.10
