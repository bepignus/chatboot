#!/usr/bin/env node
/**
 * compare_style.mjs — how close is a built UI to a reference capture?
 *
 *   node compare_style.mjs <reference> <candidate> [--json]
 *
 * <reference>/<candidate> = a capture folder (with capture.json) or the capture.json itself.
 * Capture your own build first:  node capture_style.mjs ./dist/index.html --out .captures --name my-build
 *
 * Prints a 0–100 fidelity score per dimension plus concrete, actionable deltas.
 * The score is a guide, not the goal: always look at the screenshots side by side too.
 */
import fs from 'node:fs';
import path from 'node:path';
import { deltaE, chroma } from './lib/color.mjs';

const load = (p) => {
  const file = fs.existsSync(p) && fs.statSync(p).isDirectory() ? path.join(p, 'capture.json') : p;
  if (!fs.existsSync(file)) throw new Error(`No capture.json at ${p}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};
const px = (v) => parseFloat(v) || 0;
const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
const normFam = (f) => String(f || '').toLowerCase().replace(/["']/g, '').replace(/\s+(variable|vf)$/i, '').trim();

function nearest(hex, palette) {
  let best = null;
  for (const c of palette) {
    const d = deltaE(hex, c.hex);
    if (!best || d < best.d) best = { hex: c.hex, d };
  }
  return best;
}

function compare(ref, cand) {
  const R = ref.aggregate;
  const C = cand.aggregate;
  const deltas = [];
  const scores = {};

  // Colors: roles + weighted palette coverage
  const roleScore = (name, a, b, tolerance = 30) => {
    if (!a) return null;
    if (!b) {
      deltas.push(`color · ${name}: reference uses \`${a}\`, candidate has none`);
      return 0;
    }
    const d = deltaE(a, b);
    if (d > 6) deltas.push(`color · ${name}: \`${b}\` → should be closer to \`${a}\` (ΔE ${d.toFixed(1)})`);
    return clamp(100 - (d / tolerance) * 100);
  };
  const roles = [
    roleScore('background', R.colors.background, C.colors.background, 25),
    roleScore('text', R.colors.textPrimary, C.colors.textPrimary, 30),
    roleScore('muted text', R.colors.textMuted, C.colors.textMuted, 35),
    roleScore('accent', R.colors.accent, C.colors.accent, 30),
    roleScore('border', R.colors.border, C.colors.border, 35),
  ].filter((v) => v !== null);
  const candPalette = [...C.colors.palettes.bg, ...C.colors.palettes.text, ...C.colors.palettes.border, ...C.colors.palettes.gradient];
  const refPalette = [...R.colors.palettes.bg, ...R.colors.palettes.text].filter((c) => c.pct >= 1);
  let wsum = 0;
  let wscore = 0;
  for (const c of refPalette) {
    const n = nearest(c.hex, candPalette);
    const s = n ? clamp(100 - (n.d / 30) * 100) : 0;
    wsum += c.pct;
    wscore += c.pct * s;
    if (c.pct >= 5 && (!n || n.d > 12)) deltas.push(`color · palette: \`${c.hex}\` covers ${c.pct}% of the reference; nearest in candidate ${n ? `\`${n.hex}\` (ΔE ${n.d.toFixed(1)})` : 'none'}`);
  }
  const coverage = wsum ? wscore / wsum : 100;
  scores.color = clamp(0.6 * (roles.reduce((a, b) => a + b, 0) / (roles.length || 1)) + 0.4 * coverage);
  if (R.theme !== C.theme) {
    deltas.unshift(`theme: reference is **${R.theme}**, candidate is **${C.theme}**`);
    scores.color = Math.min(scores.color, 30);
  }
  const refGrad = R.colors.gradients.length > 0;
  const candGrad = C.colors.gradients.length > 0;
  if (refGrad !== candGrad) deltas.push(`color · gradients: reference ${refGrad ? 'uses' : 'does not use'} gradients, candidate ${candGrad ? 'does' : "doesn't"}`);

  // Typography
  let t = 0;
  const hf = normFam(R.type.headingFamily) === normFam(C.type.headingFamily);
  const bf = normFam(R.type.bodyFamily) === normFam(C.type.bodyFamily);
  if (!hf) deltas.push(`type · heading font: \`${C.type.headingFamily}\` → \`${R.type.headingFamily}\``);
  if (!bf) deltas.push(`type · body font: \`${C.type.bodyFamily}\` → \`${R.type.bodyFamily}\``);
  t += (hf ? 35 : 0) + (bf ? 35 : 0);
  const sizeCmp = (tag, weight) => {
    const a = R.type.tags[tag];
    const b = C.type.tags[tag];
    if (!a || !b) return weight / 2;
    const ratio = px(b.size) / px(a.size);
    if (Math.abs(1 - ratio) > 0.12) deltas.push(`type · ${tag} size: ${b.size} → ~${a.size}`);
    if (Math.abs(px(a.weight) - px(b.weight)) >= 200) deltas.push(`type · ${tag} weight: ${b.weight} → ${a.weight}`);
    if (a.transform !== b.transform) deltas.push(`type · ${tag} text-transform: ${b.transform} → ${a.transform}`);
    if (Math.abs(px(a.letterSpacing) - px(b.letterSpacing)) > 0.5) deltas.push(`type · ${tag} letter-spacing: ${b.letterSpacing} → ${a.letterSpacing}`);
    return weight * Math.max(0, 1 - Math.abs(1 - ratio) * 2);
  };
  t += sizeCmp('h1', 15) + sizeCmp('h2', 8) + sizeCmp('p', 7);
  if (R.type.monoUsed && !C.type.monoUsed) deltas.push('type · the reference uses a monospace face somewhere (labels/code); candidate does not');
  scores.typography = clamp(t);

  // Shape & depth
  let s = 100;
  const rr = px(R.shape.dominantRadius);
  const cr = px(C.shape.dominantRadius);
  if (R.shape.dominantRadius || C.shape.dominantRadius) {
    const diff = Math.abs(rr - cr);
    if (diff > 2) deltas.push(`shape · dominant radius: ${C.shape.dominantRadius || '0'} → ${R.shape.dominantRadius || '0'}`);
    s -= Math.min(40, diff * 4);
  }
  const refPills = R.shape.radii.some((r) => r.value === 'full');
  const candPills = C.shape.radii.some((r) => r.value === 'full');
  if (refPills !== candPills) {
    deltas.push(`shape · pill/circle shapes: reference ${refPills ? 'uses' : 'avoids'} them`);
    s -= 15;
  }
  const rs = R.shape.shadows.length > 0;
  const cs = C.shape.shadows.length > 0;
  if (rs !== cs) {
    deltas.push(`depth · box-shadows: reference ${rs ? 'uses shadows (e.g. ' + R.shape.shadows[0].value + ')' : 'is flat (no shadows)'}`);
    s -= 25;
  }
  const rb = (R.effects.backdrop || []).length > 0;
  const cb = (C.effects.backdrop || []).length > 0;
  if (rb !== cb) {
    deltas.push(`depth · backdrop blur (glass): reference ${rb ? 'uses it (' + R.effects.backdrop[0].value + ')' : 'does not use it'}`);
    s -= 15;
  }
  scores.shape = clamp(s);

  // Spacing & layout
  let l = 100;
  if (R.spacing.baseUnit && R.spacing.baseUnit !== C.spacing.baseUnit) {
    deltas.push(`spacing · base unit: reference is a ${R.spacing.baseUnit}px grid, candidate is ${C.spacing.baseUnit ? C.spacing.baseUnit + 'px' : 'irregular'}`);
    l -= 20;
  }
  // The page container is the widest max-width in use (>= 900px), not the most frequent one.
  const container = (cap) => Math.max(0, ...cap.layout.maxWidths.map((m) => px(m.value)).filter((n) => n >= 900));
  const rmw = container(R);
  const cmw = container(C);
  if (rmw && cmw && Math.abs(rmw - cmw) / rmw > 0.1) {
    deltas.push(`layout · main container max-width: ${cmw}px → ~${rmw}px`);
    l -= 20;
  }
  const avgPad = (cap) => {
    const ss = cap.layout.sections || [];
    const v = ss.map((x) => px(String(x.padding).split('/')[0])).filter((n) => n > 0);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
  };
  const rp = avgPad(R);
  const cp = avgPad(C);
  if (rp && cp && Math.abs(rp - cp) / rp > 0.3) {
    deltas.push(`layout · section vertical padding: ~${Math.round(cp)}px → ~${Math.round(rp)}px`);
    l -= 20;
  }
  scores.layout = clamp(l);

  // Motion: judge presence and easing family, not how many transitions each page happens to have.
  const rm = R.motion.transitions.length + R.motion.animations.length;
  const cm = C.motion.transitions.length + C.motion.animations.length;
  const easings = (cap) => new Set(cap.motion.transitions.flatMap((t) => String(t.value).match(/cubic-bezier\([^)]*\)|ease-in-out|ease-out|ease-in|linear|ease/g) || []));
  const re = easings(R);
  const ce = easings(C);
  const sharedEase = [...re].some((e) => ce.has(e));
  if (rm === 0 && cm === 0) scores.motion = 100;
  else if (rm > 0 && cm === 0) scores.motion = 20;
  else if (rm === 0) scores.motion = 85;
  else scores.motion = sharedEase ? 100 : 75;
  if (rm > 0 && cm === 0) deltas.push('motion · reference has transitions/animations; candidate is static');
  if (rm > 0 && cm > 0 && !sharedEase && re.size) deltas.push(`motion · easing: reference uses ${[...re].slice(0, 2).join(' / ')}`);
  const refHover = (ref.hover || []).filter((h) => Object.keys(h.diff).length);
  const candHover = (cand.hover || []).filter((h) => Object.keys(h.diff).length);
  if (refHover.length && !candHover.length) deltas.push(`motion · buttons/cards change on hover in the reference (${Object.keys(refHover[0].diff).join(', ')}); candidate has no hover change`);

  const weights = { color: 0.35, typography: 0.25, shape: 0.15, layout: 0.15, motion: 0.1 };
  const overall = clamp(Object.entries(weights).reduce((a, [k, w]) => a + scores[k] * w, 0));
  return { overall, scores, deltas, reference: ref.target, candidate: cand.target, accentIsChromatic: R.colors.accent ? chroma(R.colors.accent) : null };
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const [a, b] = args.filter((x) => !x.startsWith('--'));
  if (!a || !b) {
    console.log('usage: node compare_style.mjs <reference-capture> <candidate-capture> [--json]');
    process.exit(1);
  }
  const res = compare(load(a), load(b));
  if (json) return console.log(JSON.stringify(res, null, 2));
  console.log(`# Style fidelity: ${res.overall}/100\n`);
  console.log(`reference: ${res.reference}\ncandidate: ${res.candidate}\n`);
  console.log('| dimension | score |\n| --- | --- |');
  for (const [k, v] of Object.entries(res.scores)) console.log(`| ${k} | ${v} |`);
  console.log(`\n## Deltas to fix (${res.deltas.length})`);
  console.log(res.deltas.length ? res.deltas.map((d) => `- ${d}`).join('\n') : '- none detected — now compare the screenshots visually');
}

main();
