#!/usr/bin/env node
import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const svg = join(ROOT, "public/favicon.svg");
const outDir = join(ROOT, "public/icons");

if (!existsSync(svg)) {
  console.error("Missing public/favicon.svg");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

for (const size of [192, 512]) {
  const out = join(outDir, `icon-${size}.png`);
  const result = spawnSync(
    "npx",
    ["--yes", "@resvg/resvg-js-cli", "--fit-width", String(size), svg, out],
    { stdio: "inherit", cwd: ROOT }
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log(`✓ ${out}`);
}
