#!/usr/bin/env node
/**
 * Build web and Android launcher icons from public/icon-source.jpg.
 * The source is an iOS-style rounded icon on a white margin. Corners are
 * filled with the icon blue so a circular mask crops blue, not white.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SOURCE = join(ROOT, "public/icon-source.jpg");
const TWA_RES = join(ROOT, "twa/app/src/main/res");

const LAUNCHER = [
  ["mipmap-mdpi", 48],
  ["mipmap-hdpi", 72],
  ["mipmap-xhdpi", 96],
  ["mipmap-xxhdpi", 144],
  ["mipmap-xxxhdpi", 192],
];
const MASKABLE = [
  ["mipmap-mdpi", 82],
  ["mipmap-hdpi", 123],
  ["mipmap-xhdpi", 164],
  ["mipmap-xxhdpi", 246],
  ["mipmap-xxxhdpi", 328],
];

function isSolidBlue(r, g, b) {
  return b > 235 && r < 25 && g < 180 && b > r + 100;
}

function fullBleed(data, width, height) {
  const n = width * height;
  const margin = new Uint8Array(n);
  const solid = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    if (isSolidBlue(data[o], data[o + 1], data[o + 2])) solid[i] = 1;
  }

  // Step inside the blue so JPEG fringe is not used as the fill color.
  const core = new Uint8Array(n);
  const radius = 6;
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const i = y * width + x;
      if (!solid[i]) continue;
      let ok = true;
      for (let dy = -radius; dy <= radius && ok; dy += radius) {
        for (let dx = -radius; dx <= radius; dx += radius) {
          if (!solid[i + dy * width + dx]) {
            ok = false;
            break;
          }
        }
      }
      if (ok) core[i] = 1;
    }
  }

  const queue = [0, width - 1, (height - 1) * width, (height - 1) * width + width - 1];
  for (const start of queue) margin[start] = 1;
  for (let qi = 0; qi < queue.length; qi++) {
    const p = queue[qi];
    const x = p % width;
    const y = (p / width) | 0;
    const next = [];
    if (x > 0) next.push(p - 1);
    if (x < width - 1) next.push(p + 1);
    if (y > 0) next.push(p - width);
    if (y < height - 1) next.push(p + width);
    for (const neighbor of next) {
      if (margin[neighbor] || core[neighbor]) continue;
      margin[neighbor] = 1;
      queue.push(neighbor);
    }
  }

  const out = Buffer.from(data);
  const seen = new Uint8Array(n);
  const bleed = [];
  for (let i = 0; i < n; i++) {
    if (!core[i]) continue;
    seen[i] = 1;
    bleed.push(i);
  }
  for (let qi = 0; qi < bleed.length; qi++) {
    const p = bleed[qi];
    const x = p % width;
    const y = (p / width) | 0;
    const next = [];
    if (x > 0) next.push(p - 1);
    if (x < width - 1) next.push(p + 1);
    if (y > 0) next.push(p - width);
    if (y < height - 1) next.push(p + width);
    for (const neighbor of next) {
      if (seen[neighbor] || !margin[neighbor]) continue;
      seen[neighbor] = 1;
      const so = p * 4;
      const to = neighbor * 4;
      out[to] = out[so];
      out[to + 1] = out[so + 1];
      out[to + 2] = out[so + 2];
      out[to + 3] = 255;
      bleed.push(neighbor);
    }
  }
  return out;
}

function edgeBlue(data, width, height) {
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  const take = (x, y) => {
    const o = (y * width + x) * 4;
    if (!isSolidBlue(data[o], data[o + 1], data[o + 2])) return;
    r += data[o];
    g += data[o + 1];
    b += data[o + 2];
    count++;
  };
  for (let x = 0; x < width; x += 4) {
    take(x, 2);
    take(x, height - 3);
  }
  for (let y = 0; y < height; y += 4) {
    take(2, y);
    take(width - 3, y);
  }
  if (!count) return "#0261F8";
  const hex = (v) => Math.round(v / count).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}

function patchLauncherBackground(color) {
  const colorsPath = join(TWA_RES, "values/colors.xml");
  let colors = readFileSync(colorsPath, "utf8");
  const tag = `<color name="ic_launcher_background">${color}</color>`;
  if (colors.includes('name="ic_launcher_background"')) {
    colors = colors.replace(/<color name="ic_launcher_background">#[0-9A-Fa-f]+<\/color>/, tag);
  } else {
    colors = colors.replace("</resources>", `    ${tag}\n</resources>`);
  }
  writeFileSync(colorsPath, colors);

  const xmlPath = join(TWA_RES, "mipmap-anydpi-v26/ic_launcher.xml");
  let xml = readFileSync(xmlPath, "utf8");
  xml = xml.replace(
    /android:drawable="@android:color\/white"|android:drawable="@color\/ic_launcher_background"/,
    'android:drawable="@color/ic_launcher_background"'
  );
  writeFileSync(xmlPath, xml);
}

async function writePng(master, size, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  await sharp(master).resize(size, size).png().toFile(dest);
  console.log(`✓ ${dest}`);
}

/**
 * Favicon mark: drop the bottom "사이즈" word, then scale the wiper
 * up slightly and center it. Home-screen icons keep the word.
 * Bounds are in the 1024px source space.
 */
async function faviconMaster(filled, width, height) {
  const sx = width / 1024;
  const mark = {
    x0: Math.round(131 * sx),
    y0: Math.round(149 * sx),
    x1: Math.round(892 * sx),
    y1: Math.round(650 * sx),
  };
  const pad = Math.round(20 * sx);
  const crop = {
    x0: mark.x0 - pad,
    y0: Math.max(0, mark.y0 - pad),
    x1: Math.min(width - 1, mark.x1 + pad),
    y1: Math.min(height - 1, mark.y1 + pad),
  };
  const cw = crop.x1 - crop.x0 + 1;
  const ch = crop.y1 - crop.y0 + 1;
  const sprite = Buffer.alloc(cw * ch * 4);
  const sampleX = Math.round(96 * sx);

  const bgAt = (y) => {
    const yy = Math.min(height - 1, Math.max(0, y));
    let r = 0;
    let g = 0;
    let b = 0;
    const span = 5;
    for (let dy = -span; dy <= span; dy++) {
      const y2 = Math.min(height - 1, Math.max(0, yy + dy));
      const o = (y2 * width + sampleX) * 4;
      r += filled[o];
      g += filled[o + 1];
      b += filled[o + 2];
    }
    const n = span * 2 + 1;
    return [r / n, g / n, b / n];
  };

  for (let y = 0; y < ch; y++) {
    const [br, bg, bb] = bgAt(crop.y0 + y);
    for (let x = 0; x < cw; x++) {
      const o = ((crop.y0 + y) * width + (crop.x0 + x)) * 4;
      const r = filled[o];
      const g = filled[o + 1];
      const b = filled[o + 2];
      const dist = Math.hypot(r - br, g - bg, b - bb);
      const alpha = Math.max(0, Math.min(1, (dist - 34) / 40));
      const so = (y * cw + x) * 4;
      sprite[so] = r;
      sprite[so + 1] = g;
      sprite[so + 2] = b;
      sprite[so + 3] = Math.round(alpha * 255);
    }
  }

  const markW = mark.x1 - mark.x0 + 1;
  const scale = (0.86 * width) / markW;
  const outW = Math.max(1, Math.round(cw * scale));
  const outH = Math.max(1, Math.round(ch * scale));
  const markCx = ((mark.x0 + mark.x1) / 2 - crop.x0) * scale;
  const markCy = ((mark.y0 + mark.y1) / 2 - crop.y0) * scale;
  const left = Math.round(width / 2 - markCx);
  const top = Math.round(height / 2 - markCy);

  const canvas = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const [br, bg, bb] = bgAt(y);
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      canvas[o] = Math.round(br);
      canvas[o + 1] = Math.round(bg);
      canvas[o + 2] = Math.round(bb);
      canvas[o + 3] = 255;
    }
  }

  const resized = await sharp(sprite, { raw: { width: cw, height: ch, channels: 4 } })
    .resize(outW, outH, { kernel: "lanczos3" })
    .png()
    .toBuffer();

  return sharp(canvas, { raw: { width, height, channels: 4 } })
    .composite([{ input: resized, left, top }])
    .png()
    .toBuffer();
}

if (!existsSync(SOURCE)) {
  console.error("Missing public/icon-source.jpg");
  process.exit(1);
}

const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const filled = fullBleed(data, info.width, info.height);
const master = await sharp(filled, {
  raw: { width: info.width, height: info.height, channels: 4 },
}).png().toBuffer();

const iconsDir = join(ROOT, "public/icons");
mkdirSync(iconsDir, { recursive: true });
await writePng(master, 192, join(iconsDir, "icon-192.png"));
await writePng(master, 512, join(iconsDir, "icon-512.png"));
await writePng(master, 180, join(ROOT, "public/apple-touch-icon.png"));
const favicon = await faviconMaster(filled, info.width, info.height);
await writePng(favicon, 192, join(ROOT, "public/favicon.png"));

for (const [folder, size] of LAUNCHER) {
  await writePng(master, size, join(TWA_RES, folder, "ic_launcher.png"));
}
for (const [folder, size] of MASKABLE) {
  await writePng(master, size, join(TWA_RES, folder, "ic_maskable.png"));
}
await writePng(master, 512, join(ROOT, "twa/store_icon.png"));

const background = edgeBlue(filled, info.width, info.height);
patchLauncherBackground(background);
console.log(`✓ launcher background ${background}`);
