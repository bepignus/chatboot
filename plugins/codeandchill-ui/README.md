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
/plugin install codeandchill-ui --marketplace bepignus/chatboot
```

En versiones anteriores de Claude Code: `/plugin marketplace add bepignus/chatboot` y luego
`/plugin install codeandchill-ui@chatboot`.

## Contenido

| componente | qué hace |
| --- | --- |
| skill `capture-product-style` | Flujo descubrir → capturar → mirar → ficha por producto → guía del catálogo + tokens |
| skill `codeandchill-ui` | Flujo cargar estilo → elegir referencia → stack → construir → verificar → entregar |
| `/codeandchill-ui:capture <fuente>` | Atajo para la captura |
| `/codeandchill-ui:ui <qué construir>` | Atajo para construir |
| `scripts/capture_style.mjs` | Extractor con Playwright: `summary.md`, `capture.json`, capturas desktop y móvil, recortes de componentes; modo `--discover` para tiendas |
| `scripts/compare_style.mjs` | Puntuación de fidelidad (0–100) por dimensión, con la lista de deltas a corregir |

## Estado

La guía de estilo está en `skills/codeandchill-ui/references/style-guide.md` y su estado es
**pendiente de captura**. Mientras siga así, `codeandchill-ui` se niega a improvisar el estilo y
pide ejecutar primero la captura.

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
