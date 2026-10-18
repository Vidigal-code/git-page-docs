# Modo foco

O modo foco abre o documento Markdown atual em um diálogo de leitura. Ative-o com `site.FocusMode`; o controle aparece apenas para uma página Markdown real. `site.icons.FocusMode` muda a aparência em ícone/texto e não habilita ou desabilita o recurso.

## Configurar os controles

Mescle este fragmento em `gitpagedocs/config.json`:

```json
{
  "site": {
    "FocusMode": true,
    "focusMode": {
      "copyEnabled": true,
      "downloadEnabled": true,
      "sectionNavigationEnabled": true,
      "documentNavigationEnabled": true
    }
  }
}
```

Cada opção tem padrão `true`; `false` oculta a ação ou o grupo de navegação correspondente. Com `sectionNavigationEnabled: false`, o modo foco exibe o documento inteiro sem paginação por seções. Configurações existentes sem o novo objeto `focusMode` mantêm os controles habilitados.

## Seções e documentos

- A navegação de seções possui quatro botões: primeira seção, seção anterior, próxima seção e última seção do documento atual.
- A navegação de documentos possui quatro botões: primeiro documento, documento anterior, próximo documento e último documento na ordem dos menus, incluindo submenus.
- `sectionNavigationEnabled` controla os quatro botões de seção; `documentNavigationEnabled` controla os quatro botões de documento. Direções indisponíveis ficam desabilitadas nas extremidades.
- Documentos sem tradução no idioma ativo, destinos sem Markdown e páginas sem permissão são ignorados.
- Trocar de documento mantém o diálogo aberto e volta à primeira seção. Contadores de seção/documento mostram a posição atual.
- `site.ActiveNavigation` controla a navegação rápida; não desabilita a navegação de documentos no modo foco.

## Copiar e baixar

Em uma página composta, o foco lê os blocos Markdown autorizados em ordem, incluindo repetições. Copiar/baixar reúne essas fontes e usa `page-<id>.md`; as ações individuais dos blocos mantêm os nomes originais. Consulte Blocos de conteúdo ordenados para o contrato completo.

Copiar e baixar usam o **Markdown original inteiro no idioma selecionado**, incluindo seções que não estão visíveis no momento. Não exportam o HTML renderizado nem apenas a seção atual.

O download conserva o nome-base Markdown do `path` localizado da rota; quando indisponível, o nome do arquivo é `document.md`. A área de transferência segue as permissões e regras de contexto seguro do navegador. Se a cópia falhar, use o download e confira o erro exibido.

## Teclado e leitura

O diálogo possui nome acessível, gerenciamento de foco do teclado e controle de fechar. Use Tab para percorrer controles e Escape para fechar. Controles só com ícone continuam com seus nomes traduzidos acessíveis. Fechar o diálogo retorna à documentação.

A narração é configurada separadamente em Acessibilidade. No modo foco, lê somente a seção exibida. Trocar seção, documento ou idioma, entrar ou sair do modo foco interrompe a fala anterior; a próxima leitura começa no conteúdo visível. As preferências de voz, velocidade e volume são mantidas. Com `sectionNavigationEnabled: false`, o documento inteiro fica visível e disponível para narração. Copiar/baixar continua incluindo a fonte original completa.

> Versão: 0.0.13
