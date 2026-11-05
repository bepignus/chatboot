---
status: captured            # pending-capture | captured
updated: <YYYY-MM-DD>
sources:                    # slugs de products/ y URLs de origen
  - <slug>: <url>
products: <n>
---

# Guía de estilo · catálogo codeandchill.store

<!-- Este archivo es lo primero que lee codeandchill-ui. Tiene que bastar por sí solo para
construir algo fiel; las fichas de products/ añaden detalle por arquetipo. Escribe decisiones
y su porqué, no adjetivos sueltos. -->

## ADN común del catálogo
<!-- Lo que comparten la mayoría de productos (ver .captures/catalog-summary.md). 5–8 bullets. -->

## Variantes
<!-- Solo si el catálogo tiene familias visuales distintas. Para cada una: nombre, cuándo usarla
(tipo de proyecto), productos de referencia (slugs) y en qué se diferencia del ADN común.
En tokens.css cada variante es un bloque [data-cc-variant="<nombre>"]. -->
| variante | úsala para | referencias | diferencias clave |
| --- | --- | --- | --- |

## Color
<!-- Roles y reglas de uso: proporciones aproximadas (p. ej. 80 % bg / 15 % surface / 5 % acento),
dónde va el acento y dónde no, gradientes firma, estados. -->

## Tipografía
<!-- Familias + cómo cargarlas (con alternativa libre si alguna es comercial), escala, tracking,
mayúsculas/eyebrows, longitud típica de titulares. -->

## Forma, profundidad y texturas

## Layout y ritmo
<!-- Container, rejillas, padding de secciones, orden típico de secciones por arquetipo. -->

## Recetas de componentes
<!-- Un snippet mínimo por componente usando SOLO tokens (clases Tailwind mapeadas o var(--cc-*)).
Incluye estados hover / focus-visible / active. -->

### Botones
### Header / nav
### Hero
### Cards
### Badges / pills
### Formularios
### Footer
### Otros patrones recurrentes

## Motion
<!-- Duraciones, easings, patrones de entrada, hover, scroll. Siempre con prefers-reduced-motion. -->

## Voz y microcopy

## Señas de identidad (checklist de verificación)
<!-- Lista numerada de rasgos observables que todo build debe cumplir. codeandchill-ui la usa
para revisar sus capturas. -->
1.
2.
3.

## Anti-patrones
