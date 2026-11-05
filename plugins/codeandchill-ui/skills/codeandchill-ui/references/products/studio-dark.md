---
family: studio-dark
variant: studio-dark
type: dashboard / app-ui
theme: dark
products: [plotta, rivet, meridian]
also_in_family: "fathom, kestro, coffra, merrin… (finance & SaaS dashboards with neon accent)"
captured: 2026-11-05
capture_dirs: [.captures/clean/a/demo-codeandchill-store-plotta, …-rivet, …-meridian]
confidence: alta (demos capturadas)
---

# Studio dark · dashboards negros con acento neón

## En una frase
Un dashboard negro-oliva o negro-azulado, denso pero calmado. Las tarjetas se separan con anillos
de 1 px casi invisibles, no con sombras. Un **lima neón** marca solo lo importante: el CTA, el
número clave o la serie principal del gráfico.

## Señas de identidad
1. **Fondo casi negro con matiz** (oliva `#171a13`, azul `#10141b` o neutro `#050507`), nunca
   `#000`. Las tarjetas son el mismo fondo, o +4 % de luz.
2. **Bordes como anillo interior**: `box-shadow: inset 0 0 0 1px rgb(255 255 255 / .075)`, con un
   highlight superior `inset 0 1px 0 rgb(255 255 255 / .04)`. En hover el anillo sube a `.14`.
3. **Lima como único color de acción** (`#c6f04b` / `#d4ff3f` / `#d8ff4e`), siempre con texto
   casi negro encima (`#172006`), y un glow verde bajo el botón: `0 8px 18px -12px rgb(110 150 0 / .9)`.
4. **KPIs con delta en píldora**: número de 26–37 px, más una píldora `↗ 1.3%` (fondo negro al 25 %
   o lima al 14 %), más un sparkline.
5. **Saludo personal** ("Good morning, Nadia") de 37–42 px, con fecha y contexto debajo en gris.
6. **Gráficos de área** con relleno degradado del color de la serie a transparente, una línea
   discontinua de objetivo ("Plan for the year") y **barras rayadas** para lo previsto.

## Productos medidos
| producto | bg | surface | text / muted | acento | fuente | radio card | nota |
| --- | --- | --- | --- | --- | --- | --- | --- |
| plotta | `#171a13` | `#1e2219` · sidebar `#0f110c` | `#eef1e6` / `#a1a794` (7.1:1) | `#c6f04b` · coral `#ff8173` | Urbanist 400–700 | 16 px | KPI cards tintadas por color (verde, azul, ámbar, teal oscuros) |
| rivet | `#050507` | `#1a1b24` | `#f4f5f9` / `#858a9e` (5.9:1) | `#d4ff3f` · cyan `#3ef2ff` · rosa `#ff5c8a` | Urbanist | 18 px | Tarjeta de crédito lima con glow; barra de presupuesto en gradiente cyan→lima |
| meridian | `#10141b` | `#171c25` | `#eef1f6` / `#a6adbd` (8.2:1) | `#d8ff4e` · violeta `#a690ff` · coral `#ff7a6e` | Inter + Outfit (títulos) | 22 px | Gráfico de líneas verticales con glow; nav en píldora flotante |

## Tipografía (medida)
- **Familia**: Urbanist (variable 400–700), en 2 de 3; Meridian usa Inter para el cuerpo y Outfit
  para los títulos.
- **Escala**:

| uso | tamaño / interlineado | peso | tracking | color |
| --- | --- | --- | --- | --- |
| Saludo (h1) | 37–42 / 1.04 | 600 | −0.025em | — |
| Número KPI | 26 | 600 | −0.02em | — |
| Título de card | 15 / 1.45 | 600 | −0.005em | — |
| Cuerpo | 13.5–14 | 500 | — | muted |
| Etiquetas | 11–12 | 600 | — | — |
| Secciones del sidebar | 11 | 700, MAYÚSCULAS | 0.08–0.1em | muted |

## Forma y profundidad
- **Radios**:
  - cards 16–22 px;
  - sub-cards 13–14 px;
  - botones cuadrados e icon buttons 10–11 px;
  - segmented 8 px;
  - píldoras 99 px.
- **Sin sombras grises.** La profundidad viene del anillo interior y, como mucho,
  `0 1px 2px rgb(0 0 0 / .35)`.
- **Gradientes**:
  - radial muy sutil del acento en una esquina:
    `radial-gradient(70% 60% at 100% 0, rgb(212 255 74 / .1), transparent 60%)`;
  - gradiente vertical en cards: `linear-gradient(#15161e, #111218 40%)`.

## Layout y ritmo
- **Sidebar fijo**:
  - 248 px de ancho, `#0f110c` y borde derecho `inset -1px 0 rgb(255 255 255 / .14)`;
  - logo en tile de acento redondeado, búsqueda con `⌘K`;
  - secciones con etiqueta en mayúsculas (ANALYTICS, ENGAGEMENT…) y badges contadores en lima;
  - usuario abajo.
- **Alternativa**: nav superior en píldora flotante (meridian).
- **Contenido**:
  - max 1480–1520 px;
  - grid de 12 columnas con gap 16;
  - fila de 4 KPIs con gap 10–16;
  - debajo, una card ancha de gráfico (8 col) y una lateral de actividad "Right now" (4 col).
- **Densidad**: espaciado en pasos de 2 px (6/8/10/12/14/16/18/20); padding de card `18px 20px 20px`.
- **Topbar**: indicador vivo ("18 events / min" con punto verde), toggle de tema, campana con
  contador, botón secundario con icono ("Ask Plotta") y CTA lima "+ New".

## Componentes
- **CTA**:
  - lima, alto 40, radio 11 o píldora, padding `0 16px`, 13.5 px/600, icono `+` a la izquierda;
  - en hover el fondo se aclara (`#d3f56d`).
- **Secundario**: transparente con anillo interior y icono. Hover: `background: #1e2219`.
- **Icon button**: 38–40 px, cuadrado redondeado o círculo, con anillo interior.
- **Segmented** (`Revenue | Riders | Rides`): contenedor con anillo; el ítem activo tiene
  fondo `#1e2219` y texto claro, y los inactivos texto muted. Alto 28, 12.5 px/600.
- **Delta**: píldora `↗ 0.5%` en verde menta `#9be6b1` sobre `rgb(0 0 0 / .25)`. Las negativas
  van en coral.
- **Lista de actividad**: icono en tile 36 px con anillo, título 14/600, meta en muted y tiempo
  relativo alineado a la derecha ("0s", "7m").
- **Ranking**: número en cuadradito lima, nombre, barra lima sobre pista `rgb(255 255 255 / .08)`
  y valor.
- **Avatares**: iniciales sobre pastel (`#f4e2b6`…) o tinte del acento al 14 %.

## Motion (medido)
- **Transiciones**: `color .25s cubic-bezier(.22,1,.36,1)`; `background-color .2s ease`;
  `opacity .35s cubic-bezier(.22,1,.36,1)`.
- **Hover de card**: `translateY(-2px)` y anillo a `.14`.
- **Keyframes recurrentes**:
  - `flash`, para un valor que cambia;
  - `tick-up` / `tick-down`, para números que suben o bajan;
  - `breathe`, para el punto "live";
  - `spin`.

## Voz
Datos de un negocio concreto y creíble (Hollin Bikes "across five cities"), nombres reales y
diversos, y frases que interpretan el dato:
- "Trim what you never open"
- "2 subscriptions unused for sixty days cost you $66.99 a month. Review them in one pass."

## Qué NO hacer
- Negro puro o grises fríos genéricos.
- Sombras difusas grises, bordes de 1 px opacos o más de un color de acción.
- Lima sobre texto blanco: el lima siempre lleva texto oscuro.
