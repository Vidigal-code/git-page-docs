# Receitas de configuração

Este guia monta um site pequeno em três idiomas, com duas páginas Markdown e menu com três níveis. Comece pela configuração gerada, revise as mudanças e mantenha os arquivos originais no controle de versão. Os exemplos usam os IDs 101 e 102 para distingui-los das páginas incluídas no scaffold.

## 1. Gere e confira a estrutura

O scaffold inclui as versões 0.0.18, 0.0.17, 0.0.16, 0.0.15, 0.0.14, 0.0.13, 0.0.12, 0.0.11, 0.0.10 e 0.0.9 no seletor, da mais recente para a mais antiga. As dez contêm os exemplos atuais; a versão do pacote é 0.0.18. Caminhos e rótulos de versão são gerados para a versão correspondente da documentação. Pastas existentes de versões anteriores não são apagadas.

Execute `npx --yes @gitpagedocs/cli@0.0.18 --no-interactive --owner SEU_USUARIO --repo SEU_REPOSITORIO` em um diretório de projeto novo. Neste repositório de código-fonte, `node cli/index.mjs` executa a versão do checkout. A geração grava configuração e documentação; ela não inicia o visualizador Next.js.

O JSON completo abaixo é um exemplo mínimo de `gitpagedocs/config.json`. Em um site existente, mescle os campos relevantes e preserve a identidade do repositório, opções de publicação, temas e demais versões.

```json
{
  "site": {
    "name": "Documentação • Guía • Documentation",
    "docsVersion": "0.0.18",
    "languages": {
      "en": true,
      "pt": true,
      "es": true
    },
    "nestedMenusEnabled": true,
    "ActiveNavigation": true,
    "RouteGuide": true,
    "FocusMode": true,
    "focusMode": {
      "copyEnabled": true,
      "downloadEnabled": true,
      "sectionNavigationEnabled": true,
      "documentNavigationEnabled": true
    },
    "icons": {
      "defaults": {
        "reactIcon": true,
        "size": "22px",
        "colorDark": "currentColor",
        "colorLight": "currentColor"
      },
      "LanguageSelector": {
        "tag": "SiGoogletranslate"
      },
      "ThemeSelector": {
        "tag": "LuPencil"
      },
      "VersionSelector": {
        "tag": "LuGitBranch"
      },
      "FocusMode": {
        "tag": "LuBookOpen"
      },
      "QuickNavigation": {
        "tag": "LuSearch"
      },
      "PdfDownload": {
        "tag": "LuDownload"
      },
      "PdfOpenInNewTab": {
        "tag": "LuExternalLink"
      },
      "DocumentPrevious": {
        "tag": "LuChevronLeft"
      },
      "DocumentNext": {
        "tag": "LuChevronRight"
      }
    },
    "pdf": {
      "enabled": true,
      "previewEnabled": true,
      "downloadEnabled": true,
      "openInNewTabEnabled": true
    }
  },
  "VersionControl": {
    "versions": [
      {
        "id": "0.0.18",
        "path": "gitpagedocs/docs/versions/0.0.18/config.json"
      }
    ]
  }
}
```

As nove entradas herdam a apresentação comum de `icons.defaults`. Para mostrar texto em uma ação, acrescente `"reactIcon": false` à entrada correspondente. Não altere um default compartilhado apenas para mudar um botão. Campos planos antigos de ícones prevalecem sobre os compactos; remova ou atualize um campo conflitante somente depois de confirmar sua intenção.

## 2. Crie a configuração da versão

Salve o próximo JSON completo no caminho do config da versão indicado acima. Uma categoria de menu tem título e `submenus`; uma folha tem `path-click` localizado. Categorias não precisam de rota. Destinos Markdown apontam para os caminhos reais dos arquivos, sem usar o alias `page:<id>`.

```json
{
  "routeDefaults": {
    "RouteGuide": true
  },
  "routes-md": [
    {
      "id": 101,
      "title": {
        "en": "Start",
        "pt": "Início",
        "es": "Inicio"
      },
      "path": {
        "en": "gitpagedocs/docs/versions/0.0.18/en/start.md",
        "pt": "gitpagedocs/docs/versions/0.0.18/pt/start.md",
        "es": "gitpagedocs/docs/versions/0.0.18/es/start.md"
      }
    },
    {
      "id": 102,
      "title": {
        "en": "Next steps",
        "pt": "Próximos passos",
        "es": "Próximos pasos"
      },
      "path": {
        "en": "gitpagedocs/docs/versions/0.0.18/en/next-steps.md",
        "pt": "gitpagedocs/docs/versions/0.0.18/pt/next-steps.md",
        "es": "gitpagedocs/docs/versions/0.0.18/es/next-steps.md"
      }
    }
  ],
  "menus-header-md": [
    {
      "id": 3100,
      "en": {
        "title": "Guides"
      },
      "pt": {
        "title": "Guias"
      },
      "es": {
        "title": "Guías"
      },
      "submenus": [
        {
          "id": 3101,
          "en": {
            "title": "Getting started"
          },
          "pt": {
            "title": "Primeiros passos"
          },
          "es": {
            "title": "Primeros pasos"
          },
          "submenus": [
            {
              "id": 101,
              "en": {
                "title": "Start",
                "path-click": "gitpagedocs/docs/versions/0.0.18/en/start.md"
              },
              "pt": {
                "title": "Início",
                "path-click": "gitpagedocs/docs/versions/0.0.18/pt/start.md"
              },
              "es": {
                "title": "Inicio",
                "path-click": "gitpagedocs/docs/versions/0.0.18/es/start.md"
              }
            },
            {
              "id": 102,
              "en": {
                "title": "Next steps",
                "path-click": "gitpagedocs/docs/versions/0.0.18/en/next-steps.md"
              },
              "pt": {
                "title": "Próximos passos",
                "path-click": "gitpagedocs/docs/versions/0.0.18/pt/next-steps.md"
              },
              "es": {
                "title": "Próximos pasos",
                "path-click": "gitpagedocs/docs/versions/0.0.18/es/next-steps.md"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

Crie `start.md` e `next-steps.md` nas pastas `en`, `pt` e `es` dessa versão: seis arquivos ao todo. Escreva no idioma correspondente e salve em UTF-8. Comece cada página com um título e acrescente seções `##` para testar o modo foco. Os bundles gerados em `langs/` contêm os textos da interface, separados do conteúdo dos documentos.

## 3. Mude a apresentação sem perder destinos

Com `nestedMenusEnabled: true`, o leitor expande Guias → Primeiros passos → página. Com `false`, os mesmos destinos aparecem em uma lista plana. Acrescente `submenus` recursivamente quando a organização do conteúdo justificar; não há limite fixo de profundidade configurado. Mantenha identidades distintas entre irmãos e evite repetir destinos apenas para aumentar a árvore.

Breadcrumbs usam `site.RouteGuide`, depois `routeDefaults.RouteGuide` da versão e por último a rota individual. O valor explícito mais específico prevalece. `RouteguideBrand` é o índice separado de títulos. As setas Voltar/Próximo do rodapé seguem os destinos disponíveis; `ActiveNavigation` controla a navegação rápida e Ctrl+K.

## 4. Inclua mídia e valide

Consulte Documentos PDF para adicionar `routes-pdf` e `menus-header-pdf`; o exemplo `page:23` aponta para o guia em inglês incluído. Prévia, download e nova aba são independentes da aparência dos ícones. PDFs externos precisam permitir CORS nas três ações; PDFs locais dentro de `gitpagedocs/` são preparados ao executar ou compilar o Next.js.

Confira todos os idiomas, expanda cada categoria e percorra as folhas. Teste URLs diretas, alterações entre texto e ícone, primeiro/anterior/próximo/último no foco e direções desabilitadas nas extremidades. Inspecione o config da versão quando o rótulo aparece mas o destino falha. Faça commit da configuração revisada junto com os documentos e anexos referenciados.

> Versão: 0.0.18
