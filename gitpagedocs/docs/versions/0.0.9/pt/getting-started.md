# Primeiros passos

O Git Page Docs separa os arquivos de documentação do visualizador. Instale a CLI para criar os arquivos; use o visualizador oficial, GitHub Pages ou um checkout do runtime para exibi-los.

## Requisitos e instalação

Use Node.js 20 ou superior. Git é necessário para publicar; GitHub CLI é necessário quando a CLI configura o Pages automaticamente.

```bash
npm install --save-dev @gitpagedocs/cli
npx gitpagedocs --no-interactive --owner SEU_USUARIO --repo SEU_REPOSITORIO
```

Para executar sem instalação local, use `npx --yes @gitpagedocs/cli --no-interactive --owner SEU_USUARIO --repo SEU_REPOSITORIO`. Para instalar globalmente, use `npm install -g @gitpagedocs/cli` e depois `gitpagedocs`. Execute na raiz do repositório.

## Contrato gerado

- `gitpagedocs/config.json`: opções do site e referências das versões.
- `gitpagedocs/langs/{en,pt,es}.json`: textos da interface.
- `gitpagedocs/docs/versions/<version>/config.json`: rotas e menus.
- `gitpagedocs/docs/versions/<version>/{en,pt,es}/*.md`: conteúdo; os nomes dos arquivos permanecem em inglês nos três idiomas.
- `gitpagedocs/icon.svg`: ícone do site.
- `--layoutconfig` também grava `gitpagelayouts/`; `--layouts-dir` altera essa pasta.

O gerador escreve configuração e conteúdo; ele não instala uma aplicação Next.js no seu repositório. Executá-lo novamente regrava os arquivos do scaffold: revise o diff do Git antes de manter mudanças em documentação editada manualmente.

## Ler e publicar

Faça commit e push da pasta gerada e abra `https://vidigal-code.github.io/git-page-docs/SEU_USUARIO/SEU_REPOSITORIO/` para um repositório público. Para publicar seu próprio site, autentique com `gh auth login` e execute `npx gitpagedocs pages deploy --owner SEU_USUARIO --repo SEU_REPOSITORIO`. Isso gera arquivos, faz commit e push; acompanhe a execução do GitHub Actions. Consulte Publicação para subcaminhos e o contrato do workflow.

## Desenvolver o visualizador localmente

Os comandos abaixo pertencem a um checkout do Git Page Docs, não a um repositório que contém apenas arquivos gerados:

```bash
git clone https://github.com/Vidigal-code/git-page-docs.git
cd git-page-docs
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

O repositório fixa o pnpm em `packageManager`. `pnpm dev` ativa a busca de repositórios; `pnpm dev:e2e` usa a documentação local. Para produção local, execute `pnpm build` e `pnpm start`; o script start recompila antes de iniciar. Configure `PORT=3100` no ambiente do processo quando a porta 3000 estiver ocupada.

## Próximos passos

Use Configuração para idiomas, ícones, navegação, foco e narração; Funcionalidades para CLI e MCP; Temas e layouts para tokens visuais; Perguntas frequentes para diagnóstico.

> Versão: 0.0.9
