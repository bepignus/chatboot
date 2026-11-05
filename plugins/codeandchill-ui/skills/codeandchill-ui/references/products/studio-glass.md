---
family: studio-glass
variant: [studio-glass, studio-glass-light]
type: dashboard / app-ui
theme: both
products: [cirrel, solvik, hemli]
also_in_family: "vitrea, halvo, nimbra, nestra, sorvo, lumelle, kerfa, pane (frosted / iPhone-style liquid glass)"
captured: 2026-11-05
capture_dirs: [.captures/clean/a/demo-codeandchill-store-cirrel, …-solvik, …-hemli]
confidence: alta (demos capturadas)
---

# Studio glass · cristal esmerilado e iOS liquid glass

## En una frase
Paneles translúcidos con desenfoque fuerte, encima de **algo que merece verse detrás**: orbes de
color (cirrel), una foto difuminada de un paisaje (solvik) o el salón de la casa (hemli). Tienen
bordes de luz finos, esquinas muy redondeadas y la gramática de iOS (azul `#0a84ff`, verde
`#30d158`, toggles y segmented controls).

## Señas de identidad
1. **Fondo con contenido visual**:
   - orbes radiales de color, desenfocados y animados con `orb 3.2s ease-in-out infinite`
     (`radial-gradient(circle at 32% 28%, #6fb2ff 0%, #1471f0 34%, …)`);
   - o una foto a pantalla completa con desenfoque.
2. **Cristal**:
   - oscuro: `background: rgb(14 18 28 / .5); backdrop-filter: blur(30px) saturate(1.5) brightness(.5)`;
   - claro: `rgb(255 255 255 / .56)` con `blur(24px) saturate(1.4)`.
3. **Bordes de luz**: `inset 0 0 0 1px rgb(255 255 255 / .08)` y `inset 0 1px 0 rgb(255 255 255 / .22)`.
   En claro, `inset 0 0 0 1px rgb(255 255 255 / .72)`, `inset 0 1px 0 rgb(255 255 255 / .95)` y un
   brillo diagonal `linear-gradient(165deg, rgb(255 255 255 / .5), transparent 42%)`.
4. **Radios grandes**: cards de 20–26 px, sidebar de 30 px y todo lo interactivo en píldora.
5. **Paleta iOS**:
   - azul `#0a84ff` para acciones, con texto tintado `#6cb4ff` sobre `rgb(11 133 255 / .18)`;
   - verde `#30d158` / `#4fdc78` para lo positivo, toggles y "Live";
   - solvik cambia el azul por lima `#c4ef4f` y salmón `#ff9a7c`.
6. **KPI cards tintadas en pastel translúcido** (hemli: azul `#c4e2f6`, menta `#cbeae4`, piedra y
   rosa al 66 %).

## Productos medidos
| producto | tema | fondo | panel | text / muted | acento | radio | nota |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cirrel | oscuro | `#04070d` + gradiente 140° + orbes azul/naranja | `rgb(14 18 28 / .5)` · blur 30 | `#f2f5fa` / `#b6bfcd` | `#0a84ff` · `#30d158` | 26 / 30 px | Sidebar de cristal con secciones SHOP/MONEY/TALK, toggle iOS "Dark mode" |
| solvik | oscuro | foto de paisaje difuminada | `rgb(20 24 24 / .46)` · blur 22 · borde `rgb(255 255 255 / .15)` | `#f2f4f0` / `#c2c7c1` | lima `#c4ef4f` · salmón `#ff9a7c` | 22 px | Nav superior en píldora central, rail flotante de iconos, "Hot deals" en cards grises translúcidas |
| hemli | claro | foto de interior difuminada + `#cdd1d6` | `rgb(255 255 255 / .56)` | `#14181d` / `#4d5561` | `#0f7fbd` · cálido `#ffe6c2` | 20 px | Plano de la casa con puntos de luz que brillan (`0 0 14px -2px` cálido), dial de termostato |

## Tipografía
- **Familia**: Urbanist en los tres.
- **Escala**:

| uso | tamaño | peso | tracking |
| --- | --- | --- | --- |
| Saludo | 37–44 px | 600 | −0.025em |
| Título de card | 15 px | 600 | — |
| Cuerpo | 12.5–14 px | 500 | — |
| Secciones | 11 px | 700, MAYÚSCULAS | 0.08em |

## Componentes
- **Segmented iOS** (`12M | 6M | 30D | 7D`): contenedor `rgb(255 255 255 / .06)` en píldora, con
  el activo en `rgb(255 255 255 / .12)`.
- **CTA**: píldora azul con icono ("+ Create"), alto 40, glow `drop-shadow(0 8px 14px rgb(10 132 255 / .4))`.
- **Chips de acción en filas** ("Packed", "Restock"): píldora `rgb(255 255 255 / .08)` con anillo
  `.15`, alto 32.
- **Icon buttons circulares** (42 px) de cristal: `rgb(14 18 28 / .5)` con blur, o círculo con
  borde `rgb(255 255 255 / .18)`.
- **Toggle iOS** verde y **badges contadores** azules tintados.
- **Gráficos**: línea azul con área degradada; barras verticales redondeadas en azul ("Live
  store"); anillos de progreso con punto en el extremo.

## Motion
- **Transiciones**: `transform .9s cubic-bezier(.22,1,.36,1)` para paneles; `color .3s
  cubic-bezier(.2,.8,.2,1)`.
- **Hover de card**: `translateY(-4px)`.
- **Keyframes**: `breathe`, `breathe-ring`, `stamp-in` (el sello "PAID"), `typing`, `orb`, `flash`.

## Qué NO hacer
- Cristal sobre un fondo plano: sin nada detrás, el blur no se ve y queda gris sucio.
- Blur sin `saturate()`.
- Bordes opacos o esquinas de menos de 18 px en paneles.
