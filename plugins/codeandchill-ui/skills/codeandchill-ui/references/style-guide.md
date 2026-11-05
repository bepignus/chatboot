---
status: captured
updated: 2026-11-05
sources:
  - store: https://codeandchill.store (inventario: 149 plantillas, 75 componentes, 24 colecciones)
  - demos: plotta, rivet, meridian, corbel, murmura, tend, halden, cirrel, solvik, hemli, arden, kessler, lunde, mango, vanta, nocturne, bamboo, sleuth (https://demo.codeandchill.store/<slug>/)
  - reels: gulp, dart, opal, sigil, lumen-toggle, meniscus, glyph, plimsoll, tender, halo (media.codeandchill.store)
products: 28
---

# Guía de estilo · catálogo codeandchill.store

Las plantillas de Code and Chill no tienen un único look. Son **un oficio común aplicado a varias
familias visuales**. Lo que las hace reconocibles es lo primero que explica esta guía: el
acabado, la densidad, la voz y el cuidado del motion. La paleta concreta depende de la familia.
Elige primero la variante (sección 2) y luego aplica el ADN común.

Los valores vienen de capturas reales (ver `products/*.md`); los tokens están en `tokens.css`.

## 1 · ADN común del catálogo

1. **Un negocio concreto, no un "dashboard genérico"**:
   - cada plantilla es una app para alguien en particular: una clínica, un club de running, una
     empresa de chárter o una frutería;
   - los datos de ejemplo son realistas: nombres diversos, ciudades, importes con céntimos;
   - el copy interpreta los datos.
2. **Acabado de hardware**:
   - bordes de 1 px hechos con anillos interiores translúcidos (`inset 0 0 0 1px`) y un
     highlight superior;
   - sombras largas, suaves y con offset negativo (`0 24px 48px -30px`) en lugar de sombras
     grises cortas;
   - nada de bordes grises opacos.
3. **Un único color de acción**, saturado y con texto de alto contraste encima. Va acompañado de
   un **glow de su mismo color** bajo el botón.
4. **Tipografía grotesca y apretada**:
   - titulares con tracking negativo (−0.025em en apps, −0.04em en display);
   - etiquetas en MAYÚSCULAS pequeñas con tracking positivo (0.08–0.24em);
   - números grandes y protagonistas.
5. **Radios con intención**:
   - apps: 16–26 px en cards y píldoras en lo interactivo;
   - editorial: 0–2 px;
   - nunca el 8 px genérico en todo.
6. **Motion con física**:
   - easing `cubic-bezier(.22,1,.36,1)` (ease-out-quint) en casi todo, con 0.2–0.35 s en UI y
     0.6–1 s en revelados;
   - hover discreto (−2/−4 px y un anillo más claro);
   - una micro-interacción con metáfora en la acción crítica;
   - en vez de spinners genéricos: "breathe" en indicadores live, "tick" en números que cambian
     y "stamp" en confirmaciones.
7. **Accesibilidad de serie**: enlace "Skip to content", toggle de tema claro/oscuro en las apps,
   búsqueda `⌘K` y foco visible.
8. **Tecnología ligera**:
   - HTML, CSS y TS/JS planos (Vite + TypeScript sin framework en las apps);
   - un CSS por página;
   - módulos `motion.ts`, `charts.ts` y `store.ts`;
   - 0–3 dependencias (GSAP o Lenis solo donde aportan).

## 2 · Variantes (familias)

| variante (`data-cc-variant`) | úsala para | señas rápidas | ficha |
| --- | --- | --- | --- |
| `studio-light` (por defecto) | CRMs, back-offices, admin de tiendas, clínicas, social media: herramientas diarias | papel `#f1f2ef`, cards blancas translúcidas, una card tinta, píldoras negras, verde profundo, manchas ambientales difuminadas | `products/studio-light.md` |
| `studio-dark` | finanzas, analítica, trading, SaaS "técnico" | negro con matiz (oliva o azul), anillos `.075`, **lima neón** con texto oscuro, gráficos de área y barras rayadas | `products/studio-dark.md` |
| `studio-glass` / `studio-glass-light` | smart-home, apps premium "iPhone-style", dashboards con foto | cristal `blur(30px) saturate(1.5)` sobre orbes o foto, paleta iOS (azul `#0a84ff`, verde `#30d158`), radios 20–30 | `products/studio-glass.md` |
| `editorial` / `editorial-dark` | landings de producto, lanzamientos, tiendas, inmobiliarias | display gigante, foto a sangre, esquinas rectas, **un rojo-naranja**, capítulos numerados, "SCROLL" | `products/editorial.md` |
| `playful` / `playful-paper` | login, 404, felicitaciones, mini-juegos | personaje ilustrado con una interacción física, card de cristal o papel cálido, animación ambiental lenta | `products/playful.md` |

Si el usuario no indica la familia:
- un dashboard o app de negocio va a `studio-light`;
- si el dominio es financiero, de datos o "nocturno", va a `studio-dark`;
- una web de venta de un producto va a `editorial`.

Dilo explícitamente en la entrega.

## 3 · Color

- **Proporción aproximada**:
  - apps: 85–95 % fondo y superficies, 3–8 % tinta y muted, ≤ 3 % acento;
  - editorial: fondo plano más una franja final a todo color de acento.
- **El acento solo va en**:
  - la acción principal;
  - la serie principal del gráfico;
  - los badges contadores;
  - el estado "live";
  - las palabras destacadas de un titular (editorial).
- **Texto**: `--cc-text` para títulos y números, `--cc-text-muted` para todo lo secundario. El
  muted medido siempre cumple AA (4.9–10:1); mantenlo.
- **Estados**:
  - positivo en verde (`#1fa855` claro, `#9be6b1`/`#30d158` oscuro);
  - negativo en coral o rojo (`#ff8173`, `#c43636`);
  - aviso en ámbar `#f2b740`;
  - todos como **píldora tintada** (color al 12–18 % de fondo y el color pleno de texto).
- **Series de datos**: lima, coral, cielo, violeta y crema (`--cc-data-1..5`). Para la previsión
  o "lo que aún no ha pasado", usa la misma serie **rayada** (utility `hatched`).
- **Avatares**: iniciales de 11 px/700 sobre pasteles (`--cc-avatar-1..5`), en pilas
  solapadas con un anillo del color del fondo de 2 px.

## 4 · Tipografía

Fuentes (todas en Google Fonts):

| familia | dónde |
| --- | --- |
| **Urbanist** 400–700 | apps (7 de 10 dashboards) |
| Geist | apps (alternativa) |
| Manrope | apps (alternativa) |
| Inter + Outfit | meridian |
| **Instrument Sans** | editorial |
| Archivo 800 | editorial |
| Anton | editorial (wordmarks condensados) |
| Inter Tight | editorial-dark |
| Hanken Grotesk | etiquetas editoriales |
| Poppins, Sora + Manrope | playful |
| Baloo 2 + Nunito Sans + IBM Plex Mono | playful-paper |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400..700&display=swap" rel="stylesheet">
```

| rol | apps (studio-*) | editorial |
| --- | --- | --- |
| Título de página / hero | 37–44 px · 600 · −0.025em · lh 1.04 | 71–107 px (wordmark hasta 370) · 500–800 · −0.025/−0.04em · lh 1.05 |
| Número KPI / stat | 26–37 px · 600 · −0.02em | 40–54 px · 700 |
| Título de card / sección | 15–17 px · 600 · −0.005em | 24–40 px · 500–700 |
| Cuerpo | 13.5–14 px · 500 · muted | 15–17 px · 400 · lh 1.55 · lead de 18–22 px |
| Etiqueta / eyebrow | 11–12 px · 700 · MAYÚSCULAS · 0.08em | 11–11.5 px · 600 · MAYÚSCULAS · 0.14–0.24em · color acento |
| Botón | 12.5–13.5 px · 600 | 14–16.5 px · 500–800 |

**Móvil**:
- apps: h1 a 26–34 px;
- editorial: h1 a 45–72 px.

## 5 · Forma, profundidad y texturas

- **Anillo interior en lugar de borde**:
  - oscuro: `box-shadow: inset 0 0 0 1px rgb(255 255 255/.075), inset 0 1px 0 rgb(255 255 255/.04)`;
  - claro: `inset 0 0 0 1px rgb(255 255 255/.82), inset 0 1px 0 rgb(255 255 255/.75)`;
  - token `--cc-ring`, utility `shadow-ring`.
- **Sombras largas y negativas**: `0 24px 48px -30px` (claro), `0 30px 60px -30px rgb(0 0 0/.6)`
  (oscuro) y `0 50px 120px -40px` (hero cards).
- **Glow del acento bajo los CTAs**: token `--cc-glow`.
- **Cristal**: `background: var(--cc-surface); backdrop-filter: var(--cc-blur)` (utility `glass`).
  Solo funciona con algo detrás: orbes, foto o manchas.
- **Manchas ambientales**: 2–3 `radial-gradient(closest-side, <pastel>, transparent)` con
  `filter: blur(60px)`, fijas detrás del contenido (studio-light).
- **Texturas**:
  - rayado a 45° para la previsión;
  - grano de película animado (`steps(6)`) en editorial y playful;
  - viñeta interior en playful-paper.

## 6 · Layout y ritmo

- **Apps**:
  - **Shell**, una de estas tres opciones:
    - sidebar de 248 px con secciones en mayúsculas;
    - nav superior en píldora más un rail de iconos flotante en forma de píldora;
    - topbar con tabs y contadores.
  - **Cabecera**: saludo o título a la izquierda, con fecha o contexto. A la derecha, una acción
    secundaria con icono y la primaria.
  - **Rejilla**:
    - fila de 4 KPIs;
    - bloque principal 2/3 (gráfico) + 1/3 (actividad "Right now", objetivo o próximo evento);
    - filas de 3 cards;
    - gap 10–16 px, container de 1480–1520 px y padding de card `18px 20px 20px`.
  - **Densidad**: pasos de 2 px (6/8/10/12/14/16/18/20).
- **Editorial**:
  - container de 1296–1440 px, gutter de 72 px y secciones de 96–128 px;
  - la estructura típica está en `products/editorial.md`.
- **Playful**: una sola pantalla centrada. La escena ocupa todo y la card es de 404–430 px.

## 7 · Recetas de componentes

Clases de Tailwind v4 mapeadas a tokens (`tailwind.theme.css`). Con v3 funcionan igual gracias al
preset. Sin Tailwind, usa `var(--cc-*)`.

### Botones
```html
<!-- Primario: acento + glow (lima, verde, azul o rojo según la variante) -->
<button class="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-4 text-[13.5px] font-semibold text-on-accent shadow-glow
               transition-[background-color,transform] duration-200 ease-cc hover:brightness-110 active:translate-y-px
               focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
  <svg aria-hidden="true" class="size-4"><!-- + --></svg> New
</button>
<!-- Primario en studio-light: píldora tinta -->
<button class="h-10 rounded-full bg-inverse px-4 text-[13.5px] font-semibold text-bg">Export</button>
<!-- Secundario: anillo interior + icono -->
<button class="inline-flex h-10 items-center gap-2 rounded-md bg-surface px-3.5 text-[13.5px] font-semibold text-fg shadow-ring hover:bg-surface-2">
  <svg aria-hidden="true" class="size-4"></svg> Ask a question
</button>
<!-- Icon button -->
<button aria-label="Notifications" class="relative grid size-10 place-items-center rounded-full bg-surface shadow-ring">
  <svg class="size-[18px]"></svg><span class="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-on-accent">3</span>
</button>
<!-- Editorial: rectángulo -->
<a class="inline-flex h-11 items-center bg-inverse px-5 text-base font-medium text-bg hover:opacity-90">Book a call</a>
```

### KPI card
```html
<article class="rounded-lg bg-surface p-[18px_20px_20px] shadow-ring">
  <p class="flex items-center gap-2 text-sm font-medium text-muted"><svg class="size-4"></svg> Recurring revenue</p>
  <p class="mt-3 font-display text-xl font-semibold tracking-tight text-fg">£216k</p>
  <div class="mt-2 flex items-center gap-2 text-sm text-muted">
    <span class="rounded-full bg-accent-tint px-2 py-0.5 text-xs font-bold text-accent">↗ 1.3%</span> a month
  </div>
  <!-- sparkline SVG a la derecha, stroke = currentColor del acento o de la serie -->
</article>
```

### Segmented control
```html
<div role="tablist" class="inline-flex rounded-full bg-surface p-1 shadow-ring">
  <button role="tab" aria-selected="true" class="h-7 rounded-full bg-surface-2 px-3 text-sm font-semibold text-fg">Revenue</button>
  <button role="tab" aria-selected="false" class="h-7 rounded-full px-3 text-sm font-semibold text-muted hover:text-fg">Riders</button>
</div>
```

### Pills, badges y avatares
```html
<span class="inline-flex items-center gap-1.5 rounded-full bg-fg/5 px-2.5 py-0.5 text-sm font-semibold text-fg"><i class="size-1.5 rounded-full bg-positive"></i>Scheduled</span>
<span class="grid size-7 place-items-center rounded-full text-[11px] font-bold" style="background:var(--cc-avatar-2);color:var(--cc-avatar-ink)">TH</span>
```

### Cabecera de página (apps)
```html
<header class="flex flex-wrap items-end justify-between gap-4">
  <div>
    <p class="text-sm font-medium text-muted">Wednesday 4 November · Hollin Bikes across five cities</p>
    <h1 class="font-display text-2xl font-semibold leading-tight tracking-tight text-fg">Good morning, Nadia</h1>
  </div>
  <div class="flex gap-2"><!-- secundario + primario --></div>
</header>
```

### Hero editorial
```html
<section class="relative mx-auto max-w-page px-[var(--cc-gutter)] pt-40">
  <p class="text-xs font-semibold uppercase tracking-wide text-accent">Autumn 2026 · 12 pieces</p>
  <h1 class="mt-4 font-display text-[clamp(48px,7.4vw,107px)] font-medium leading-tight tracking-tight text-fg">
    Studio <span class="text-accent">sound</span>, silence on <span class="text-accent">demand.</span>
  </h1>
  <ul class="mt-6 flex gap-4 text-sm text-muted"><li>40 h battery</li><li aria-hidden="true">•</li><li>249 g</li></ul>
  <span class="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.3em] text-muted">Scroll</span>
</section>
```

### Gráficos
- **Área**: la línea de 2 px del color de la serie y el relleno `linearGradient` de ese color al
  35 % → 0 %. Lleva una línea discontinua (`stroke-dasharray: 4 4`) para el objetivo o el año
  anterior.
- **Barras**:
  - radio superior completo, con la barra actual en tinta o acento;
  - las futuras van rayadas;
  - tooltip oscuro de radio 10 px con título, filas clave/valor y la variación en verde.
- **Gauges y anillos**: el trazo es del acento y la pista es `rgb(255 255 255/.08)` o
  `rgb(0 0 0/.06)`, con un punto blanco con anillo en el extremo.

## 8 · Motion

| token | valor | uso |
| --- | --- | --- |
| `--cc-ease` | `cubic-bezier(.22,1,.36,1)` | casi todo |
| `--cc-ease-expo` | `cubic-bezier(.16,1,.3,1)` | tiendas editoriales |
| `--cc-duration-fast` / `--cc-duration` | 0.2 / 0.3 s | color, fondo, anillo |
| `--cc-duration-slow` | 0.8 s | revelado al hacer scroll (opacity + translateY 16–24 px) |

**Patrones**:
- **Hover de card**: `translateY(-2px)` (oscuro) o `-4px` (cristal), y el anillo sube de `.075`
  a `.14`.
- **Botón**: el fondo se aclara; `active:translate-y-px`.
- **Indicador live**: punto con `breathe` o `ping`.
- **Números que cambian**: `tick-up`/`tick-down` (deslizar 6 px y fundir), más un `flash` de
  fondo del acento al 20 %.
- **Confirmaciones**: `stamp-in`, un sello que cae con escala de 1.4 → 1 y rotación de −8°.
- **Escenas**: animación ambiental lenta (aurora de 20 s, drift de 20 s, grano `steps(6)`).
- **Scroll**: Lenis solo en editorial.
- **Siempre**: `@media (prefers-reduced-motion: reduce)` lleva las duraciones casi a 0, y la
  interfaz tiene que funcionar sin animación.

## 9 · Voz y microcopy

- **Nombre propio para todo**: el negocio, el usuario ("Nadia Okafor · Insights lead"), los
  clientes y los productos.
- **Saludo más contexto**: "Good morning, Nadia" y "Wednesday 4 November · Hollin Bikes across
  five cities".
- **Cada card interpreta su dato en una frase llana**: "Ahead of plan. Both channels beat last
  month. Online did most of the lifting."
- **Instrucciones cortas en imperativo**: "Pick a room. Tap a dot to switch what is in it."
- **CTAs de 1 a 3 palabras**: "+ New", "Export", "Board pack", "Book a call", "Get a crate".
- **Editorial**:
  - tríos rotundos ("Sun-ripened. Hand-picked. Delivered fresh.");
  - promesas firmes ("No sales, ever.");
  - detalles de oficio y lugar.
- **Inglés británico** en los originales (colour, licence). Si el usuario escribe en español,
  aplica la misma actitud en español.
- **Nunca reutilices frases, nombres de producto ni marcas del catálogo**: imita la actitud, no
  el texto.

## 10 · Señas de identidad (checklist de verificación)

Comprueba en las capturas del build:

1. La variante elegida es reconocible a 2 m: el fondo, el acento y los radios coinciden con su
   ficha.
2. Hay **un solo color de acción** y lleva glow.
3. Los bordes son anillos interiores translúcidos (apps) o reglas y rectángulos limpios
   (editorial), no grises opacos.
4. El titular, saludo o hero es grande, con tracking negativo, y hay etiquetas en MAYÚSCULAS
   con tracking positivo.
5. Los números son protagonistas, con deltas en píldora tintada (apps), o hay stats con pie
   (editorial).
6. Los datos y el copy son concretos (nombres, lugares, cifras) y cada bloque interpreta su
   dato.
7. Hay al menos un detalle de oficio:
   - previsión rayada;
   - indicador live que respira;
   - micro-interacción con metáfora en la acción crítica;
   - capítulos numerados o palabra fantasma (editorial).
8. El motion usa `--cc-ease`, los hovers son discretos y hay `prefers-reduced-motion`.
9. Están el enlace "Skip to content", el foco visible, el toggle de tema (apps) y el `⌘K` en la
   búsqueda.

## 11 · Anti-patrones

- Mezclar familias en una pantalla, por ejemplo cristal más esquinas rectas editoriales.
- Elegir un color de acento "bonito" que no sea el de la variante.
- Usar varios acentos a la vez.
- Fondos `#fff`/`#000` puros, sombras grises cortas (`0 2px 4px rgba(0,0,0,.2)`) o el 8 px
  genérico en todo.
- Lorem ipsum, "John Doe", "Company Inc", métricas redondas (1000, 50 %) o iconos de relleno de
  varios estilos.
- Spinners genéricos en la acción principal, en vez de que el propio control cuente su progreso.
- Librerías pesadas por defecto: GSAP y Lenis solo cuando la familia lo pide (editorial,
  cards 3D).
