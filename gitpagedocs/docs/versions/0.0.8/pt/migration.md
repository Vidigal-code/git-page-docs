# Migrar uma documentação existente

O GitPageDocs oferece compatibilidade com configurações e dados desde a versão oficial 0.0.1. Os formatos experimentais anteriores, numerados 1.1.x, estão fora desse contrato. Atualizar o pacote e reescrever a documentação são operações diferentes: o gerador não combina automaticamente suas páginas, rotas, traduções ou temas personalizados.

## Salve um ponto de recuperação

Anote o commit publicado, a versão da CLI e a revisão do workflow. Execute `git status --short`, revise alterações pendentes e salve os arquivos de origem desejados em um commit específico. Guarde também uma cópia dos documentos e recursos personalizados ainda não rastreados; não adicione credenciais apenas para completar o backup. Crie uma branch com `git switch -c docs/upgrade-0.0.10`.

Para uma comparação reproduzível, invoque explicitamente o pacote desejado:

```sh
npx --yes @gitpagedocs/cli@0.0.10 version
npx --yes @gitpagedocs/cli@0.0.10 --no-interactive --owner SEU_USUARIO --repo SEU_REPOSITORIO --output gitpagedocs-candidate
git diff --no-index -- gitpagedocs gitpagedocs-candidate
```

O último comando retorna código 1 quando existem diferenças; isso é esperado. A pasta candidata serve para revisão e não se torna o site ativo automaticamente. As configurações geradas ainda descrevem caminhos canônicos em `gitpagedocs/`. Alterar a pasta de saída não significa reescrever todos os caminhos usados pelo visualizador.

## Combine as configurações com cuidado

Preserve a identidade do site, as opções de publicação e as entradas de `VersionControl.versions` em `gitpagedocs/config.json`. Cada versão aponta para seu próprio `docs/versions/<version>/config.json`; mantenha os arquivos, IDs de documentos, caminhos de rotas e destinos de menus consistentes. Conserve as versões históricas necessárias aos links existentes. Arrays de rotas são conteúdo e não padrões reconstruídos pelo visualizador.

Copie somente as novas opções desejadas. O `routeDefaults` da versão fornece configurações comuns; um campo explícito na rota prevalece sobre esse padrão. Preserve Markdown, PDFs e os pacotes `gitpagedocs/langs/<idioma>.json` de cada idioma. A opção `site.languages` habilita idiomas na interface, mas não cria traduções dos documentos.

O formato compacto `site.icons.defaults` compartilha valores entre ícones, e cada entrada pode sobrescrevê-los. Campos planos `Icon*ReactIcones` existentes prevalecem sobre as entradas compactas. Remova duplicatas conflitantes apenas depois de confirmar o efeito desejado. Na versão 0.0.10, LanguageSelector, ThemeSelector, FocusMode, QuickNavigation, PdfDownload, PdfOpenInNewTab, DocumentPrevious e DocumentNext usam ícones por padrão; defina `reactIcon: false` na entrada para manter texto.

A abertura de PDF agora busca bytes validados e abre um Blob `application/pdf` em nova guia. Servidores externos precisam permitir CORS mesmo com a prévia desativada. Revise separadamente as três ações de PDF, teste a permissão de popups e preserve as mensagens traduzidas. As preferências do navegador para PDFs continuam valendo.

## Valide e publique o resultado revisado

Neste repositório de runtime, altere as fontes de geração antes de compilar: o build gera a documentação novamente. Execute `pnpm run typecheck`, `pnpm run lint`, `pnpm exec vitest run`, `pnpm run smoke:all` e `pnpm run build`. Execute `pnpm run test:e2e` com `PORT=3100` definido no shell. Um repositório consumidor precisa de verificações equivalentes próprias.

Teste todas as versões e idiomas preservados, links diretos, menus aninhados, ícones/texto, ações de PDF e autorização. Confira a exportação no subcaminho real do Pages. Faça commit dos arquivos revisados e envie pelo workflow existente. O comando inicial `pages deploy` gera arquivos, cria commit e faz push; não o repita sem revisão sobre documentação personalizada.

Registre o commit publicado após o sucesso no Actions. Se a verificação falhar, reverta o commit específico com `git revert COMMIT_DA_ATUALIZACAO`, restaure a versão anterior do runtime quando aplicável, envie e execute a publicação novamente. Confirme o conteúdo restaurado na URL pública; o revert sozinho não publica o site.

> Versao: 0.0.8
