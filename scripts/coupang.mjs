import crypto from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DOMAIN = "https://api-gateway.coupang.com";
const SEARCH_PATH = "/v2/providers/affiliate_open_api/apis/openapi/products/search";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_FETCH_PER_BUILD = 8;
export const PRODUCT_LIMIT = 6;

function signedDate() {
  return new Date().toISOString().substr(2, 17).replace(/:/gi, "").replace(/-/gi, "") + "Z";
}

function generateHmac(method, path, query, secretKey, accessKey) {
  const date = signedDate();
  const message = date + method + path + query;
  const signature = crypto.createHmac("sha256", secretKey).update(message).digest("hex");
  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${date}, signature=${signature}`;
}

function sizeCacheKey(driver, passenger) {
  return `${driver}-${passenger}`;
}

function defaultKeyword(driver, passenger) {
  return `불스원 ${driver} ${passenger}`;
}

function rankProducts(products, driver, passenger) {
  const score = (name) => {
    if (name.includes(`${driver}mm+${passenger}mm`) || name.includes(`${driver}+${passenger}`)) return 20;
    if (name.includes(`${driver}mm`) && name.includes(`${passenger}mm`)) return 15;
    if (name.includes(`${driver}mm`) || name.includes(`${passenger}mm`)) return 5;
    return 0;
  };
  return [...products].sort((a, b) => score(b.name) - score(a.name));
}

function normalizeProduct(item) {
  return {
    id: String(item.productId ?? item.product_id ?? ""),
    name: item.productName ?? item.product_name ?? "",
    price: Number(item.productPrice ?? item.product_price ?? 0),
    image: item.productImage ?? item.product_image ?? "",
    url: item.productUrl ?? item.product_url ?? "",
    rocket: Boolean(item.isRocket ?? item.is_rocket),
    freeShipping: Boolean(item.isFreeShipping ?? item.is_free_shipping),
  };
}

export async function searchCoupangProducts({ keyword, limit = PRODUCT_LIMIT, accessKey, secretKey, subId }) {
  const params = new URLSearchParams({ keyword, limit: String(limit) });
  if (subId) params.set("subId", subId);
  const query = params.toString();
  const auth = generateHmac("GET", SEARCH_PATH, query, secretKey, accessKey);

  const res = await fetch(`${DOMAIN}${SEARCH_PATH}?${query}`, {
    headers: {
      Authorization: auth,
      "Content-Type": "application/json;charset=UTF-8",
    },
  });

  const body = await res.json();
  if (!res.ok) {
    const msg = body?.message || body?.rMessage || res.statusText;
    throw new Error(`Coupang API ${res.status}: ${msg}`);
  }
  if (body.rCode && body.rCode !== "0" && body.rCode !== 0) {
    throw new Error(`Coupang API error ${body.rCode}: ${body.rMessage || "unknown"}`);
  }

  const list = body?.data?.productData ?? body?.data ?? [];
  return (Array.isArray(list) ? list : []).map(normalizeProduct).filter((p) => p.url && p.name);
}

function readCache(cachePath) {
  if (!existsSync(cachePath)) return null;
  try {
    return JSON.parse(readFileSync(cachePath, "utf8"));
  } catch {
    return null;
  }
}

function isFresh(entry, ttlMs) {
  if (!entry?.fetchedAt) return false;
  return Date.now() - new Date(entry.fetchedAt).getTime() < ttlMs;
}

function cacheValid(cached, keyword, refresh) {
  if (refresh) return false;
  if (!cached?.products?.length) return false;
  if (cached.keyword !== keyword) return false;
  if (cached.products.length < PRODUCT_LIMIT) return false;
  return isFresh(cached, CACHE_TTL_MS);
}

export async function loadProductsBySize({ generations, root, env, refresh = false }) {
  const accessKey = env.COUPANG_ACCESS_KEY;
  const secretKey = env.COUPANG_SECRET_KEY;
  const subId = env.COUPANG_SUB_ID || "";
  const cacheDir = join(root, "data/products");
  mkdirSync(cacheDir, { recursive: true });

  const unique = new Map();
  for (const gen of generations) {
    const key = sizeCacheKey(gen.driver_mm, gen.passenger_mm);
    if (!unique.has(key)) {
      unique.set(key, gen.coupang_keyword || defaultKeyword(gen.driver_mm, gen.passenger_mm));
    }
  }

  const productsBySize = {};
  let fetched = 0;
  let fromCache = 0;
  const missing = [];

  for (const [key, keyword] of unique) {
    const cachePath = join(cacheDir, `${key}.json`);
    const cached = readCache(cachePath);
    const searchMoreUrl = `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`;

    if (cacheValid(cached, keyword, refresh)) {
      productsBySize[key] = { ...cached, searchMoreUrl: cached.searchMoreUrl || searchMoreUrl };
      fromCache++;
      continue;
    }

    if (!accessKey || !secretKey) {
      if (cached?.products?.length && cached.keyword === keyword) {
        productsBySize[key] = { ...cached, searchMoreUrl: cached.searchMoreUrl || searchMoreUrl };
        fromCache++;
      } else {
        missing.push(key);
      }
      continue;
    }

    if (fetched >= MAX_FETCH_PER_BUILD) {
      if (cached?.products?.length && cached.keyword === keyword) {
        productsBySize[key] = { ...cached, searchMoreUrl: cached.searchMoreUrl || searchMoreUrl };
        fromCache++;
      } else {
        missing.push(key);
      }
      continue;
    }

    try {
      console.log(`  Coupang search: ${keyword} (${key})`);
      const products = rankProducts(
        await searchCoupangProducts({
          keyword,
          limit: PRODUCT_LIMIT,
          accessKey,
          secretKey,
          subId,
        }),
        ...key.split("-")
      );
      const entry = {
        sizeKey: key,
        keyword,
        fetchedAt: new Date().toISOString(),
        products,
        searchMoreUrl,
      };
      writeFileSync(cachePath, JSON.stringify(entry, null, 2), "utf8");
      productsBySize[key] = entry;
      fetched++;
      if (fetched < MAX_FETCH_PER_BUILD) {
        await new Promise((r) => setTimeout(r, 1200));
      }
    } catch (err) {
      console.warn(`  ⚠ Coupang ${key}: ${err.message}`);
      if (cached?.products?.length && cached.keyword === keyword) {
        productsBySize[key] = { ...cached, searchMoreUrl: cached.searchMoreUrl || searchMoreUrl };
        fromCache++;
      } else {
        missing.push(key);
      }
    }
  }

  console.log(`Products: ${fromCache} from cache, ${fetched} fetched, ${missing.length} missing`);
  if (missing.length) {
    console.log(`  Missing sizes (re-run build): ${missing.join(", ")}`);
  }

  return productsBySize;
}

export { sizeCacheKey, defaultKeyword };
