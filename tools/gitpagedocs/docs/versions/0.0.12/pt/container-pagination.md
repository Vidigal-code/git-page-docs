# Containers paginados

Mostre vários arquivos em um único container Markdown, HTML, vídeo, áudio ou PDF. Cadastre os arquivos na coleção de rotas correspondente e informe os IDs, na ordem desejada, em `pagination.items` na rota do container. Cada container mantém sua própria seleção. Use blocos de conteúdo ordenados para combinar vários containers e tipos em uma página.

## Padrões do site

Configure `site.containerPagination` em `gitpagedocs/config.json`. Os quatro controles ficam ativos por padrão: primeira página, anterior, próxima e última. Aparecem abaixo do conteúdo, à direita, com ícones e contador de página atual/total.

```json
{
  "site": {
    "containerPagination": {
      "enabled": true,
      "alignment": "right",
      "placement": "bottom",
      "display": "icon",
      "showCount": true,
      "controls": {
        "first": true,
        "previous": true,
        "next": true,
        "last": true
      },
      "icons": {
        "first": "FiSkipBack",
        "previous": "FiChevronLeft",
        "next": "FiChevronRight",
        "last": "FiSkipForward"
      },
      "iconSize": "20px",
      "labels": {
        "pages": {
          "en": "Pages",
          "pt": "Páginas",
          "es": "Páginas"
        },
        "first": {
          "en": "First page",
          "pt": "Primeira página",
          "es": "Primera página"
        },
        "previous": {
          "en": "Previous page",
          "pt": "Página anterior",
          "es": "Página anterior"
        },
        "next": {
          "en": "Next page",
          "pt": "Próxima página",
          "es": "Página siguiente"
        },
        "last": {
          "en": "Last page",
          "pt": "Última página",
          "es": "Última página"
        }
      }
    }
  }
}
```

## Arquivos e metadados por rota

Adicione este exemplo a `routes-md` na configuração da versão. A rota 1 já deve existir. O primeiro item pode apontar para a própria rota. HTML, vídeo, áudio e PDF utilizam a mesma estrutura na coleção `routes-*` correspondente.

```json
{
  "id": 51,
  "path": {
    "en": "gitpagedocs/docs/versions/<version>/en/pagination-first.md",
    "pt": "gitpagedocs/docs/versions/<version>/pt/pagination-first.md",
    "es": "gitpagedocs/docs/versions/<version>/es/pagination-first.md"
  },
  "pagination": {
    "items": [
      {
        "routeId": 51,
        "title": {
          "en": "First lesson",
          "pt": "Primeira lição",
          "es": "Primera lección"
        }
      },
      {
        "routeId": 1,
        "title": {
          "en": "Getting started",
          "pt": "Primeiros passos",
          "es": "Primeros pasos"
        },
        "description": {
          "en": "Configure your project",
          "pt": "Configure seu projeto",
          "es": "Configura tu proyecto"
        }
      }
    ]
  }
}
```

| Opção | Valores e comportamento |
| --- | --- |
| `enabled` | Ativa ou desativa; a rota tem prioridade sobre o padrão do site. |
| `alignment` | `left`, `center` ou `right`; padrão `right`. |
| `placement` | `top`, `bottom` ou `both`; padrão `bottom`. |
| `display` | `icon` ou `text`; padrão `icon`. |
| `showCount` | Exibe página atual e total; padrão `true`. |
| `controls` | Ativa individualmente `first`, `previous`, `next` e `last`. |
| `icons` / `iconSize` | Tags do React Icons e tamanho CSS; cores acompanham o tema. |
| `labels` | Texto ou mapa de idiomas para as ações e `pages`; nomes acessíveis permanecem no modo ícone. |
| `items` | Lista ordenada com `routeId` inteiro do mesmo tipo de conteúdo. |
| `items[].title` / `description` | Mapas de idiomas que substituem os metadados do item; campos omitidos usam os metadados da rota. |

Controles, ícones e rótulos complementam os padrões globais. Botões sem destino disponível ficam desabilitados. Desativar a paginação mostra a rota original. Referências inválidas são informadas no console; fontes sem autorização são excluídas. A paginação de outra rota não é expandida recursivamente.

## Foco, busca e mídia

A paginação Markdown aparece no modo foco. Trocar de arquivo mantém o foco aberto, atualiza título, descrição e ações de origem, e retorna à primeira seção. O Ctrl+K inclui os itens disponíveis de containers com destino no menu; o resultado abre o item na página proprietária. A seleção é mantida durante a navegação na documentação carregada e reiniciada ao mudar idioma, versão ou recarregar.

O arquivo selecionado utiliza as opções existentes de disposição dos metadados. Título e descrição do Markdown permanecem fora do Markdown renderizado. A troca de mídia substitui o player anterior e preserva a reprodução exclusiva. A navegação geral do rodapé é independente: `site.documentNavigation.position` continua com padrão `center`.

## Exemplo para validar

Abra Guias > Leia e explore > Exemplo de containers paginados (página 50). Há três arquivos Markdown, dois HTML, versões MP4/WebM do vídeo público de flores da MDN, dois tons WAV locais de dois segundos e dois PDFs diferentes em inglês. O vídeo precisa de internet; os demais arquivos acompanham a documentação. Navegue em cada container, teste o Ctrl+K e abra a sequência Markdown no modo foco.

> Versão: 0.0.12
