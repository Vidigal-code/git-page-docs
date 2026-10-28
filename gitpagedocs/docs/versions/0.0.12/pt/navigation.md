# Navegação e submenus

Rotas definem o conteúdo; menus definem como o leitor o encontra. Configure-os em `gitpagedocs/docs/versions/<version>/config.json`. Opções visuais globais ficam em `gitpagedocs/config.json`.

```json
{
  "site": {
    "nestedMenusEnabled": true,
    "RouteGuide": true
  }
}
```

## Guia de introdução

A rota `/introduction-guide` está disponível nos builds com busca de repositórios. Seu tour de capítulos acompanha a rolagem nativa da página. A partir da versão 0.0.16 do visualizador, parar em uma transição mantém o texto legível, sem sobreposição entre capítulos adjacentes. Os efeitos de parallax, a preferência por movimento reduzido e o layout em lista para telas baixas em orientação paisagem continuam disponíveis.

## Montar a árvore de menus

Cada entrada de `menus-header-md` tem `id` e objetos `pt`, `en`, `es` com `title` e `path-click` opcional. Adicione `submenus` com novas entradas para aninhar a árvore. O objeto de um idioma também aceita `submenus` localizados com título/caminho. Use uma forma de maneira consistente para não listar o mesmo filho duas vezes.

Grupos sem `path-click` organizam os filhos. Para o destino de uma rota Markdown, use seu caminho localizado real de `routes-md[].path`. Rotas source-viewer, vídeo, áudio, PDF e composições explícitas em `pages` registram `page:<id>`; uma rota Markdown simples usa o caminho do arquivo. O exemplo usa a versão `0.0.8`: troque esse trecho pela versão editada e crie os três arquivos chapter.

```json
{
  "routeDefaults": {
    "RouteGuide": false
  },
  "routes-md": [
    {
      "id": 101,
      "RouteGuide": true,
      "path": {
        "pt": "gitpagedocs/docs/versions/0.0.8/pt/chapter.md",
        "en": "gitpagedocs/docs/versions/0.0.8/en/chapter.md",
        "es": "gitpagedocs/docs/versions/0.0.8/es/chapter.md"
      }
    }
  ],
  "menus-header-md": [
    {
      "id": 900,
      "pt": {
        "title": "Guia"
      },
      "en": {
        "title": "Guide"
      },
      "es": {
        "title": "Guía"
      },
      "submenus": [
        {
          "id": 901,
          "pt": {
            "title": "Capítulos"
          },
          "en": {
            "title": "Chapters"
          },
          "es": {
            "title": "Capítulos"
          },
          "submenus": [
            {
              "id": 101,
              "pt": {
                "title": "Primeiro capítulo",
                "path-click": "gitpagedocs/docs/versions/0.0.8/pt/chapter.md"
              },
              "en": {
                "title": "First chapter",
                "path-click": "gitpagedocs/docs/versions/0.0.8/en/chapter.md"
              },
              "es": {
                "title": "Primer capítulo",
                "path-click": "gitpagedocs/docs/versions/0.0.8/es/chapter.md"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## Comportamento do aninhamento

Um pai pode ser documento e grupo ao mesmo tempo. Mantenha seu `path-click` localizado junto com `submenus`: o título abre a página Markdown e a seta separada expande ou recolhe os filhos. O scaffold inclui visões gerais úteis para os oito grupos pais. Os ancestrais dos breadcrumbs apontam para esses documentos; o destino atual continua marcado como atual. Um grupo sem caminho ainda organiza filhos, mas não possui destino para abrir.

O trecho abaixo usa as rotas Markdown 31, 32 e 13 já presentes no scaffold. Combine-o com `menus-header-md` e preserve as definições correspondentes em `routes-md` e seus arquivos:

```json
{
  "id": 1000,
  "en": {
    "title": "Guides",
    "path-click": "gitpagedocs/docs/versions/0.0.12/en/guides.md"
  },
  "pt": {
    "title": "Guias",
    "path-click": "gitpagedocs/docs/versions/0.0.12/pt/guides.md"
  },
  "es": {
    "title": "Guías",
    "path-click": "gitpagedocs/docs/versions/0.0.12/es/guides.md"
  },
  "submenus": [
    {
      "id": 1001,
      "en": {
        "title": "Configure your site",
        "path-click": "gitpagedocs/docs/versions/0.0.12/en/configure-your-site.md"
      },
      "pt": {
        "title": "Configure seu site",
        "path-click": "gitpagedocs/docs/versions/0.0.12/pt/configure-your-site.md"
      },
      "es": {
        "title": "Configura tu sitio",
        "path-click": "gitpagedocs/docs/versions/0.0.12/es/configure-your-site.md"
      },
      "submenus": [
        {
          "id": 13,
          "en": {
            "title": "Configuration",
            "path-click": "gitpagedocs/docs/versions/0.0.12/en/configuration.md"
          },
          "pt": {
            "title": "Configuração",
            "path-click": "gitpagedocs/docs/versions/0.0.12/pt/configuration.md"
          },
          "es": {
            "title": "Configuración",
            "path-click": "gitpagedocs/docs/versions/0.0.12/es/configuration.md"
          }
        }
      ]
    }
  ]
}
```

`site.nestedMenusEnabled: true` exibe menus recursivos expansíveis. Você pode acrescentar `submenus` em qualquer nó: não há limite fixo de profundidade na aplicação. A configuração deve ser finita e adequada à memória do navegador e à usabilidade. Com `false`, os destinos aparecem em uma lista plana; as páginas aninhadas não são removidas.

A árvore atende à navegação lateral, aos rótulos de busca, à expansão dos pais e à trilha de navegação. Mantenha IDs estáveis e sem ambiguidade; destinos protegidos seguem as regras de autorização da página. A mesma estrutura vale para `menus-header-source-viewer`, `menus-header-html`, `menus-header-video`, `menus-header-audio` e `menus-header-pdf`. `hierarchyMenu` ordena as seções por tipo; `hierarchyPage` ordena os containers que compartilham o ID da página.

## Trilha de navegação: RouteGuide

A trilha de navegação tem 12 px de espaçamento acima e abaixo, separando o caminho do conteúdo ao redor.

`RouteGuide` controla os breadcrumbs. A prioridade é `routes-md[].RouteGuide` da página, depois `routeDefaults.RouteGuide` da versão, depois `site.RouteGuide`, usando `true` como padrão final. O exemplo desliga a trilha na versão e a liga no capítulo 101. Arquivos existentes da versão `0.0.8` aceitam os mesmos campos.

`RouteguideBrand` e `RouteguideBrandPosition` são configurações separadas do sumário de títulos do documento; não controlam os breadcrumbs.

## URLs e anterior/próximo

URLs versionadas usam `/v/<version>/`; `?lang=pt` escolhe o idioma e `?id=101` escolhe a página. `?name=chapter` seleciona o slug do documento. Mantenha `VersionControl.versions[].path` apontando para o config da versão correspondente. `site.ActiveNavigation` ativa a navegação rápida e seu atalho Ctrl+K. Os controles anterior/próximo do rodapé seguem os destinos disponíveis no menu; a navegação entre documentos no modo foco possui opção própria. Consulte Modo foco para os controles de seção e documento.

Os botões Voltar/Próximo do rodapé usam `site.icons.DocumentPrevious` (`LuChevronLeft`) e `site.icons.DocumentNext` (`LuChevronRight`) por padrão. Defina `reactIcon: false` em qualquer entrada para exibir seu texto traduzido; cada entrada também aceita `tag`, `size`, `colorDark` e `colorLight`. A aparência não muda a navegação: o rodapé aparece quando há mais de um destino disponível no menu, e a direção indisponível continua desabilitada nas extremidades.

Teste um menu novo pela lateral, por URL direta e em cada idioma habilitado; confirme que o destino existe e é permitido para o leitor atual.

> Versão: 0.0.12
