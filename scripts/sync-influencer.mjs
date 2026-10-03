#!/usr/bin/env node
/**
 * Refresh data/influencer-products.csv from the influencer storefront.
 * The site build reads the CSV. It does not call Coupang during deploy.
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { CATALOG_FILE, parseStorefrontHtml, toCsv } from "./influencer.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = JSON.parse(readFileSync(join(ROOT, "data/site.json"), "utf8"));
const home = site.influencerHome;
if (!home) {
  console.error("Missing influencerHome in data/site.json");
  process.exit(1);
}

const res = await fetch(home, {
  headers: {
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    accept: "text/html",
  },
});
if (!res.ok) {
  console.error(`Failed to fetch ${home}: ${res.status}`);
  process.exit(1);
}

const products = parseStorefrontHtml(await res.text());
const dest = join(ROOT, CATALOG_FILE);
writeFileSync(dest, toCsv(products), "utf8");

const paired = products.filter((item) => item.driver_mm && item.passenger_mm).length;
console.log(`✓ ${products.length} products → ${CATALOG_FILE}`);
console.log(`  ${paired} with driver+passenger size, ${products.length - paired} without a pair`);
