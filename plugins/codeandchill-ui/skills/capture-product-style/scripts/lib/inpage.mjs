// Functions in this file are serialized and executed INSIDE the browser page by Playwright.
// They must be self-contained: no references to anything outside their own body.

/**
 * Walks the rendered DOM and tallies the visual decisions of the page: colors (weighted by
 * painted area / text length), typography, radii, shadows, spacing, layout, motion, plus
 * component candidates (buttons, inputs, cards, pills), header/hero/footer and section rhythm.
 * Elements worth screenshotting get a `data-cc-id` attribute.
 */
export function extractInPage({ maxEls = 6000 } = {}) {
  const docW = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const cache = new Map();
  const hex2 = (n) => n.toString(16).padStart(2, '0');
  // Normalizes ANY css color (rgb, oklch, color(), hsl...) to sRGB hex by painting one pixel.
  function color(c) {
    if (!c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)' || c === 'none') return null;
    if (cache.has(c)) return cache.get(c);
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000';
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    const out = d[3] === 0 ? null : { hex: '#' + hex2(d[0]) + hex2(d[1]) + hex2(d[2]), a: Math.round((d[3] / 255) * 100) / 100 };
    cache.set(c, out);
    return out;
  }
  const px = (v) => parseFloat(v) || 0;
  const anyPositive = (v) => String(v || '').split(',').some((d) => parseFloat(d) > 0);
  const primaryFamily = (ff) => (ff || '').split(',')[0].trim().replace(/^["']|["']$/g, '');
  const clean = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);
  const tally = () => new Map();
  const add = (m, k, w = 1) => {
    if (k === null || k === undefined || k === '') return;
    m.set(k, (m.get(k) || 0) + w);
  };
  const top = (m, n = 40) =>
    [...m.entries()]
      .filter(([, w]) => w > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([value, weight]) => ({ value, weight: Math.round(weight * 100) / 100 }));
  const directText = (el) => {
    let s = '';
    for (const n of el.childNodes) if (n.nodeType === 3) s += n.textContent;
    return s.replace(/\s+/g, ' ').trim();
  };
  let idSeq = 0;
  const mark = (el) => {
    if (!el.dataset.ccId) el.dataset.ccId = String(++idSeq);
    return el.dataset.ccId;
  };

  const T = {
    bg: tally(), text: tally(), border: tally(), gradient: tally(), gradientColor: tally(),
    family: tally(), typeStyle: tally(), uppercase: tally(), radius: tally(), shadow: tally(),
    textShadow: tally(), padding: tally(), gap: tally(), maxWidth: tally(), grid: tally(),
    transition: tally(), animation: tally(), backdrop: tally(), filter: tally(), blend: tally(),
    borderWidth: tally(),
  };
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'META', 'LINK', 'TITLE', 'BR', 'WBR', 'HEAD']);
  const MEDIA = new Set(['img', 'video', 'canvas', 'picture', 'iframe']);
  const tagStyles = {};
  const counts = { elements: 0, svg: 0, img: 0, video: 0, canvas: 0, iframe: 0 };
  const fixed = [];
  const eyebrows = [];
  const cands = { button: [], input: [], card: [], pill: [] };

  // Painted-area model: an opaque background "owns" its box until a descendant paints over it,
  // so each opaque child subtracts its area from the nearest opaque ancestor.
  const opaqueBg = new Map();
  const docArea = docW * document.documentElement.scrollHeight;
  for (const rootEl of [document.documentElement, document.body]) {
    if (!rootEl) continue;
    const c = color(getComputedStyle(rootEl).backgroundColor);
    if (c) {
      add(T.bg, c.hex, docArea * c.a);
      if (c.a >= 0.95) opaqueBg.set(rootEl, c.hex);
    }
  }
  if (!opaqueBg.size) {
    add(T.bg, '#ffffff', docArea); // default canvas
    opaqueBg.set(document.documentElement, '#ffffff');
  }
  const all = document.body ? document.body.getElementsByTagName('*') : [];
  for (const el of all) {
    if (counts.elements >= maxEls) break;
    if (SKIP.has(el.tagName)) continue;
    const tag = el.tagName.toLowerCase();
    if (tag !== 'svg' && el.closest('svg')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || px(cs.opacity) < 0.05) continue;
    counts.elements++;
    if (tag in counts) counts[tag]++;

    const w = Math.min(r.width, docW);
    const h = Math.min(r.height, 4000);
    const area = w * h;
    const bg = color(cs.backgroundColor);
    if (bg) {
      add(T.bg, bg.hex, area * bg.a);
      if (bg.a >= 0.95) {
        let p = el.parentElement;
        while (p && !opaqueBg.has(p)) p = p.parentElement;
        if (p) add(T.bg, opaqueBg.get(p), -area);
        opaqueBg.set(el, bg.hex);
      }
    }
    const bgi = cs.backgroundImage && cs.backgroundImage !== 'none' ? cs.backgroundImage : null;
    if (bgi && bgi.includes('gradient')) {
      add(T.gradient, bgi.slice(0, 240), area);
      const found = bgi.match(/(rgba?\([^)]*\)|#[0-9a-f]{3,8}\b|oklch\([^)]*\)|oklab\([^)]*\)|hsla?\([^)]*\)|color\([^)]*\))/gi) || [];
      for (const c of found) {
        const cc = color(c);
        if (cc) add(T.gradientColor, cc.hex, area / found.length);
      }
    }
    const bTop = px(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none';
    const hasShadow = cs.boxShadow && cs.boxShadow !== 'none';
    const hasBox = !!bg || !!bgi || hasShadow || bTop || MEDIA.has(tag) || ['input', 'button', 'textarea', 'select'].includes(tag);

    const txt = directText(el);
    if (txt.length) {
      const c = color(cs.color);
      if (c) add(T.text, c.hex, txt.length * c.a);
      const fam = primaryFamily(cs.fontFamily);
      add(T.family, fam, txt.length);
      add(T.typeStyle, [cs.fontSize, cs.fontWeight, cs.lineHeight, cs.letterSpacing, cs.textTransform, fam].join('|'), txt.length);
      if (!tagStyles[tag]) {
        tagStyles[tag] = {
          family: cs.fontFamily, size: cs.fontSize, weight: cs.fontWeight, lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing, transform: cs.textTransform, color: c && c.hex, sample: clean(txt, 60), count: 0,
        };
      }
      tagStyles[tag].count++;
      const upper = cs.textTransform === 'uppercase' || (txt.length > 2 && txt === txt.toUpperCase() && /[A-Z]/.test(txt));
      if (upper) {
        add(T.uppercase, `${cs.fontSize} · ${cs.fontWeight} · tracking ${cs.letterSpacing} · ${fam}`, txt.length);
        if (px(cs.fontSize) <= 15 && txt.length <= 40 && eyebrows.length < 10) eyebrows.push(clean(txt, 40));
      }
      if (cs.textShadow && cs.textShadow !== 'none') add(T.textShadow, cs.textShadow.slice(0, 120));
    }

    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      const bw = px(cs[`border${side}Width`]);
      if (bw > 0 && cs[`border${side}Style`] !== 'none') {
        const bc = color(cs[`border${side}Color`]);
        if (bc) add(T.border, bc.hex, (side === 'Top' || side === 'Bottom' ? w : h) * bc.a);
        add(T.borderWidth, `${bw}px ${cs[`border${side}Style`]}`);
      }
    }

    let radiusPx = 0;
    if (hasBox) {
      const rs = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius];
      radiusPx = Math.max(...rs.map(px));
      if (radiusPx > 0) {
        const half = Math.min(r.width, r.height) / 2;
        const norm = rs.map((v) => (v.includes('%') ? v : px(v) >= half - 0.5 && px(v) > 0 ? 'full' : v.split(' ')[0]));
        add(T.radius, norm.every((v) => v === norm[0]) ? norm[0] : norm.join(' '));
      }
    }
    if (hasShadow) add(T.shadow, cs.boxShadow.slice(0, 200));
    for (const p of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) {
      const v = Math.round(px(cs[p]));
      if (v > 0) add(T.padding, v);
    }
    if (cs.display.includes('flex') || cs.display.includes('grid')) {
      const rg = Math.round(px(cs.rowGap));
      const cg = Math.round(px(cs.columnGap));
      if (rg > 0) add(T.gap, rg);
      if (cg > 0 && cg !== rg) add(T.gap, cg);
    }
    if (cs.maxWidth.endsWith('px') && px(cs.maxWidth) >= 320) add(T.maxWidth, cs.maxWidth);
    if (cs.display.includes('grid') && cs.gridTemplateColumns !== 'none') {
      const cols = cs.gridTemplateColumns.split(/\s+/).filter((t) => /px$/.test(t)).length;
      if (cols > 1) add(T.grid, `${cols} col${cols > 1 ? 's' : ''} · gap ${cs.columnGap}`);
    }
    if (anyPositive(cs.transitionDuration)) add(T.transition, clean(`${cs.transitionProperty} ${cs.transitionDuration} ${cs.transitionTimingFunction}`, 160));
    if (cs.animationName && cs.animationName !== 'none') add(T.animation, clean(`${cs.animationName} ${cs.animationDuration} ${cs.animationTimingFunction} ×${cs.animationIterationCount}`, 160));
    const bf = cs.backdropFilter || cs.webkitBackdropFilter;
    if (bf && bf !== 'none') add(T.backdrop, bf, area);
    if (cs.filter && cs.filter !== 'none') add(T.filter, cs.filter.slice(0, 100));
    if (cs.mixBlendMode && cs.mixBlendMode !== 'normal') add(T.blend, cs.mixBlendMode);
    if ((cs.position === 'fixed' || cs.position === 'sticky') && fixed.length < 10) {
      fixed.push({ id: mark(el), tag, position: cs.position, top: cs.top, width: Math.round(r.width), height: Math.round(r.height), bg: bg && bg.hex, bgAlpha: bg && bg.a, backdrop: bf && bf !== 'none' ? bf : null });
    }

    // ---- component candidates (cheap checks first; innerText only when needed)
    const isButtonTag = tag === 'button' || el.getAttribute('role') === 'button' || (tag === 'input' && /^(submit|button)$/i.test(el.type));
    if (r.height >= 24 && r.height <= 90 && r.width <= 480) {
      const linkButton = tag === 'a' && (bg || bgi || bTop) && px(cs.paddingLeft) >= 8;
      if ((isButtonTag || linkButton) && clean(el.innerText || el.value, 60).length <= 40) cands.button.push(el);
    }
    if (['input', 'textarea', 'select'].includes(tag) && el.type !== 'hidden' && !isButtonTag) cands.input.push(el);
    if (!isButtonTag && tag !== 'a' && r.height >= 16 && r.height <= 40 && r.width <= 260 && (bg || bTop) && radiusPx >= r.height / 2 - 1) {
      const t = clean(el.innerText, 40);
      if (t.length >= 1 && t.length <= 30) cands.pill.push(el);
    }
    if (r.width >= 160 && r.width <= 760 && r.height >= 120 && r.height <= 1100 && (radiusPx > 0 || hasShadow || bTop)) {
      let distinct = hasShadow || bTop;
      if (!distinct && bg && el.parentElement) {
        const pbg = color(getComputedStyle(el.parentElement).backgroundColor);
        distinct = !pbg || pbg.hex !== bg.hex;
      }
      if (distinct && el.querySelector('img,picture,svg,video,canvas,h2,h3,h4,h5,p')) cands.card.push(el);
    }
  }

  // ---- component snapshots
  const snap = (el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const bg = color(cs.backgroundColor);
    const c = color(cs.color);
    const bc = color(cs.borderTopColor);
    const bf = cs.backdropFilter || cs.webkitBackdropFilter;
    return {
      id: mark(el),
      tag: el.tagName.toLowerCase(),
      text: clean(el.innerText || el.value || el.placeholder, 60),
      size: `${Math.round(r.width)}×${Math.round(r.height)}`,
      bg: bg ? (bg.a < 1 ? `${bg.hex} @${bg.a}` : bg.hex) : null,
      bgImage: cs.backgroundImage !== 'none' ? cs.backgroundImage.slice(0, 200) : null,
      color: c && c.hex,
      border: px(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none' ? `${cs.borderTopWidth} ${cs.borderTopStyle} ${bc ? bc.hex + (bc.a < 1 ? ' @' + bc.a : '') : ''}` : null,
      radius: cs.borderRadius,
      padding: cs.padding,
      font: `${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${primaryFamily(cs.fontFamily)}`,
      letterSpacing: cs.letterSpacing !== 'normal' ? cs.letterSpacing : null,
      textTransform: cs.textTransform !== 'none' ? cs.textTransform : null,
      shadow: cs.boxShadow !== 'none' ? cs.boxShadow.slice(0, 160) : null,
      backdrop: bf && bf !== 'none' ? bf : null,
      transition: anyPositive(cs.transitionDuration) ? clean(`${cs.transitionProperty} ${cs.transitionDuration} ${cs.transitionTimingFunction}`, 120) : null,
    };
  };
  const signature = (s) => [s.bg, s.bgImage && s.bgImage.slice(0, 50), s.color, s.border, s.radius, s.font, s.shadow ? 'sh' : '', s.backdrop ? 'bd' : ''].join('|');
  const dedupe = (els, limit) => {
    const groups = new Map();
    for (const el of els.slice(0, 400)) {
      const s = snap(el);
      const k = signature(s);
      if (!groups.has(k)) groups.set(k, { ...s, count: 0 });
      groups.get(k).count++;
    }
    return [...groups.values()].sort((a, b) => b.count - a.count).slice(0, limit);
  };
  const components = {
    buttons: dedupe(cands.button, 8),
    inputs: dedupe(cands.input, 4),
    pills: dedupe(cands.pill, 6),
    cards: dedupe(cands.card, 6),
  };

  // ---- header / hero / footer
  const header = document.querySelector('header') || (fixed[0] && document.querySelector(`[data-cc-id="${fixed[0].id}"]`));
  let headerInfo = null;
  if (header) {
    const links = [...header.querySelectorAll('a')].filter((a) => a.getBoundingClientRect().width > 0);
    const cs = getComputedStyle(header);
    headerInfo = {
      ...snap(header),
      position: cs.position,
      navLinks: links.map((a) => clean(a.innerText, 30)).filter(Boolean).slice(0, 12),
      navLinkStyle: links[0] ? snap(links[0]) : null,
    };
  }
  let heroInfo = null;
  const h1 = document.querySelector('h1');
  if (h1) {
    let hero = h1;
    while (hero.parentElement && hero.parentElement !== document.body) {
      const rr = hero.getBoundingClientRect();
      if (rr.height >= vh * 0.5 && rr.width >= docW * 0.8) break;
      hero = hero.parentElement;
    }
    const cs = getComputedStyle(hero);
    const h1cs = getComputedStyle(h1);
    const rr = hero.getBoundingClientRect();
    const bigMedia = [...hero.querySelectorAll('img,video,canvas,svg,picture,iframe')].filter((m) => {
      const mr = m.getBoundingClientRect();
      return mr.width >= 200 && mr.height >= 150;
    });
    heroInfo = {
      id: mark(hero),
      heightVsViewport: Math.round((rr.height / vh) * 100) / 100,
      bg: (color(cs.backgroundColor) || {}).hex || null,
      bgImage: cs.backgroundImage !== 'none' ? cs.backgroundImage.slice(0, 200) : null,
      display: cs.display,
      gridColumns: cs.gridTemplateColumns !== 'none' ? cs.gridTemplateColumns.split(/\s+/).filter((t) => /px$/.test(t)).length : null,
      h1: { text: clean(h1.innerText, 100), font: `${h1cs.fontWeight} ${h1cs.fontSize}/${h1cs.lineHeight} ${primaryFamily(h1cs.fontFamily)}`, letterSpacing: h1cs.letterSpacing, align: h1cs.textAlign, transform: h1cs.textTransform, color: (color(h1cs.color) || {}).hex, bgClipText: h1cs.webkitBackgroundClip === 'text' || h1cs.backgroundClip === 'text' || !!h1.querySelector('[style*="background-clip"], .bg-clip-text') },
      media: bigMedia.slice(0, 4).map((m) => `${m.tagName.toLowerCase()} ${Math.round(m.getBoundingClientRect().width)}×${Math.round(m.getBoundingClientRect().height)}`),
      ctas: [...hero.querySelectorAll('a,button')].map((b) => clean(b.innerText, 30)).filter(Boolean).slice(0, 4),
    };
  }
  const footer = document.querySelector('footer');
  let footerInfo = null;
  if (footer) {
    const cols = [...footer.querySelectorAll('*')].filter((n) => n.children.length >= 2 && n.querySelectorAll(':scope > a, :scope > li > a, :scope > ul > li > a').length >= 2);
    footerInfo = { ...snap(footer), linkColumns: cols.length };
  }

  // ---- sections (vertical rhythm)
  let root = document.querySelector('main') || document.body;
  for (let i = 0; i < 6; i++) {
    const kids = [...root.children].filter((k) => k.getBoundingClientRect().height > 40);
    if (kids.length === 1) root = kids[0];
    else break;
  }
  const sections = [...root.children]
    .map((k) => ({ k, r: k.getBoundingClientRect() }))
    .filter((o) => o.r.height >= 100)
    .slice(0, 30)
    .map(({ k, r }) => {
      const cs = getComputedStyle(k);
      const hd = k.querySelector('h1,h2,h3');
      let maxCols = 0;
      for (const d of [...k.querySelectorAll('*')].slice(0, 500)) {
        const dcs = getComputedStyle(d);
        if (dcs.display.includes('grid')) maxCols = Math.max(maxCols, dcs.gridTemplateColumns.split(/\s+/).filter((t) => /px$/.test(t)).length);
        else if (dcs.display.includes('flex') && dcs.flexDirection.startsWith('row')) maxCols = Math.max(maxCols, [...d.children].filter((c) => c.getBoundingClientRect().width > 120).length);
      }
      return {
        tag: k.tagName.toLowerCase(),
        id: k.id || null,
        cls: clean(typeof k.className === 'string' ? k.className : '', 70) || null,
        top: Math.round(r.top + window.scrollY),
        height: Math.round(r.height),
        bg: (color(cs.backgroundColor) || {}).hex || null,
        bgImage: cs.backgroundImage !== 'none' ? cs.backgroundImage.slice(0, 80) : null,
        padding: `${cs.paddingTop} / ${cs.paddingBottom}`,
        heading: hd ? clean(hd.innerText, 80) : null,
        columns: maxCols || null,
        media: k.querySelectorAll('img,video,canvas,picture').length,
        ctas: k.querySelectorAll('a,button').length,
      };
    });

  // ---- copy samples (for voice/tone reference only, never to be copied verbatim)
  const copy = {
    headings: [...document.querySelectorAll('h1,h2,h3')].slice(0, 14).map((hh) => `${hh.tagName.toLowerCase()}: ${clean(hh.innerText, 90)}`).filter((s) => s.length > 4),
    paragraphs: [...document.querySelectorAll('p')].map((p) => clean(p.innerText, 180)).filter((s) => s.length > 40).slice(0, 5),
    eyebrows: [...new Set(eyebrows)],
    buttons: [...new Set(components.buttons.map((b) => b.text).filter(Boolean))].slice(0, 10),
  };

  // ---- stylesheet-level info: custom properties, keyframes, @font-face
  const vars = {};
  let varCount = 0;
  const keyframes = new Set();
  const fontFaces = [];
  const blockedSheets = [];
  const walk = (rules) => {
    for (const rule of rules) {
      if (rule.type === 1) {
        const sel = rule.selectorText || '';
        if (/(^|,)\s*(:root|html|body|:host|\[data-theme|\[data-mode|\.dark|\.light)/.test(sel)) {
          for (const p of rule.style) {
            if (p.startsWith('--') && varCount < 600) {
              const key = sel.slice(0, 50);
              (vars[key] = vars[key] || {})[p] = rule.style.getPropertyValue(p).trim().slice(0, 160);
              varCount++;
            }
          }
        }
      } else if (rule.type === 7) keyframes.add(rule.name);
      else if (rule.type === 5) {
        fontFaces.push({ family: rule.style.getPropertyValue('font-family').replace(/["']/g, '').trim(), weight: rule.style.getPropertyValue('font-weight') || '400', style: rule.style.getPropertyValue('font-style') || 'normal' });
      }
      if (rule.cssRules && rule.cssRules.length) walk(rule.cssRules);
    }
  };
  for (const sh of document.styleSheets) {
    try {
      walk(sh.cssRules);
    } catch (e) {
      if (sh.href) blockedSheets.push(sh.href);
    }
  }
  const rootCs = getComputedStyle(document.documentElement);
  const rootVars = {};
  for (const [sel, obj] of Object.entries(vars)) {
    if (!/:root|html/.test(sel)) continue;
    for (const name of Object.keys(obj)) {
      const v = rootCs.getPropertyValue(name).trim();
      if (v) rootVars[name] = v.slice(0, 160);
    }
  }

  // ---- fonts & tech
  const loadedFonts = new Set();
  try {
    for (const f of document.fonts) if (f.status === 'loaded') loadedFonts.add(`${f.family.replace(/["']/g, '')} ${f.weight} ${f.style}`);
  } catch (e) { /* ignore */ }
  const fontLinks = [...document.querySelectorAll('link[href*="fonts.googleapis"], link[href*="fonts.bunny"], link[href*="typekit"], link[href*="fontshare"], link[rel="preload"][as="font"]')].map((l) => l.href);
  const meta = (n) => (document.querySelector(`meta[name="${n}"]`) || {}).content || null;
  const tech = [];
  const has = (sel) => { try { return !!document.querySelector(sel); } catch (e) { return false; } };
  if (window.__NEXT_DATA__ || has('script[src*="/_next/"]')) tech.push('Next.js');
  if (window.__NUXT__ || has('#__nuxt')) tech.push('Nuxt');
  if (has('astro-island') || has('[data-astro-cid]')) tech.push('Astro');
  if (document.documentElement.dataset.wfSite) tech.push('Webflow');
  if (/framer/i.test(meta('generator') || '') || has('[data-framer-name]')) tech.push('Framer');
  if (window.Shopify) tech.push('Shopify');
  if (window.gsap) tech.push('GSAP');
  if (document.documentElement.classList.contains('lenis') || window.lenis || window.Lenis) tech.push('Lenis smooth scroll');
  if (window.THREE) tech.push('three.js');
  if (has('lottie-player, dotlottie-player')) tech.push('Lottie');
  if (has('[data-aos]')) tech.push('AOS (scroll reveal)');
  if (has('[data-framer-appear-id]')) tech.push('Framer Motion appear');
  if (has('[data-slot]') || has('[data-radix-collection-item]') || has('[data-radix-popper-content-wrapper]')) tech.push('Radix / shadcn-style data attributes');
  if (has('svg.lucide, [class*="lucide-"]')) tech.push('Lucide icons');
  if (has('i.ph, [class^="ph-"], [class*=" ph-"]')) tech.push('Phosphor icons');
  if (has('[class*="fa-"]')) tech.push('Font Awesome');
  if (has('.material-symbols-outlined, .material-icons')) tech.push('Material icons');
  let utility = 0;
  const utilRe = /^(?:flex|grid|hidden|block|inline-flex|items-\w+|justify-\w+|p[trblxy]?-\d+|m[trblxy]?-\d+|gap-\d+|text-(?:xs|sm|base|lg|\d?xl)|font-(?:medium|semibold|bold)|rounded(?:-\w+)?|bg-[a-z]+-\d{2,3}|text-[a-z]+-\d{2,3}|w-\w+|h-\w+|max-w-\w+|(?:sm|md|lg|xl):[\w-]+)$/;
  for (const el of [...all].slice(0, 1500)) {
    if (typeof el.className !== 'string') continue;
    for (const c of el.className.split(/\s+/)) if (utilRe.test(c)) utility++;
  }
  if (utility > 60) tech.push(`Tailwind-style utility classes (${utility} hits)`);

  return {
    url: location.href,
    title: document.title,
    description: meta('description'),
    generator: meta('generator'),
    themeColor: meta('theme-color'),
    lang: document.documentElement.lang || null,
    colorScheme: getComputedStyle(document.documentElement).colorScheme,
    doc: { width: docW, height: document.documentElement.scrollHeight, viewportHeight: vh },
    pageBg: (color(getComputedStyle(document.body).backgroundColor) || color(getComputedStyle(document.documentElement).backgroundColor) || { hex: '#ffffff' }).hex,
    counts,
    tallies: Object.fromEntries(Object.entries(T).map(([k, m]) => [k, top(m, k === 'typeStyle' ? 60 : 40)])),
    tagStyles,
    fixed,
    components,
    header: headerInfo,
    hero: heroInfo,
    footer: footerInfo,
    sections,
    copy,
    css: { vars, rootVars, keyframes: [...keyframes].slice(0, 80), fontFaces: fontFaces.slice(0, 60), blockedSheets },
    fonts: { loaded: [...loadedFonts].slice(0, 40), links: fontLinks },
    tech,
  };
}

/** Lightweight responsive check run on the mobile viewport. */
export function extractMobile() {
  const fs = (sel) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el).fontSize : null;
  };
  const header = document.querySelector('header');
  const visibleLinks = header ? [...header.querySelectorAll('a')].filter((a) => {
    const r = a.getBoundingClientRect();
    const cs = getComputedStyle(a);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden';
  }).length : null;
  const toggle = document.querySelector('header button, nav button, [aria-label*="menu" i], [aria-controls][aria-expanded]');
  return {
    h1: fs('h1'),
    h2: fs('h2'),
    p: fs('p'),
    body: getComputedStyle(document.body).fontSize,
    headerHeight: header ? Math.round(header.getBoundingClientRect().height) : null,
    navToggle: !!toggle,
    visibleHeaderLinks: visibleLinks,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    docHeight: document.documentElement.scrollHeight,
  };
}

/** Store discovery: classifies links into product pages and live demo/preview links. */
export function discoverLinks() {
  const clean = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);
  const demoText = /(live\s*)?(demo|preview)|vista\s*previa|ver\s*demo|ver\s*en\s*vivo|en\s*vivo|ver\s*plantilla|live\s*site/i;
  const demoHost = /vercel\.app|netlify\.app|framer\.(website|app|ai)|webflow\.io|github\.io|pages\.dev|surge\.sh|onrender\.com|fly\.dev|stackblitz|codesandbox/i;
  const productPath = /\/(products?|templates?|components?|blocks?|themes?|items?|kits?|plantillas?|componentes?|productos?|shop|store|l)\/[^/?#]+/i;
  const out = { products: [], demos: [], images: [], videos: [] };
  const seen = new Set();
  for (const a of document.querySelectorAll('a[href]')) {
    let u;
    try { u = new URL(a.getAttribute('href'), location.href); } catch (e) { continue; }
    if (!/^https?:$/.test(u.protocol)) continue;
    const href = u.href.split('#')[0];
    const label = clean(a.innerText || a.getAttribute('aria-label') || a.title, 80);
    const card = a.closest('article, li, [class*="card" i], [class*="product" i]') || a;
    const price = (clean(card.innerText, 400).match(/(?:[$€£]\s?\d[\d.,]*|\d[\d.,]*\s?(?:USD|EUR|MXN|€|\$))/) || [])[0] || null;
    const key = href + '|' + label;
    if (seen.has(key)) continue;
    seen.add(key);
    if (demoText.test(label) || (u.host !== location.host && demoHost.test(u.host))) out.demos.push({ href, label });
    else if (u.host === location.host && productPath.test(u.pathname)) out.products.push({ href, label, price });
  }
  const og = document.querySelector('meta[property="og:image"]');
  if (og && og.content) out.images.push(og.content);
  for (const img of document.querySelectorAll('img')) {
    const r = img.getBoundingClientRect();
    if ((img.naturalWidth >= 600 || r.width >= 400) && img.currentSrc) out.images.push(img.currentSrc);
  }
  out.images = [...new Set(out.images)].slice(0, 8);
  // Product reels/promo videos: the first ones on a product page usually belong to that product.
  for (const vd of document.querySelectorAll('video')) {
    const src = vd.currentSrc || vd.src || (vd.querySelector('source') || {}).src;
    if (src && !src.startsWith('blob:')) out.videos.push(src);
  }
  out.videos = [...new Set(out.videos)].slice(0, 6);
  out.title = document.title;
  out.h1 = clean((document.querySelector('h1') || {}).innerText, 120);
  return out;
}
