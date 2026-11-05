/**
 * Tailwind v3 preset for the codeandchill.store catalog.
 *   // tailwind.config.js
 *   module.exports = { presets: [require('./tailwind.preset.cjs')], content: [...] }
 *   // global css: @import "./tokens.css";
 * Every value is a CSS variable from tokens.css, so data-cc-variant switches the whole theme.
 */
const v = (name) => `var(--cc-${name})`;

module.exports = {
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        surface: v('surface'),
        'surface-2': v('surface-2'),
        inverse: v('surface-inverse'),
        border: v('border'),
        fg: v('text'),
        muted: v('text-muted'),
        accent: v('accent'),
        'accent-2': v('accent-2'),
        'on-accent': v('on-accent'),
        'accent-tint': v('accent-tint'),
        positive: v('positive'),
        negative: v('negative'),
        warning: v('warning'),
        data: { 1: v('data-1'), 2: v('data-2'), 3: v('data-3'), 4: v('data-4'), 5: v('data-5') },
      },
      fontFamily: { display: v('font-display'), sans: v('font-body'), mono: v('font-mono') },
      fontSize: {
        xs: v('text-xs'), sm: v('text-sm'), base: v('text-base'), md: v('text-md'),
        lg: v('text-lg'), xl: v('text-xl'), '2xl': v('text-2xl'), '3xl': v('text-3xl'),
      },
      letterSpacing: { tight: v('tracking-tight'), wide: v('tracking-wide') },
      lineHeight: { tight: v('leading-tight'), body: v('leading-body') },
      borderRadius: { sm: v('radius-sm'), md: v('radius-md'), lg: v('radius-lg'), xl: v('radius-xl') },
      boxShadow: { sm: v('shadow-sm'), md: v('shadow-md'), lg: v('shadow-lg'), ring: v('ring'), glow: v('glow') },
      transitionTimingFunction: { cc: v('ease'), expo: v('ease-expo') },
      maxWidth: { page: v('container') },
    },
  },
};
