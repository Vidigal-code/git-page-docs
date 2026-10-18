# Referência da CLI

## Comandos da CLI

| Comando | Descrição |
|---------|------------|
| `npx @gitpagedocs/cli` | Gera config e docs em `gitpagedocs/` |
| `npx @gitpagedocs/cli --layoutconfig` | Também gera layouts/templates locais em `gitpagelayouts/` |
| `npx @gitpagedocs/cli --home` | Distribuicao standalone (`gitpagedocshome/`) |
| `npx @gitpagedocs/cli --push --owner X --repo Y` | Configura workflow, commit, push |
| `npx @gitpagedocs/cli --interactive` / `-i` | Modo interativo com prompts (padrão em um terminal) |
| `npx @gitpagedocs/cli --no-interactive` / `--yes` / `-y` | Nunca pergunta; usa flags e padrões |
| `gitpagedocs ai` | Gerador interativo de documentação com IA |
| `gitpagedocs chat [pergunta]` | Chat de IA com streaming no terminal (REPL em TTY; resposta única com pergunta ou stdin) |
| `gitpagedocs provider [id]` / `models [provider]` | Lista provedores de IA / modelos do catálogo |
| `gitpagedocs document[:repo\|:file\|:folder]` | Gera documentação com IA |
| `gitpagedocs deploy` / `pages [actions\|deploy]` | Configura GitHub Pages via Actions + push |
| `gitpagedocs docs` | Atualiza as regioes gerenciadas de README/CONTRIBUTING/SECURITY |
| `gitpagedocs password` | Define a senha de acesso a documentação (chave pública em `site.docsAccess`) |
| `gitpagedocs config` / `config clear` | Mostra a config resolvida / apaga a config salva e o cofre de chaves |
| `gitpagedocs doctor` / `version` / `update` | Diagnóstico / versão / verificação de atualização no registro |
| `gitpagedocs mcp start` | Inicia o servidor MCP via stdio |

Instale globalmente com `npm install -g @gitpagedocs/cli` ou rode sem instalar com `npx @gitpagedocs/cli`.

## Opções da CLI

| Opção | Descrição |
|-------|-----------|
| `--owner <user>` | Owner do GitHub |
| `--repo <repo>` | Repositório GitHub |
| `--path <subpath>` | Subcaminho dos docs (ex: `docs`); sem ele, base path = nome do repo para CSS/JS em project sites |
| `--output <dir>` | Diretório de saída (padrão: `gitpagedocs`) |
| `--search <true-or-false>` | Habilita/desabilita busca de repositório (`--home`) |
| `--layoutconfig` | Gera layouts locais em `gitpagelayouts/` |
| `--layouts-dir <dir>` | Pasta dos layouts locais (padrão: `gitpagelayouts`) |
| `--push` | Cria workflow, commit de artefatos, push |
| `--pages-actions` | Apenas muda a fonte do GitHub Pages para GitHub Actions (igual a `pages actions`) |
| `--home` | Gera `gitpagedocshome/` (estatico + .env + Dockerfile) |

## Saída gerada

- `gitpagedocs/config.json` – config raiz
- `gitpagedocs/icon.svg` – ícone padrão
- `gitpagedocs/docs/versions/<ver>/config.json` – rotas por versão
- `gitpagedocs/docs/versions/<ver>/{en,pt,es}/*.md` – docs em markdown
- `gitpagelayouts/` – apenas com `--layoutconfig` (pasta configuravel com `--layouts-dir`)

## Exemplos e limites dos comandos

```bash
npx gitpagedocs --no-interactive --owner octocat --repo handbook
npx gitpagedocs --layoutconfig --layouts-dir assets/layouts --no-interactive
npx gitpagedocs chat "Explique este projeto" --provider ollama --model llama3
npx gitpagedocs pages deploy --owner octocat --repo handbook --path docs
npx gitpagedocs mcp start
```

- `init` é um alias da geração. `providers` equivale a `provider`; `--version` e `-v` equivalem a `version`.
- `document`, `document:repo`, `document:file`, `document:folder` e `--ai` selecionam o fluxo interativo de documentação. Escolha diretórios nos prompts; esses aliases não implementam uma API separada de arquivo/pasta por argumento posicional.
- `chat` aceita `--provider <id>`, `--model <id>` e `--system <prompt>`. Com pergunta ou stdin recebe resposta única; um terminal interativo sem pergunta inicia uma conversa.
- `--build`, `--serve` e `--full` são flags de compatibilidade: o scaffold comum continua apenas configuração e elas não iniciam um servidor local.
- `--home` compila `frontend/` a partir de um checkout do runtime e grava o export estático com arquivos auxiliares. A pasta de saída é recriada quando diferente de `.`; mantenha sua documentação fonte fora dela. Instalar apenas a CLI não fornece `frontend/`.
- `pages actions` apenas configura a fonte do Pages; `pages deploy` e `--push` geram, fazem commit e push. Uma URL impressa não significa que o build remoto terminou: acompanhe o GitHub Actions.
- `update` consulta o npm e imprime um comando de instalação; não atualiza a CLI silenciosamente.

## Configuração e credenciais

As opções visuais ficam em `gitpagedocs/config.json`. O gerador interativo/chat salva `.gitpagedocsconfig` e o cofre criptografado `.gitpagedocsvault` na pasta de configuração do usuário: `%APPDATA%/gitpagedocs` no Windows, `~/Library/Application Support/gitpagedocs` no macOS e a pasta XDG no Linux. `config clear` remove essas configurações e o cofre. MCP usa `.gitpagedocs-mcp.json` na raiz do projeto e o ambiente do processo; consulte a página MCP.

`gitpagedocs docs` atualiza somente regiões delimitadas por marcadores em README.md, CONTRIBUTING.md e SECURITY.md, preservando o texto ao redor. `password` configura o par de chaves de acesso à documentação; controles de apresentação no cliente não tornam confidenciais arquivos de um repositório público.

> Versão: 0.0.13
