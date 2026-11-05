# Ejemplos

Son las dos interfaces que construyó la skill `codeandchill-ui` en la validación (2026-11-05), en
sesiones limpias que solo tenían el plugin y estos prompts:

| ejemplo | prompt | familia elegida | fidelidad (`compare_style.mjs`) |
| --- | --- | --- | --- |
| [yoga-dashboard](yoga-dashboard/) | "Necesito el dashboard principal para la recepción de un estudio de yoga en Valencia (clases de hoy, ocupación, alumnas, bonos que caducan, ingresos del mes). Hazlo con el estilo de las plantillas de codeandchill." | `studio-light` (referencia: tend) | 80/100 frente a corbel · 67/100 frente a tend (tend usa Geist; la familia usa Urbanist) |
| [coffee-landing](coffee-landing/) | "Quiero una landing de una sola página para vender una suscripción mensual de café de especialidad tostado en Bilbao, al estilo de las plantillas de codeandchill." | `editorial` (referencias: arden, lunde, kessler) | 86/100 frente a arden |

Son archivos HTML únicos, sin build: ábrelos en el navegador. Las imágenes `preview-*.png` son
capturas de estos mismos archivos hechas con `capture_style.mjs`.
