# Arquitetura

O projeto e organizado por fronteiras de feature e responsabilidades do runtime.

## Pacotes

- **frontend/** — visualizador Next.js (Feature-Sliced: app / widgets / features / entities / shared); export estatico.
- **cli/** — o bin publicado `gitpagedocs` (hexagonal) + `cli/ai/` (CLI de documentação com IA).
- **tools/** — `@gitpagedocs/tools`: ai/ security/ crypto/ cache/ config/ logger/ errors/ filesystem/ documentation/ i18n/ ports/.
- **mcp/** — `@gitpagedocs/mcp`: ferramentas + recursos MCP que delegam ao tools/.

## Modulos principais (frontend)

- `frontend/src/app/[[...repo]]/page.tsx` — parser de rota, generateStaticParams, seleção de shell.
- `frontend/src/entities/docs/api/load-docs-data.ts` — config local/remota, versão, parse markdown, layouts + temas.
- `frontend/src/widgets/docs-shell/docs-shell.tsx` — UI, estado idioma/versão/tema, sync de URL, montagem do chat de IA.

## Segurança: credenciais de IA criptografadas

O console `/ai` e o chat drawer exigem uma senha local que deriva (PBKDF2) uma chave AES-256-GCM; as chaves ficam criptografadas no `localStorage` e só são descriptografadas durante a sessão (`@gitpagedocs/tools/security`). O drawer se bloqueia sozinho após `site.AiChatAutoLockSeconds` segundos sem uso (padrão 30; `0` desativa): um modal centralizado com contagem regressiva, no idioma selecionado, permite cancelar ou bloquear agora, e voltar exige a senha de novo. Na CLI, a chave de `.gitpagedocsconfig` fica selada no cofre criptografado `.gitpagedocsvault` e a senha do cofre é pedida em toda execução.

## Fluxo de dados

1. A rota chega (`/owner/repo/v/x.y.z` ou equivalente local)
2. O config e resolvido (local ou remoto)
3. Config de versão sobrescreve rotas/menus base
4. Markdown e carregado e convertido para HTML
5. Template de layout e resolvido e aplicado em CSS vars
6. Shell renderiza conteúdo e controles

## Pontos de resiliencia

- fallback de carga para layouts/templates
- carregamento de markdown por idioma com fallback de erro
- sincronização de linguagem/versão/tema via localStorage

> Versão: 0.0.11
