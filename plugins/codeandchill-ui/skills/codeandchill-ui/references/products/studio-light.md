---
family: studio-light
variant: studio-light
type: dashboard / app-ui
theme: light
products: [corbel, murmura, tend, halden]
also_in_family: "rapport, sprig, mender, accord, lintel, ivora, tavola… (business dashboards & CRMs)"
captured: 2026-11-05
capture_dirs: [.captures/clean/a/demo-codeandchill-store-corbel, …-tend, …-halden, .captures/clean/b/demo-codeandchill-store-murmura]
confidence: alta (demos capturadas)
---

# Studio light · dashboards claros, suaves y con tinta

## En una frase
Papel gris cálido de fondo, tarjetas blancas translúcidas con brillo interior y sombra larga y
suave. Hay **una sola tarjeta oscura** como protagonista. Las acciones son píldoras negras y el
acento es un verde profundo. Detrás de todo, manchas de color difuminadas dan calidez.

## Señas de identidad
1. **Fondo off-white**: `#f1f2ef` / `#efefed` / `#fbfcfb`. Las cards son `rgb(255 255 255 / .52–.64)`,
   con `inset 0 0 0 1px rgb(255 255 255 / .82)`, `inset 0 1px 0 rgb(255 255 255 / .75)` y
   `0 24px 48px -30px rgb(30 40 45 / .28)`.
2. **Una card "tinta" por pantalla** (`#121212` / `#16191d`, o teal `#0a3338` en halden) con el
   dato principal o el contenido destacado. Rompe la monotonía blanca.
3. **Píldoras negras** para la acción principal ("Export", "New post"), con alto 40 y radio
   999. El acento verde se guarda para acciones de confirmación ("Approve", "New deal").
4. **Manchas ambientales**: `radial-gradient(closest-side, #f3e3c8, transparent)` y
   `radial-gradient(closest-side, #cde9e4, transparent)`, con `filter: blur(60px)` y detrás del
   contenido.
5. **Barras rayadas** (`repeating-linear-gradient(-45deg, …)`) para la previsión, y la barra
   actual en tinta sólida.
6. **Iconografía de línea** con trazo de 1.5 px en todos los botones y etiquetas.

## Productos medidos
| producto | bg | text / muted | acento | fuente | radio card | nota |
| --- | --- | --- | --- | --- | --- | --- |
| corbel | `#efefed` | `#121212` / `#4f4f4c` | tinta `#121212` · verde `#1b5e4a` | Urbanist | 22 px | KPIs que alternan negro, blanco y gris piedra `#d2d2cd`; gauge de puntuación; barras rayadas |
| murmura | `#f1f2ef` | `#16191d` / `#5b6064` (5.7:1) | verde `#11745a` · ámbar `#f2b740` (contadores) | Urbanist | 26 px | Card oscura "Up next" con foto; pills de estado con punto de color |
| tend | `#fbfcfb` | `#10231f` / `#586a65` (5.6:1) | teal `#148d80` / `#0d5c55` | Geist 400–800 | 22 px | Sidebar verde bosque `#0f2d29`; tablero kanban de pacientes; inbox de WhatsApp |
| halden | `#fdfdfc` | `#111a1b` / `#5d6869` | teal `#12707a` | Manrope 500–800 | 18 px | Card hero teal oscuro con progreso; header sticky de cristal `blur(12px) saturate(1.4)` |

## Tipografía
- **Familia**: Urbanist, Geist o Manrope, siempre una grotesca geométrica o humanista limpia.
- **Escala**:

| uso | tamaño / interlineado | peso | tracking |
| --- | --- | --- | --- |
| Título de página | 37–40 / 1.04 | 600 | −0.025em |
| KPI | 26–33 / 1.1 | 600–700 | −0.02em |
| Título de card | 15–17 | 600–700 | — |
| Cuerpo | 13–14.5 | 500 | — |
| Etiquetas y fechas | 11–12 | 700 | 0.08em (MAYÚSCULAS) |

- **Eyebrow sobre el título** en el color de acento (halden: "Q4 · WEEK 6 · THURSDAY, NOV 5").

## Forma y profundidad
- **Radios**: cards 18–26 px; botones 999 px o 10–11 px; inputs 10 px; chips 7 px.
- **Sombra corta para filas y chips**: `0 1px 2px rgb(16 35 31 / .05)`.
- **Sombra media para cards**: `0 1px 2px rgb(16 35 31 / .04), 0 14px 34px -22px rgb(16 35 31 / .22)`.
- **Botón primario con glow del acento**: `0 10px 22px -12px rgb(13 92 85 / .8)`.

## Layout y ritmo
- **Navegación**, una de estas tres:
  - nav superior en píldora (blanca, con el ítem activo en píldora negra) más un rail vertical
    flotante de iconos a la izquierda, oscuro y en forma de píldora (corbel, murmura);
  - sidebar sólido de color (tend);
  - topbar con tabs y contadores (halden).
- **Cabecera**: título grande a la izquierda y acciones a la derecha (secundaria con borde y
  primaria negra).
- **Contenido**:
  - fila de KPIs de 4;
  - debajo, un bloque 2/3 + 1/3;
  - después, filas de 3 cards con gap 12–20.

## Componentes
- **Botón primario**: píldora `#16191d`, texto `#f6f7f5`, 13–14 px/600, padding `0 15px`, alto 36–40.
- **Secundario**: píldora `rgb(255 255 255 / .52)` con `1px solid rgb(25 25 31 / .16)`. Hover:
  `rgb(255 255 255 / .7)`.
- **Confirmación**: píldora del acento verde con check: "✓ Approve".
- **Pill de estado**: `rgb(17 34 34 / .06)` más punto de color y texto 12.5/600 ("● Scheduled").
- **Contadores**: píldora ámbar `#f2b740` con texto oscuro, o verde `#1fa855` con texto blanco.
- **Tarjetas de lista** (kanban de tend):
  - blancas, radio 14 px y borde hairline;
  - avatar con iniciales en pastel;
  - meta con punto de color;
  - acción en chip tintado ("Check in" sobre `#c3e1dd`);
  - borde izquierdo de color para el estado (naranja = esperando).
- **Barra de proporción**: segmentos redondeados contiguos en tonos del acento (de claro a oscuro)
  y leyenda en 2 columnas con valores alineados a la derecha.

## Motion
- **Transiciones**: `background-color .2–.25s ease`; `box-shadow .35s`.
- **Keyframes**:
  - `ping`, para el punto "live";
  - `ov-breathe 2.4s ease-in-out infinite`;
  - `flash` y `fade`;
  - `dlg-in`, para la entrada de diálogos.

## Voz
- **Negocio con nombre propio y situación concreta**: "Corbel Supply Co. · Pro trial, 9 days left";
  "Northside Family Clinic".
- **Cada card interpreta su dato en una frase**:
  - "Ahead of plan. Both channels beat last month. Online did most of the lifting."
  - "$163k could slip this month".
- **CTAs de 1 a 3 palabras con icono**: "Improve your score", "Join call".

## Qué NO hacer
- Blanco puro de fondo sin manchas, o cards opacas con borde gris duro.
- Botones de color saturado para todo: el negro es el botón por defecto.
- Sombras cortas y oscuras.
