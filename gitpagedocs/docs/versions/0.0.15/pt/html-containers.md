# Containers HTML e exemplos interativos

Uma rota HTML exibe um documento local ou uma página externa dentro de um iframe. Use-a para uma demonstração interativa confiável que o Markdown não consegue representar. O scaffold inclui **DOOM: exemplo HTML**, rota 29. O título e a descrição pertencem ao container da documentação; o HTML contém somente o player, sem repetir títulos, instruções ou criar um botão próprio de carregamento. O jogo continua hospedado pelo provedor; o pacote npm inclui a integração HTML, não os arquivos do jogo.

## Configure uma rota HTML local

Adicione esta rota ao array `routes-html` existente na configuração da versão. Preserve as demais rotas e use um ID distinto para cada destino. Crie cada arquivo referenciado como HTML UTF-8 ou gere o exemplo incluído pela CLI.

```json
{
  "id": 29,
  "title": {
    "en": "DOOM: HTML example",
    "pt": "DOOM: exemplo HTML",
    "es": "DOOM: ejemplo HTML"
  },
  "description": {
    "en": "An interactive HTML container",
    "pt": "Um container HTML interativo",
    "es": "Un contenedor HTML interactivo"
  },
  "titleIsVisible": true,
  "descriptionIsVisible": true,
  "path": {
    "en": "gitpagedocs/docs/versions/0.0.15/en/doom.html",
    "pt": "gitpagedocs/docs/versions/0.0.15/pt/doom.html",
    "es": "gitpagedocs/docs/versions/0.0.15/es/doom.html"
  },
  "container": "full",
  "fullscreenEnabled": true,
  "blockLink": true
}
```

Adicione um item traduzido em `menus-header-html`. Cada `path-click` deve corresponder ao caminho da rota no mesmo idioma, como `gitpagedocs/docs/versions/0.0.15/pt/doom.html`; não substitua esse caminho HTML local por `page:29`. Um rótulo de menu não cria uma rota. HTML aceita a mesma estrutura recursiva `submenus` dos outros menus.

## Dimensões, conteúdo e URLs externas

`container: "full"` aplica uma altura mínima relacionada à janela; um número positivo define a altura em pixels. Omita-o para usar o container normal. `fullscreenEnabled` controla a ação de tela cheia do visualizador. Título e descrição da rota são independentes dos títulos escritos dentro do próprio HTML.

Para uma página hospedada, use `url: { "en": "https://example.com/demo", "pt": "https://example.com/demo", "es": "https://example.com/demo" }` no lugar de `path`. Uma rota URL navega o iframe; o HTML local é carregado em `srcDoc`. No conteúdo local, prefira estilos incluídos no documento e URLs HTTPS explícitas: srcDoc não resolve automaticamente os recursos relativos ao diretório do arquivo original.

O servidor externo pode impedir incorporação por CSP ou X-Frame-Options. Hosts conhecidos que bloqueiam iframe recebem uma alternativa para abrir em nova aba; falhas de qualquer servidor não são detectadas universalmente. Teste o destino real no site publicado. `blockLink: true` define nova aba como destino padrão dos links no HTML local; não impede navegação feita por scripts ou links com destino próprio.

## Use e mantenha o exemplo do jogo

Escolha o item HTML no menu. O SDK do player carrega quando a página abre; use o controle Play nativo para iniciar o jogo. Não há início automático nem botão de carregamento separado da documentação. É necessária conexão. Uma falha de inicialização exibe um erro que orienta recarregar a página; a visualização normal contém apenas o player. Teste foco de teclado, telas pequenas, tela cheia e retorno à documentação. Disponibilidade do player e recursos do navegador podem mudar independentemente do GitPageDocs.

Revise o HTML e suas dependências antes de publicar. O iframe atual permite scripts e conteúdo de mesma origem, portanto não funciona como barreira de segurança para HTML arbitrário não confiável. Não inclua segredos em HTML, URLs ou configuração do cliente. A hospedagem estática expõe os arquivos independentemente da visibilidade do menu ou autorização da rota. No ambiente local e no Pages, versione a página com a configuração correspondente e valide os caminhos gerados antes da publicação.

> Versão: 0.0.15
