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

Cada opção tem padrão `true`; `false` oculta seu controle correspondente. Com `sectionNavigationEnabled: false`, o modo foco exibe o documento inteiro sem paginação por seções. Configurações existentes sem o novo objeto `focusMode` mantêm os controles habilitados.

## Seções e documentos

- Os controles anterior/próximo de seta simples mudam de seção no mesmo documento.
- Os controles anterior/próximo de seta dupla mudam de documento Markdown na ordem dos menus, incluindo submenus.
- Documentos sem tradução no idioma ativo, destinos sem Markdown e páginas sem permissão são ignorados.
- Trocar de documento mantém o diálogo aberto e volta à primeira seção. Contadores de seção/documento mostram a posição atual.
- `site.ActiveNavigation` controla a navegação comum da página; não desabilita a navegação de documentos no modo foco.

## Copiar e baixar

Copiar e baixar usam o **Markdown original inteiro no idioma selecionado**, incluindo seções que não estão visíveis no momento. Não exportam o HTML renderizado nem apenas a seção atual.

O download conserva o nome-base Markdown do `path` localizado da rota; quando indisponível, o nome do arquivo é `document.md`. A área de transferência segue as permissões e regras de contexto seguro do navegador. Se a cópia falhar, use o download e confira o erro exibido.

## Teclado e leitura

O diálogo possui nome acessível, gerenciamento de foco do teclado e controle de fechar. Use Tab para percorrer controles e Escape para fechar. Controles só com ícone continuam com seus nomes traduzidos acessíveis. Fechar o diálogo retorna à documentação.

A narração é configurada separadamente em Acessibilidade. Trocar documento ou idioma cancela a narração anterior, evitando continuar a leitura de conteúdo antigo.

> Versao: 0.0.8
