#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import {
  renderBrandPage,
  renderGenerationPage,
  renderModelPage,
  renderMyCarsPage,
  renderResultPage,
  renderWarningDetailPage,
  renderWarningListPage,
  renderGuideListPage,
  renderGuidePage,
  renderPrivacyPage,
  resolvePowerBadge,
} from "./render.mjs";
import { GUIDES } from "./guides.mjs";
import { loadProductsBySize, sizeCacheKey } from "./coupang.mjs";
import { buildLlmsTxt, buildRobotsTxt, buildRssXml, buildSitemapXml, collectRssItems, normalizeSiteUrl } from "./seo.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadEnv() {
  const envPath = join(ROOT, ".env");
  const env = { ...process.env };
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
  }
  return env;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const obj = {};
    headers.forEach((h, idx) => {
      if (h) obj[h] = (cells[idx] ?? "").trim();
    });
    return obj;
  });
}

async function fetchSheet(sheetId, tab) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${tab}: ${res.status}`);
  return parseCsv(await res.text());
}

function normalizeBasePath(raw) {
  if (!raw) return "";
  let p = raw.trim();
  if (!p.startsWith("/")) p = `/${p}`;
  return p.replace(/\/$/, "");
}

function loadGenesisCatalog() {
  const path = join(ROOT, "data/genesis.json");
  if (!existsSync(path)) return { brands: [], models: [], generations: [] };
  const data = JSON.parse(readFileSync(path, "utf8"));
  const crossTitle = "사이드미러 발수코팅제";
  const crossUrl = "https://link.coupang.com/a/e74nXxT7me";
  const generations = (data.generations || []).map((row) => ({
    rear_mm: "",
    rear_note: "",
    coupang_keyword: "",
    product_title_front: "",
    coupang_url_front: "",
    product_title_rear: "",
    coupang_url_rear: "",
    cross_title: crossTitle,
    cross_url: crossUrl,
    verified: "TRUE",
    ...row,
  }));
  return {
    brands: data.brands || [],
    models: data.models || [],
    generations,
  };
}

function mergeById(primary, extra) {
  const seen = new Set(primary.map((row) => row.id).filter(Boolean));
  const out = [...primary];
  for (const row of extra) {
    if (!row.id || seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

function enrichGeneration(row, carsDir) {
  const driver = row.driver_mm;
  const passenger = row.passenger_mm;
  const rearType = row.rear_type || "none";

  const product_title_front =
    row.product_title_front ||
    `가성비 ${driver}+${passenger}mm 세트`;

  const product_title_rear =
    row.product_title_rear ||
    (rearType !== "none" ? "후방 전용 와이퍼" : "");

  let rearDisplay = { value: "—", unit: "" };
  let rearMessage = "";

  if (rearType === "none") {
    rearMessage = row.rear_note || "이 차종은 후방 와이퍼가 없습니다.";
    rearDisplay = { value: "없음", unit: "" };
  } else if (rearType === "dedicated") {
    rearDisplay = { value: "전용", unit: "" };
    if (row.rear_note) rearMessage = row.rear_note;
  } else if (rearType === "size") {
    rearDisplay = { value: row.rear_mm, unit: "mm" };
    if (row.rear_note) rearMessage = row.rear_note;
  }

  const requestedImage = (row.image || `${row.id}.jpg`).trim();
  const imageFile =
    carsDir && existsSync(join(carsDir, requestedImage)) ? requestedImage : "";
  const powerBadge = resolvePowerBadge(row.hybrid);

  return {
    ...row,
    product_title_front,
    product_title_rear,
    rearDisplay,
    rearMessage,
    imageFile,
    powerBadge,
    coupang_keyword: row.coupang_keyword || `불스원 ${driver} ${passenger}`,
  };
}

function dedupeById(rows, label) {
  const seen = new Set();
  const out = [];
  const dups = [];
  for (const row of rows) {
    if (!row.id) continue;
    if (seen.has(row.id)) {
      dups.push(row.id);
      continue;
    }
    seen.add(row.id);
    out.push(row);
  }
  if (dups.length) {
    console.warn(`⚠ ${label}: skipped duplicate ids: ${[...new Set(dups)].join(", ")}`);
  }
  return out;
}

function writeHtml(path, html) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html, "utf8");
}

function copyDirFlat(srcDir, destDir) {
  mkdirSync(destDir, { recursive: true });
  if (!existsSync(srcDir)) return 0;
  let count = 0;
  for (const name of readdirSync(srcDir)) {
    if (name.startsWith(".")) continue;
    cpSync(join(srcDir, name), join(destDir, name));
    count++;
  }
  return count;
}

function copyImages(srcDir, destDir) {
  mkdirSync(destDir, { recursive: true });
  if (!existsSync(srcDir)) return 0;
  let count = 0;
  for (const name of readdirSync(srcDir)) {
    if (name.startsWith(".")) continue;
    cpSync(join(srcDir, name), join(destDir, name));
    count++;
  }
  return count;
}

function enrichWarning(row, iconsDir) {
  const iconFile = row.icon || `${row.id}.png`;
  const hasIcon = existsSync(join(iconsDir, iconFile));
  return {
    ...row,
    iconFile,
    hasIcon,
  };
}

async function loadWarnings(sheetId, iconsDir) {
  try {
    const raw = await fetchSheet(sheetId, "warning_lights");
    const rows = raw.filter((r) => r.id);
    if (rows.length) {
      console.log(`Loaded ${rows.length} warning light(s) from sheet`);
      return rows.map((r) => enrichWarning(r, iconsDir));
    }
  } catch {
    console.log("warning_lights tab not found, using data/warning-lights.json");
  }
  const jsonPath = join(ROOT, "data/warning-lights.json");
  return JSON.parse(readFileSync(jsonPath, "utf8")).map((r) => enrichWarning(r, iconsDir));
}

async function main() {
  const env = loadEnv();
  const refreshCoupang = process.argv.includes("--refresh-coupang");
  const sheetId = env.SHEET_ID || env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    console.error("Missing SHEET_ID. Set it in .env or as a build environment variable.");
    process.exit(1);
  }

  const base = normalizeBasePath(env.BASE_PATH || "");
  const siteUrl = normalizeSiteUrl(env.SITE_URL);
  const dist = join(ROOT, "dist");
  const imageBase = `${base}/images/cars/`;
  const warningImageBase = `${base}/images/warnings/`;
  const warningsIconsDir = join(ROOT, "public/images/warnings");

  console.log("Fetching Google Sheet...");
  const [sheetBrands, sheetModels, sheetGenerations] = await Promise.all([
    fetchSheet(sheetId, "brands"),
    fetchSheet(sheetId, "models"),
    fetchSheet(sheetId, "generations"),
  ]);
  const genesis = loadGenesisCatalog();
  const brands = mergeById(sheetBrands, genesis.brands);
  const models = mergeById(sheetModels, genesis.models);
  const generationsRaw = mergeById(sheetGenerations, genesis.generations);
  if (genesis.generations.length) {
    console.log(`Merged Genesis catalog: ${genesis.models.length} models, ${genesis.generations.length} generations`);
  }

  const carsDir = join(ROOT, "public/images/cars");
  const generations = dedupeById(generationsRaw, "generations").map((row) =>
    enrichGeneration(row, carsDir)
  );
  const warnings = (await loadWarnings(sheetId, warningsIconsDir)).sort(
    (a, b) => Number(a.sort) - Number(b.sort)
  );

  brands.sort((a, b) => Number(a.sort) - Number(b.sort));

  const modelsByBrand = {};
  for (const m of models) {
    if (!modelsByBrand[m.brand_id]) modelsByBrand[m.brand_id] = [];
    modelsByBrand[m.brand_id].push(m);
  }
  for (const list of Object.values(modelsByBrand)) {
    list.sort((a, b) => Number(a.sort) - Number(b.sort));
  }

  const gensByModel = {};
  for (const g of generations) {
    if (!gensByModel[g.model_id]) gensByModel[g.model_id] = [];
    gensByModel[g.model_id].push(g);
  }
  for (const list of Object.values(gensByModel)) {
    list.sort((a, b) => Number(a.sort) - Number(b.sort));
  }

  console.log("Loading Coupang products...");
  const productsBySize = await loadProductsBySize({
    generations,
    root: ROOT,
    env,
    refresh: refreshCoupang,
  });

  if (existsSync(dist)) rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });

  const ogGen = spawnSync("node", [join(__dirname, "generate-og-image.mjs")], { cwd: ROOT, stdio: "inherit" });
  if (ogGen.status !== 0) process.exit(ogGen.status ?? 1);

  const imgCount = copyImages(join(ROOT, "public/images/cars"), join(dist, "images/cars"));
  console.log(`Copied ${imgCount} image(s) to dist/images/cars/`);

  const ogShare = join(ROOT, "public/images/og-share.webp");
  if (existsSync(ogShare)) {
    mkdirSync(join(dist, "images"), { recursive: true });
    cpSync(ogShare, join(dist, "images/og-share.webp"));
    console.log("Copied OG share image to dist/images/og-share.webp");
  }

  const warnImgCount = copyImages(join(ROOT, "public/images/warnings"), join(dist, "images/warnings"));
  if (warnImgCount) console.log(`Copied ${warnImgCount} warning icon(s) to dist/images/warnings/`);

  const jsCount = copyDirFlat(join(ROOT, "public/js"), join(dist, "js"));
  console.log(`Copied ${jsCount} script(s) to dist/js/`);

  for (const name of ["favicon.png", "apple-touch-icon.png", "manifest.json"]) {
    const src = join(ROOT, "public", name);
    if (existsSync(src)) {
      cpSync(src, join(dist, name));
    }
  }
  console.log("Copied favicon(s) and manifest to dist/");

  const iconsCount = copyDirFlat(join(ROOT, "public/icons"), join(dist, "icons"));
  if (iconsCount) console.log(`Copied ${iconsCount} PWA icon(s) to dist/icons/`);

  const assetlinksSrc = join(ROOT, "public/.well-known/assetlinks.json");
  if (existsSync(assetlinksSrc)) {
    const raw = readFileSync(assetlinksSrc, "utf8");
    if (raw.includes("REPLACE_WITH_SHA256")) {
      console.warn("⚠ assetlinks.json still has placeholder — skip deploy until TWA keystore is ready");
    } else {
      const wellKnown = join(dist, ".well-known");
      mkdirSync(wellKnown, { recursive: true });
      cpSync(assetlinksSrc, join(wellKnown, "assetlinks.json"));
      console.log("Copied assetlinks.json to dist/.well-known/");
    }
  }

  const sitemapUrls = [
    { path: "/", priority: "1.0" },
    { path: "/my/", priority: "0.4" },
    { path: "/guide/", priority: "0.75" },
    { path: "/privacy/", priority: "0.3" },
    { path: "/warnings/", priority: "0.7" },
  ];

  writeHtml(
    join(dist, "index.html"),
    renderBrandPage({ base, siteUrl, brands, modelsByBrand })
  );
  writeHtml(join(dist, "my", "index.html"), renderMyCarsPage({ base, siteUrl }));
  writeHtml(join(dist, "guide", "index.html"), renderGuideListPage({ base, siteUrl }));
  writeHtml(join(dist, "privacy", "index.html"), renderPrivacyPage({ base, siteUrl }));
  writeHtml(
    join(dist, "warnings", "index.html"),
    renderWarningListPage({ base, siteUrl, warnings, imageBase: warningImageBase })
  );

  let pageCount = 3 + 1 + 1;
  for (const guide of GUIDES) {
    sitemapUrls.push({ path: `/guide/${guide.id}/`, priority: "0.65" });
    writeHtml(
      join(dist, "guide", guide.id, "index.html"),
      renderGuidePage({ base, siteUrl, guide })
    );
    pageCount++;
  }
  for (const w of warnings) {
    sitemapUrls.push({ path: `/warnings/${w.id}/`, priority: "0.5" });
    writeHtml(
      join(dist, "warnings", w.id, "index.html"),
      renderWarningDetailPage({ base, siteUrl, warning: w, imageBase: warningImageBase })
    );
    pageCount++;
  }

  for (const brand of brands) {
    sitemapUrls.push({ path: `/${brand.id}/`, priority: "0.8" });
    const brandModels = (modelsByBrand[brand.id] || []).map((m) => ({
      ...m,
      genCount: (gensByModel[m.id] || []).length,
    }));

    writeHtml(
      join(dist, brand.id, "index.html"),
      renderModelPage({ base, siteUrl, brand, models: brandModels })
    );
    pageCount++;

    for (const model of brandModels) {
      sitemapUrls.push({ path: `/${brand.id}/${model.id}/`, priority: "0.75" });
      const gens = gensByModel[model.id] || [];
      writeHtml(
        join(dist, brand.id, model.id, "index.html"),
        renderGenerationPage({ base, siteUrl, brand, model, generations: gens, imageBase })
      );
      pageCount++;

      for (const gen of gens) {
        sitemapUrls.push({
          path: `/${brand.id}/${model.id}/${gen.id}/`,
          priority: "0.9",
        });
        const productsEntry = productsBySize[sizeCacheKey(gen.driver_mm, gen.passenger_mm)];
        writeHtml(
          join(dist, brand.id, model.id, `${gen.id}`, "index.html"),
          renderResultPage({ base, siteUrl, brand, model, gen, productsEntry, imageBase })
        );
        pageCount++;
      }
    }
  }

  writeFileSync(join(dist, "sitemap.xml"), buildSitemapXml(siteUrl, base, sitemapUrls), "utf8");
  writeFileSync(join(dist, "robots.txt"), buildRobotsTxt(siteUrl, base), "utf8");
  const rssItems = collectRssItems({ brands, modelsByBrand, gensByModel, warnings, guides: GUIDES });
  writeFileSync(join(dist, "rss.xml"), buildRssXml(siteUrl, base, rssItems), "utf8");
  writeFileSync(join(dist, "llms.txt"), buildLlmsTxt(siteUrl, base), "utf8");

  writeFileSync(
    join(dist, "data.json"),
    JSON.stringify({ brands, models, generations, warnings }, null, 2),
    "utf8"
  );

  console.log(`✓ Built ${pageCount} pages → dist/`);
  console.log(`  Brands: ${brands.length}, Models: ${models.length}, Generations: ${generations.length}, Warnings: ${warnings.length}`);
  console.log(`  Base path: "${base || "/"}"`);
  console.log(`  Site URL: ${siteUrl}`);
  console.log(`  Sitemap: ${sitemapUrls.length} URLs`);
  console.log(`  RSS: ${rssItems.length} items`);
  console.log("\nDeploy: upload dist/ contents to Cloudflare Pages or ChemiCloud");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
