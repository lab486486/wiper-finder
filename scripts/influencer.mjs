/**
 * Influencer storefront catalog.
 * data/influencer-products.csv is the source the site build reads.
 * scripts/sync-influencer.mjs refreshes that file from the storefront page.
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";

export const CATALOG_FILE = "data/influencer-products.csv";
export const PRODUCT_LIMIT = 6;

const COLUMNS = ["url", "driver_mm", "passenger_mm", "name", "price", "image", "rocket", "free_shipping"];

export function sizesFromTitle(name) {
  const match = String(name || "")
    .trim()
    .match(/^(\d{3,4})(?:\s*[xX×]\s*\d+)?(?:\s+(\d{3,4}))?/);
  if (!match) return { driver_mm: "", passenger_mm: "" };
  const driver_mm = match[1];
  return { driver_mm, passenger_mm: match[2] || driver_mm };
}

export function largerThumb(url) {
  return String(url || "").replace("/212x212ex/", "/492x492ex/");
}

export function parseStorefrontHtml(html) {
  const marker = '\\"list\\":[';
  const at = html.indexOf(marker);
  if (at < 0) throw new Error("Influencer page has no product list");
  const start = at + '\\"list\\":'.length;
  let depth = 0;
  let end = -1;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (ch === "\\") {
      i++;
      continue;
    }
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) throw new Error("Influencer product list was cut off");
  const decoded = JSON.parse(`"${html.slice(start, end + 1)}"`);
  const list = JSON.parse(decoded);
  return list.filter((item) => item?.landingUrl && item.valid !== false && !item.isSoldOut).map((item) => {
    const name = String(item.customName || item.title || "").trim();
    const sizes = sizesFromTitle(name);
    const delivery = Array.isArray(item.deliveryChargeType) ? item.deliveryChargeType : [];
    return {
      url: item.landingUrl,
      ...sizes,
      name,
      price: Number(item.salesPrice?.units || 0),
      image: largerThumb(item.image || ""),
      rocket: delivery.includes("ROCKET") ? "1" : "0",
      free_shipping: item.isFreeShipping || delivery.includes("FREE") ? "1" : "0",
    };
  });
}

export function toCsv(rows) {
  const lines = [COLUMNS.join(",")];
  for (const row of rows) {
    lines.push(COLUMNS.map((key) => csvField(row[key])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

export function parseCatalogCsv(text) {
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const [header, ...body] = rows;
  const index = Object.fromEntries(header.map((name, i) => [name.trim(), i]));
  return body
    .map((cells) => {
      const get = (key) => (cells[index[key]] ?? "").trim();
      return {
        url: get("url"),
        driver_mm: get("driver_mm"),
        passenger_mm: get("passenger_mm"),
        name: get("name"),
        price: Number(get("price") || 0),
        image: get("image"),
        rocket: get("rocket") === "1",
        freeShipping: get("free_shipping") === "1",
      };
    })
    .filter((row) => row.url && row.name);
}

export function loadInfluencerCatalog(root) {
  const sitePath = join(root, "data/site.json");
  const site = existsSync(sitePath) ? JSON.parse(readFileSync(sitePath, "utf8")) : {};
  const csvPath = join(root, CATALOG_FILE);
  const products = existsSync(csvPath) ? parseCatalogCsv(readFileSync(csvPath, "utf8")) : [];
  return {
    homeUrl: site.influencerHome || "https://influencers.coupang.com/s/england",
    products,
  };
}

export function influencerProductsBySize(catalog, generations, homeUrl) {
  const order = shuffle(catalog);
  const map = {};
  for (const gen of generations) {
    const key = `${gen.driver_mm}-${gen.passenger_mm}`;
    if (map[key]) continue;
    const driver = String(gen.driver_mm || "");
    const passenger = String(gen.passenger_mm || "");
    const matched = order.filter(
      (item) => item.driver_mm && item.passenger_mm && item.driver_mm === driver && item.passenger_mm === passenger
    );
    const rest = order.filter((item) => !matched.includes(item));
    const picked = [...matched, ...rest].slice(0, PRODUCT_LIMIT);
    map[key] = {
      products: picked.map(toCard),
      searchMoreUrl: homeUrl,
      matchedCount: Math.min(matched.length, picked.length),
    };
  }
  return map;
}

function toCard(item) {
  return {
    url: item.url,
    name: item.name,
    price: item.price,
    image: item.image,
    rocket: Boolean(item.rocket),
    freeShipping: Boolean(item.freeShipping),
  };
}

function shuffle(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function csvField(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}
