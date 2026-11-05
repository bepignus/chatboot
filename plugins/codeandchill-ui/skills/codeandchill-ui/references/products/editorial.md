---
family: editorial
variant: [editorial, editorial-dark]
type: landing / ecommerce
theme: both
products: [arden, kessler, lunde, mango, vanta]
also_in_family: "landing-pages (nero, solace, vesper, strada, dwella, gesso…) y shop-templates (sola, norda, sorrel, oria, glint, kesten…)"
captured: 2026-11-05
capture_dirs: [.captures/clean/b/demo-codeandchill-store-{arden,kessler,lunde,mango,vanta}, .captures/scroll/* (scroll-shots)]
confidence: alta (demos capturadas; secciones vistas con --scroll-shots)
---

# Editorial · landings de producto y tiendas

## En una frase
Revista de producto. La tipografía es el héroe, a 90–370 px. Hay fotografía o vídeo a sangre,
esquinas rectas y un único rojo-naranja que grita. La página se cuenta como **capítulos que se
revelan al hacer scroll**.

## Señas de identidad
1. **Display gigante**:
   - palabra-marca de lado a lado (MANGOO en Anton 374 px; LUNDE STUDIO en Archivo 800 a 269 px);
   - o titular de 90–107 px con tracking muy cerrado (−0.025 a −0.04em).
2. **Titulares a dos tonos**: palabras clave en el color de acento dentro de la frase. Ejemplos:
   "**Studio** Sound, Silence On **Demand.**" o "Hear **Everything.** Then **Nothing.**".
3. **Eyebrow** en mayúsculas de 11–11.5 px, peso 600, tracking 0.14–0.24em y color de acento,
   encima de cada título ("INTRODUCING VANTA PRO", "AUTUMN 2026 · 12 PIECES", "THE HOUSE RULES").
4. **Esquinas rectas**: 0–2 px en botones, cards e inputs. La excepción es vanta (launch oscuro),
   con píldoras y cards de 30 px.
5. **Rojo-naranja caliente** como único acento: `#ec3013` (kessler), `#ff2a3c` (vanta) o `#ff8c32`
   (mango). Se usa en un CTA, un eyebrow, una etiqueta "NEW" y una franja final a todo color.
6. **Capítulos numerados** con numerales o palabras fantasma gigantes al fondo (opacidad baja):
   "01 Picked · 03 Delivered", "NO. 01 ALPHONSO".
7. **Indicadores de scroll**:
   - "SCROLL" pequeño, en mayúsculas espaciadas y centrado abajo en el hero;
   - columna de puntos de progreso a la derecha con el activo en acento;
   - botón circular ↓.
8. **Fila de especificaciones** con separadores de punto ("40 h battery • 45 dB noise cancelled
   • 249 g"), o stats grandes con pie pequeño ("<40 ms / game-mode latency over Bluetooth").

## Productos medidos
| producto | tipo | bg | text / muted | acento | display / cuerpo | radio | nota |
| --- | --- | --- | --- | --- | --- | --- | --- |
| arden | landing inmobiliaria | `#f6f6f5` | `#131313` / `#6c6c6a` (4.9:1) | `#ff5c3d` (mínimo) | Instrument Sans 500 a 107 px / Instrument Sans | 0 | Titular a la izquierda y lead muted a la derecha en la misma fila; foto a sangre dentro del container (1296 px); botones negros rectos |
| kessler | tienda (6 páginas) | `#f3f2f2` | `#201e1d` / `#444141` | `#ec3013` | Archivo 800 / Archivo | 0 | Reglas negras de 2 px enmarcan el hero partido; fotos en blanco y negro (`grayscale(1) contrast(1.08)`); franja roja de newsletter |
| lunde | tienda de muebles | `#ece7dc` arena / `#222a24` | `#1d221e` / `#565a51` | `#8b4324` (hover) | Archivo 700–800 MAYÚSCULAS / Hanken Grotesk | 2 px | Hero con foto a sangre y wordmark gigante; nav en mayúsculas 11 px con tracking 0.16em; botones rectos claros sobre foto |
| mango | landing de un producto | campos de color: verde `#1f4f2e`, chocolate `#19130a`, naranja `#ff8c32`, amarillo `#ffc93c` | `#fff8ec` | `#ff8c32` | Anton 400 / Instrument Sans | píldora | Cada sección es un color plano; etiquetas tipo pegatina inclinadas con sombra dura; insignia giratoria `badge-spin 16s`; grano de película |
| vanta | lanzamiento oscuro | `#050507` + glow violeta radial | `#f5f4f7` / `#b6b4bf` | `#ff2a3c` con glow `0 6px 22px -8px` | Inter Tight 700 a 90 px / Inter | píldora · cards 30 px | Vídeo ligado al scroll, marquee de imágenes en forma de píldora, bento de stats, lista de gestos numerada 01–04, cierre centrado con precio y swatches |

## Tipografía
- **Display**:
  - grotesca apretada (Instrument Sans 500, Inter Tight 700, Archivo 800);
  - o condensada en mayúsculas (Anton, Archivo con `font-stretch`).
- **Cuerpo**: 15–17 px, 400, interlineado 1.55, color muted y medida máxima de unos 46ch.
  El lead del hero va a 18–22 px.
- **Nav**: 11–15 px en MAYÚSCULAS con tracking 0.1–0.16em (tiendas), o 16.5 px en minúsculas
  (arden).

## Estructura típica (vista en capturas de scroll)
- **Landing de producto**:
  1. hero (eyebrow, titular a dos tonos, lead, specs, CTA más "Watch the film")
  2. statement con el producto en grande
  3. beneficios con stats
  4. galería o marquee
  5. bento de características
  6. interacción numerada (01–04) con el visual a la derecha
  7. caso de uso con mockups de UI
  8. cierre centrado: titular, precio, CTA y variantes
  9. footer mínimo
- **Tienda**:
  1. barra utilitaria ("Made in Walsall · shipped worldwide" · "EN / USD · Track order")
  2. header con logo, categorías en mayúsculas, iconos de búsqueda, cuenta y bolsa con contador
     rojo
  3. hero partido
  4. tira de categorías
  5. grid de producto de 4 columnas con etiqueta "NEW" roja, nombre, materiales y precio
  6. foto lifestyle a sangre con panel superpuesto
  7. historia del taller
  8. promesas en 4 columnas numeradas con icono
  9. FAQ en dos columnas con acordeón
  10. franja de newsletter a todo color
  11. footer de 4 columnas
- **Ritmo**: padding vertical de sección de 96–128 px, container de 1296–1440 px y gutter de 72 px.

## Componentes
- **Botón primario**:
  - rectángulo negro `#131313`, o el acento, de 42–46 px de alto;
  - padding `0 20px`, 14–16.5 px/500–800;
  - hover un tono más claro (`#3a3a38`) o el acento oscurecido (`#dd2b0f`).
- **Secundario**: mismo rectángulo con `1px solid #dededc`, o `2px solid` tinta en kessler.
- **En vanta**: píldora roja con glow, y el secundario es solo texto con un círculo ▶ al lado.
- **Card de producto**: imagen sobre fondo gris claro, etiqueta "NEW" en rectángulo rojo de
  texto blanco 10 px, nombre 14/700, materiales en muted y precio.
- **Input de newsletter**: borde de 2 px más botón pegado ("email address | Join").
- **Chips de spec** (vanta): `rgb(255 255 255 / .06)` en píldora, 12.5 px.

## Motion
- **Scroll suave**: Lenis en 4 de 5.
- **Revelado**: `opacity` + `transform` 0.6–0.9 s con `cubic-bezier(.22,1,.36,1)`, o
  `cubic-bezier(.16,1,.3,1)` 0.78–1.1 s.
- **Animaciones**:
  - vídeo y palabras ligados al scroll;
  - marquee infinito (`marquee 40s linear`);
  - pista "SCROLL" que pulsa (`hint 1.6–1.8s`);
  - insignias que giran.
- **Hover**: botones que escalan 1.1 (iconos circulares) o cambian de fondo en 0.2 s.
- **Tienda**: `bag-pop` al añadir, `toast-in`, `qv-in` (vista rápida), `acc-in` (acordeón),
  `value-change`.

## Voz
- **Frases cortas y rotundas**, a menudo en tríos:
  - "Sun-ripened. Hand-picked. Delivered fresh."
  - "Bags built to outlast the person carrying them."
  - "Twelve pieces a season. No sales, ever."
- **Copy de oficio**: materiales, lugar, años ("hand-stitched at the corners, made to order in a
  Walsall workshop that has cut leather since 1948").
- **Inglés británico** (colour, licence).

## Qué NO hacer
- Esquinas redondeadas genéricas, sombras de card o gradientes de colores en una tienda editorial.
- Más de un acento.
- Titulares pequeños.
- Imágenes con marco y padding en lugar de a sangre.
