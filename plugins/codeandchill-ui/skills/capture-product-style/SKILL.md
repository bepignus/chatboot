---
name: capture-product-style
description: Captura el ADN visual de las interfaces y plantillas que se venden en codeandchill.store (o de cualquier demo en vivo, plantilla local o capturas de pantalla) y lo convierte en la guía de estilo, fichas de producto y tokens que usa la skill codeandchill-ui. Úsala cuando el usuario quiera añadir o actualizar productos de referencia, analizar el diseño de una plantilla o demo, extraer paleta/tipografías/espaciados/componentes de una web, o diga cosas como "captura el estilo de…", "analiza esta plantilla", "actualiza la guía de codeandchill", "extract design tokens from this site", "what fonts and colors does this template use".
---

# Capturar el estilo de productos (plantillas / interfaces)

El objetivo es que `codeandchill-ui` pueda construir interfaces **nuevas** que se sientan del mismo
catálogo que las plantillas de codeandchill.store. Para eso necesita conocimiento destilado y
verificable (no impresiones): roles de color, escala tipográfica, ritmo de secciones, recetas de
componentes, motion y tono. Esta skill lo obtiene de las demos de los productos y lo escribe en
los `references/` de `codeandchill-ui`.

Los números del script dicen **qué** se usa; las capturas de pantalla dicen **cómo se siente**.
Las dos cosas hacen falta: un hex correcto con la composición equivocada no se parece en nada.

## Dónde va cada cosa

| Qué | Dónde | Por qué |
| --- | --- | --- |
| Capturas crudas (PNG, `capture.json`, `summary.md`) | `.captures/` en la raíz del proyecto (está en `.gitignore`) | Son material de terceros: sirven para analizar en local, no para versionar ni redistribuir |
| Conocimiento destilado (guía, fichas, tokens) | `plugins/codeandchill-ui/skills/codeandchill-ui/references/` si estás dentro del repo del plugin; si no, `.codeandchill/` en la raíz del proyecto | Si el plugin se instaló desde un marketplace, su carpeta es una caché que se sobrescribe al actualizar. `codeandchill-ui` lee primero `.codeandchill/` y después sus `references/` |

Los scripts están en `scripts/`, dentro del directorio de esta skill. Requieren Node 18+ y
Playwright (`npm i -D playwright && npx playwright install chromium` si no está instalado; en
entornos con Chromium preinstalado, `CHROMIUM_PATH=/ruta/al/chromium`).

## Paso 0 · Elegir la fuente

| Tienes… | Haz |
| --- | --- |
| La URL de la tienda | Paso 1 (descubrir) y luego el paso 2 con las demos |
| URLs de demos en vivo | Paso 2 directamente: es la fuente más fiel |
| El código de una plantilla comprada | Paso 2 con la carpeta (o arranca su dev server y pasa `http://localhost:…`). Además, lee su `tailwind.config.*`, `@theme`, sus variables CSS y los imports de fuentes: son los tokens reales |
| Solo imágenes o capturas | Sin script: analízalas con la vista siguiendo la plantilla de ficha. Marca `confidence: baja` y da los valores como aproximados |

## Paso 1 · Descubrir productos en la tienda

```bash
node <skill-dir>/scripts/capture_style.mjs --discover https://codeandchill.store --deep --out .captures
```

Lee `.captures/discover-*/discovery.md`. Incluye cada producto con su precio, sus enlaces de
demo ("Live demo", "Preview", "Vista previa"…) y hasta 3 imágenes descargadas de su galería. Las
imágenes del producto también enseñan la interfaz, así que sirven cuando no hay demo pública.
Si hay más de ~6 productos o no está claro cuáles importan, pregunta al usuario. Si no, prioriza
la variedad de arquetipos (landing, SaaS, dashboard, portfolio, e-commerce…) antes que capturar
muchos parecidos.

## Paso 2 · Capturar las demos

```bash
node <skill-dir>/scripts/capture_style.mjs <demo-url-1> <demo-url-2> … --out .captures
# opciones: --name <slug> (un único target) · --wait <ms> · --max-segments <n> · --no-mobile
#           --ignore "<selector>"  quita elementos que no son del producto (repetible)
#           --scroll-shots         capturas de la ventana mientras baja (landings con scroll)
```

- **Elementos que añade el host de la demo**: si la tienda inyecta algo propio en cada demo (en
  codeandchill.store es el botón "Buy this template", `.cc-preview-pill`), quítalo con `--ignore`.
  Si no, su color y su fuente contaminan las paletas. Si sospechas de uno, busca un color o fuente
  que se repita idéntico en todas las capturas pero no encaje con la página.
- **Landings con scroll**: si usan reveal al entrar, vídeo ligado al scroll o secciones fijadas,
  los tramos `desktop-NN.png` salen con huecos vacíos. Repite con `--scroll-shots`, que guarda
  `scroll-NN.png` tal como los ve un visitante. Para verlos de un vistazo, únelos en una hoja:
  `ffmpeg -i scroll-%02d.png -vf "scale=560:-2,tile=4x3" -frames:v 1 scroll-sheet.png`.
- **Componentes sin demo en vivo**: si solo tienen un vídeo de producto, extrae fotogramas con
  `node <skill-dir>/scripts/extract_frames.mjs <video-url> --out .captures/components --name <slug>`
  y lee `sheet.png`. Marca la confianza como `media` y no des hex medidos de lo que solo has
  visto en vídeo.
- **Heurísticos mejorados**: si cambias los heurísticos del informe, no hace falta volver a
  capturar. Ejecuta `capture_style.mjs --reaggregate .captures/<slug> [...]`.

Por cada target genera `.captures/<slug>/` con:

- `summary.md`: el resumen que debes leer primero (roles de color, tipografía por etiqueta,
  radios, sombras, espaciado y unidad base, layout, ritmo de secciones, botones, cards, pills,
  inputs, cambios en hover, motion, variables CSS y muestras de copy).
- `capture.json`: los datos completos; los usa `compare_style.mjs`.
- `desktop-fold.png`, `desktop-NN.png` (tramos de 1440 px), `mobile-fold.png`, `mobile-NN.png`.
- `components/*.png`: recortes de botones, cards, pills, inputs, header, hero y footer.

Con 2 o más targets se genera también `.captures/catalog-summary.md`, con lo que comparten
(fuentes, colores por rol, tema, radio dominante, tecnología). Es la base para separar el ADN
del catálogo de lo específico de cada producto.

**Si la red falla** (DNS, 403 del proxy, timeout): dile al usuario qué host falló y ofrécele
alternativas: permitir el dominio en la configuración de red, pasar capturas de pantalla o el
código de una plantilla, o ejecutar la captura en su máquina. No rellenes los huecos con valores
inventados. Una guía especulativa es peor que ninguna, porque `codeandchill-ui` la tomaría como
verdad.

## Paso 3 · Mirar (no te saltes este paso)

1. Lee `summary.md`.
2. Abre con Read `desktop-fold.png`, los tramos de desktop, `mobile-fold.png` y los recortes de
   `components/`.
3. Anota lo que los números no capturan:
   - **Personalidad**: técnica, lúdica, editorial, lujosa, brutalista, retro…
   - **Composición**: asimetría, solapamientos, bento grids, columnas, densidad, aire.
   - **Imágenes**: mockups de UI, 3D, ilustración, foto, gradientes, ruido o grano, patrones de
     grid o puntos, glows.
   - **Iconografía**: librería, grosor de trazo, relleno o contorno.
   - **Detalles firma**: bordes con gradiente, highlights internos, cursores, marquees,
     separadores, numeración, etiquetas tipo `// code`.
   - **Motion**: cómo entra el contenido y qué pasa en hover.
4. Contrasta los heurísticos del script con lo que ves:
   - Los roles de color se infieren por área pintada y contraste, así que el "accent" puede salir
     mal en páginas dominadas por fotos.
   - El color de imágenes y vídeos no se mide.
   - `font-family` es la familia **declarada**; confírmala con "Loaded font faces".
   - Si algo no cuadra, gana lo que ves.

## Paso 4 · Ficha por producto

Escribe `<destino>/products/<slug>.md` siguiendo `references/product-sheet-template.md` (de esta
skill) y añade el producto al índice `<destino>/products/README.md`. `<destino>` es la carpeta de
conocimiento destilado de la tabla de arriba.

**Catálogos grandes** (decenas o cientos de productos): agrupa por **familia visual**. Escribe una
ficha por familia con la misma plantilla y una tabla "Productos medidos" (una fila por producto
con bg, superficies, texto/muted, acento, fuente, radio y una nota). Es lo que usa
`codeandchill-ui` para elegir referencia, y evita repetir 20 veces lo mismo. La sección de
**señas de identidad** de la ficha es la más importante: son las 3 a 6 decisiones que hacen
reconocible el producto. Son las que `codeandchill-ui` verificará en cada build.

## Paso 5 · Sintetizar el catálogo

Con todas las fichas, actualiza en `<destino>`:

1. `style-guide.md`, siguiendo `references/style-guide-template.md`:
   - Pon `status: captured`, la fecha y las fuentes en el frontmatter.
   - Separa el **ADN común** (lo que aparece en la mayoría de productos) de las **variantes** (si
     el catálogo tiene familias distintas, p. ej. "SaaS oscuro" frente a "portfolio claro").
     Indica cuándo usar cada variante.
   - Escribe recetas de componentes con snippets que usen solo tokens.
2. `tokens.css`, `tailwind.theme.css` y `tailwind.preset.cjs`, siguiendo el contrato de nombres
   de `codeandchill-ui/references/tokens-contract.md`. Si hay variantes, usa
   `[data-cc-variant="…"]`. Cada valor tiene que salir de una captura. Si un token no se pudo
   medir, déjalo fuera y anótalo; no lo inventes.

## Propiedad intelectual

Capturamos **lenguaje visual**, no activos. En las fichas y la guía nunca guardes ni recomiendes
reutilizar logos, nombres de producto o de marca, textos literales, ilustraciones, fotos ni
iconos propios. Si una tipografía es comercial, anótala y propone una alternativa libre parecida
(Google Fonts o Fontshare), indicando en qué se diferencia. Las capturas de `.captures/` no se
suben al repo.
