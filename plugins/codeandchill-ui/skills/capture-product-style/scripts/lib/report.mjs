// Turns raw in-page tallies into a compact, opinionated digest (aggregate) and markdown reports.
import { clusterColors, deltaE, chroma, contrast, luminance, describeColor } from './color.mjs';

const withPct = (list) => {
  const total = list.reduce((s, x) => s + x.weight, 0) || 1;
  return list.map((x) => ({ ...x, pct: Math.round((1000 * x.weight) / total) / 10 }));
};
const toEntries = (tally = []) => tally.map((t) => ({ hex: t.value, weight: t.weight }));
const pxNum = (v) => parseFloat(v) || 0;

export function aggregate(raw) {
  const t = raw.tallies;
  const bg = withPct(clusterColors(toEntries(t.bg)));
  const text = withPct(clusterColors(toEntries(t.text)));
  const border = withPct(clusterColors(toEntries(t.border)));
  const gradient = withPct(clusterColors(toEntries(t.gradientColor)));

  // --- color roles
  const background = (bg[0] && bg[0].hex) || raw.pageBg;
  const surfaces = bg.filter((c) => c.hex !== background && c.pct >= 0.8 && deltaE(c.hex, background) > 3).slice(0, 4);
  // Text: "primary" is the strongest-contrast neutral with real presence (usually headings);
  // "muted" is the most used neutral that is clearly softer than it (usually body/secondary copy).
  // Heading color wins when it is a neutral that really appears; otherwise the highest-contrast
  // neutral with >= 8% of the text (so white-on-button labels don't hijack the role).
  const neutralsText = text.filter((c) => c.pct >= 3 && chroma(c.hex) < 20);
  const headingColor = ['h1', 'h2', 'h3']
    .map((tg) => raw.tagStyles[tg] && raw.tagStyles[tg].color)
    .find((hx) => hx && chroma(hx) < 20 && text.some((c) => c.members.includes(hx) && c.pct >= 1));
  const byContrast = neutralsText.filter((c) => c.pct >= 8).sort((a, b) => contrast(b.hex, background) - contrast(a.hex, background));
  const textPrimary = headingColor || (byContrast[0] && byContrast[0].hex) || (text[0] && text[0].hex) || null;
  const textMuted = neutralsText.find((c) => textPrimary && c.hex !== textPrimary && deltaE(c.hex, textPrimary) > 8 && contrast(c.hex, background) < contrast(textPrimary, background));
  const textBody = (raw.tagStyles.p && raw.tagStyles.p.color) || (text[0] && text[0].hex) || null;
  const borderMain = border[0] || null;

  // Accent = the chromatic color with the most presence, boosted when used on buttons.
  const buttonBgs = (raw.components.buttons || []).map((b) => (b.bg || '').split(' ')[0]).filter((h) => /^#/.test(h));
  const pool = [
    ...bg.map((c) => ({ hex: c.hex, weight: c.pct })),
    ...text.map((c) => ({ hex: c.hex, weight: c.pct * 1.5 })),
    ...gradient.map((c) => ({ hex: c.hex, weight: c.pct * 0.8 })),
    ...border.map((c) => ({ hex: c.hex, weight: c.pct * 0.4 })),
    ...buttonBgs.map((hex) => ({ hex, weight: 25 })),
  ].filter((c) => chroma(c.hex) >= 18);
  const chromatic = clusterColors(pool, 10).map((c) => ({ ...c, score: c.weight * (1 + chroma(c.hex) / 60) })).sort((a, b) => b.score - a.score);
  const accent = chromatic[0] ? chromatic[0].hex : null;
  const accents = chromatic.filter((c, i) => i === 0 || deltaE(c.hex, chromatic[0].hex) > 18).slice(0, 4).map((c) => c.hex);

  const theme = luminance(background) < 0.18 ? 'dark' : 'light';

  // --- typography
  const families = withPct((t.family || []).map((f) => ({ hex: f.value, weight: f.weight }))).map((f) => ({ family: f.hex, pct: f.pct }));
  const ts = raw.tagStyles || {};
  const fam = (s) => (s && s.family ? s.family.split(',')[0].replace(/["']/g, '').trim() : null);
  const headingFamily = fam(ts.h1) || fam(ts.h2) || (families[0] && families[0].family);
  const bodyFamily = fam(ts.p) || (families[0] && families[0].family);
  const scale = (t.typeStyle || [])
    .map((s) => {
      const [size, weight, lineHeight, letterSpacing, transform, family] = s.value.split('|');
      return { size, weight, lineHeight, letterSpacing, transform, family, weight_: s.weight };
    })
    .sort((a, b) => pxNum(b.size) - pxNum(a.size));
  const scaleSizes = [...new Set(scale.map((s) => Math.round(pxNum(s.size))))].sort((a, b) => b - a);
  const monoUsed = families.some((f) => /mono|code|courier|consolas|menlo/i.test(f.family));

  // --- spacing / shape
  const spacingMap = new Map();
  for (const s of [...(t.padding || []), ...(t.gap || [])]) spacingMap.set(Number(s.value), (spacingMap.get(Number(s.value)) || 0) + s.weight);
  const spacing = [...spacingMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 16).map(([v, w]) => ({ px: v, count: w }));
  const totalSp = spacing.reduce((s, x) => s + x.count, 0) || 1;
  const share = (n) => spacing.filter((s) => s.px % n === 0).reduce((s, x) => s + x.count, 0) / totalSp;
  const baseUnit = share(8) >= 0.7 ? 8 : share(4) >= 0.7 ? 4 : null;
  const radii = (t.radius || []).slice(0, 8).map((r) => ({ value: r.value, count: r.weight }));
  const dominantRadius = (radii.find((r) => r.value !== 'full') || {}).value || null;
  const shadows = (t.shadow || []).slice(0, 6).map((s) => ({ value: s.value, count: s.weight }));

  return {
    theme,
    colors: {
      background,
      surfaces: surfaces.map((c) => ({ hex: c.hex, pct: c.pct })),
      textPrimary,
      textMuted: textMuted ? textMuted.hex : null,
      textBody,
      border: borderMain ? borderMain.hex : null,
      accent,
      accents,
      contrast: {
        textOnBg: textPrimary ? Math.round(contrast(textPrimary, background) * 10) / 10 : null,
        mutedOnBg: textMuted ? Math.round(contrast(textMuted.hex, background) * 10) / 10 : null,
        accentOnBg: accent ? Math.round(contrast(accent, background) * 10) / 10 : null,
      },
      palettes: { bg: bg.slice(0, 10), text: text.slice(0, 8), border: border.slice(0, 6), gradient: gradient.slice(0, 8) },
      gradients: (t.gradient || []).slice(0, 5).map((g) => g.value),
    },
    type: { headingFamily, bodyFamily, families: families.slice(0, 6), monoUsed, scaleSizes: scaleSizes.slice(0, 14), scale: scale.slice(0, 18), uppercase: (t.uppercase || []).slice(0, 5), tags: ts },
    spacing: { baseUnit, values: spacing },
    shape: { radii, dominantRadius, shadows, borderWidths: (t.borderWidth || []).slice(0, 5), textShadows: (t.textShadow || []).slice(0, 3) },
    layout: { maxWidths: (t.maxWidth || []).slice(0, 6), grids: (t.grid || []).slice(0, 8), sections: raw.sections, docHeight: raw.doc.height },
    effects: { backdrop: (t.backdrop || []).slice(0, 4), filters: (t.filter || []).slice(0, 4), blend: (t.blend || []).slice(0, 4) },
    motion: { transitions: (t.transition || []).slice(0, 8), animations: (t.animation || []).slice(0, 8), keyframes: raw.css.keyframes },
  };
}

// ----------------------------------------------------------------------------- markdown

const swatch = (hex) => (hex ? `\`${hex}\` (${describeColor(hex)})` : '—');
const list = (arr, fmt = (x) => x) => (arr && arr.length ? arr.map((x) => `- ${fmt(x)}`).join('\n') : '- —');
const table = (headers, rows) =>
  rows.length ? [`| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.map((c) => String(c ?? '—').replace(/\|/g, '\\|')).join(' | ')} |`)].join('\n') : '_none_';

function componentTable(items) {
  return table(
    ['×', 'text', 'size', 'bg', 'color', 'border', 'radius', 'padding', 'font', 'shadow / effects', 'id'],
    items.map((c) => [c.count, c.text, c.size, c.bgImage && c.bgImage.includes('gradient') ? `gradient${c.bg ? ' over ' + c.bg : ''}` : c.bg, c.color, c.border, c.radius, c.padding, [c.font, c.textTransform, c.letterSpacing].filter(Boolean).join(' · '), [c.shadow, c.backdrop && `backdrop ${c.backdrop}`].filter(Boolean).join(' · ') || '—', c.id]),
  );
}

export function summaryMarkdown(raw, agg, extra = {}) {
  const c = agg.colors;
  const lines = [];
  lines.push(`# Style capture — ${raw.title || raw.url}`);
  lines.push('');
  lines.push(`- URL: ${raw.url}`);
  lines.push(`- Captured: ${extra.capturedAt || new Date().toISOString()}`);
  lines.push(`- Theme: **${agg.theme}** · color-scheme: ${raw.colorScheme || 'normal'} · page height: ${raw.doc.height}px @ ${raw.doc.width}px`);
  lines.push(`- Tech hints: ${raw.tech.length ? raw.tech.join(', ') : 'none detected'}`);
  lines.push(`- Elements analysed: ${raw.counts.elements} (svg ${raw.counts.svg}, img ${raw.counts.img}, video ${raw.counts.video}, canvas ${raw.counts.canvas})`);
  lines.push('');
  lines.push('> Numbers say *what* is used; the screenshots say *how it feels*. Read both before writing the style guide.');
  lines.push('');
  lines.push('## Color roles (heuristic)');
  lines.push(table(['role', 'value'], [
    ['background', swatch(c.background)],
    ['surfaces', c.surfaces.map((s) => `\`${s.hex}\` ${s.pct}%`).join(', ') || '—'],
    ['text', swatch(c.textPrimary)],
    ['text muted', swatch(c.textMuted)],
    ['paragraph text', swatch(c.textBody)],
    ['border', swatch(c.border)],
    ['accent', swatch(c.accent)],
    ['other accents', c.accents.slice(1).map((h) => `\`${h}\``).join(', ') || '—'],
    ['contrast text/bg', c.contrast.textOnBg],
    ['contrast muted/bg', c.contrast.mutedOnBg],
    ['contrast accent/bg', c.contrast.accentOnBg],
  ]));
  lines.push('');
  lines.push('### Raw palettes (share of painted area / text)');
  for (const [k, arr] of Object.entries(c.palettes)) lines.push(`- **${k}**: ${arr.filter((x) => x.pct >= 0.1).map((x) => `\`${x.hex}\` ${x.pct}%`).join(' · ') || '—'}`);
  if (c.gradients.length) {
    lines.push('');
    lines.push('### Gradients');
    lines.push(list(c.gradients, (g) => `\`${g}\``));
  }
  lines.push('');
  lines.push('## Typography');
  lines.push(`- Heading family: **${agg.type.headingFamily || '—'}** · Body family: **${agg.type.bodyFamily || '—'}** · Monospace in use: ${agg.type.monoUsed ? 'yes' : 'no'}`);
  lines.push(`- Families by text share: ${agg.type.families.map((f) => `${f.family} ${f.pct}%`).join(' · ')}`);
  lines.push(`- Size steps (px): ${agg.type.scaleSizes.join(' · ')}`);
  lines.push(`- Loaded font faces: ${raw.fonts.loaded.join(', ') || '—'}`);
  if (raw.fonts.links.length) lines.push(`- Font sources: ${raw.fonts.links.slice(0, 4).join(' , ')}`);
  lines.push('');
  lines.push(table(['tag', 'family', 'size', 'weight', 'line-height', 'tracking', 'transform', 'color', 'sample'],
    ['h1', 'h2', 'h3', 'h4', 'p', 'a', 'button', 'li', 'span', 'small', 'label'].filter((k) => agg.type.tags[k]).map((k) => {
      const s = agg.type.tags[k];
      return [k, s.family.split(',')[0].replace(/["']/g, ''), s.size, s.weight, s.lineHeight, s.letterSpacing, s.transform, s.color, s.sample];
    })));
  if (agg.type.uppercase.length) {
    lines.push('');
    lines.push(`- Uppercase styles (eyebrows/labels): ${agg.type.uppercase.map((u) => u.value).join(' ; ')}`);
  }
  lines.push('');
  lines.push('## Shape, depth & spacing');
  lines.push(`- Radii (by element count): ${agg.shape.radii.map((r) => `${r.value}×${r.count}`).join(' · ') || 'none'}`);
  lines.push(`- Border widths: ${agg.shape.borderWidths.map((b) => `${b.value}×${b.weight}`).join(' · ') || 'none'}`);
  lines.push(`- Spacing values (px × uses): ${agg.spacing.values.map((s) => `${s.px}×${s.count}`).join(' · ')}`);
  lines.push(`- Inferred base unit: ${agg.spacing.baseUnit ? agg.spacing.baseUnit + 'px' : 'irregular'}`);
  lines.push('- Box shadows:');
  lines.push(list(agg.shape.shadows, (s) => `\`${s.value}\` ×${s.count}`));
  if (agg.effects.backdrop.length) lines.push(`- Backdrop filters: ${agg.effects.backdrop.map((b) => b.value).join(' · ')}`);
  if (agg.effects.filters.length) lines.push(`- Filters: ${agg.effects.filters.map((b) => b.value).join(' · ')}`);
  if (agg.effects.blend.length) lines.push(`- Blend modes: ${agg.effects.blend.map((b) => b.value).join(' · ')}`);
  if (agg.shape.textShadows.length) lines.push(`- Text shadows: ${agg.shape.textShadows.map((b) => b.value).join(' · ')}`);
  lines.push('');
  lines.push('## Layout');
  lines.push(`- Max widths: ${agg.layout.maxWidths.map((m) => `${m.value}×${m.weight}`).join(' · ') || '—'}`);
  lines.push(`- Grids: ${agg.layout.grids.map((g) => `${g.value} ×${g.weight}`).join(' · ') || '—'}`);
  if (raw.header) lines.push(`- Header: ${raw.header.position} · ${raw.header.size} · bg ${raw.header.bg || 'transparent'}${raw.header.backdrop ? ' · backdrop ' + raw.header.backdrop : ''}${raw.header.border ? ' · border ' + raw.header.border : ''} · links: ${raw.header.navLinks.join(' / ')}`);
  if (raw.hero) {
    const h = raw.hero;
    lines.push(`- Hero: ${h.heightVsViewport}× viewport · ${h.display}${h.gridColumns ? ` (${h.gridColumns} cols)` : ''} · h1 ${h.h1.font} · align ${h.h1.align}${h.h1.transform !== 'none' ? ' · ' + h.h1.transform : ''}${h.h1.bgClipText ? ' · gradient text' : ''} · media: ${h.media.join(', ') || 'none'}${h.bgImage ? ' · bg-image ' + h.bgImage.slice(0, 80) : ''}`);
  }
  if (raw.footer) lines.push(`- Footer: ${raw.footer.size} · bg ${raw.footer.bg || 'transparent'} · ${raw.footer.linkColumns} link columns`);
  lines.push('');
  lines.push('### Section rhythm (top → bottom)');
  lines.push(table(['#', 'top', 'height', 'bg', 'padding (t/b)', 'cols', 'media', 'ctas', 'heading'],
    agg.layout.sections.map((s, i) => [i + 1, s.top, s.height, s.bgImage ? 'image/gradient' : s.bg || 'inherit', s.padding, s.columns, s.media, s.ctas, s.heading])));
  lines.push('');
  lines.push('## Components');
  const comp = raw.components;
  lines.push('### Buttons');
  lines.push(componentTable(comp.buttons));
  if (extra.hover && extra.hover.length) {
    lines.push('');
    lines.push('Hover changes:');
    lines.push(list(extra.hover, (hv) => `${hv.kind} #${hv.id}: ${Object.entries(hv.diff).map(([k, v]) => `${k}: \`${v[0]}\` → \`${v[1]}\``).join(' ; ') || 'no computed change'}`));
  }
  lines.push('');
  lines.push('### Cards');
  lines.push(componentTable(comp.cards));
  lines.push('');
  lines.push('### Pills / badges');
  lines.push(componentTable(comp.pills));
  lines.push('');
  lines.push('### Inputs');
  lines.push(componentTable(comp.inputs));
  lines.push('');
  lines.push('## Motion');
  lines.push('- Transitions:');
  lines.push(list(agg.motion.transitions, (x) => `\`${x.value}\` ×${x.weight}`));
  lines.push('- Running animations:');
  lines.push(list(agg.motion.animations, (x) => `\`${x.value}\` ×${x.weight}`));
  lines.push(`- @keyframes defined: ${agg.motion.keyframes.join(', ') || '—'}`);
  lines.push('');
  if (extra.mobile) {
    const m = extra.mobile;
    lines.push('## Mobile (390px)');
    lines.push(`- h1 ${m.h1} · h2 ${m.h2} · p ${m.p} · header ${m.headerHeight}px · menu toggle: ${m.navToggle ? 'yes' : 'no'} · visible header links: ${m.visibleHeaderLinks} · horizontal overflow: ${m.horizontalOverflow ? 'YES' : 'no'}`);
    lines.push('');
  }
  lines.push('## Design tokens found in CSS');
  const rootVars = Object.entries(raw.css.rootVars || {});
  lines.push(rootVars.length ? rootVars.slice(0, 80).map(([k, v]) => `- \`${k}: ${v}\``).join('\n') : '- none readable (see capture.json → css.vars / cssExternal)');
  if (extra.externalVars && Object.keys(extra.externalVars).length) {
    lines.push('');
    lines.push(`Custom properties from external stylesheets (first 60): ${Object.entries(extra.externalVars).slice(0, 60).map(([k, v]) => `\`${k}: ${v}\``).join(' · ')}`);
  }
  lines.push('');
  lines.push('## Copy samples (voice & tone reference — do not reuse verbatim)');
  lines.push(list(raw.copy.headings));
  if (raw.copy.eyebrows.length) lines.push(`- Eyebrows: ${raw.copy.eyebrows.join(' · ')}`);
  if (raw.copy.buttons.length) lines.push(`- Button labels: ${raw.copy.buttons.join(' · ')}`);
  lines.push(list(raw.copy.paragraphs, (p) => `“${p}”`));
  lines.push('');
  lines.push('## Screenshots');
  lines.push(list(extra.screenshots || [], (s) => `\`${s}\``));
  lines.push('');
  return lines.join('\n');
}

export function catalogMarkdown(items) {
  // items: [{ slug, raw, agg }]
  const n = items.length;
  const lines = [`# Catalog DNA — ${n} captures`, '', `Generated: ${new Date().toISOString()}`, ''];
  lines.push(table(['capture', 'theme', 'background', 'text', 'accent', 'heading font', 'body font', 'radius', 'base unit', 'shadows'],
    items.map(({ slug, agg }) => [slug, agg.theme, agg.colors.background, agg.colors.textPrimary, agg.colors.accent, agg.type.headingFamily, agg.type.bodyFamily, agg.shape.dominantRadius, agg.spacing.baseUnit, agg.shape.shadows.length])));
  lines.push('');
  const half = Math.max(2, Math.ceil(n / 2));
  // shared fonts
  const famCount = new Map();
  for (const { agg } of items) for (const f of new Set([agg.type.headingFamily, agg.type.bodyFamily, ...agg.type.families.filter((x) => x.pct >= 10).map((x) => x.family)].filter(Boolean))) famCount.set(f, (famCount.get(f) || 0) + 1);
  lines.push('## Shared across captures');
  lines.push(`- Fonts in ≥${half}/${n}: ${[...famCount.entries()].filter(([, k]) => k >= half).map(([f, k]) => `${f} (${k})`).join(', ') || 'none — each product has its own typography'}`);
  // shared colors by role
  const roleColors = [];
  for (const { slug, agg } of items) {
    const c = agg.colors;
    for (const [role, hex] of [['background', c.background], ['text', c.textPrimary], ['muted', c.textMuted], ['border', c.border], ...c.accents.map((h) => ['accent', h])]) if (hex) roleColors.push({ slug, role, hex });
  }
  const groups = [];
  for (const rc of roleColors) {
    const g = groups.find((x) => x.role === rc.role && deltaE(x.hex, rc.hex) < 8);
    if (g) g.items.push(rc);
    else groups.push({ hex: rc.hex, role: rc.role, items: [rc] });
  }
  const shared = groups.map((g) => ({ ...g, slugs: new Set(g.items.map((i) => i.slug)) })).filter((g) => g.slugs.size >= half).sort((a, b) => b.slugs.size - a.slugs.size);
  lines.push(`- Colors in ≥${half}/${n}: ${shared.map((g) => `\`${g.hex}\` as ${g.role} (${g.slugs.size})`).join(' · ') || 'none'}`);
  const themes = items.reduce((m, { agg }) => ((m[agg.theme] = (m[agg.theme] || 0) + 1), m), {});
  lines.push(`- Themes: ${Object.entries(themes).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
  const radCount = new Map();
  for (const { agg } of items) if (agg.shape.dominantRadius) radCount.set(agg.shape.dominantRadius, (radCount.get(agg.shape.dominantRadius) || 0) + 1);
  lines.push(`- Dominant radius: ${[...radCount.entries()].map(([r, k]) => `${r} (${k})`).join(' · ') || '—'}`);
  const techCount = new Map();
  for (const { raw } of items) for (const tch of raw.tech) techCount.set(tch.replace(/\s*\(.*\)$/, ''), (techCount.get(tch.replace(/\s*\(.*\)$/, '')) || 0) + 1);
  lines.push(`- Tech: ${[...techCount.entries()].map(([k, v]) => `${k} (${v})`).join(' · ') || '—'}`);
  lines.push('');
  lines.push('Use this table to decide what is catalog-wide DNA (goes in style-guide.md) vs. what is product-specific (goes in products/<slug>.md).');
  return lines.join('\n');
}
