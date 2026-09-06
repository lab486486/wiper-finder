#!/usr/bin/env node
/**
 * Bubblewrap TWA 빌드 (AAB)
 */
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TWA_DIR = join(ROOT, "twa");
const config = JSON.parse(readFileSync(join(TWA_DIR, "config.json"), "utf8"));

function loadKeystoreEnv() {
  const envPath = join(TWA_DIR, ".keystore-env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^(BUBBLEWRAP_\w+)=(.+)$/);
    if (m) process.env[m[1]] = m[2];
  }
}

function run(cmd, args, opts = {}) {
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, { stdio: "inherit", cwd: opts.cwd ?? TWA_DIR, ...opts });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function signBundle() {
  const store = process.env.BUBBLEWRAP_KEYSTORE_PASSWORD;
  const key = process.env.BUBBLEWRAP_KEY_PASSWORD;
  if (!store || !key) {
    console.error("Missing keystore passwords. Run: source scripts/twa-env.sh");
    process.exit(1);
  }
  const input = join(TWA_DIR, "app/build/outputs/bundle/release/app-release.aab");
  const output = join(TWA_DIR, "app-release-bundle.aab");
  run("jarsigner", [
    "-verbose",
    "-sigalg", "SHA256withRSA",
    "-digestalg", "SHA-256",
    "-keystore", join(TWA_DIR, "android.keystore"),
    input,
    "android",
    "-storepass", store,
    "-keypass", key,
    "-signedjar", output,
  ]);
}

const isInit = process.argv.includes("--init");

if (isInit) {
  if (!existsSync(join(TWA_DIR, "twa-manifest.json"))) {
    run("node", [join(ROOT, "scripts/twa-bootstrap.mjs")], { cwd: ROOT });
  } else {
    console.log("twa/twa-manifest.json already exists — skip init");
  }
  console.log("\nNext:");
  console.log("  node scripts/update-assetlinks.mjs --from-twa");
  console.log("  node scripts/build.mjs && wrangler pages deploy dist --project-name=wiper-finder");
  console.log("  node scripts/build-twa.mjs");
  process.exit(0);
}

if (!existsSync(join(TWA_DIR, "twa-manifest.json"))) {
  console.error("Run first: node scripts/build-twa.mjs --init");
  process.exit(1);
}

loadKeystoreEnv();

// Text splash before build; bubblewrap update (if manifest changed) may overwrite icons.
run("node", [join(ROOT, "scripts/generate-splash.mjs")], { cwd: ROOT });
run("bubblewrap", ["build"]);
// Re-apply text splash, rebuild bundle, re-sign (update restores wiper icon splash).
run("node", [join(ROOT, "scripts/generate-splash.mjs")], { cwd: ROOT });
run("./gradlew", ["bundleRelease"], { cwd: TWA_DIR });
signBundle();

const signedAab = join(TWA_DIR, "app-release-bundle.aab");
const gradleAab = join(TWA_DIR, "app/build/outputs/bundle/release/app-release.aab");
console.log("\n✓ AAB output (signed, upload this):", signedAab);
if (existsSync(gradleAab)) {
  console.log("  (unsigned gradle artifact — do not upload:", gradleAab + ")");
}
console.log("  Upload in Play Console → Internal testing → New release");
