// Color utilities shared by capture_style.mjs and compare_style.mjs.
// All colors are handled as lowercase "#rrggbb" strings.

export function hexToRgb(hex) {
  let h = String(hex).replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }) {
  const h = (v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function rgbToLab({ r, g, b }) {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  // sRGB -> XYZ (D65)
  const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

const labCache = new Map();
export function lab(hex) {
  if (!labCache.has(hex)) labCache.set(hex, rgbToLab(hexToRgb(hex)));
  return labCache.get(hex);
}

/** CIE76 distance in Lab space. ~2.3 = just noticeable, >10 = clearly different. */
export function deltaE(hexA, hexB) {
  const a = lab(hexA);
  const b = lab(hexB);
  return Math.sqrt((a.L - b.L) ** 2 + (a.a - b.a) ** 2 + (a.b - b.b) ** 2);
}

/** Lab chroma: < ~12 reads as a neutral (white / grey / black / near-neutral tint). */
export function chroma(hex) {
  const { a, b } = lab(hex);
  return Math.sqrt(a * a + b * b);
}

/** WCAG relative luminance (0..1). */
export function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/** WCAG contrast ratio (1..21). */
export function contrast(hexA, hexB) {
  const la = luminance(hexA);
  const lb = luminance(hexB);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export function toHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === R) h = (G - B) / d + (G < B ? 6 : 0);
    else if (max === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Merge perceptually similar colors. Input: [{hex, weight}], heaviest first wins as the
 * cluster representative. Output: [{hex, weight, members}] sorted by weight.
 */
export function clusterColors(entries, threshold = 6) {
  const sorted = [...entries].filter((e) => e && e.hex).sort((a, b) => b.weight - a.weight);
  const clusters = [];
  for (const e of sorted) {
    const hit = clusters.find((c) => deltaE(c.hex, e.hex) < threshold);
    if (hit) {
      hit.weight += e.weight;
      if (!hit.members.includes(e.hex)) hit.members.push(e.hex);
    } else {
      clusters.push({ hex: e.hex, weight: e.weight, members: [e.hex] });
    }
  }
  return clusters.sort((a, b) => b.weight - a.weight);
}

export function describeColor(hex) {
  const { h, s, l } = toHsl(hex);
  return `hsl(${h} ${s}% ${l}%)`;
}
