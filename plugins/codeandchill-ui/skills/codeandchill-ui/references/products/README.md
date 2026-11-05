# Fichas del catálogo

El catálogo de codeandchill.store tiene 149 plantillas y 75 componentes (inventario del 2026-11-05),
y se agrupa en **familias visuales**. Cada ficha de familia incluye una tabla con los valores
medidos de cada producto capturado, sus señas de identidad, componentes, motion, voz y
anti-patrones.

Para elegir referencia, busca el tipo de interfaz en la columna "úsala para" y lee esa ficha. Si
el build lleva un control crítico (pagar, enviar, borrar, verificar), lee también
`micro-interactions.md`.

| ficha | variante de tokens | úsala para | productos capturados | confianza |
| --- | --- | --- | --- | --- |
| [studio-dark.md](studio-dark.md) | `studio-dark` | dashboards de finanzas, analítica, SaaS y trading con carácter "técnico/nocturno" | plotta, rivet, meridian | alta |
| [studio-light.md](studio-light.md) | `studio-light` (por defecto) | CRMs, back-offices, clínicas, tiendas (admin), social media managers: herramientas de uso diario | corbel, murmura, tend, halden | alta |
| [studio-glass.md](studio-glass.md) | `studio-glass` · `studio-glass-light` | smart-home, apps de consumo premium, "iPhone-style", dashboards con foto de fondo | cirrel, solvik, hemli | alta |
| [editorial.md](editorial.md) | `editorial` · `editorial-dark` | landings de un producto, lanzamientos, tiendas online, inmobiliarias, estudios | arden, kessler, lunde, mango, vanta | alta |
| [playful.md](playful.md) | `playful` · `playful-paper` | login / sign-up, 404, felicitaciones, páginas-juego | nocturne, bamboo, sleuth | alta |
| [micro-interactions.md](micro-interactions.md) | (la del contexto) | botones de acción, OTP, toggles, tab bars, cards de producto animadas | gulp, dart, opal, sigil, lumen-toggle, meniscus, glyph, plimsoll, tender, halo | media (desde vídeo) |

## Productos capturados

| slug | familia | qué es | demo |
| --- | --- | --- | --- |
| plotta | studio-dark | reporting y analítica para un negocio de suscripción | demo.codeandchill.store/plotta/ |
| rivet | studio-dark | app de finanzas personales de 9 páginas, negro y neón o claro | demo.codeandchill.store/rivet/ |
| meridian | studio-dark | dashboard de inversiones con gráficos animados | demo.codeandchill.store/meridian/ |
| corbel | studio-light | ventas para tiendas online y físicas | demo.codeandchill.store/corbel/ |
| murmura | studio-light | gestor de redes sociales para 8 redes | demo.codeandchill.store/murmura/ |
| tend | studio-light | CRM de clínica con inbox de WhatsApp | demo.codeandchill.store/tend/ |
| halden | studio-light | CRM de ventas con tablero drag-and-drop | demo.codeandchill.store/halden/ |
| cirrel | studio-glass | admin de tienda en "liquid glass" estilo iPhone | demo.codeandchill.store/cirrel/ |
| solvik | studio-glass | CRM de ventas en cristal esmerilado | demo.codeandchill.store/solvik/ |
| hemli | studio-glass (light) | smart-home en cristal sobre un salón | demo.codeandchill.store/hemli/ |
| arden | editorial | landing inmobiliaria con buscador | demo.codeandchill.store/arden/ |
| kessler | editorial | tienda de marroquinería de 6 páginas | demo.codeandchill.store/kessler/ |
| lunde | editorial | tienda de muebles con hero de vídeo fijado | demo.codeandchill.store/lunde/ |
| mango | editorial | landing animada con scroll para una frutería | demo.codeandchill.store/mango/ |
| vanta | editorial (dark) | lanzamiento de producto oscuro con vídeos de scroll | demo.codeandchill.store/vanta/ |
| nocturne | playful | login de cristal sobre un bosque nocturno | demo.codeandchill.store/nocturne/ |
| bamboo | playful | login donde un panda se tapa los ojos | demo.codeandchill.store/bamboo/ |
| sleuth | playful (paper) | 404 en el que el ratón es una lupa | demo.codeandchill.store/sleuth/ |

Para recapturar (por ejemplo, para tener las capturas de referencia en local y comparar):

```bash
node <plugin>/skills/capture-product-style/scripts/capture_style.mjs https://demo.codeandchill.store/<slug>/ \
  --out .captures --ignore .cc-preview-pill --wait 2500
```

`.cc-preview-pill` es el botón "Buy this template" que la tienda inyecta en cada demo.
