/**
 * Generates tasteful abstract artwork imagery for Atelier Gallery.
 * Warm neutral palettes (ivory, clay, terracotta, charcoal), soft gradients,
 * film grain and gentle vignettes — no photography required.
 *
 * Output:
 *   public/images/artworks/*.jpg   (12 artwork images)
 *   public/images/journal/*.jpg     (4 journal covers)
 *   public/images/studio/*.jpg      (studio shots + artist portrait)
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
const ART = join(root, 'artworks');
const JOURNAL = join(root, 'journal');
const STUDIO = join(root, 'studio');
for (const d of [ART, JOURNAL, STUDIO]) mkdirSync(d, { recursive: true });

/* deterministic PRNG */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PAL = {
  ivory: '#FAF7F2', parchment: '#F4EFE6', beige: '#EDE6DA', sand: '#E3D9C8',
  linen: '#D9CFC0', clay: '#A9714B', claylight: '#C99E7C', terracotta: '#9C4A2F',
  terracottadeep: '#7E3A24', charcoal: '#1C1A17', smoke: '#4A453E', stone: '#8A8177',
};

function svgWrap(w, h, body, defs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}${body}</svg>`;
}
function linearGrad(id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
  const s = stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('');
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${s}</linearGradient>`;
}
function radialGrad(id, stops, cx = 0.5, cy = 0.5, r = 0.6) {
  const s = stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('');
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${s}</radialGradient>`;
}
const vignette = (w, h) =>
  `<rect width="${w}" height="${h}" fill="url(#vg)" opacity="0.35"/>`;

function defsCommon(w, h) {
  return `<defs>${radialGrad('vg', [[0, 'rgba(0,0,0,0)'], [1, 'rgba(28,26,23,0.55)']])}</defs>`;
}

/** paint canvas texture: subtle horizontal streaks */
function streaks(rnd, w, h, n, color, opacity) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const y = rnd() * h;
    const hh = 2 + rnd() * 14;
    s += `<rect x="0" y="${y.toFixed(0)}" width="${w}" height="${hh.toFixed(0)}" fill="${color}" opacity="${(opacity * (0.3 + rnd() * 0.7)).toFixed(3)}"/>`;
  }
  return s;
}

/** weave: alternating thread stripes */
function weave(rnd, w, h, colors) {
  let s = '';
  let y = 0;
  while (y < h) {
    const hh = 6 + rnd() * 26;
    const c = colors[Math.floor(rnd() * colors.length)];
    s += `<rect x="0" y="${y.toFixed(0)}" width="${w}" height="${hh.toFixed(1)}" fill="${c}" opacity="${(0.75 + rnd() * 0.25).toFixed(2)}"/>`;
    y += hh;
  }
  // warp threads
  for (let x = 0; x < w; x += 5) {
    s += `<rect x="${x}" y="0" width="1.6" height="${h}" fill="#000000" opacity="0.06"/>`;
  }
  return s;
}

async function grainy(base, w, h, seed, strength = 26) {
  const rnd = mulberry32(seed);
  const noise = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const v = Math.floor(118 + rnd() * 40);
    noise[i * 4] = v; noise[i * 4 + 1] = v; noise[i * 4 + 2] = v; noise[i * 4 + 3] = strength;
  }
  const grain = await sharp(noise, { raw: { width: w, height: h, channels: 4 } })
    .png().toBuffer();
  return sharp(base)
    .composite([{ input: grain, blend: 'overlay' }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
}

async function save(name, dir, w, h, svgBody, defs, seed) {
  const svg = svgWrap(w, h, svgBody, defs);
  const base = await sharp(Buffer.from(svg)).png().toBuffer();
  const out = await grainy(base, w, h, seed);
  const path = join(dir, name);
  await sharp(out).toFile(path);
  console.log('  wrote', path);
}

const W = 1200, H = 1500;

/* ---------------- PAINTINGS ---------------- */
async function painting1() { // Field Study — low ochre horizon
  const d = `<defs>${linearGrad('sky', [[0, PAL.ivory], [0.62, PAL.parchment], [0.63, PAL.claylight], [0.75, PAL.clay], [1, PAL.terracottadeep]])}${radialGrad('sun', [[0, 'rgba(250,247,242,0.9)'], [1, 'rgba(250,247,242,0)']], 0.68, 0.3, 0.35)}</defs>`;
  const b = `<rect width="${W}" height="${H}" fill="url(#sky)"/>
    <ellipse cx="${W * 0.68}" cy="${H * 0.3}" rx="220" ry="220" fill="url(#sun)"/>
    <rect x="0" y="${H * 0.63}" width="${W}" height="${H * 0.37}" fill="${PAL.terracottadeep}" opacity="0.25"/>
    <path d="M0 ${H * 0.63} Q ${W * 0.3} ${H * 0.6}, ${W * 0.6} ${H * 0.64} T ${W} ${H * 0.62} L ${W} ${H} L 0 ${H} Z" fill="${PAL.terracottadeep}" opacity="0.5"/>
    <path d="M0 ${H * 0.72} Q ${W * 0.4} ${H * 0.68}, ${W} ${H * 0.74} L ${W} ${H} L 0 ${H} Z" fill="${PAL.charcoal}" opacity="0.35"/>
    ${streaks(mulberry32(11), W, H, 40, PAL.charcoal, 0.08)}${vignette(W, H)}`;
  await save('painting-1.jpg', ART, W, H, b, d, 101);
}

async function painting2() { // impasto detail — arcs
  const rnd = mulberry32(22);
  const d = `<defs>${linearGrad('bg', [[0, PAL.parchment], [1, PAL.sand]])}${radialGrad('vg', [[0, 'rgba(0,0,0,0)'], [1, 'rgba(28,26,23,0.5)']])}</defs>`;
  let arcs = '';
  for (let i = 0; i < 26; i++) {
    const cx = rnd() * W, cy = rnd() * H, r = 60 + rnd() * 260;
    const c = [PAL.clay, PAL.terracotta, PAL.linen, PAL.stone, PAL.claylight][Math.floor(rnd() * 5)];
    arcs += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="none" stroke="${c}" stroke-width="${(8 + rnd() * 40).toFixed(0)}" opacity="${(0.25 + rnd() * 0.45).toFixed(2)}"/>`;
  }
  const b = `<rect width="${W}" height="${H}" fill="url(#bg)"/>${arcs}${streaks(rnd, W, H, 30, PAL.charcoal, 0.06)}${vignette(W, H)}`;
  await save('painting-2.jpg', ART, W, H, b, d, 102);
}

async function painting3() { // still life with figs
  const d = `<defs>${linearGrad('bg', [[0, PAL.smoke], [1, PAL.charcoal]])}${radialGrad('glow', [[0, 'rgba(201,158,124,0.55)'], [1, 'rgba(201,158,124,0)']], 0.5, 0.42, 0.5)}${radialGrad('vg', [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.6)']])}
  ${linearGrad('cloth', [[0, PAL.beige], [1, PAL.linen]], 0, 0, 1, 0)}</defs>`;
  const b = `<rect width="${W}" height="${H}" fill="url(#bg)"/><ellipse cx="${W / 2}" cy="${H * 0.42}" rx="480" ry="380" fill="url(#glow)"/>
    <path d="M${W * 0.1} ${H * 0.95} Q ${W * 0.3} ${H * 0.55}, ${W * 0.55} ${H * 0.72} T ${W * 0.95} ${H * 0.6} L ${W} ${H} L 0 ${H} Z" fill="url(#cloth)" opacity="0.85"/>
    <ellipse cx="${W * 0.42}" cy="${H * 0.52}" rx="95" ry="120" fill="${PAL.terracottadeep}"/>
    <ellipse cx="${W * 0.58}" cy="${H * 0.5}" rx="85" ry="110" fill="${PAL.clay}"/>
    <ellipse cx="${W * 0.68}" cy="${H * 0.56}" rx="70" ry="92" fill="${PAL.terracottadeep}" opacity="0.85"/>
    <ellipse cx="${W * 0.4}" cy="${H * 0.48}" rx="30" ry="45" fill="${PAL.claylight}" opacity="0.5"/>
    <ellipse cx="${W * 0.56}" cy="${H * 0.46}" rx="26" ry="40" fill="${PAL.claylight}" opacity="0.45"/>
    <rect x="${W * 0.415}" y="${H * 0.38}" width="10" height="60" fill="${PAL.stone}"/>
    <rect x="${W * 0.575}" y="${H * 0.36}" width="9" height="55" fill="${PAL.stone}"/>${vignette(W, H)}`;
  await save('painting-3.jpg', ART, W, H, b, d, 103);
}

async function painting4() { // tide pools triptych
  const d = `<defs>${linearGrad('sea', [[0, PAL.linen], [0.5, PAL.sand], [1, PAL.stone]])}${radialGrad('pool', [[0, PAL.terracotta], [1, 'rgba(156,74,47,0)']], 0.5, 0.5, 0.5)}${radialGrad('vg', [[0, 'rgba(0,0,0,0)'], [1, 'rgba(28,26,23,0.5)']])}</defs>`;
  let panels = '';
  const rnd = mulberry32(44);
  for (let p = 0; p < 3; p++) {
    const x = p * (W / 3);
    panels += `<rect x="${x + 14}" y="60" width="${W / 3 - 28}" height="${H - 120}" fill="url(#sea)" stroke="${PAL.charcoal}" stroke-width="10" opacity="0.96"/>`;
    for (let i = 0; i < 7; i++) {
      const cx = x + 40 + rnd() * (W / 3 - 80), cy = 120 + rnd() * (H - 240), r = 30 + rnd() * 90;
      panels += `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${r.toFixed(0)}" ry="${(r * 0.7).toFixed(0)}" fill="${PAL.charcoal}" opacity="${(0.25 + rnd() * 0.4).toFixed(2)}"/>`;
      panels += `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${(r * 0.5).toFixed(0)}" ry="${(r * 0.35).toFixed(0)}" fill="url(#pool)" opacity="0.7"/>`;
    }
  }
  const b = `<rect width="${W}" height="${H}" fill="${PAL.ivory}"/>${panels}${vignette(W, H)}`;
  await save('painting-4.jpg', ART, W, H, b, d, 104);
}

/* ---------------- CERAMICS ---------------- */
async function ceramic1() { // Morning Vessel — tall vessel on ivory
  const d = `<defs>${linearGrad('bg', [[0, PAL.ivory], [1, PAL.parchment]])}${linearGrad('body', [[0, PAL.beige], [0.55, PAL.ivory], [1, PAL.sand]], 0, 0, 1, 0)}${linearGrad('wash', [[0, 'rgba(156,74,47,0)'], [0.6, 'rgba(156,74,47,0.35)'], [1, 'rgba(156,74,47,0.65)']])}${radialGrad('vg', [[0, 'rgba(0,0,0,0)'], [1, 'rgba(28,26,23,0.35)']])}</defs>`;
  const b = `<rect width="${W}" height="${H}" fill="url(#bg)"/>
    <ellipse cx="${W / 2}" cy="${H * 0.86}" rx="330" ry="46" fill="${PAL.charcoal}" opacity="0.18"/>
    <path d="M ${W * 0.38} ${H * 0.18}
             C ${W * 0.36} ${H * 0.35}, ${W * 0.3} ${H * 0.5}, ${W * 0.33} ${H * 0.68}
             C ${W * 0.35} ${H * 0.8}, ${W * 0.42} ${H * 0.84}, ${W * 0.5} ${H * 0.84}
             C ${W * 0.58} ${H * 0.84}, ${W * 0.65} ${H * 0.8}, ${W * 0.67} ${H * 0.68}
             C ${W * 0.7} ${H * 0.5}, ${W * 0.64} ${H * 0.35}, ${W * 0.62} ${H * 0.18} Z"
          fill="url(#body)"/>
    <path d="M ${W * 0.38} ${H * 0.18}
             C ${W * 0.36} ${H * 0.35}, ${W * 0.3} ${H * 0.5}, ${W * 0.33} ${H * 0.68}
             C ${W * 0.35} ${H * 0.8}, ${W * 0.42} ${H * 0.84}, ${W * 0.5} ${H * 0.84}
             C ${W * 0.58} ${H * 0.84}, ${W * 0.65} ${H * 0.8}, ${W * 0.67} ${H * 0.68}
             C ${W * 0.7} ${H * 0.5}, ${W * 0.64} ${H * 0.35}, ${W * 0.62} ${H * 0.18} Z"
          fill="url(#wash)" opacity="0.8"/>
    <ellipse cx="${W / 2}" cy="${H * 0.18}" rx="${W * 0.12}" ry="26" fill="${PAL.charcoal}" opacity="0.55"/>
    <ellipse cx="${W * 0.44}" cy="${H * 0.5}" rx="26" ry="220" fill="#FFFFFF" opacity="0.35"/>
    ${vignette(W, H)}`;
  await save('ceramic-1.jpg', ART, W, H, b, d, 201);
}

async function ceramic2() { // Ember cups — two smoked cups
  const d = `<defs>${linearGrad('bg', [[0, PAL.parchment], [1, PAL.beige]])}${linearGrad('cup', [[0, PAL.claylight], [0.5, PAL.clay], [1, PAL.terracottadeep]], 0, 0, 1, 0)}${radialGrad('vg', [[0, 'rgba(0,0,0,0)'], [1, 'rgba(28,26,23,0.35)']])}</defs>`;
  const cup = (cx, cy, s) => `
    <ellipse cx="${cx}" cy="${cy + 190 * s}" rx="${150 * s}" ry="26" fill="${PAL.charcoal}" opacity="0.16"/>
    <path d="M ${cx - 130 * s} ${cy} L ${cx - 105 * s} ${cy + 185 * s} Q ${cx} ${cy + 215 * s} ${cx + 105 * s} ${cy + 185 * s} L ${cx + 130 * s} ${cy} Z" fill="url(#cup)"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${130 * s}" ry="24" fill="${PAL.charcoal}" opacity="0.7"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${100 * s}" ry="17" fill="#0f0e0c" opacity="0.9"/>`;
  const b = `<rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect x="0" y="${H * 0.78}" width="${W}" height="${H * 0.22}" fill="${PAL.sand}" opacity="0.7"/>
    ${cup(W * 0.36, H * 0.42, 1)}${cup(W * 0.66, H * 0.46, 0.86)}
    ${vignette(W, H)}`;
  await save('ceramic-2.jpg', ART, W, H, b, d, 202);
}

async function ceramic3() { // Harvest bowls — nested bowls
  const d = `<defs>${linearGrad('bg', [[0, PAL.ivory], [1, PAL.parchment]])}${linearGrad('bowl', [[0, PAL.beige], [0.5, PAL.ivory], [1, PAL.linen]], 0, 0, 1, 0)}${radialGrad('vg', [[0, 'rgba(0,0,0,0)'], [1, 'rgba(28,26,23,0.35)']])}</defs>`;
  const bowl = (cy, rx, ry, op) => `
    <ellipse cx="${W / 2}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#bowl)" opacity="${op}"/>
    <ellipse cx="${W / 2}" cy="${cy - ry * 0.28}" rx="${rx * 0.8}" ry="${ry * 0.55}" fill="${PAL.parchment}" opacity="${op}"/>
    <ellipse cx="${W / 2}" cy="${cy - ry * 0.28}" rx="${rx * 0.8}" ry="${ry * 0.55}" fill="none" stroke="${PAL.stone}" stroke-width="6" opacity="0.5"/>`;
  const b = `<rect width="${W}" height="${H}" fill="url(#bg)"/>
    <ellipse cx="${W / 2}" cy="${H * 0.88}" rx="360" ry="44" fill="${PAL.charcoal}" opacity="0.15"/>
    ${bowl(H * 0.5, 300, 96, 0.55)}${bowl(H * 0.58, 245, 82, 0.8)}${bowl(H * 0.65, 190, 68, 1)}
    <ellipse cx="${W * 0.44}" cy="${H * 0.6}" rx="18" ry="60" fill="#FFFFFF" opacity="0.4"/>
    ${vignette(W, H)}`;
  await save('ceramic-3.jpg', ART, W, H, b, d, 203);
}

/* ---------------- SCULPTURE ---------------- */
async function sculpture1() { // standing figure — tall carved form
  const d = `<defs>${linearGrad('bg', [[0, PAL.smoke], [1, PAL.charcoal]])}${linearGrad('wood', [[0, PAL.claylight], [0.5, PAL.clay], [1, PAL.terracottadeep]], 0, 0, 1, 0)}${radialGrad('spot', [[0, 'rgba(250,247,242,0.28)'], [1, 'rgba(250,247,242,0)']], 0.5, 0.3, 0.55)}${radialGrad('vg', [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.55)']])}</defs>`;
  const b = `<rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#spot)"/>
    <rect x="${W * 0.3}" y="${H * 0.82}" width="${W * 0.4}" height="${H * 0.1}" fill="#0f0e0c" opacity="0.9"/>
    <path d="M ${W * 0.47} ${H * 0.1}
             C ${W * 0.44} ${H * 0.22}, ${W * 0.52} ${H * 0.28}, ${W * 0.46} ${H * 0.42}
             C ${W * 0.42} ${H * 0.54}, ${W * 0.5} ${H * 0.62}, ${W * 0.46} ${H * 0.74}
             C ${W * 0.44} ${H * 0.8}, ${W * 0.48} ${H * 0.82}, ${W * 0.5} ${H * 0.82}
             C ${W * 0.54} ${H * 0.82}, ${W * 0.56} ${H * 0.78}, ${W * 0.55} ${H * 0.7}
             C ${W * 0.54} ${H * 0.58}, ${W * 0.6} ${H * 0.5}, ${W * 0.57} ${H * 0.38}
             C ${W * 0.55} ${H * 0.26}, ${W * 0.56} ${H * 0.18}, ${W * 0.53} ${H * 0.1} Z"
          fill="url(#wood)"/>
    <ellipse cx="${W * 0.5}" cy="${H * 0.07}" rx="60" ry="70" fill="url(#wood)"/>
    ${vignette(W, H)}`;
  await save('sculpture-1.jpg', ART, W, H, b, d, 301);
}

async function sculpture2() { // bronze seed on limestone
  const d = `<defs>${linearGrad('bg', [[0, PAL.parchment], [1, PAL.beige]])}${radialGrad('bronze', [[0.25, 0.3], [0, '#D8A86B'], [0.55, '#8A5A30'], [1, '#4A2E18']])}${linearGrad('stone', [[0, PAL.linen], [1, PAL.sand]])}${radialGrad('vg', [[0, 'rgba(0,0,0,0)'], [1, 'rgba(28,26,23,0.35)']])}</defs>`;
  const b = `<rect width="${W}" height="${H}" fill="url(#bg)"/>
    <ellipse cx="${W / 2}" cy="${H * 0.84}" rx="300" ry="40" fill="${PAL.charcoal}" opacity="0.15"/>
    <rect x="${W * 0.36}" y="${H * 0.66}" width="${W * 0.28}" height="${H * 0.18}" fill="url(#stone)"/>
    <rect x="${W * 0.36}" y="${H * 0.66}" width="${W * 0.28}" height="14" fill="${PAL.stone}" opacity="0.6"/>
    <ellipse cx="${W / 2}" cy="${H * 0.44}" rx="170" ry="230" fill="url(#bronze)"/>
    <path d="M ${W / 2} ${H * 0.44 - 230} Q ${W / 2 + 60} ${H * 0.44} ${W / 2} ${H * 0.44 + 230}" stroke="#2E1C10" stroke-width="10" fill="none" opacity="0.6"/>
    <ellipse cx="${W * 0.45}" cy="${H * 0.36}" rx="34" ry="70" fill="#F2D8A8" opacity="0.5"/>
    ${vignette(W, H)}`;
  await save('sculpture-2.jpg', ART, W, H, b, d, 302);
}

/* ---------------- TEXTILE ---------------- */
async function textile1() { // woven tapestry
  const rnd = mulberry32(55);
  const colors = [PAL.ivory, PAL.beige, PAL.linen, PAL.sand, PAL.claylight, PAL.clay, PAL.terracotta];
  const d = `<defs>${radialGrad('vg', [[0, 'rgba(0,0,0,0)'], [1, 'rgba(28,26,23,0.4)']])}</defs>`;
  const b = `<rect width="${W}" height="${H}" fill="${PAL.parchment}"/>
    <rect x="60" y="40" width="${W - 120}" height="${H - 80}" fill="${PAL.beige}"/>
    ${weave(rnd, W - 120, H - 80, colors).replaceAll('x="0"', 'x="60"').replaceAll('y="0"', 'y="40"').replaceAll(`height="${H}"`, `height="${H - 80}"`)}
    <rect x="${W / 2 - 8}" y="0" width="16" height="60" fill="${PAL.charcoal}"/>
    <rect x="60" y="40" width="${W - 120}" height="${H - 80}" fill="none" stroke="${PAL.charcoal}" stroke-width="8" opacity="0.25"/>
    ${vignette(W, H)}`;
  // note: weave offsets are approximate; fine for abstract imagery
  await save('textile-1.jpg', ART, W, H, b, d, 401);
}

async function textile2() { // embroidered linen — stitched light lines
  const rnd = mulberry32(66);
  const d = `<defs>${linearGrad('bg', [[0, PAL.ivory], [1, PAL.parchment]])}${radialGrad('vg', [[0, 'rgba(0,0,0,0)'], [1, 'rgba(28,26,23,0.35)']])}</defs>`;
  let stitches = '';
  for (let i = 0; i < 46; i++) {
    const y = 80 + rnd() * (H - 160);
    const x1 = 100 + rnd() * W * 0.3;
    const x2 = x1 + 120 + rnd() * 320;
    stitches += `<line x1="${x1.toFixed(0)}" y1="${y.toFixed(0)}" x2="${x2.toFixed(0)}" y2="${(y + (rnd() - 0.5) * 60).toFixed(0)}" stroke="${PAL.clay}" stroke-width="${(3 + rnd() * 5).toFixed(1)}" opacity="${(0.4 + rnd() * 0.5).toFixed(2)}" stroke-linecap="round"/>`;
  }
  const b = `<rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect x="70" y="70" width="${W - 140}" height="${H - 140}" fill="none" stroke="${PAL.charcoal}" stroke-width="26" opacity="0.85"/>
    ${stitches}${vignette(W, H)}`;
  await save('textile-2.jpg', ART, W, H, b, d, 402);
}

/* ---------------- DECOR ---------------- */
async function decor1() { // garden lantern glowing
  const rnd = mulberry32(77);
  const d = `<defs>${linearGrad('bg', [[0, '#2A251F'], [1, '#12100D']])}${radialGrad('glow', [[0, 'rgba(233,178,106,0.95)'], [0.4, 'rgba(201,140,80,0.45)'], [1, 'rgba(201,140,80,0)']], 0.5, 0.5, 0.5)}${radialGrad('vg', [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.65)']])}</defs>`;
  let holes = '';
  for (let i = 0; i < 60; i++) {
    const cx = W / 2 + (rnd() - 0.5) * 300, cy = H * 0.45 + (rnd() - 0.5) * 420;
    holes += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(6 + rnd() * 14).toFixed(0)}" fill="#F5C87E" opacity="${(0.5 + rnd() * 0.5).toFixed(2)}"/>`;
  }
  const b = `<rect width="${W}" height="${H}" fill="url(#bg)"/>
    <ellipse cx="${W / 2}" cy="${H * 0.45}" rx="460" ry="520" fill="url(#glow)"/>
    <path d="M ${W * 0.38} ${H * 0.2} L ${W * 0.34} ${H * 0.72} Q ${W / 2} ${H * 0.78} ${W * 0.66} ${H * 0.72} L ${W * 0.62} ${H * 0.2} Z" fill="#3A322A"/>
    <ellipse cx="${W / 2}" cy="${H * 0.2}" rx="${W * 0.12}" ry="22" fill="#241F19"/>
    ${holes}
    <ellipse cx="${W / 2}" cy="${H * 0.45}" rx="120" ry="160" fill="#F5C87E" opacity="0.75"/>
    ${vignette(W, H)}`;
  await save('decor-1.jpg', ART, W, H, b, d, 501);
}

/* ---------------- JOURNAL ---------------- */
async function journalCovers() {
  const cfgs = [
    { n: 'journal-1.jpg', seed: 601, c1: PAL.terracottadeep, c2: PAL.clay, shape: 'flame' },
    { n: 'journal-2.jpg', seed: 602, c1: PAL.claylight, c2: PAL.ivory, shape: 'horizon' },
    { n: 'journal-3.jpg', seed: 603, c1: PAL.terracotta, c2: PAL.sand, shape: 'dye' },
    { n: 'journal-4.jpg', seed: 604, c1: PAL.beige, c2: PAL.linen, shape: 'crate' },
  ];
  const w = 1200, h = 800;
  for (const { n, seed, c1, c2, shape } of cfgs) {
    const d = `<defs>${linearGrad('g', [[0, c2], [1, c1]])}${radialGrad('vg', [[0, 'rgba(0,0,0,0)'], [1, 'rgba(28,26,23,0.45)']])}</defs>`;
    let body = `<rect width="${w}" height="${h}" fill="url(#g)"/>`;
    if (shape === 'flame') {
      body += `<ellipse cx="${w / 2}" cy="${h * 0.55}" rx="180" ry="240" fill="${PAL.charcoal}" opacity="0.55"/><ellipse cx="${w / 2}" cy="${h * 0.55}" rx="90" ry="150" fill="#E9B26A" opacity="0.8"/>`;
    } else if (shape === 'horizon') {
      body += `<rect x="0" y="${h * 0.58}" width="${w}" height="${h * 0.42}" fill="${PAL.terracottadeep}" opacity="0.6"/><ellipse cx="${w * 0.7}" cy="${h * 0.32}" rx="130" ry="130" fill="${PAL.ivory}" opacity="0.85"/>`;
    } else if (shape === 'dye') {
      const rnd = mulberry32(seed);
      for (let i = 0; i < 12; i++) body += `<circle cx="${(rnd() * w).toFixed(0)}" cy="${(rnd() * h).toFixed(0)}" r="${(40 + rnd() * 120).toFixed(0)}" fill="${PAL.charcoal}" opacity="${(0.12 + rnd() * 0.25).toFixed(2)}"/>`;
    } else {
      body += `<rect x="${w * 0.3}" y="${h * 0.25}" width="${w * 0.4}" height="${h * 0.5}" fill="none" stroke="${PAL.charcoal}" stroke-width="14" opacity="0.7"/><line x1="${w * 0.3}" y1="${h * 0.5}" x2="${w * 0.7}" y2="${h * 0.5}" stroke="${PAL.charcoal}" stroke-width="10" opacity="0.7"/>`;
    }
    await save(n, JOURNAL, w, h, body + vignette(w, h), d, seed);
  }
}

/* ---------------- STUDIO ---------------- */
async function studioShots() {
  const w = 1200, h = 900;
  // studio-1: worktable with vessels
  {
    const d = `<defs>${linearGrad('bg', [[0, PAL.parchment], [1, PAL.sand]])}${linearGrad('table', [[0, '#8A6A4E'], [1, '#5E4630']])}${radialGrad('vg', [[0, 'rgba(0,0,0,0)'], [1, 'rgba(28,26,23,0.45)']])}</defs>`;
    const rnd = mulberry32(701);
    let vessels = '';
    for (let i = 0; i < 5; i++) {
      const x = 150 + i * 200 + rnd() * 40, vw = 90 + rnd() * 60, vh = 140 + rnd() * 120;
      const c = [PAL.ivory, PAL.beige, PAL.clay, PAL.terracotta, PAL.linen][i];
      vessels += `<ellipse cx="${x.toFixed(0)}" cy="${(h * 0.62).toFixed(0)}" rx="${(vw * 0.7).toFixed(0)}" ry="18" fill="${PAL.charcoal}" opacity="0.15"/>
        <rect x="${(x - vw / 2).toFixed(0)}" y="${(h * 0.62 - vh).toFixed(0)}" width="${vw.toFixed(0)}" height="${vh.toFixed(0)}" rx="${(vw / 2).toFixed(0)}" fill="${c}"/>`;
    }
    const b = `<rect width="${w}" height="${h}" fill="url(#bg)"/>
      <rect x="0" y="${h * 0.55}" width="${w}" height="${h * 0.12}" fill="${PAL.charcoal}" opacity="0.08"/>
      <rect x="0" y="${h * 0.62}" width="${w}" height="${h * 0.38}" fill="url(#table)"/>
      ${vessels}
      <rect x="0" y="${h * 0.3}" width="${w}" height="${h * 0.25}" fill="${PAL.ivory}" opacity="0.25"/>
      ${vignette(w, h)}`;
    await save('studio-1.jpg', STUDIO, w, h, b, d, 701);
  }
  // studio-2: shelf of bowls, window light
  {
    const d = `<defs>${linearGrad('bg', [[0, PAL.ivory], [1, PAL.beige]])}${linearGrad('light', [[0, 'rgba(250,247,242,0.9)'], [1, 'rgba(250,247,242,0)']], 0, 0, 1, 1)}${radialGrad('vg', [[0, 'rgba(0,0,0,0)'], [1, 'rgba(28,26,23,0.4)']])}</defs>`;
    let shelves = '';
    for (let s = 0; s < 3; s++) {
      const y = h * (0.3 + s * 0.22);
      shelves += `<rect x="80" y="${y.toFixed(0)}" width="${w - 160}" height="16" fill="#6B543C"/>`;
      for (let i = 0; i < 4; i++) {
        const x = 200 + i * 220, bw = 110 + ((s * 7 + i * 13) % 40);
        const c = [PAL.beige, PAL.claylight, PAL.ivory, PAL.sand][(s + i) % 4];
        shelves += `<ellipse cx="${x}" cy="${(y - bw * 0.28).toFixed(0)}" rx="${(bw / 2).toFixed(0)}" ry="${(bw * 0.3).toFixed(0)}" fill="${c}" stroke="${PAL.stone}" stroke-width="4"/>`;
      }
    }
    const b = `<rect width="${w}" height="${h}" fill="url(#bg)"/>
      <polygon points="0,0 ${w * 0.45},0 0,${h}" fill="url(#light)"/>
      ${shelves}${vignette(w, h)}`;
    await save('studio-2.jpg', STUDIO, w, h, b, d, 702);
  }
  // portrait: abstract artist portrait
  {
    const w2 = 900, h2 = 1200;
    const d = `<defs>${linearGrad('bg', [[0, PAL.claylight], [0.6, PAL.clay], [1, PAL.terracottadeep]])}${radialGrad('face', [[0, '#E8C39A'], [1, '#B57E52']])}${radialGrad('vg', [[0, 'rgba(0,0,0,0)'], [1, 'rgba(28,26,23,0.5)']])}</defs>`;
    const b = `<rect width="${w2}" height="${h2}" fill="url(#bg)"/>
      <ellipse cx="${w2 / 2}" cy="${h2 * 0.34}" rx="150" ry="190" fill="url(#face)"/>
      <path d="M ${w2 / 2 - 170} ${h2 * 0.3} Q ${w2 / 2} ${h2 * 0.12} ${w2 / 2 + 170} ${h2 * 0.3} L ${w2 / 2 + 150} ${h2 * 0.42} Q ${w2 / 2} ${h2 * 0.3} ${w2 / 2 - 150} ${h2 * 0.42} Z" fill="${PAL.charcoal}" opacity="0.85"/>
      <path d="M 0 ${h2} L 0 ${h2 * 0.72} Q ${w2 / 2} ${h2 * 0.58} ${w2} ${h2 * 0.72} L ${w2} ${h2} Z" fill="${PAL.charcoal}" opacity="0.9"/>
      <rect x="${w2 / 2 - 130}" y="${h2 * 0.32}" width="100" height="14" rx="7" fill="${PAL.charcoal}" opacity="0.35"/>
      <rect x="${w2 / 2 + 30}" y="${h2 * 0.32}" width="100" height="14" rx="7" fill="${PAL.charcoal}" opacity="0.35"/>
      ${vignette(w2, h2)}`;
    await save('portrait.jpg', STUDIO, w2, h2, b, d, 703);
  }
}

console.log('Generating Atelier imagery…');
await painting1(); await painting2(); await painting3(); await painting4();
await ceramic1(); await ceramic2(); await ceramic3();
await sculpture1(); await sculpture2();
await textile1(); await textile2();
await decor1();
await journalCovers();
await studioShots();
console.log('Done.');
