---
status: pending-capture
updated: null
sources: []
products: 0
---

# Guía de estilo · catálogo codeandchill.store

**Pendiente de captura.** Todavía no se han analizado los productos del catálogo, así que esta guía
no contiene valores. `codeandchill-ui` no debe construir nada "al estilo codeandchill" hasta que se
rellene, porque cualquier valor sería inventado.

Para rellenarla, ejecuta la skill `capture-product-style` (o el comando `/codeandchill-ui:capture`)
con una de estas fuentes:

- la URL de la tienda (`https://codeandchill.store`), para descubrir productos y demos;
- URLs de demos concretas;
- el código de una plantilla comprada;
- capturas de pantalla de los productos.

El resultado sustituirá este archivo siguiendo
`../../capture-product-style/references/style-guide-template.md` y generará `tokens.css`,
`tailwind.theme.css`, `tailwind.preset.cjs` y las fichas de `products/`.
