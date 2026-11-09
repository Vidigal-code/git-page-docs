# Telas estreitas e dobráveis

Um documento do GitPageDocs deve continuar legível quando a largura disponível do navegador muda. Um celular dobrável pode oferecer tela externa estreita, tela interna ampla, modo de tela dividida e diferentes orientações. A largura da janela em pixels CSS importa mais que o nome do aparelho: não presuma que todo Galaxy Z Fold tenha a mesma largura visível.

## Configure um menu fácil de percorrer

Use rótulos traduzidos concisos e agrupe páginas relacionadas em categorias claras. Um pai pode abrir sua introdução enquanto o controle separado de expansão mostra os filhos. Mantenha os destinos importantes perto do início da árvore. Se uma hierarquia profunda dificultar um site pequeno, defina `nestedMenusEnabled` como false para exibir os destinos existentes em uma lista plana.

O fragmento abaixo fica dentro de `site`, em `gitpagedocs/config.json`:

```json
{
  "nestedMenusEnabled": true,
  "RouteGuide": true,
  "ActiveNavigation": true,
  "documentNavigation": { "position": "center" },
  "RouteguideBrandPositionDefault": "left",
  "RouteguideBrandContainerTopDefault": false,
  "backgroundEffects": {
    "enabled": true,
    "overrides": { "accessibility": { "showPauseButton": true } }
  }
}
```

`RouteGuide` mantém os breadcrumbs disponíveis; `ActiveNavigation` habilita a navegação rápida. Essas opções não definem um breakpoint por aparelho. O visualizador adapta o layout ao espaço disponível. Use o controle do menu móvel para acessar idioma, tema e animações quando o cabeçalho estiver recolhido.

## Limite o índice de forma intencional

Em uma referência Markdown extensa, indexe a hierarquia principal de títulos em vez de todos os parágrafos. Adicione o fragmento é rota correspondente de `routes-md`:

```json
{
  "RouteguideBrand": true,
  "RouteGuideTags": ["h1", "h2", "h3"],
  "RouteguideBrandPosition": "left"
}
```

Títulos abaixo dos níveis escolhidos continuam visíveis no documento. Se uma página se beneficiar do índice acima do conteúdo em todas as larguras, configure `RouteguideBrandContainerTop` como true nessa rota e confira a ordem de leitura. Consulte [Configure o guia do documento](route-guide.md) para listas vazias, comportamento legado, filtros de ID e marcadores explícitos.

## Escreva conteúdo que se adapte

Prefira links com rótulos curtos a URLs expostas, tabelas estreitas a muitas colunas sem relação e blocos de código com a linguagem indicada. Preserve comandos longos para cópia; a rolagem horizontal dentro de um bloco é diferente de uma página inteira transbordando. Divida exemplos grandes em fragmentos focados e identifique onde cada fragmento deve ser aplicado.

Em demonstrações HTML locais, inclua a meta tag de viewport, use larguras relativas, permita quebra de texto e evite larguras mínimas fixas maiores que o iframe. Confira teclado e toque separadamente do visualizador. O leitor PDF nativo, as vozes do navegador e os players externos têm limitações móveis próprias; ofereça texto útil e ações alternativas quando disponíveis.

## Confira dobra e redimensionamento

Use esta sequência com larguras de 280, 320, 344, 390 e 768 pixels CSS; depois repita os caminhos importantes em um aparelho real:

1. Abra diretamente uma referência longa e confira se o corpo do documento não transborda a janela.
2. Abra e feche o menu principal, expanda um pai, siga uma página aninhada e retorne pelo breadcrumb.
3. Troque idioma e tema; confira se os rótulos traduzidos e indicadores de foco permanecem visíveis.
4. Abra o guia do documento, siga uma entrada próxima do fim e retorne ao topo.
5. Abra o modo foco, use os controles de seção e documento e feche-o sem perder a orientação.
6. Mude a largura com o menu ou guia aberto. No aparelho dobrável, também abra e feche o dispositivo e altere a orientação.
7. Repita com texto ampliado, navegação por teclado e preferência de redução de movimento do sistema.

Essas larguras formam uma matriz de verificação, não uma certificação de todos os navegadores, estados de dobra, níveis de zoom ou modelos Galaxy Z Fold. Registre navegador, largura, orientação, rota, idioma e comportamento observado para produzir um relato reproduzível.

## Mantenha animações opcionais

A ação de pausa do cabeçalho controla a animação decorativa sem ocultar a documentação. A preferência de redução de movimento do sistema tem prioridade. Para desabilitar os efeitos de fundo em todo o site, configure `site.backgroundEffects.enabled` como false. Teste uma página longa durante rolagem e abertura de menus; os efeitos visuais não devem atrasar o acesso ao conteúdo. Consulte [Temas e layouts](themes.md) para opções por tema e de desempenho.


## Acompanhe a página ativa no menu

Com o cadeado de navegação destravado, Anterior e Próximo centralizam o destino atual na área de rolagem do próprio menu. Abrir ou destravar o menu também revela esse destino. O comportamento vale para a barra lateral desktop e a gaveta móvel; o limite de rolagem restringe a centralização perto do início ou fim. O documento não se move quando o menu é centralizado.

A rolagem manual do menu permanece entre mudanças de página. Redimensionar ou desdobrar a tela centraliza o item ativo; travar o menu preserva sua posição e desativa o acompanhamento automático. Teste os dois estados do cadeado ao passar de 344 para 768 pixels CSS e voltar, inclusive na orientação horizontal.

## Exiba os controles desde a primeira renderização

Os controles de idioma, tema e animação usam os ícones oficiais padrão enquanto a configuração do shell independente carrega ou não pode ser obtida. Busca de repositórios, carregamento da documentação, abertura de repositório, guia introdutório, visualizador de código e páginas não encontradas mantêm nomes acessíveis nos botões. A opção explícita `reactIcon: false` continua válida para texto localizado depois que a configuração carrega; os padrões de ícone não a substituem.

A trilha de navegação tem `1.75rem` de espaço acima e abaixo (28 pixels CSS no tamanho padrão da fonte raiz). Os seletores móveis preenchem as linhas do menu com ícones centralizados; os seletores do cabeçalho desktop mantêm dimensões compactas.

Desde a 0.0.22, os controles do cabeçalho da documentação exibem um ícone padrão enquanto o ícone configurado carrega, evitando controles vazios. O ícone configurado substitui esse padrão quando está pronto; uma preferência explícita por texto continua como texto. Em telas estreitas, os controles de ações Markdown reservam espaço próprio antes do título do documento, sem cobri-lo.

> Versão: 0.0.24
