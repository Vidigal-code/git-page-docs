# Configure seu site

Separe a apresentação global do conteúdo de cada versão da documentação. O arquivo raiz `gitpagedocs/config.json` seleciona idiomas, temas e controles de leitura. A configuração da versão define rotas, arquivos por idioma e a árvore de menus.

## Configure em uma ordem prática

1. Leia **Configuração** para localizar a opção desejada e seu padrão.
2. Use **Receitas de configuração** para exemplos JSON completos e uma estrutura multilíngue inicial.
3. Escolha **Temas e layouts** para tokens visuais e alterações de templates.
4. Leia **Navegação e submenus** para conectar rotas, documentos dos pais, submenus e breadcrumbs.

## Confira o resultado

Mantenha um arquivo existente para cada idioma habilitado e destino do menu. Apenas um título não cria um documento. Dê ao pai seu próprio caminho Markdown quando precisar de uma introdução e preserve os filhos em `submenus`. Valide um idioma primeiro; depois confira os demais, o menu plano e um link direto para uma página aninhada. Preserve as configurações específicas do repositório ao gerar exemplos novamente.

> Versão: 0.0.16
