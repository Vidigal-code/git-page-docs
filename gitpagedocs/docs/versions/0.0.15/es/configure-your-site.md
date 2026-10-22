# Configura tu sitio

Separa la presentación global del contenido de cada versión. El archivo raíz `gitpagedocs/config.json` selecciona idiomas, temas y controles de lectura. La configuración de la versión define rutas, archivos por idioma y el árbol de menús.

## Configura en un orden práctico

1. Lee **Configuración** para localizar el ajuste y su valor predeterminado.
2. Usa **Recetas de configuración** para ejemplos JSON completos y una estructura multilingüe inicial.
3. Elige **Temas y diseños** para tokens visuales y cambios de plantillas.
4. Lee **Navegación y submenús** para conectar rutas, documentos de los padres, submenús y breadcrumbs.

## Comprueba el resultado

Mantén un archivo existente para cada idioma habilitado y destino. Un título por sí solo no crea un documento. Asigna al padre su propia ruta Markdown cuando necesite una introducción y conserva sus hijos en `submenus`. Valida primero un idioma; después comprueba los demás, el menú plano y un enlace directo a una página anidada. Conserva los ajustes propios del repositorio al regenerar ejemplos.

> Versión: 0.0.15
