# Publicação

Escolha o visualizador oficial para um repositório público, publique seu próprio GitHub Pages ou hospede um export estático compilado do runtime.

## Visualizador oficial

Faça commit da pasta `gitpagedocs/` gerada no repositório público. Abra `https://vidigal-code.github.io/git-page-docs/OWNER/REPOSITORY/` e escolha versão e idioma. O visualizador busca configuração e conteúdo no repositório. Essa URL não torna público um repositório privado.

## Seu site no GitHub Pages

Requisitos: repositório Git, origin GitHub, permissão de push e GitHub CLI autenticado (`gh auth login`) quando a CLI configura o Pages.

```bash
npx gitpagedocs pages deploy --owner OWNER --repo REPOSITORY
```

O fluxo confirma o destino, gera docs e `.github/workflows/gitpagedocs-pages.yml`, faz commit e push e solicita GitHub Actions como fonte do Pages. Para mudar apenas a fonte, use `npx gitpagedocs pages actions`. Para publicar em subcaminho, passe `--path docs`.

Acompanhe o GitHub Actions até o deploy terminar; a URL impressa pela CLI pode aparecer antes do fim do build remoto. Sites de projeto normalmente usam `https://OWNER.github.io/REPOSITORY/`; sites de usuário/organização usam a raiz do repositório `OWNER.github.io`.

## Contrato do build

O workflow instala dependências do workspace com pnpm fixado, compila o visualizador e envia o artefato estático com as actions oficiais do Pages. O job de deploy exige `pages: write`, `id-token: write` e o ambiente `github-pages`.

- `GITHUB_ACTIONS=true` ativa export estático do Next.js.
- `GITHUB_REPOSITORY=OWNER/REPOSITORY` determina a base do repositório.
- `GITPAGEDOCS_REPOSITORY_SEARCH=true` ativa o build da busca inicial.
- `GITPAGEDOCS_BASE_PATH` sobrescreve explicitamente a base; `GITPAGEDOCS_PATH` define o subcaminho dos docs.
- `GITPAGEDOCS_DIST_DIR` separa saídas de build/dev quando há dois servidores locais.

`pnpm build` sem o ambiente do Pages produz um build de produção Next.js; sozinho não valida export estático. Preserve `.nojekyll` ao hospedar o export no Pages.

## Export independente

Em um checkout do runtime com dependências instaladas, `node cli/index.mjs --home --output gitpagedocshome --no-interactive` compila `frontend/` e empacota uma distribuição estática. `--search true` ativa a busca inicial de repositórios. A saída inclui arquivos estáticos, README, Dockerfile e exemplo de ambiente; a pasta de destino é recriada. Um servidor estático serve os arquivos; alterar configuração de ambiente usada no build exige nova compilação.

## Releases npm para mantenedores

O monorepo pública `@gitpagedocs/tools`, `@gitpagedocs/mcp` e `@gitpagedocs/cli`; raiz e frontend são privados. O `npm-publish.yml` atual roda em pushes para `main` e ignora uma versão da CLI já publicada. Usa o secret `NPM_TOKEN` do repositório e pública workspaces na ordem de dependência. Criar somente uma release no GitHub não é seu gatilho.

Sincronize versões e dependências internas, regenere docs/baselines, execute typecheck, lint, testes, smoke, build e Playwright e revise antes do push. Confirme as três versões no npm e o resultado do Pages. A CLI de configuração ignora `prebuilt/`; essa pasta não é exigida pelo workflow de publicação.

> Versão: 0.0.8
