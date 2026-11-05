---
family: micro-interactions
variant: (cualquiera: se adaptan a los tokens del contexto)
type: ui components
products: [gulp, dart, opal, sigil, lumen-toggle, meniscus, glyph, plimsoll, tender, halo]
also_in_family: "75 componentes: delete/send/share/download/upload buttons, toggles, OTP fields, navbars, cart & checkout, inputs & feedback"
captured: 2026-11-05
capture_dirs: [.captures/components/video-<slug>/ (sheet.png + 12 frames de cada reel)]
confidence: media (analizados a partir de los vídeos de producto; no hay demo en vivo)
---

# Micro-interacciones · componentes con metáfora

## En una frase
Un control normal (borrar, enviar, subir, pagar, verificar, navegar) que, al usarse,
**se convierte en el objeto que representa** y cuenta el resultado: la papelera se come la
palabra "Delete", el botón se pliega en un avión de papel, el líquido sube con la subida y la
tarjeta pasa por la ranura.

## Señas de identidad
1. **Verbo → objeto**:

   | componente | interacción | qué representa |
   | --- | --- | --- |
   | gulp | la papelera se come la etiqueta | borrar |
   | dart | el botón se pliega en un avión de papel | enviar |
   | plimsoll | el botón se llena de líquido, ligado al progreso real | subir |
   | tender | la tarjeta pasa por la ranura | pagar |
   | sigil | 4 cajas que se funden en un sello | verificar |
   | opal | gota de cristal que se estira hacia el ítem | navegar |
   | meniscus | hendidura líquida en la tab bar | navegar |
   | lumen-toggle | el tema nuevo se expande en círculo desde el botón | cambiar de tema |
   | glyph | las letras conducen, saltan o se desvanecen en humo según el lado de entrada del cursor | — |

2. **El ciclo completo de estados, siempre**: reposo, pulsado, en curso (el propio botón es la
   barra o el anillo de progreso), éxito y **error**:
   - éxito: color de éxito, check y microcopy debajo ("Receipt sent · $48.00");
   - error: "DECLINED" con microcopy "Card refused · try another".
3. **Física creíble**: springs (`new Spring(210, .9)`), FLIP para unir elementos, trazos con
   `stroke-dasharray`, `clip-path` y squash and stretch. Nada de fundidos genéricos.
4. **Sin dependencias**: HTML, CSS y JS planos de 8–20 KB, con 0 deps. Halo es la excepción y usa
   GSAP.
5. **Aspecto del control**:
   - botones en píldora de 44–48 px de alto, con icono más etiqueta 600;
   - gradiente vertical sutil con highlight interior: no son planos, tienen volumen;
   - colores de intención (rojo carmesí para borrar, navy para lo neutro, verde para pagado,
     violeta para el foco).
6. **Escenario de presentación**:
   - tarjeta clara `#f6f6f4` sobre página oscura;
   - o fondo oscuro con aurora de color (teal e índigo) y el titular "Navigation *opal*" con el
     nombre en serif itálica;
   - eyebrow "COMPONENT · 103".

## Componentes vistos
| componente | resumen | notas de estilo |
| --- | --- | --- |
| gulp (delete) | Las letras caen en la papelera, el botón se vuelve un loader circular con anillo y la papelera se vacía con una pequeña explosión | Píldoras carmesí y navy (colores estimados del vídeo, sin medir), con icono de papelera de trazo blanco |
| dart (send) | El botón se pliega en un avión, vuela por la esquina, y aparecen un check y "Sent" | — |
| opal (nav) | Barra de cristal flotante; el ítem activo en píldora menta (≈, estimado del vídeo) con icono más label; la "gota" se estira al cambiar | Eyebrow "LIQUID GLASS" menta; títulos en serif condensada; modos oscuro (aurora) y claro (pastel con grid) |
| sigil (OTP) | Cada dígito rueda a su caja; la caja activa brilla en violeta; sugerencia de autocompletar desde SMS ("MESSAGE · 4190 is your verification code. [Fill]"); al completar, las cajas se unen en un sello con check teal y botón "Continue" menta | — |
| tender (pay) | "PAY NOW" negro; la tarjeta pasa por la ranura y la línea se llena; el éxito es "✓ PAID" verde con "Receipt sent · $48.00"; el fallo es "DECLINED" con "Card refused · try another" | — |
| plimsoll (upload) | El líquido sube y el texto cambia de color al cruzar la línea del líquido | — |
| lumen-toggle | El tema nuevo se expande en círculo desde el botón mientras el sol gira y se convierte en luna | — |
| meniscus (tab bar) | La pestaña activa se hunde en una hendidura que se desliza y se estira; se puede arrastrar | — |
| glyph (CTA) | Tres efectos de letras en hover que dependen de la dirección de entrada del cursor | — |
| halo (cards) | Cards de producto que se inclinan hacia el cursor con brillo; en hover el producto se adelanta y pulsan anillos de sonido | Modo claro y oscuro |

## Cómo aplicarlo en un build
- **En cada pantalla**, elige **una** acción crítica (pagar, enviar, borrar, verificar) y dale
  su micro-interacción con metáfora. El resto de controles siguen siendo sobrios.
- **Implementa los estados** de reposo, en curso, éxito y error, con microcopy debajo del
  control.
- **Anímalo con `transform`/`opacity` y springs o easing `cubic-bezier(.22,1,.36,1)`.** Con
  `prefers-reduced-motion`, muestra el estado final sin la animación.
- **Comenta el código** como en la tienda: explica la intención, no la sintaxis ("the dash IS
  the electron", "one spring per edge").
