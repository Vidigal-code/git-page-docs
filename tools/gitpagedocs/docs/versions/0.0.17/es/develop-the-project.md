# Desarrolla el proyecto

Empieza por el módulo responsable del comportamiento que quieres cambiar. El frontend sigue Feature-Sliced Design; la CLI contiene las plantillas del scaffold; tools proporciona servicios compartidos de configuración y documentación; MCP expone esos servicios mediante su protocolo.

## Localiza la fuente y la frontera de prueba

- **Arquitectura** describe paquetes, responsabilidades y flujo de datos.
- **Contribución y pruebas** identifica plantillas fuente, salidas generadas y comandos de validación.
- **Funcionalidades** ofrece una referencia amplia de capacidades y ajustes existentes.

## Produce un cambio revisable

Describe el comportamiento observable, reprodúcelo mediante la interfaz pública y actualiza la fuente antes de generar artefactos. Prueba controles renderizados, configuraciones devueltas o archivos escritos, en lugar de helpers privados. Revisa traducciones y accesibilidad al cambiar controles visibles. Ejecuta las comprobaciónes de los paquetes afectados e inspecciona el diff generado antes del commit. Conserva directorios de versiones existentes salvo que el cambio requiera explícitamente actualizar su contenido.

> Versión: 0.0.17
