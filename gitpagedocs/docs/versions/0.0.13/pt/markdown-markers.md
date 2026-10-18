# Marcadores de Markdown

Um marcador realça uma frase ou um elemento HTML dentro do Markdown renderizado e acrescenta uma entrada clicável ao índice. Clicar nessa entrada rola até o alvo realçado. Destaque e navegação sempre funcionam juntos; não existem modos separados de somente destaque ou somente índice.

## Preserve o sumário de títulos

`RouteguideBrand` ativa o sumário existente. `RouteGuideSpeciFicbrand` continua sendo a lista de IDs dos títulos incluídos: um array vazio inclui todos. Os marcadores são configurados separadamente em `routes-md[].markdownMarkers` e não mudam esse filtro. As entradas dos marcadores podem aparecer mesmo com `RouteguideBrand: false`. O índice acompanha a ordem do documento e reutiliza o ID existente do alvo quando disponível.

## Padrões do site

Defina ativação e cores comuns em `gitpagedocs/config.json`:

```json
{
  "site": {
    "markdownMarkers": {
      "enabled": true,
      "style": {
        "background": "color-mix(in srgb, var(--primary) 24%, transparent)",
        "color": "var(--text)",
        "outlineColor": "var(--primary)"
      }
    }
  }
}
```

O `enabled` da rota tem prioridade sobre o padrão do site. Use `markdownMarkers.enabled: false` na rota para desativar seus marcadores ou `enabled: false` em um item para ignorar apenas aquele marcador. Isso não desativa o sumário de títulos existente.

## Exemplo por rota

Acrescente estes campos a uma rota Markdown existente na configuração da versão. O primeiro alvo existe no exemplo de paginação incluído; adicione uma tabela ao Markdown antes de ativar o segundo.

```json
{
  "id": 51,
  "RouteguideBrand": true,
  "RouteGuideSpeciFicbrand": [],
  "markdownMarkers": {
    "enabled": true,
    "items": [
      {
        "id": "reading-target",
        "text": {
          "en": "This highlighted sentence is a navigation target.",
          "pt": "Esta frase realçada é um destino de navegação.",
          "es": "Esta frase resaltada es un destino de navegación."
        },
        "label": {
          "en": "Important detail",
          "pt": "Detalhe importante",
          "es": "Detalle importante"
        }
      },
      {
        "id": "second-cell",
        "selector": "td",
        "occurrence": 2,
        "label": {
          "en": "Second table cell",
          "pt": "Segunda célula da tabela",
          "es": "Segunda celda de la tabla"
        },
        "style": {
          "outlineColor": "var(--secondary)"
        }
      }
    ]
  }
}
```

| Campo | Comportamento |
| --- | --- |
| `id` | Texto obrigatório, não vazio e único na lista de marcadores da rota. |
| `text` | Frase exata, sensível a maiúsculas, no texto visível. Pode atravessar formatação inline; espaços e normalização Unicode são tratados sem alterar o texto exibido. |
| `selector` | Seletor CSS de um elemento desse Markdown, como `blockquote`, `td` ou `#exemplo`. |
| `occurrence` | Ocorrência escolhida, contando a partir de `1`; o padrão é a primeira. Útil para frases ou elementos repetidos. |
| `label` | Texto do índice; quando ausente ou indisponível, usa o ID do marcador. |
| `style` | Cores CSS opcionais `background`, `color` e `outlineColor`. |

Informe exatamente um alvo: `text` ou `selector`. Textos, seletores e rótulos aceitam uma string ou mapa de idiomas; o idioma atual tem prioridade, seguido pelo inglês. Seletores procuram apenas no fragmento Markdown atual, sem acessar a aplicação ao redor. Conteúdo oculto ou executável é excluído.

## Cores, repetições e diagnóstico

A prioridade dos estilos é: padrões do site, opções da rota e, por último, marcador. Variáveis como `var(--primary)`, `var(--secondary)` e `var(--text)` acompanham o tema claro ou escuro. Os campos aceitam cores, não folhas de estilo arbitrárias nem URLs de imagens. Todo marcador válido recebe um destaque visível do tema, mesmo sem estilo personalizado.

Em páginas compostas, cada instância Markdown mantém destinos próprios para títulos e marcadores. Copiar/baixar preserva o Markdown original. Seletores inválidos, IDs duplicados, ocorrências inválidas e alvos ausentes são informados no console e não criam links sem destino. Cores inválidas são informadas, mantendo o estilo normal disponível.

Abra Guias > Leia e explore > Exemplo de containers paginados e escolha a entrada realçada do índice no primeiro Markdown. O mesmo mecanismo atende a parágrafos, listas, citações, tabelas e elementos de código.

> Versão: 0.0.13
