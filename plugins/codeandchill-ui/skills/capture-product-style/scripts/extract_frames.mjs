#!/usr/bin/env node
/**
 * extract_frames.mjs — turn a product video (reel / promo) into evenly spaced frames and a
 * contact sheet, so motion and micro-interactions can be analysed visually when there is no
 * live demo (e.g. animated components).
 *
 *   node extract_frames.mjs <video-url|file> [--out DIR] [--name SLUG] [--frames 12] [--cols 4] [--width 540]
 *
 * Output: DIR/<slug>/frame-01.png … frame-NN.png, sheet.png (grid, read this first), info.json
 * Requires ffmpeg + ffprobe on PATH. Downloads with curl (honours HTTPS_PROXY) or fetch.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const o = { src: null, out: '.captures', name: null, frames: 12, cols: 4, width: 540 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') o.out = argv[++i];
    else if (a === '--name') o.name = argv[++i];
    else if (a === '--frames') o.frames = Number(argv[++i]);
    else if (a === '--cols') o.cols = Number(argv[++i]);
    else if (a === '--width') o.width = Number(argv[++i]);
    else if (!a.startsWith('--')) o.src = a;
    else throw new Error(`Unknown flag ${a}`);
  }
  return o;
}

const has = (bin) => spawnSync(bin, [bin === 'curl' ? '--version' : '-version'], { encoding: 'utf8' }).status === 0;
const run = (bin, args) => {
  const r = spawnSync(bin, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`${bin} failed: ${(r.stderr || '').split('\n').slice(-4).join(' ')}`);
  return r.stdout;
};

async function download(url, file) {
  if (has('curl')) {
    const r = spawnSync('curl', ['-sSfL', '--max-time', '120', '-o', file, url], { encoding: 'utf8' });
    if (r.status === 0) return;
    throw new Error(`download failed (${url}): ${r.stderr.trim()}`);
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed (${url}): HTTP ${res.status}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  const o = parseArgs(process.argv.slice(2));
  if (!o.src) {
    console.log('usage: node extract_frames.mjs <video-url|file> [--out DIR] [--name SLUG] [--frames 12] [--cols 4] [--width 540]');
    process.exit(1);
  }
  if (!has('ffmpeg') || !has('ffprobe')) {
    console.error('✖ ffmpeg/ffprobe not found. Install ffmpeg (brew install ffmpeg · apt install ffmpeg · winget install ffmpeg).');
    process.exit(2);
  }
  const slug = o.name || path.basename(o.src.split('?')[0]).replace(/\.[a-z0-9]+$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const dir = path.join(o.out, `video-${slug}`);
  fs.mkdirSync(dir, { recursive: true });
  let file = o.src;
  if (/^https?:\/\//i.test(o.src)) {
    file = path.join(dir, `source${path.extname(o.src.split('?')[0]) || '.mp4'}`);
    await download(o.src, file);
  }
  const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file]));
  const v = (probe.streams || []).find((s) => s.codec_type === 'video') || {};
  const duration = Number(probe.format && probe.format.duration) || Number(v.duration) || 0;
  if (!duration) throw new Error('could not read the video duration');
  const n = Math.max(1, o.frames);
  const frames = [];
  for (let i = 0; i < n; i++) {
    const t = ((i + 0.5) * duration) / n; // centre of each slice, skips black first/last frames
    const name = `frame-${String(i + 1).padStart(2, '0')}.png`;
    run('ffmpeg', ['-y', '-v', 'error', '-ss', t.toFixed(3), '-i', file, '-frames:v', '1', '-vf', `scale=${o.width}:-2`, path.join(dir, name)]);
    frames.push({ file: name, t: Number(t.toFixed(2)) });
  }
  const rows = Math.ceil(n / o.cols);
  run('ffmpeg', ['-y', '-v', 'error', '-i', path.join(dir, 'frame-%02d.png'), '-vf', `tile=${o.cols}x${rows}:padding=6:margin=6:color=white`, '-frames:v', '1', path.join(dir, 'sheet.png')]);
  const info = { source: o.src, duration: Number(duration.toFixed(2)), width: v.width, height: v.height, fps: v.r_frame_rate, frames };
  fs.writeFileSync(path.join(dir, 'info.json'), JSON.stringify(info, null, 2));
  console.log(`✓ ${dir}/sheet.png · ${n} frames over ${info.duration}s (${v.width}×${v.height})`);
}

main().catch((e) => {
  console.error(`✖ ${e.message}`);
  process.exit(1);
});
