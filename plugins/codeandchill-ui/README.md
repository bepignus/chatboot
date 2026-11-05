# codeandchill-ui

Plugin de Claude Code para desarrollar interfaces con el estilo de las plantillas que se venden en
[codeandchill.store](https://codeandchill.store).

Hace dos cosas:

1. **Captura** el ADN visual de los productos del catálogo: paleta por roles, tipografía, escala,
   espaciado, radios, sombras, layout, componentes, hover, motion y tono. Lo hace a partir de sus
   demos, del código de una plantilla o de capturas de pantalla.
2. **Construye** interfaces nuevas con ese lenguaje visual y verifica la fidelidad comparando
   capturas del resultado con las de la referencia.

## Instalación

```
/plugin install codeandchill-ui --marketplace bepignus/ui-style-skills
```

En versiones anteriores de Claude Code: `/plugin marketplace add bepignus/ui-style-skills` y luego
`/plugin install codeandchill-ui@ui-style-skills`.

## Contenido

| componente | qué hace |
| --- | --- |
| skill `capture-product-style` | Flujo descubrir → capturar → mirar → ficha por producto → guía del catálogo + tokens |
| skill `codeandchill-ui` | Flujo cargar estilo → elegir referencia → stack → construir → verificar → entregar |
| `/codeandchill-ui:capture <fuente>` | Atajo para la captura |
| `/codeandchill-ui:ui <qué construir>` | Atajo para construir |
| `scripts/capture_style.mjs` | Extractor con Playwright: `summary.md`, `capture.json`, capturas desktop y móvil, recortes de componentes; modo `--discover` para tiendas |
| `scripts/compare_style.mjs` | Puntuación de fidelidad (0–100) por dimensión, con la lista de deltas a corregir |
| `scripts/extract_frames.mjs` | Fotogramas y hoja de contactos de un vídeo de producto (componentes sin demo en vivo); requiere ffmpeg |

## Estado

**Capturado el 2026-11-05**: 18 demos en vivo y 10 vídeos de componentes, sobre un inventario de
149 plantillas y 75 componentes. Todo está en `skills/codeandchill-ui/references/`:

| archivo | contenido |
| --- | --- |
| `style-guide.md` | ADN común, variantes, color, tipografía, layout, recetas de componentes, motion, voz y checklist |
| `products/*.md` | fichas por familia (studio-light, studio-dark, studio-glass, editorial, playful, micro-interactions) con valores medidos por producto |
| `tokens.css` | 8 variantes por `data-cc-variant` |
| `tailwind.theme.css` / `tailwind.preset.cjs` | Tailwind v4 y v3 |

## Ejemplos

En `examples/` hay dos interfaces construidas por la skill en la validación: el dashboard de un
estudio de yoga (`studio-light`, 80/100) y la landing de una suscripción de café (`editorial`,
86/100). Cada una tiene sus capturas.

## Requisitos

- Node 18+
- Playwright con Chromium: `npm i -D playwright && npx playwright install chromium`, o
  `CHROMIUM_PATH=/ruta/a/chromium` si ya lo tienes.

## Tests

```bash
node plugins/codeandchill-ui/tests/smoke.mjs
```

Ejecuta el extractor, el comparador y el modo discover sobre fixtures locales neutros
(`tests/fixture/`).
