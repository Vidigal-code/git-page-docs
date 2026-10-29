# Automatize e integre

Use automação para tarefas repetíveis, mantendo o repositório como fonte de verdade. A CLI gera arquivos de configuração e documentação. O servidor MCP oferece operações do projeto a um cliente MCP. A autorização de rotas governa a experiência de acesso no visualizador.

## Escolha a interface adequada

- **Referência da CLI** lista instalação, comandos, opções e operações que gravam ou publicam arquivos.
- **Servidor MCP** descreve configuração stdio, todas as tools e resources, variáveis de provedores e limites do sistema de arquivos.
- **Rotas autorizadas** explica chaves, roles e provedores externos de identidade.

## Revise antes de publicar

Mantenha credenciais no ambiente ou armazenamento apropriado, nunca na configuração gerada. Inspecione os arquivos alterados antes do commit e valide caminhos da versão e do idioma escolhidos. Arquivos estáticos públicos continuam acessíveis por suas URLs mesmo quando o menu os esconde. Comece por comandos informativos e diretórios de saída explícitos ao comparar uma geração candidata com um site existente.

> Versão: 0.0.17
