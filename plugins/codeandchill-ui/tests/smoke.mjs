#!/usr/bin/env node
// Smoke test for the capture/compare/discover scripts, using neutral local fixtures.
//   node plugins/codeandchill-ui/tests/smoke.mjs
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const scripts = path.join(here, '..', 'skills', 'capture-product-style', 'scripts');
const fx = path.join(here, 'fixture');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-smoke-'));
let failures = 0;

const run = (script, args) => {
  const r = spawnSync(process.execPath, [path.join(scripts, script), ...args], { encoding: 'utf8', timeout: 300000 });
  if (r.status !== 0) throw new Error(`${script} exited ${r.status}\n${r.stdout}\n${r.stderr}`);
  return r.stdout;
};
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '✓' : '✖'} ${name}${ok ? '' : `  ${detail}`}`);
  if (!ok) failures++;
};

try {
  run('capture_style.mjs', [path.join(fx, 'reference.html'), path.join(fx, 'variant.html'), '--out', out]);
  const refDir = path.join(out, 'fixture-reference-html');
  const varDir = path.join(out, 'fixture-variant-html');
  for (const f of ['summary.md', 'capture.json', 'desktop-fold.png', 'mobile-fold.png', 'components/button-1.png', 'components/card-1.png']) {
    check(`reference produces ${f}`, fs.existsSync(path.join(refDir, f)));
  }
  check('catalog-summary.md produced for 2 targets', fs.existsSync(path.join(out, 'catalog-summary.md')));

  const ref = JSON.parse(fs.readFileSync(path.join(refDir, 'capture.json'), 'utf8')).aggregate;
  const vari = JSON.parse(fs.readFileSync(path.join(varDir, 'capture.json'), 'utf8')).aggregate;
  check('reference theme is dark', ref.theme === 'dark', ref.theme);
  check('reference background is the page bg (#0b0d12)', ref.colors.background === '#0b0d12', ref.colors.background);
  check('reference primary text is the heading color (#e8eaf0)', ref.colors.textPrimary === '#e8eaf0', ref.colors.textPrimary);
  check('reference muted text is #8b93a7', ref.colors.textMuted === '#8b93a7', ref.colors.textMuted);
  check('reference accent is the violet (~#7c5cff)', /^#7[bc]5[bc]ff$/.test(ref.colors.accent || ''), ref.colors.accent);
  check('reference heading font is Space Grotesk', ref.type.headingFamily === 'Space Grotesk', ref.type.headingFamily);
  check('reference detects monospace usage', ref.type.monoUsed === true);
  check('reference dominant radius 14px', ref.shape.dominantRadius === '14px', ref.shape.dominantRadius);
  check('reference detects backdrop blur', ref.effects.backdrop.length > 0);
  check('reference detects float keyframes', ref.motion.keyframes.includes('float'));
  check('variant theme is light with bg #faf7f2', vari.theme === 'light' && vari.colors.background === '#faf7f2', `${vari.theme} ${vari.colors.background}`);

  run('capture_style.mjs', [path.join(fx, 'reference.html'), '--out', out, '--name', 'self', '--no-mobile']);
  const self = JSON.parse(run('compare_style.mjs', [refDir, path.join(out, 'self'), '--json']));
  check('compare: reference vs itself scores >= 95', self.overall >= 95, self.overall);
  const diff = JSON.parse(run('compare_style.mjs', [refDir, varDir, '--json']));
  check('compare: reference vs variant scores < 60', diff.overall < 60, diff.overall);
  check('compare: reports theme mismatch', diff.deltas.some((d) => d.startsWith('theme')));

  run('capture_style.mjs', ['--discover', path.join(fx, 'store'), '--deep', '--out', out]);
  const disc = JSON.parse(fs.readFileSync(path.join(out, 'discover-fixture-store', 'discovery.json'), 'utf8'));
  check('discover: finds 2 products', disc.products.length === 2, disc.products.length);
  check('discover: finds demo links (EN + ES labels)', disc.products.every((p) => p.demos.length === 1), JSON.stringify(disc.products.map((p) => p.demos)));
  check('discover: reads prices', disc.products.every((p) => /\$\d+/.test(p.price || '')), JSON.stringify(disc.products.map((p) => p.price)));
} catch (e) {
  console.error(e.message);
  failures++;
} finally {
  fs.rmSync(out, { recursive: true, force: true });
}

console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
