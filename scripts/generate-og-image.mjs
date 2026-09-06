#!/usr/bin/env node
/**
 * OG share image (1200×630 WebP) for KakaoTalk / social previews.
 */
import { existsSync, mkdirSync, statSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SOURCE = join(ROOT, "public/images/og-source.jpg");
const OUT = join(ROOT, "public/images/og-share.webp");
const WIDTH = 1200;
const HEIGHT = 630;

if (!existsSync(SOURCE)) {
  console.error(`Missing source image: ${SOURCE}`);
  process.exit(1);
}

mkdirSync(dirname(OUT), { recursive: true });

await sharp(SOURCE)
  .rotate()
  .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
  .webp({ quality: 78, effort: 5, smartSubsample: true })
  .toFile(OUT);

const kb = (statSync(OUT).size / 1024).toFixed(1);
console.log(`✓ ${OUT} (${WIDTH}×${HEIGHT}, ${kb} KB)`);
