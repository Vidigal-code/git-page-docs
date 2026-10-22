# Servidor MCP

O servidor Model Context Protocol expõe 20 tools e 7 resources por **stdio**. Ele inicia como processo filho do cliente MCP. Não abre porta HTTP nem executa um daemon em segundo plano.

## Instalar e conectar

Use Node.js 20+. Instale a CLI no projeto com `npm install --save-dev @gitpagedocs/cli`; ela inclui o servidor e o runtime TypeScript. A instalação global também permite `gitpagedocs mcp start`. Para execução avulsa, use `npx --yes @gitpagedocs/cli mcp start`.

No VS Code, crie `.vscode/mcp.json` com a configuração abaixo. A pasta de trabalho do processo é a raiz do projeto; o comando MCP não possui flags `--root` ou `--cwd`.

```json
{
  "servers": {
    "gitpagedocs": {
      "type": "stdio",
      "command": "node",
      "args": [
        "${workspaceFolder}/node_modules/@gitpagedocs/cli/index.mjs",
        "mcp",
        "start"
      ],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

Abra os controles de servidor MCP do cliente, inicie GitPageDocs e liste tools/resources. Teste `list_files` com `{"path":".","recursive":false}` e leia `project://readme`. Essas operações não precisam de chave de provedor. Um terminal iniciado com `mcp start` aguarda JSON-RPC; texto comum no stdin não é um comando de chat. Em um checkout do código, a entrada direta é `node --import tsx mcp/src/bin.ts`, não `index.ts`.

## Configurar um provedor

As chamadas de provedor leem credenciais do ambiente do processo MCP. O MCP não carrega `.env` nem o cofre criptografado da CLI automaticamente. Use o recurso de entrada protegida/segredos do cliente para injetar variáveis; nunca grave chaves reais em configuração versionada. Reinicie o processo MCP após alterar seu ambiente.

Selecione o provedor com `configure_ai_provider` ou pelo arquivo `.gitpagedocs-mcp.json` na raiz do projeto:

```json
{
  "provider": "ollama",
  "model": "llama3"
}
```

| Provider | Environment |
| --- | --- |
| `openai` | `OPENAI_API_KEY` |
| `anthropic` | `ANTHROPIC_API_KEY / CLAUDE_API_KEY` |
| `gemini` | `GEMINI_API_KEY / GOOGLE_API_KEY` |
| `openrouter` | `OPENROUTER_API_KEY` |
| `ollama` | `OLLAMA_BASE_URL` |
| `azure-openai` | `AZURE_OPENAI_API_KEY + AZURE_OPENAI_BASE_URL` |
| `mistral` | `MISTRAL_API_KEY` |
| `deepseek` | `DEEPSEEK_API_KEY` |
| `cohere` | `COHERE_API_KEY` |
| `groq` | `GROQ_API_KEY` |
| `xai` | `XAI_API_KEY` |
| `together` | `TOGETHER_API_KEY` |
| `fireworks` | `FIREWORKS_API_KEY` |
| `perplexity` | `PERPLEXITY_API_KEY` |

Quando a seleção salva está ausente, ilegível ou contém JSON inválido, o provedor padrão é OpenAI. Um ID de provedor desconhecido em JSON legível gera erro explícito, sem selecionar outro provedor. Ollama não exige chave de API; o serviço local e o modelo escolhido precisam estar disponíveis. `OLLAMA_BASE_URL` é opcional. A URL base do Azure é a URL completa da operação de chat, incluindo deployment e versão da API quando exigidos. A lista de modelos é um catálogo distribuído, não uma verificação de disponibilidade em tempo real.

## Referência de tools

`?` indica argumento opcional. Caminhos e conteúdo são strings; `recursive` é booleano. Os identificadores de provedor vêm do catálogo. Execute as tools pela interface de ferramentas do cliente MCP.

| Tool | Argumentos | Comportamento |
| --- | --- | --- |
| `list_files` | `path?, recursive?` | Lista arquivos (padrão: pasta atual, sem recursão) |
| `read_file` | `path` | Lê texto UTF-8 |
| `write_file` | `path, content` | Grava o arquivo inteiro; cria pastas necessárias |
| `search_project` | `query, extension?` | Busca por trecho sem distinguir maiúsculas |
| `list_ai_providers` | `—` | Consulta o catálogo de provedores |
| `list_ai_models` | `provider?` | Consulta o catálogo local de modelos |
| `configure_ai_provider` | `provider, model?` | Salva .gitpagedocs-mcp.json |
| `ask_ai` | `prompt, provider?, model?, system?` | Retorna uma resposta, sem histórico de conversa |
| `generate_documentation` | `path, provider?` | Documenta um arquivo fonte |
| `generate_api_docs` | `path, provider?` | Descreve a API de um arquivo |
| `generate_database_docs` | `path, provider?` | Descreve modelos de dados de um arquivo |
| `analyze_source_code` | `path, provider?` | Analisa um arquivo fonte |
| `generate_readme` | `provider?` | Usa a árvore e package.json |
| `generate_architecture_docs` | `provider?` | Usa a árvore do repositório |
| `analyze_repository` | `provider?` | Analisa a árvore do repositório |
| `analyze_project` | `provider?` | Analisa a árvore e package.json |
| `generate_changelog` | `provider?` | Usa até 80 commits; usa a árvore se indisponíveis |
| `generate_release_notes` | `provider?` | Usa o mesmo contexto do changelog |
| `validate_docs` | `provider?` | Pede ao provedor uma revisão do Markdown coletado |
| `update_documentation` | `path, instructions?, provider?` | Gera e grava uma região gerenciada |

`generate_*`, `analyze_*`, `ask_ai` e `validate_docs` retornam texto; não salvam automaticamente. `validate_docs` é uma revisão feita pelo provedor, não um verificador determinístico de links. Somente `write_file`, `configure_ai_provider` e `update_documentation` gravam arquivos. `update_documentation` preserva texto fora de `<!-- gitpagedocs:start -->` / `<!-- gitpagedocs:end -->`; acrescenta uma região quando o par válido não existe. O servidor não exibe confirmação própria; configure permissões no cliente MCP.

## Referência de resources

| URI | Conteúdo |
| --- | --- |
| `project://structure` | Árvore do repositório |
| `project://docs` | Documentos Markdown coletados |
| `project://config` | Configuração resolvida e sourcePath |
| `project://repository` | Conteúdo de package.json |
| `project://readme` | README.md |
| `project://ai/providers` | Catálogo de provedores |
| `project://ai/models` | Catálogo de modelos por provedor |

## Exemplo de uso

1. Leia `project://structure` e `project://readme`.
2. Execute `list_ai_providers` e `list_ai_models` para escolher provedor/modelo.
3. Execute `generate_api_docs` com `{"path":"src/index.ts"}` e revise o texto retornado.
4. Salve o texto aprovado com `write_file`, ou use `update_documentation` com `{"path":"docs/api.md","instructions":"Documente a API pública em português."}` para uma região gerenciada.

A etapa de geração envia o conteúdo selecionado do projeto ao provedor configurado.

## Limites e diagnóstico

- Leitura de arquivos: até 512.000 bytes. Listagem: até 2.000 entradas; árvores coletadas do projeto: 400 entradas.
- Busca: até 5.000 entradas, 200 resultados e 240 caracteres por linha encontrada.
- Coleta de documentação: primeiros 40 arquivos Markdown entre até 2.000 entradas; arquivos acima de 40.000 bytes são ignorados. O contexto coletado de arquivos e Markdown é limitado a 24.000 caracteres. Isso não é um limite global do prompt: árvore/pacote, documento existente e pergunta fornecida podem acrescentar conteúdo conforme a tool escolhida.
- A listagem ignora pastas de dependências/build como `node_modules`, `.git`, `.next`, `out`, `dist`, `prebuilt`, `.turbo` e `coverage`. Não interpreta `.gitignore`; arquivos como `.env` não são excluídos automaticamente. Execute somente em projeto confiável e selecione o conteúdo que será exposto.
- A partir da versão 0.0.15 dos pacotes, as ferramentas de arquivos verificam tanto os caminhos lexicais quanto os caminhos canônicos do sistema de arquivos. Leituras e listagens de diretórios rejeitam links simbólicos/junctions que apontam para fora da raiz do projeto. Gravações também validam o ancestral existente mais próximo antes de criar diretórios e rejeitam links simbólicos no destino, inclusive links para arquivos internos. A busca ignora arquivos vinculados cujo conteúdo não pode ser lido com segurança.
- Essas verificações protegem contra links já presentes quando uma solicitação é tratada; não constituem um sandbox do sistema operacional contra a substituição concorrente de caminhos por outro processo. Execute o servidor em um projeto confiável, com permissões adequadas no sistema de arquivos. O carregamento de configuração e a persistência da seleção de provedor usam caminhos separados; ler `project://config` pode importar configuração JavaScript/TypeScript.
- Falhas de tools incluem `isError: true`. Resources ausentes retornam `Unavailable: ...`. Consulte stderr no cliente para falhas de inicialização; stdout é reservado para JSON-RPC.
- Se as tools funcionam mas a geração falha, confira seleção do provedor, credenciais de ambiente, modelo e conectividade.

> Versão: 0.0.10
