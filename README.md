# Git Page Docs

Documentação multi-idioma (en, pt, es) com temas configuráveis para repositórios GitHub Pages. Inclui CLI de scaffold, SPA standalone e app Next.js.

## Instalação e uso rápido

```bash
# 1. Instalar o pacote
npm install gitpagedocs

# 2. Gerar documentação completa no projeto
npx gitpagedocs

# 3. Servir a pasta e abrir no navegador
npx serve .
# Abra http://localhost:3000
```

## Alternativas ao passo 2

```bash
# Usando npm init (cria projeto do zero)
npm init gitpagedocs

# Ou adicione ao package.json e rode o script:
# "scripts": { "gitpagedocs": "gitpagedocs" }
npm run gitpagedocs
```

## O que é gerado

O comando `npx gitpagedocs` cria:

| Arquivo / Pasta | Descrição |
|-----------------|-----------|
| `gitpagedocs/config.json` | Config raiz (rotas, menus, VersionControl, idiomas) |
| `gitpagedocs/docs/en/`, `pt/`, `es/` | Docs base: index, getting-started, configuration, deployment, architecture, themes, faq |
| `gitpagedocs/docs/versions/1.0.0/` | Docs da versão 1.0.0 |
| `gitpagedocs/docs/versions/1.1.0/` | Docs da versão 1.1.0 |
| `gitpagedocs/docs/versions/1.1.1/` | Docs da versão 1.1.1 |
| `gitpagedocs/layouts/` | Temas padrão (aurora-dark, aurora-light) |
| `public/layouts/` | Templates de tema (se `public` existir) |
| `index.js` | SPA para renderizar a documentação no navegador |
| `index.html` | Página HTML com `<div id="gitpagedocs-app">` e script (criado se não existir) |

## SPA no index.html

Se `index.html` não existir, ele é criado com:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GitPageDocs</title>
</head>
<body>
  <div id="gitpagedocs-app"></div>
  <script src="./index.js"></script>
</body>
</html>
```

O `index.js` carrega `gitpagedocs/config.json` e exibe:

- Seletor de versão (1.0.0, 1.1.0, 1.1.1)
- Seletor de idioma (EN, PT, ES)
- Menu lateral com submenus (Inicio, Primeiros passos, Configuracao › Arquitetura, Temas, FAQ, Publicacao)
- Conteúdo Markdown renderizado
- Navegação anterior/próximo

Servir sempre via HTTP (ex.: `npx serve .`), pois abrir `index.html` como `file://` pode bloquear o `fetch`.

## Desenvolvimento com Next.js

Para rodar o app Next.js deste repositório:

```bash
npm install
npm run gitpagedocs
npm run dev
```

Acesse: http://localhost:3000

## Funcionalidades

- Documentação multi-idioma (en, pt, es)
- Temas com suporte dark/light
- Seleção de versão
- Rotas por versão (`/owner/repo/v/1.1.1`)
- Redirecionamento de `?version=1.1.1` para `/v/1.1.1`
- Modo de busca por repositório (`/{owner}/{repo}`)
- UI responsiva e navegação por teclado (Ctrl+K)

## Deploy no GitHub Pages

1. Repo → **Settings** → **Pages**
2. **Source**: GitHub Actions
3. Push na branch `main`

Deploy em: [https://vidigal-code.github.io/git-page-docs/](https://vidigal-code.github.io/git-page-docs/)

## Publicar no npm

```bash
npm login
npm whoami

# Pacote principal
npm publish --access public

# Para npm init gitpagedocs
cd packages/create-gitpagedocs && npm publish --access public
```

### Erro "Cannot read properties of null (reading 'matches')"

Em geral causado por `node_modules` inconsistente ou uso misto de gerenciadores (pnpm + npm). Resolver:

```bash
rm -rf node_modules package-lock.json
npm install
```
