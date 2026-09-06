#!/usr/bin/env node
/**
 * Non-interactive TWA setup: bubblewrap config, JDK 17, project init, keystore.
 *
 * Usage: node scripts/twa-bootstrap.mjs
 */
import { createRequire } from "module";
import { createHash, randomBytes } from "crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import { homedir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TWA_DIR = join(ROOT, "twa");
const BUBBLEWRAP_CONFIG = join(homedir(), ".bubblewrap", "config.json");
const JDK_ROOT = join(homedir(), ".bubblewrap", "jdk");
const JDK_DIR_NAME = "jdk-17.0.11+9";
const ANDROID_SDK = join(homedir(), "Library", "Android", "sdk");

const require = createRequire(import.meta.url);
const globalRoot = spawnSync("npm", ["root", "-g"], { encoding: "utf8" }).stdout.trim();
const bubblewrapCli = join(globalRoot, "@bubblewrap", "cli");
const core = require(join(bubblewrapCli, "node_modules", "@bubblewrap", "core"));
const { JdkInstaller } = require(join(bubblewrapCli, "dist", "lib", "JdkInstaller.js"));

const projectConfig = JSON.parse(readFileSync(join(TWA_DIR, "config.json"), "utf8"));

class SilentPrompt {
  printMessage(msg) {
    console.log(msg);
  }
  async downloadFile(url, filename, totalSize = 0) {
    console.log(`  downloading ${url}`);
    await core.fetchUtils.downloadFile(url, filename);
  }
}

function macJdkBundlePath(jdkRoot) {
  const bundle = join(jdkRoot, JDK_DIR_NAME);
  if (existsSync(join(bundle, "Contents", "Home", "release"))) return bundle;
  if (existsSync(join(bundle, "release"))) return bundle;
  return null;
}

async function ensureJdk17() {
  mkdirSync(JDK_ROOT, { recursive: true });
  let jdkPath = macJdkBundlePath(JDK_ROOT);
  if (jdkPath) {
    console.log(`✓ JDK 17 found at ${jdkPath}`);
    return jdkPath;
  }
  console.log("Installing JDK 17 for Bubblewrap (~180MB, one-time)...");
  const installer = new JdkInstaller(process, new SilentPrompt());
  const installedPath = await installer.install(JDK_ROOT);
  jdkPath = macJdkBundlePath(JDK_ROOT) ?? installedPath;
  const valid = await core.JdkHelper.validatePath(jdkPath);
  if (valid.isError()) {
    throw new Error(valid.unwrapError().message);
  }
  console.log(`✓ JDK 17 installed at ${jdkPath}`);
  return jdkPath;
}

function ensureBubblewrapConfig(jdkPath) {
  mkdirSync(dirname(BUBBLEWRAP_CONFIG), { recursive: true });
  writeFileSync(
    BUBBLEWRAP_CONFIG,
    `${JSON.stringify({ jdkPath, androidSdkPath: ANDROID_SDK }, null, 2)}\n`,
    "utf8"
  );
  console.log(`✓ Bubblewrap config → ${BUBBLEWRAP_CONFIG}`);
}

function keystorePasswords() {
  const envPath = join(TWA_DIR, ".keystore-env");
  if (existsSync(envPath)) {
    const text = readFileSync(envPath, "utf8");
    const store = text.match(/^BUBBLEWRAP_KEYSTORE_PASSWORD=(.+)$/m)?.[1];
    const key = text.match(/^BUBBLEWRAP_KEY_PASSWORD=(.+)$/m)?.[1];
    if (store && key) return { store, key, envPath };
  }
  const pass = randomBytes(18).toString("base64url");
  writeFileSync(
    envPath,
    `# Auto-generated — keep secret, do not commit\nBUBBLEWRAP_KEYSTORE_PASSWORD=${pass}\nBUBBLEWRAP_KEY_PASSWORD=${pass}\n`,
    "utf8"
  );
  console.log(`✓ Keystore passwords saved → twa/.keystore-env`);
  return { store: pass, key: pass, envPath };
}

async function generateChecksum(manifestFile, targetDirectory) {
  const manifestContents = await import("fs").then((fs) => fs.promises.readFile(manifestFile));
  const sum = createHash("sha1").update(manifestContents).digest("hex");
  await import("fs").then((fs) =>
    fs.promises.writeFile(join(targetDirectory, "manifest-checksum.txt"), sum)
  );
}

async function main() {
  if (!existsSync(ANDROID_SDK)) {
    throw new Error(`Android SDK not found at ${ANDROID_SDK}. Install Android Studio first.`);
  }

  const jdkPath = await ensureJdk17();
  ensureBubblewrapConfig(jdkPath);

  const manifestPath = join(TWA_DIR, "twa-manifest.json");
  const keystorePath = join(TWA_DIR, "android.keystore");

  if (existsSync(manifestPath) && existsSync(keystorePath)) {
    console.log("✓ TWA already initialized — nothing to do");
    return;
  }

  console.log(`\nFetching web manifest: ${projectConfig.manifestUrl}`);
  let twaManifest = await core.TwaManifest.fromWebManifest(projectConfig.manifestUrl);

  twaManifest.host = projectConfig.host;
  twaManifest.startUrl = projectConfig.startUrl;
  twaManifest.name = projectConfig.name;
  twaManifest.launcherName = projectConfig.launcherName;
  twaManifest.packageId = projectConfig.packageId;
  twaManifest.display = "standalone";
  twaManifest.orientation = "portrait-primary";
  twaManifest.signingKey.path = keystorePath;
  twaManifest.signingKey.alias = "android";

  await twaManifest.saveToFile(manifestPath);
  console.log(`✓ Wrote ${manifestPath}`);

  const twaGenerator = new core.TwaGenerator();
  console.log("Generating Android project...");
  const log = new core.BufferedLog(new core.ConsoleLog("TWA"));
  await twaGenerator.createTwaProject(TWA_DIR, twaManifest, log);
  log.flush();
  await generateChecksum(manifestPath, TWA_DIR);

  const { store, key } = keystorePasswords();
  if (!existsSync(keystorePath)) {
    const bubbleConfig = new core.Config(jdkPath, ANDROID_SDK);
    const jdkHelper = new core.JdkHelper(process, bubbleConfig);
    const keytool = new core.KeyTool(jdkHelper);
    await keytool.createSigningKey({
      fullName: "Wiper Finder",
      organizationalUnit: "Dev",
      organization: "Wiper Finder",
      country: "KR",
      password: store,
      keypassword: key,
      alias: "android",
      path: keystorePath,
    });
    console.log(`✓ Created ${keystorePath}`);
  }

  console.log("\n✓ TWA bootstrap complete");
  console.log("Next:");
  console.log("  source scripts/twa-env.sh");
  console.log("  node scripts/update-assetlinks.mjs --from-twa");
  console.log("  node scripts/build.mjs && wrangler pages deploy dist --project-name=wiper-finder");
  console.log("  node scripts/build-twa.mjs");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
