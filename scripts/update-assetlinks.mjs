#!/usr/bin/env node
/**
 * TWA 서명 키 SHA-256 지문으로 assetlinks.json 갱신
 *
 * Usage:
 *   node scripts/update-assetlinks.mjs AA:BB:CC:...
 *   node scripts/update-assetlinks.mjs --from-twa
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const assetlinksPath = join(ROOT, "public/.well-known/assetlinks.json");
const twaConfig = JSON.parse(readFileSync(join(ROOT, "twa/config.json"), "utf8"));

function normalizeFingerprint(raw) {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-F0-9]/g, "")
    .match(/.{1,2}/g)
    ?.join(":") ?? raw.trim();
}

function loadKeystorePassword() {
  if (process.env.BUBBLEWRAP_KEYSTORE_PASSWORD) return process.env.BUBBLEWRAP_KEYSTORE_PASSWORD;
  const envPath = join(ROOT, "twa/.keystore-env");
  if (existsSync(envPath)) {
    const match = readFileSync(envPath, "utf8").match(/^BUBBLEWRAP_KEYSTORE_PASSWORD=(.+)$/m);
    if (match) return match[1];
  }
  return null;
}

function fingerprintFromTwaKeystore() {
  const keystore = join(ROOT, "twa/android.keystore");
  const storepass = loadKeystorePassword();
  if (!storepass) {
    console.error("Keystore password missing. Run: source scripts/twa-env.sh");
    process.exit(1);
  }
  const result = spawnSync(
    "keytool",
    ["-list", "-v", "-keystore", keystore, "-alias", "android", "-storepass", storepass],
    { encoding: "utf8" }
  );
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    console.error("\nKeystore not found or wrong password. Run bubblewrap init first.");
    process.exit(1);
  }
  const match = result.stdout.match(/SHA256:\s*([^\n]+)/);
  if (!match) {
    console.error("Could not parse SHA256 from keytool output");
    process.exit(1);
  }
  return normalizeFingerprint(match[1]);
}

const fromTwa = process.argv.includes("--from-twa");
const arg = process.argv.find((a) => !a.startsWith("-") && a !== process.argv[0] && a !== process.argv[1]);

let fingerprint;
if (fromTwa) {
  fingerprint = fingerprintFromTwaKeystore();
} else if (arg) {
  fingerprint = normalizeFingerprint(arg);
} else {
  console.error("Usage: node scripts/update-assetlinks.mjs <SHA256 fingerprint>");
  console.error("       node scripts/update-assetlinks.mjs --from-twa");
  process.exit(1);
}

const assetlinks = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: twaConfig.packageId,
      sha256_cert_fingerprints: [fingerprint],
    },
  },
];

writeFileSync(assetlinksPath, `${JSON.stringify(assetlinks, null, 2)}\n`, "utf8");
console.log(`✓ Updated ${assetlinksPath}`);
console.log(`  package: ${twaConfig.packageId}`);
console.log(`  SHA256:  ${fingerprint}`);
