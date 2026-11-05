# Checklist de entrega

Repásala antes de dar por terminada una interfaz. Cada punto existe porque es un fallo típico que
hace que un build "parezca otra cosa" o que no se pueda usar en producción.

## Fidelidad al estilo
- [ ] Se cumplen **todas** las señas de identidad de la guía (o de la variante elegida). Compruébalo
      en las capturas, no en el código.
- [ ] Se usan solo tokens: sin hex, radios ni sombras sueltos (`grep -nE '#[0-9a-fA-F]{3,8}\b'` sobre
      los componentes debería salir limpio, salvo en `tokens.css`).
- [ ] Las fuentes cargan de verdad (mira "Loaded font faces" en el `summary.md` de tu build) y el
      fallback no cambia el tamaño de forma visible.
- [ ] La escala tipográfica, el tracking del display y el estilo de los eyebrows coinciden con la guía.
- [ ] El container, el padding vertical de sección y la densidad coinciden con la guía.
- [ ] La puntuación de `compare_style.mjs` contra la referencia del mismo arquetipo es ≥ 80, o las
      diferencias están justificadas.

## Estados e interacción
- [ ] Botones, links, cards interactivas e inputs tienen hover, `:focus-visible`, active y disabled.
- [ ] El motion usa `--cc-duration*` y `--cc-ease`, y existe `@media (prefers-reduced-motion: reduce)`.
- [ ] La navegación se colapsa en móvil y el menú se abre y cierra con teclado.

## Responsive
- [ ] Probado a 390, 768, 1024 y 1440 px, sin scroll horizontal (`horizontal overflow: no` en el
      `summary.md`).
- [ ] El h1 en móvil escala como indica la guía; los grids pasan a 1 columna donde corresponde.

## Accesibilidad
- [ ] Contraste AA en el texto de cuerpo (≥ 4.5:1) y en los textos grandes (≥ 3:1).
- [ ] Landmarks (`header`, `nav`, `main`, `footer`), jerarquía de headings sin saltos, `alt` en las
      imágenes con contenido y `label` en los inputs.
- [ ] El orden de foco es lógico y el foco es visible sobre todos los fondos.

## Contenido y propiedad intelectual
- [ ] Nada de lorem ipsum: el copy es real o verosímil, con la voz de la guía.
- [ ] Ni logos, ni nombres, ni textos, ni imágenes de los productos de la tienda.
- [ ] Los placeholders que el usuario debe sustituir están marcados y listados en la entrega.

## Calidad técnica
- [ ] HTML semántico. Si el proyecto tiene componentes, son reutilizables (sin copiar y pegar
      secciones).
- [ ] No hay dependencias pesadas que la guía no justifique (GSAP, three.js…). Las imágenes usan
      `loading="lazy"` y tienen dimensiones.
- [ ] Sin errores en consola. Si el proyecto tiene build, lint o tests, pasan.
