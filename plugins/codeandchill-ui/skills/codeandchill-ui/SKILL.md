---
name: codeandchill-ui
description: Diseña y desarrolla interfaces web (landings, sitios SaaS, dashboards, portfolios, tiendas, páginas sueltas o componentes) con el estilo de las plantillas que se venden en codeandchill.store, usando la guía de estilo, las fichas de producto y los tokens capturados de ese catálogo. Úsala siempre que el usuario pida una UI "estilo codeandchill", "como las plantillas de Code & Chill", "con el estilo de nuestras plantillas", o quiera crear, rediseñar o ampliar una página o componente que deba parecer de ese catálogo, aunque no nombre la tienda explícitamente en un proyecto que ya usa este plugin. También para "build a landing/dashboard in the codeandchill style".
---

# Interfaces al estilo de las plantillas de codeandchill.store

Construye interfaces **nuevas**, con el contenido y la marca del usuario, que se sientan parte del
mismo catálogo que las plantillas de codeandchill.store. Para conseguirlo se reproduce su lenguaje
visual (paleta, tipografía, ritmo, componentes, motion y tono). Nunca se clona un producto concreto
1:1 ni se copian sus logos, textos o imágenes.

## 1 · Cargar el estilo

Lee, en este orden (el primero que exista gana):

1. `.codeandchill/style-guide.md` en la raíz del proyecto (override local).
2. `references/style-guide.md` de esta skill.

Si el frontmatter dice `status: pending-capture`, **para aquí**. Explica al usuario que todavía no
hay estilo capturado y lanza la skill `capture-product-style`, que necesita las URLs de las demos,
acceso de red a ellas o capturas de pantalla. No improvises una estética "code & chill" a partir
del nombre: saldría un diseño genérico que no se parece a lo que el usuario quiere, y lo daría por
bueno.

Después carga también:

- `tokens.css`, `tailwind.theme.css` (v4) y `tailwind.preset.cjs` (v3), de la misma carpeta que la
  guía. No hace falta leerlos enteros: cópialos al proyecto.
- `references/products/README.md`, el índice de **familias** (studio-light, studio-dark,
  studio-glass, editorial, playful y micro-interactions) con los productos medidos de cada una.
- `references/tokens-contract.md` si vas a cablear los tokens en un proyecto.

## 2 · Elegir la referencia

1. Elige la **variante** con la tabla "Variantes" de la guía y la columna "úsala para" del índice.
   Si el usuario no dice nada, aplica la regla por defecto de la guía y dilo en la entrega.
2. Lee la ficha de esa familia en `products/` y, si hay una acción crítica (pagar, enviar,
   borrar, verificar), también `products/micro-interactions.md`.
3. Dentro de la ficha, elige el **producto medido más cercano** al dominio del usuario (por
   ejemplo, una clínica se parece a `tend`). Úsalo como referencia concreta de valores y para la
   comparación del paso 5.

## 3 · Preparar el stack

- **Si hay proyecto**, respeta lo que ya existe: framework, versión de Tailwind, librería de
  componentes y convenciones. Revisa `package.json`, la configuración de Tailwind y la carpeta de
  componentes antes de escribir.
- **Si no hay proyecto**:
  - Para prototipos y páginas sueltas, usa un único HTML con Tailwind en el navegador
    (`@tailwindcss/browser` con versión exacta) más `tokens.css`.
  - Para una app, usa Vite + React + Tailwind.
- Cablea los tokens según `references/tokens-contract.md`:
  - Tailwind v4: `@theme inline`.
  - Tailwind v3: preset.
  - Sin Tailwind: `var(--cc-*)`.
- A partir de aquí, **nada de hex sueltos** en componentes. Así el estilo se mantiene coherente y
  se puede ajustar en un solo sitio.
- Activa la variante con `data-cc-variant="<variante>"` en `<html>`. Sin el atributo se aplica
  `studio-light`. Los tokens comunes (motion, datos, avatares) valen para todas.
- Carga las fuentes de la variante desde Google Fonts (tabla "Tipografía" de la guía): Urbanist
  en las apps, Instrument Sans o Archivo en editorial, etc.

## 4 · Construir

- **Estructura**: planifica las secciones siguiendo el ritmo de la guía (orden típico, padding
  vertical, container, densidad). Luego encaja ahí el contenido del usuario.
- **Componentes**: impleméntalos a partir de las recetas de la guía (botones, header, hero, cards,
  badges, formularios, footer). Hazlos reutilizables y con todos sus estados: hover, focus-visible,
  active y disabled.
- **Motion**: usa las duraciones y easings de los tokens y los patrones de entrada y hover de la
  guía. Desactívalo con `prefers-reduced-motion`.
- **Contenido**:
  - Usa el contenido real del usuario.
  - Si falta, escribe copy verosímil con la voz que describe la guía.
  - Nada de lorem ipsum ni de textos de las plantillas.
- **Imágenes**:
  - Nunca uses imágenes de la tienda.
  - Usa composiciones propias: mockups de UI hechos en HTML/CSS, SVG, gradientes, texturas, o
    placeholders claramente marcados para que el usuario los sustituya.
- **Responsive**: diseña mobile-first y aplica lo que la guía dice que cambia en móvil.
- **Accesibilidad**:
  - El texto de cuerpo debe tener contraste AA. Si el gris "muted" de referencia no llega,
    ajústalo lo mínimo y menciónalo.
  - Usa landmarks semánticos, `alt` y labels.
  - El foco tiene que ser visible.

## 5 · Verificar (bucle)

Los scripts están en `../capture-product-style/scripts/`, junto al directorio de esta skill.

```bash
# 1. Captura lo que has construido (archivo, carpeta o URL de tu dev server)
node <plugin>/skills/capture-product-style/scripts/capture_style.mjs ./index.html --out .captures --name build-<nombre>

# 2. Compárala con la referencia (si existe .captures/<slug-referencia>/)
node <plugin>/skills/capture-product-style/scripts/compare_style.mjs .captures/<slug-referencia> .captures/build-<nombre>
```

Si no tienes la captura de referencia en local, sácala de la demo: los comandos están en
`references/products/README.md`. Usa siempre `--ignore .cc-preview-pill`.

1. Corrige los deltas que señalan diferencias de **estilo**: tema, roles de color, fuentes, escala,
   radios, sombras, blur, unidad de espaciado, motion. Ignora los que solo reflejan que el contenido
   o el layout son legítimamente distintos.
2. Si la referencia es del mismo arquetipo, apunta a una puntuación de 80 o más. La puntuación es
   una guía, no el objetivo.
3. Abre tus `desktop-fold.png` y `mobile-fold.png` junto a las capturas de la referencia y repasa
   una por una las **señas de identidad** de la guía.
4. Si no hay capturas de referencia en local (por ejemplo, el plugin se usa en otro proyecto),
   haz solo la revisión visual contra la guía.
5. Termina con `references/build-checklist.md`.

## 6 · Entregar

Explica brevemente:

- Qué archivos has creado y cómo ejecutarlos.
- Qué producto o variante del catálogo tomaste como referencia.
- La puntuación de fidelidad, si se midió.
- Las desviaciones deliberadas (accesibilidad, requisitos del usuario).
- Qué placeholders quedan por sustituir.
