# Servidor MCP

El servidor Model Context Protocol expone 20 tools y 7 resources mediante **stdio**. Se inicia como proceso hijo del cliente MCP. No abre un puerto HTTP ni ejecuta un daemon en segundo plano.

## Instalar y conectar

Utiliza Node.js 20+. Instala la CLI en el proyecto con `npm install --save-dev @gitpagedocs/cli`; incluye el servidor y el runtime TypeScript. Una instalación global también permite `gitpagedocs mcp start`. Para una ejecución puntual, utiliza `npx --yes @gitpagedocs/cli mcp start`.

En VS Code, crea `.vscode/mcp.json` con la siguiente configuración. El directorio de trabajo del proceso es la raíz del proyecto; el comando MCP no tiene flags `--root` o `--cwd`.

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

Abre los controles del servidor MCP del cliente, inicia GitPageDocs y lista sus tools/resources. Prueba `list_files` con `{"path":".","recursive":false}` y lee `project://readme`. Estas operaciones no necesitan una clave de proveedor. Un terminal iniciado con `mcp start` espera JSON-RPC; el texto común en stdin no es un comando de chat. En un checkout del código, la entrada directa es `node --import tsx mcp/src/bin.ts`, no `index.ts`.

## Configurar un proveedor

Las llamadas al proveedor leen credenciales del entorno del proceso MCP. MCP no carga `.env` ni la bóveda cifrada de la CLI automáticamente. Utiliza la función de entrada protegida/secretos del cliente para inyectar variables; nunca guardes claves reales en configuración versionada. Reinicia el proceso MCP después de cambiar su entorno.

Selecciona el proveedor con `configure_ai_provider` o con `.gitpagedocs-mcp.json` en la raíz del proyecto:

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

Cuando la selección guardada está ausente, no se puede leer o contiene JSON inválido, el proveedor predeterminado es OpenAI. Un ID de proveedor desconocido en JSON legible produce un error explícito sin seleccionar otro proveedor. Ollama no requiere clave de API; el servicio local y el modelo elegido deben estar disponibles. `OLLAMA_BASE_URL` es opcional. La URL base de Azure es la URL completa de la operación de chat, incluido deployment y versión de API cuando sean necesarios. La lista de modelos es un catálogo distribuido, no una comprobación en tiempo real.

## Referencia de tools

`?` indica un argumento opcional. Rutas y contenido son strings; `recursive` es booleano. Los identificadores de proveedor proceden del catálogo. Ejecuta las tools mediante la interfaz de herramientas del cliente MCP.

| Tool | Argumentos | Comportamiento |
| --- | --- | --- |
| `list_files` | `path?, recursive?` | Lista archivos (por defecto: directorio actual, sin recursión) |
| `read_file` | `path` | Lee texto UTF-8 |
| `write_file` | `path, content` | Escribe todo el archivo; crea carpetas necesarias |
| `search_project` | `query, extension?` | Busca por fragmento sin distinguir mayúsculas |
| `list_ai_providers` | `—` | Consulta el catálogo de proveedores |
| `list_ai_models` | `provider?` | Consulta el catálogo local de modelos |
| `configure_ai_provider` | `provider, model?` | Guarda .gitpagedocs-mcp.json |
| `ask_ai` | `prompt, provider?, model?, system?` | Devuelve una respuesta, sin historial de conversación |
| `generate_documentation` | `path, provider?` | Documenta un archivo fuente |
| `generate_api_docs` | `path, provider?` | Describe la API de un archivo |
| `generate_database_docs` | `path, provider?` | Describe modelos de datos de un archivo |
| `analyze_source_code` | `path, provider?` | Analiza un archivo fuente |
| `generate_readme` | `provider?` | Utiliza el árbol y package.json |
| `generate_architecture_docs` | `provider?` | Utiliza el árbol del repositorio |
| `analyze_repository` | `provider?` | Analiza el árbol del repositorio |
| `analyze_project` | `provider?` | Analiza el árbol y package.json |
| `generate_changelog` | `provider?` | Utiliza hasta 80 commits; utiliza el árbol si no están disponibles |
| `generate_release_notes` | `provider?` | Utiliza el mismo contexto del changelog |
| `validate_docs` | `provider?` | Solicita al proveedor una revisión del Markdown recopilado |
| `update_documentation` | `path, instructions?, provider?` | Genera y escribe una región administrada |

`generate_*`, `analyze_*`, `ask_ai` y `validate_docs` devuelven texto; no lo guardan automáticamente. `validate_docs` es una revisión del proveedor, no un verificador determinista de enlaces. Solo `write_file`, `configure_ai_provider` y `update_documentation` escriben archivos. `update_documentation` conserva texto fuera de `<!-- gitpagedocs:start -->` / `<!-- gitpagedocs:end -->`; agrega una región si no existe el par válido. El servidor no muestra confirmación propia; configura los permisos en el cliente MCP.

## Referencia de resources

| URI | Contenido |
| --- | --- |
| `project://structure` | Árbol del repositorio |
| `project://docs` | Documentos Markdown recopilados |
| `project://config` | Configuración resuelta y sourcePath |
| `project://repository` | Contenido de package.json |
| `project://readme` | README.md |
| `project://ai/providers` | Catálogo de proveedores |
| `project://ai/models` | Catálogo de modelos por proveedor |

## Ejemplo de uso

1. Lee `project://structure` y `project://readme`.
2. Ejecuta `list_ai_providers` y `list_ai_models` para elegir proveedor/modelo.
3. Ejecuta `generate_api_docs` con `{"path":"src/index.ts"}` y revisa el texto devuelto.
4. Guarda el texto aprobado con `write_file`, o utiliza `update_documentation` con `{"path":"docs/api.md","instructions":"Documenta la API pública en español."}` para una región administrada.

La generación envía el contenido seleccionado del proyecto al proveedor configurado.

## Límites y diagnóstico

- Lectura de archivos: hasta 512.000 bytes. Listado: hasta 2.000 entradas; árboles recopilados del proyecto: 400 entradas.
- Búsqueda: hasta 5.000 entradas, 200 resultados y 240 caracteres por línea encontrada.
- Recopilación de documentación: primeros 40 archivos Markdown entre hasta 2.000 entradas; se omiten archivos superiores a 40.000 bytes. El contexto recopilado de archivos y Markdown se limita a 24.000 caracteres. No es un límite global del prompt: árbol/paquete, documento existente y pregunta proporcionada pueden añadir contenido según la tool seleccionada.
- El listado omite carpetas de dependencias/build como `node_modules`, `.git`, `.next`, `out`, `dist`, `prebuilt`, `.turbo` y `coverage`. No interpreta `.gitignore`; archivos como `.env` no se excluyen automáticamente. Ejecuta solo en proyectos de confianza y selecciona el contenido que se expondrá.
- A partir de la versión 0.0.15 de los paquetes, las herramientas de archivos comprueban tanto las rutas léxicas como las rutas canónicas del sistema de archivos. Las lecturas y las listas de directorios rechazan enlaces simbólicos/junctions que apuntan fuera de la raíz del proyecto. Las escrituras también validan el ancestro existente más cercano antes de crear directorios y rechazan enlaces simbólicos en el destino, incluidos los enlaces a archivos internos. La búsqueda omite archivos enlazados cuyo contenido no se puede leer de forma segura.
- Estas comprobaciones protegen contra enlaces presentes cuando se procesa una solicitud; no constituyen un sandbox del sistema operativo contra la sustitución concurrente de rutas por otro proceso. Ejecuta el servidor en un proyecto de confianza con los permisos adecuados del sistema de archivos. La carga de configuración y la persistencia de la selección del proveedor usan rutas separadas; leer `project://config` puede importar configuración JavaScript/TypeScript.
- Los fallos de tools incluyen `isError: true`. Los resources ausentes devuelven `Unavailable: ...`. Revisa stderr en el cliente para errores de inicio; stdout está reservado para JSON-RPC.
- Si las tools funcionan pero la generación falla, comprueba selección del proveedor, credenciales del entorno, modelo y conectividad.

> Versión: 0.0.14
