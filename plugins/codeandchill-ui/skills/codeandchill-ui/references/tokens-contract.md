# Contrato de tokens

Estos nombres son estables: `capture-product-style` los rellena con valores **medidos** y
`codeandchill-ui` los consume. Si un valor no se pudo medir, el token se omite y se anota en la guía;
nunca se rellena con un valor inventado. Los tokens opcionales solo existen si el catálogo los usa.

## Nombres (`tokens.css`)

| grupo | token | qué es |
| --- | --- | --- |
| color | `--cc-bg` | fondo de página |
| | `--cc-surface`, `--cc-surface-2` | cards y paneles; superficies elevadas, hover e inputs |
| | `--cc-border` | borde por defecto |
| | `--cc-text` | titulares y texto principal |
| | `--cc-text-muted` | cuerpo y texto secundario |
| | `--cc-accent`, `--cc-accent-2`? | acento principal y secundario (opcional) |
| | `--cc-on-accent` | texto sobre el acento |
| | `--cc-gradient`? | gradiente firma (opcional) |
| | `--cc-glow`? | sombra de color bajo CTAs o cards (opcional) |
| tipo | `--cc-font-display`, `--cc-font-body`, `--cc-font-mono`? | stacks completos con fallback |
| | `--cc-text-xs` … `--cc-text-7xl` | escala medida (solo los pasos que existan) |
| | `--cc-leading-tight`, `--cc-leading-body` | line-heights |
| | `--cc-tracking-tight`, `--cc-tracking-wide` | letter-spacing de display y de eyebrows |
| forma | `--cc-radius-sm`, `--cc-radius-md`, `--cc-radius-lg`, `--cc-radius-full` | radios |
| | `--cc-border-width` | grosor de borde |
| | `--cc-shadow-sm`, `--cc-shadow-md`, `--cc-shadow-lg` | sombras |
| | `--cc-blur`? | blur del cristal (header, overlays) |
| espacio | `--cc-space` | unidad base (4 u 8 px) |
| | `--cc-container`, `--cc-gutter` | ancho máximo y margen lateral |
| | `--cc-section-y`, `--cc-section-y-mobile` | padding vertical de sección |
| motion | `--cc-ease`, `--cc-duration-fast`, `--cc-duration`, `--cc-duration-slow` | easing y duraciones |

Las variantes del catálogo se declaran como bloques que redefinen los tokens:

```css
:root { /* ADN común / variante por defecto */ }
[data-cc-variant="<nombre>"] { /* solo lo que cambia */ }
```

## Tailwind v4 (`tailwind.theme.css`)

```css
@import "tailwindcss";
@import "./tokens.css";

@theme inline {
  --color-bg: var(--cc-bg);
  --color-surface: var(--cc-surface);
  --color-surface-2: var(--cc-surface-2);
  --color-border: var(--cc-border);
  --color-fg: var(--cc-text);
  --color-muted: var(--cc-text-muted);
  --color-accent: var(--cc-accent);
  --color-on-accent: var(--cc-on-accent);
  --font-display: var(--cc-font-display);
  --font-sans: var(--cc-font-body);
  --font-mono: var(--cc-font-mono);
  --radius-sm: var(--cc-radius-sm);
  --radius-md: var(--cc-radius-md);
  --radius-lg: var(--cc-radius-lg);
  --shadow-sm: var(--cc-shadow-sm);
  --shadow-md: var(--cc-shadow-md);
  --shadow-lg: var(--cc-shadow-lg);
  --ease-cc: var(--cc-ease);
  /* + --color-accent-2, --shadow-glow, --text-* … solo si existen en tokens.css */
}
```

Uso: `bg-bg text-fg`, `bg-surface border-border`, `text-muted`, `font-display`, `rounded-lg`,
`shadow-md`, `ease-cc`…

Para un HTML suelto sin build, carga `@tailwindcss/browser` con versión exacta y pon el bloque
`@theme` dentro de `<style type="text/tailwindcss">`.

## Tailwind v3 (`tailwind.preset.cjs`)

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: 'var(--cc-bg)', surface: 'var(--cc-surface)', 'surface-2': 'var(--cc-surface-2)',
        border: 'var(--cc-border)', fg: 'var(--cc-text)', muted: 'var(--cc-text-muted)',
        accent: 'var(--cc-accent)', 'on-accent': 'var(--cc-on-accent)',
      },
      fontFamily: { display: 'var(--cc-font-display)', sans: 'var(--cc-font-body)', mono: 'var(--cc-font-mono)' },
      borderRadius: { sm: 'var(--cc-radius-sm)', md: 'var(--cc-radius-md)', lg: 'var(--cc-radius-lg)' },
      boxShadow: { sm: 'var(--cc-shadow-sm)', md: 'var(--cc-shadow-md)', lg: 'var(--cc-shadow-lg)' },
      transitionTimingFunction: { cc: 'var(--cc-ease)' },
      maxWidth: { container: 'var(--cc-container)' },
    },
  },
};
```

En el proyecto: `presets: [require('./tailwind.preset.cjs')]` e importar `tokens.css` en el CSS global.

## Sin Tailwind

Importa `tokens.css` y usa `var(--cc-*)` directamente en CSS, CSS Modules o styled-components.
