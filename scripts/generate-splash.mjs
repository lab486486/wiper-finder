#!/usr/bin/env node
/**
 * TWA splash: white background + app title text (launcher icon unchanged).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TWA_DIR = join(ROOT, "twa");
const BUILD_GRADLE = join(TWA_DIR, "app/build.gradle");
const RENDER = join(__dirname, "render-splash-frame.mjs");

const FONT_CANDIDATES = [
  "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
  "/System/Library/Fonts/AppleSDGothicNeo.ttc",
  "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
];

const SPLASH_TARGETS = [
  { folder: "drawable-mdpi", size: 300 },
  { folder: "drawable-hdpi", size: 450 },
  { folder: "drawable-xhdpi", size: 600 },
  { folder: "drawable-xxhdpi", size: 900 },
  { folder: "drawable-xxxhdpi", size: 1200 },
];

function findFont() {
  for (const path of FONT_CANDIDATES) {
    if (existsSync(path)) return path;
  }
  throw new Error("Korean font not found. Install AppleGothic or Noto Sans CJK.");
}

function renderFrame(size, outPath, fontPath) {
  const result = spawnSync("node", [RENDER, String(size), outPath, fontPath], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (result.status !== 0) throw new Error(`Failed to render splash ${size}px`);
}

function patchBuildGradle() {
  if (!existsSync(BUILD_GRADLE)) return;
  let text = readFileSync(BUILD_GRADLE, "utf8");
  text = text.replace(/backgroundColor: '#F4F6F8'/, "backgroundColor: '#FFFFFF'");
  if (!text.includes("versionCode 2")) {
    text = text.replace(/versionCode 1/, "versionCode 2");
    text = text.replace(/versionName "1"/, 'versionName "1.0.1"');
  }
  writeFileSync(BUILD_GRADLE, text, "utf8");
}

function main() {
  const fontPath = findFont();
  console.log(`Font: ${fontPath}`);

  for (const { folder, size } of SPLASH_TARGETS) {
    const outDir = join(TWA_DIR, "app/src/main/res", folder);
    mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, "splash.png");
    renderFrame(size, outPath, fontPath);
    console.log(`✓ ${folder}/splash.png (${size}px)`);
  }

  patchBuildGradle();
  console.log("✓ Splash background → #FFFFFF");
}

main();
