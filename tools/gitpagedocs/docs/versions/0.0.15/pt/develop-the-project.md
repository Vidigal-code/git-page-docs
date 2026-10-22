# Desenvolva o projeto

Comece pelo módulo responsável pelo comportamento que deseja alterar. O frontend segue Feature-Sliced Design; a CLI possui os templates do scaffold; tools fornece serviços compartilhados de configuração e documentação; MCP expõe esses serviços por seu protocolo.

## Localize a fonte e a fronteira de teste

- **Arquitetura** mapeia pacotes, responsabilidades e fluxo de dados.
- **Contribuição e testes** identifica templates autorais, saídas geradas e comandos de validação.
- **Funcionalidades** oferece uma referência ampla das capacidades e configurações existentes.

## Produza uma mudança revisável

Descreva o comportamento observável, reproduza-o pela interface pública e atualize a fonte antes de gerar artefatos. Teste controles renderizados, configurações retornadas ou arquivos escritos, em vez de helpers privados. Revise traduções e acessibilidade ao mudar controles visíveis. Execute as verificações adequadas aos pacotes afetados e inspecione o diff gerado antes do commit. Diretórios de versões existentes devem permanecer intactos, salvo quando a mudança exige explicitamente atualizar seu conteúdo.

> Versão: 0.0.15
