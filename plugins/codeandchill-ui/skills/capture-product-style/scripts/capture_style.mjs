#!/usr/bin/env node
/**
 * capture_style.mjs — capture the visual DNA of one or more UIs.
 *
 * Targets can be live URLs (product demos), local HTML files or local folders with an
 * index.html (e.g. the source of a template you bought). For apps that need a build step,
 * start their dev server and pass the http://localhost URL instead.
 *
 * Usage:
 *   node capture_style.mjs <target> [<target> ...] [--out DIR] [--name SLUG] [--wait MS]
 *                          [--no-mobile] [--no-components] [--max-segments N]
 *   node capture_style.mjs --discover <store-url> [--deep] [--limit N] [--out DIR]
 *
 * Output (per target): DIR/<slug>/
 *   summary.md            human/LLM-readable digest  ← read this first
 *   capture.json          raw tallies + aggregate (input for compare_style.mjs)
 *   desktop-fold.png, desktop-NN.png (1440px wide segments), mobile-fold.png, mobile-NN.png
 *   components/*.png      crops of buttons, cards, header, hero, footer...
 * With 2+ targets also DIR/catalog-summary.md (what the captures have in common).
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { extractInPage, extractMobile, discoverLinks } from './lib/inpage.mjs';
import { aggregate, summaryMarkdown, catalogMarkdown } from './lib/report.mjs';

const require = createRequire(import.meta.url);

function loadPlaywright() {
  for (const mod of ['playwright', 'playwright-core', '@playwright/test']) {
    try {
      return require(mod);
    } catch {
      /* try next */
    }
  }
  console.error('✖ Playwright not found. Install it with:\n    npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}

// ----------------------------------------------------------------------------- args
function parseArgs(argv) {
  const o = { targets: [], out: '.captures', wait: 1200, mobile: true, components: true, maxSegments: 8, discover: null, deep: false, limit: 24, name: null, ignore: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === '--out') o.out = next();
    else if (a === '--name') o.name = next();
    else if (a === '--wait') o.wait = Number(next());
    else if (a === '--no-mobile') o.mobile = false;
    else if (a === '--no-components') o.components = false;
    else if (a === '--max-segments') o.maxSegments = Number(next());
    else if (a === '--discover') o.discover = next();
    else if (a === '--deep') o.deep = true;
    else if (a === '--limit') o.limit = Number(next());
    else if (a === '--reaggregate') o.reaggregate = true;
    else if (a === '--ignore') o.ignore.push(next());
    else if (a === '--scroll-shots') o.scrollShots = true;
    else if (a === '-h' || a === '--help') o.help = true;
    else if (a.startsWith('--')) throw new Error(`Unknown flag ${a}`);
    else o.targets.push(a);
  }
  return o;
}

const HELP = `capture_style.mjs — extract palette, typography, spacing, components and motion from UIs

  node capture_style.mjs https://demo.example.com [more targets] --out .captures
  node capture_style.mjs ./my-template/            (folder with index.html)
  node capture_style.mjs <url> --ignore ".store-badge" (remove chrome injected by the demo host; repeatable)
  node capture_style.mjs <url> --scroll-shots      (viewport shots while scrolling: for scroll-driven landings)
  node capture_style.mjs --discover https://store.example.com --deep
  node capture_style.mjs --reaggregate .captures/<slug> [...]   (rebuild summary.md from capture.json)
`;

// ----------------------------------------------------------------------------- helpers
const MIME = { '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.webm': 'video/webm' };

function serveDir(root) {
  const base = path.resolve(root);
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent(new URL(req.url, 'http://local').pathname);
      let fp = path.resolve(base, '.' + rel);
      if (fp !== base && !fp.startsWith(base + path.sep)) {
        res.writeHead(403);
        return res.end();
      }
      if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
      if (!fs.existsSync(fp)) {
        res.writeHead(404);
        return res.end('not found');
      }
      res.writeHead(200, { 'content-type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
      fs.createReadStream(fp).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function resolveTarget(target) {
  if (/^https?:\/\//i.test(target)) return { url: target, label: target, close: async () => {} };
  if (!fs.existsSync(target)) throw new Error(`Target not found (not a URL nor a local path): ${target}`);
  const stat = fs.statSync(target);
  const dir = stat.isDirectory() ? target : path.dirname(target);
  const file = stat.isDirectory() ? '' : path.basename(target);
  const server = await serveDir(dir);
  const { port } = server.address();
  return { url: `http://127.0.0.1:${port}/${file}`, label: path.resolve(target).split(path.sep).slice(-2).join('-'), close: () => new Promise((r) => server.close(r)) };
}

const slugify = (s) =>
  String(s)
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'capture';

const NET_ERR = /ERR_(NAME_NOT_RESOLVED|TUNNEL_CONNECTION_FAILED|CONNECTION_REFUSED|CONNECTION_RESET|CONNECTION_CLOSED|ADDRESS_UNREACHABLE|INTERNET_DISCONNECTED|PROXY_CONNECTION_FAILED|CERT_[A-Z_]+|SSL_[A-Z_]+)/;

async function gotoSettled(page, url, wait) {
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  } catch (e) {
    const msg = String(e && e.message ? e.message : e);
    const net = msg.match(NET_ERR);
    if (net) {
      throw new Error(
        `cannot reach ${new URL(url).host} (${net[0]}). The host is unreachable from this environment ` +
          '(network policy, proxy, DNS or the site is down). Options: allow the domain in the network settings, ' +
          'run the capture on a machine that can reach it, or use local template source / screenshots instead.',
      );
    }
    if (!/timeout/i.test(msg)) throw e;
    console.warn(`  ! load timeout on ${url}, continuing with what rendered`);
  }
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.evaluate(() => (document.fonts ? document.fonts.ready : null)).catch(() => {});
  await page.waitForTimeout(wait);
}

// Removes elements that are not part of the product (e.g. a "Buy this template" pill the store
// injects into every demo) so they don't pollute palettes, fonts and screenshots.
async function removeIgnored(page, selectors) {
  if (!selectors || !selectors.length) return;
  await page.evaluate((sels) => {
    for (const sel of sels) {
      try {
        document.querySelectorAll(sel).forEach((el) => el.remove());
      } catch (e) {
        /* invalid selector: ignore */
      }
    }
  }, selectors);
}

async function autoScroll(page) {
  // Triggers lazy-loading and scroll-reveal animations, then returns to the top.
  await page.evaluate(async () => {
    const step = Math.max(300, Math.floor(window.innerHeight * 0.8));
    for (let i = 0; i < 60; i++) {
      const before = window.scrollY;
      window.scrollBy(0, step);
      await new Promise((r) => setTimeout(r, 120));
      if (window.scrollY === before) break;
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
}

async function segmentedScreenshots(page, dir, prefix, width, segHeight, maxSegments) {
  const files = [];
  await page.screenshot({ path: path.join(dir, `${prefix}-fold.png`) });
  files.push(`${prefix}-fold.png`);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const n = Math.min(maxSegments, Math.ceil(total / segHeight));
  for (let i = 0; i < n; i++) {
    const y = i * segHeight;
    const h = Math.min(segHeight, total - y);
    if (h < 50) break;
    const name = `${prefix}-${String(i + 1).padStart(2, '0')}.png`;
    await page.screenshot({ path: path.join(dir, name), fullPage: true, clip: { x: 0, y, width, height: h } });
    files.push(name);
  }
  if (total > n * segHeight) files.push(`(page truncated: ${total}px tall, captured first ${n * segHeight}px — raise --max-segments to see more)`);
  return files;
}

// Scroll-driven pages (reveal on enter, scrubbed video, pinned sections) render blank areas in a
// full-page screenshot. Viewport shots taken while scrolling show what a visitor actually sees.
async function scrollShots(page, dir, maxShots) {
  const files = [];
  const { total, vh } = await page.evaluate(() => ({ total: document.documentElement.scrollHeight, vh: window.innerHeight }));
  const steps = Math.min(maxShots, Math.max(1, Math.ceil(total / vh)));
  const stride = Math.max(vh, Math.floor((total - vh) / Math.max(1, steps - 1)));
  for (let i = 0; i < steps; i++) {
    const y = Math.min(i * stride, total - vh);
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(900);
    const name = `scroll-${String(i + 1).padStart(2, '0')}.png`;
    await page.screenshot({ path: path.join(dir, name) });
    files.push(name);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  return files;
}

async function hoverDiff(page, id, kind) {
  const loc = page.locator(`[data-cc-id="${id}"]`).first();
  const props = ['backgroundColor', 'color', 'borderTopColor', 'boxShadow', 'transform', 'scale', 'translate', 'opacity', 'filter', 'textDecorationLine', 'backgroundImage', 'outlineStyle'];
  const read = () => loc.evaluate((el, ps) => {
    const cs = getComputedStyle(el);
    return Object.fromEntries(ps.map((p) => [p, cs[p]]));
  }, props);
  try {
    const before = await read();
    await loc.hover({ timeout: 2500, force: true });
    await page.waitForTimeout(500);
    const after = await read();
    await page.mouse.move(1, 1);
    await page.waitForTimeout(200);
    const diff = {};
    for (const p of props) if (before[p] !== after[p]) diff[p] = [String(before[p]).slice(0, 90), String(after[p]).slice(0, 90)];
    return { kind, id, diff };
  } catch {
    return null;
  }
}

async function fetchExternalCss(ctx, hrefs) {
  const vars = {};
  const fontFaces = [];
  const keyframes = new Set();
  for (const href of hrefs.slice(0, 12)) {
    try {
      const res = await ctx.request.get(href, { timeout: 15000 });
      if (!res.ok()) continue;
      const css = (await res.text()).slice(0, 3_000_000);
      for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;}{]+)/g)) if (Object.keys(vars).length < 400 && !(m[1] in vars)) vars[m[1]] = m[2].trim().slice(0, 120);
      for (const m of css.matchAll(/@font-face\s*{([^}]*)}/g)) {
        const fam = (m[1].match(/font-family\s*:\s*([^;]+)/) || [])[1];
        const wt = (m[1].match(/font-weight\s*:\s*([^;]+)/) || [])[1];
        if (fam) fontFaces.push({ family: fam.replace(/["']/g, '').trim(), weight: (wt || '400').trim() });
      }
      for (const m of css.matchAll(/@keyframes\s+([\w-]+)/g)) keyframes.add(m[1]);
    } catch {
      /* unreachable stylesheet: skip */
    }
  }
  return { vars, fontFaces: fontFaces.slice(0, 60), keyframes: [...keyframes].slice(0, 60) };
}

// ----------------------------------------------------------------------------- capture
async function captureTarget(browser, target, opts) {
  const resolved = await resolveTarget(target);
  const slug = opts.name || slugify(resolved.label);
  const dir = path.join(opts.out, slug);
  fs.mkdirSync(path.join(dir, 'components'), { recursive: true });
  const capturedAt = new Date().toISOString();
  console.log(`→ ${target}\n  out: ${dir}`);

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  try {
    try {
      await gotoSettled(page, resolved.url, opts.wait);
    } catch (e) {
      fs.rmSync(dir, { recursive: true, force: true });
      throw e;
    }
    await removeIgnored(page, opts.ignore);
    await autoScroll(page);
    await removeIgnored(page, opts.ignore);
    const screenshots = await segmentedScreenshots(page, dir, 'desktop', 1440, 1800, opts.maxSegments);
    if (opts.scrollShots) screenshots.push(...(await scrollShots(page, dir, Math.max(opts.maxSegments, 10))));
    const raw = await page.evaluate(extractInPage, { maxEls: 6000 });

    let externalCss = { vars: {}, fontFaces: [], keyframes: [] };
    if (raw.css.blockedSheets.length) externalCss = await fetchExternalCss(ctx, raw.css.blockedSheets);
    raw.css.keyframes = [...new Set([...raw.css.keyframes, ...externalCss.keyframes])];
    raw.css.fontFaces = [...raw.css.fontFaces, ...externalCss.fontFaces];
    raw.cssExternal = externalCss;

    const hover = [];
    if (opts.components) {
      for (const b of raw.components.buttons.slice(0, 4)) {
        const d = await hoverDiff(page, b.id, 'button');
        if (d) hover.push(d);
      }
      for (const c of raw.components.cards.slice(0, 2)) {
        const d = await hoverDiff(page, c.id, 'card');
        if (d) hover.push(d);
      }
      const crops = [
        ...raw.components.buttons.slice(0, 4).map((c, i) => [`button-${i + 1}`, c.id]),
        ...raw.components.cards.slice(0, 3).map((c, i) => [`card-${i + 1}`, c.id]),
        ...raw.components.pills.slice(0, 2).map((c, i) => [`pill-${i + 1}`, c.id]),
        ...raw.components.inputs.slice(0, 2).map((c, i) => [`input-${i + 1}`, c.id]),
        raw.header && ['header', raw.header.id],
        raw.hero && ['hero', raw.hero.id],
        raw.footer && ['footer', raw.footer.id],
      ].filter(Boolean);
      for (const [name, id] of crops) {
        try {
          await page.locator(`[data-cc-id="${id}"]`).first().screenshot({ path: path.join(dir, 'components', `${name}.png`), timeout: 5000, animations: 'disabled' });
          screenshots.push(`components/${name}.png`);
        } catch {
          /* element not screenshot-able (detached, zero size...) */
        }
      }
    }

    let mobile = null;
    if (opts.mobile) {
      const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
      const mpage = await mctx.newPage();
      try {
        await gotoSettled(mpage, resolved.url, opts.wait);
        await removeIgnored(mpage, opts.ignore);
        await autoScroll(mpage);
        await removeIgnored(mpage, opts.ignore);
        screenshots.push(...(await segmentedScreenshots(mpage, dir, 'mobile', 390, 1600, Math.min(4, opts.maxSegments))));
        mobile = await mpage.evaluate(extractMobile);
      } catch (e) {
        console.warn(`  ! mobile capture failed: ${e.message}`);
      } finally {
        await mctx.close();
      }
    }

    const agg = aggregate(raw);
    const extra = { capturedAt, screenshots, hover, mobile, externalVars: externalCss.vars };
    fs.writeFileSync(path.join(dir, 'capture.json'), JSON.stringify({ target, capturedAt, raw, aggregate: agg, hover, mobile }, null, 2));
    fs.writeFileSync(path.join(dir, 'summary.md'), summaryMarkdown(raw, agg, extra));
    console.log(`  ✓ ${agg.theme} · bg ${agg.colors.background} · text ${agg.colors.textPrimary} · accent ${agg.colors.accent} · ${agg.type.headingFamily} / ${agg.type.bodyFamily}`);
    return { slug, raw, agg, dir };
  } finally {
    await ctx.close();
    await resolved.close();
  }
}

// ----------------------------------------------------------------------------- discover
async function discover(browser, storeTarget, opts) {
  const resolved = await resolveTarget(storeTarget);
  const storeUrl = resolved.url;
  const dir = path.join(opts.out, `discover-${slugify(resolved.label)}`);
  fs.mkdirSync(path.join(dir, 'images'), { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  console.log(`→ discovering ${storeUrl}`);
  try {
    await gotoSettled(page, storeUrl, opts.wait);
  } catch (e) {
    fs.rmSync(dir, { recursive: true, force: true });
    await ctx.close();
    await resolved.close();
    throw e;
  }
  await autoScroll(page);
  await page.screenshot({ path: path.join(dir, 'store-fold.png') });
  const home = await page.evaluate(discoverLinks);
  const products = [];
  const seen = new Set();
  for (const p of home.products) {
    if (seen.has(p.href)) continue;
    seen.add(p.href);
    products.push({ ...p, demos: [], images: [] });
  }
  if (opts.deep) {
    for (const p of products.slice(0, opts.limit)) {
      try {
        await gotoSettled(page, p.href, 600);
        const info = await page.evaluate(discoverLinks);
        p.title = info.title;
        p.h1 = info.h1;
        p.demos = info.demos;
        const slugName = new URL(p.href).pathname.split('/').filter(Boolean).pop();
        p.videos = info.videos.filter((v) => v.includes(slugName)).concat(info.videos).filter((v, i, a) => a.indexOf(v) === i).slice(0, 2);
        const slug = slugify(new URL(p.href).pathname);
        for (const [i, src] of info.images.slice(0, 3).entries()) {
          try {
            const res = await ctx.request.get(src, { timeout: 15000 });
            if (!res.ok()) continue;
            const ext = ((res.headers()['content-type'] || '').match(/image\/(png|jpeg|webp|gif|avif)/) || [])[1] || 'png';
            const file = `images/${slug}-${i + 1}.${ext === 'jpeg' ? 'jpg' : ext}`;
            fs.writeFileSync(path.join(dir, file), await res.body());
            p.images.push(file);
          } catch {
            /* skip image */
          }
        }
        console.log(`  · ${p.h1 || p.label} — ${p.demos.length} demo link(s), ${p.images.length} image(s)`);
      } catch (e) {
        console.warn(`  ! ${p.href}: ${e.message}`);
      }
    }
  }
  const result = { store: storeUrl, title: home.title, discoveredAt: new Date().toISOString(), products, demosOnHome: home.demos };
  fs.writeFileSync(path.join(dir, 'discovery.json'), JSON.stringify(result, null, 2));
  const md = [
    `# Discovery — ${home.title || storeUrl}`,
    '',
    `${products.length} product link(s), ${home.demos.length} demo link(s) on the home page. Screenshot: store-fold.png`,
    '',
    '| # | product | price | demo links | videos | images |',
    '| --- | --- | --- | --- | --- | --- |',
    ...products.map((p, i) => `| ${i + 1} | [${(p.h1 || p.label || p.href).replace(/\|/g, '/')}](${p.href}) | ${p.price || '—'} | ${p.demos.map((d) => `[${d.label || 'demo'}](${d.href})`).join(' ') || (opts.deep ? 'none found' : 'run with --deep')} | ${(p.videos || []).map((v) => `[video](${v})`).join(' ') || '—'} | ${p.images.join(' ') || '—'} |`),
    '',
    home.demos.length ? `Demo links on home: ${home.demos.map((d) => `[${d.label || 'demo'}](${d.href})`).join(' · ')}` : '',
    '',
    'Next: capture the demo URLs (preferred). Products without a live demo: run extract_frames.mjs on their video, or analyse their images.',
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'discovery.md'), md);
  console.log(`  ✓ ${path.join(dir, 'discovery.md')}`);
  await ctx.close();
  await resolved.close();
}

// ----------------------------------------------------------------------------- main
// Rebuilds aggregate + summary.md from an existing capture.json (after improving heuristics).
function reaggregate(dir) {
  const file = path.join(dir, 'capture.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const agg = aggregate(data.raw);
  const pngs = (d) => (fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith('.png')).sort() : []);
  const screenshots = [...pngs(dir), ...pngs(path.join(dir, 'components')).map((f) => `components/${f}`)];
  const extra = { capturedAt: data.capturedAt, screenshots, hover: data.hover, mobile: data.mobile, externalVars: (data.raw.cssExternal || {}).vars };
  fs.writeFileSync(file, JSON.stringify({ ...data, aggregate: agg }, null, 2));
  fs.writeFileSync(path.join(dir, 'summary.md'), summaryMarkdown(data.raw, agg, extra));
  console.log(`  ✓ ${dir} · ${agg.theme} · card radius ${agg.shape.cardRadius} · base ${agg.spacing.baseUnit || 'irregular'} (4px ${agg.spacing.grid4}%)`);
  return { slug: path.basename(dir), raw: data.raw, agg };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.reaggregate) {
    const results = opts.targets.filter((t) => fs.existsSync(path.join(t, "capture.json"))).map(reaggregate);
    if (results.length > 1) fs.writeFileSync(path.join(opts.out, 'catalog-summary.md'), catalogMarkdown(results));
    return;
  }
  if (opts.help || (!opts.discover && !opts.targets.length)) {
    console.log(HELP);
    process.exit(opts.help ? 0 : 1);
  }
  if (opts.name && opts.targets.length > 1) throw new Error('--name only works with a single target');
  const { chromium } = loadPlaywright();
  const launchOpts = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
  const browser = await chromium.launch(launchOpts);
  try {
    if (opts.discover) return await discover(browser, opts.discover, opts);
    const results = [];
    for (const t of opts.targets) {
      try {
        results.push(await captureTarget(browser, t, opts));
      } catch (e) {
        console.error(`  ✖ ${t}: ${e.message}`);
      }
    }
    if (results.length > 1) {
      const file = path.join(opts.out, 'catalog-summary.md');
      fs.writeFileSync(file, catalogMarkdown(results));
      console.log(`✓ catalog summary: ${file}`);
    }
    if (!results.length) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(`✖ ${e.message}`);
  process.exit(1);
});
