import crypto from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DOMAIN = "https://api-gateway.coupang.com";
const SEARCH_PATH = "/v2/providers/affiliate_open_api/apis/openapi/products/search";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
/** Official search API quota is 10/hour; keep headroom. */
export const HOURLY_SEARCH_CAP = 6;
/** Per-build ceiling; never exceeds remaining hourly quota. */
export const MAX_FETCH_PER_BUILD = 6;
export const PRODUCT_LIMIT = 6;
export const RATE_LIMIT_FILE = "data/coupang-rate-limit.json";
const FETCH_GAP_MS = 1500;
const WINDOW_MS = 60 * 60 * 1000;

export class CoupangRateLimitError extends Error {
  constructor(message, { status, rCode } = {}) {
    super(message);
    this.name = "CoupangRateLimitError";
    this.status = status;
    this.rCode = rCode;
  }
}

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

export function isRateLimitResponse({ status, rCode, message } = {}) {
  const code = String(rCode ?? "");
  const msg = String(message ?? "");
  if (Number(status) === 403 || code === "403") return true;
  return /forbidden|rate\s*limit|quota|제한|초과|too many/i.test(msg);
}

function rateLimitPath(root) {
  return join(root, RATE_LIMIT_FILE);
}

function readRateLimitState(root) {
  const path = rateLimitPath(root);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function writeRateLimitState(root, state) {
  const path = rateLimitPath(root);
  mkdirSync(join(root, "data"), { recursive: true });
  writeFileSync(path, JSON.stringify(state, null, 2), "utf8");
}

/** Returns remaining search-API calls allowed in the current 1-hour window. */
export function getHourlySearchBudget(root, { now = Date.now(), cap = HOURLY_SEARCH_CAP } = {}) {
  const state = readRateLimitState(root);
  if (state?.hardStopped) {
    return {
      remaining: 0,
      used: Number(state.searchCount) || 0,
      cap,
      hardStopped: true,
      windowStartedAt: state.windowStartedAt || null,
      reason: state.hardStopReason || "hard-stopped",
    };
  }
  const started = state?.windowStartedAt ? new Date(state.windowStartedAt).getTime() : 0;
  if (!started || now - started >= WINDOW_MS) {
    return { remaining: cap, used: 0, cap, hardStopped: false, windowStartedAt: null };
  }
  const used = Number(state.searchCount) || 0;
  return {
    remaining: Math.max(0, cap - used),
    used,
    cap,
    hardStopped: false,
    windowStartedAt: state.windowStartedAt,
  };
}

function reserveSearchSlot(root, { now = Date.now(), cap = HOURLY_SEARCH_CAP } = {}) {
  const budget = getHourlySearchBudget(root, { now, cap });
  if (budget.hardStopped || budget.remaining <= 0) {
    return { ok: false, budget };
  }

  const state = readRateLimitState(root);
  const started = state?.windowStartedAt ? new Date(state.windowStartedAt).getTime() : 0;
  const inWindow = started && now - started < WINDOW_MS;
  const next = {
    windowStartedAt: inWindow ? state.windowStartedAt : new Date(now).toISOString(),
    searchCount: inWindow ? (Number(state.searchCount) || 0) + 1 : 1,
    hardStopped: false,
    updatedAt: new Date(now).toISOString(),
  };
  writeRateLimitState(root, next);
  return { ok: true, budget: getHourlySearchBudget(root, { now, cap }) };
}

function markHardStop(root, reason) {
  const prev = readRateLimitState(root) || {};
  writeRateLimitState(root, {
    ...prev,
    windowStartedAt: prev.windowStartedAt || new Date().toISOString(),
    searchCount: Number(prev.searchCount) || 0,
    hardStopped: true,
    hardStopReason: reason,
    hardStoppedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
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

  let body = {};
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  const rCode = body?.rCode ?? body?.code;
  const message = body?.message || body?.rMessage || res.statusText;
  if (isRateLimitResponse({ status: res.status, rCode, message })) {
    throw new CoupangRateLimitError(`Coupang search rate limited: ${message || res.status}`, {
      status: res.status,
      rCode,
    });
  }
  if (!res.ok) {
    throw new Error(`Coupang API ${res.status}: ${message}`);
  }
  if (rCode && rCode !== "0" && rCode !== 0) {
    throw new Error(`Coupang API error ${rCode}: ${message || "unknown"}`);
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

function useStaleOrMissing(productsBySize, key, cached, keyword, searchMoreUrl, missing, fromCacheRef) {
  if (cached?.products?.length && cached.keyword === keyword) {
    productsBySize[key] = { ...cached, searchMoreUrl: cached.searchMoreUrl || searchMoreUrl };
    fromCacheRef.value++;
  } else {
    missing.push(key);
  }
}

/**
 * Build-time only: unique size keys from generations → cache files → static product URLs.
 * Never call from request handlers. Hourly hard cap + 403 hard-stop apply even with refresh=true.
 */
export async function loadProductsBySize({ generations, root, env, refresh = false }) {
  const accessKey = env.COUPANG_ACCESS_KEY;
  const secretKey = env.COUPANG_SECRET_KEY;
  const subId = env.COUPANG_SUB_ID || "";
  const hourlyCap = Math.min(
    HOURLY_SEARCH_CAP,
    Math.max(1, Number(env.COUPANG_MAX_SEARCH_PER_HOUR) || HOURLY_SEARCH_CAP)
  );
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
  const fromCacheRef = { value: 0 };
  const missing = [];
  let stopped = false;
  let stopReason = "";

  const opening = getHourlySearchBudget(root, { cap: hourlyCap });
  console.log(
    `Coupang search budget: ${opening.remaining}/${hourlyCap} remaining this hour` +
      (opening.hardStopped ? ` (HARD STOP: ${opening.reason})` : "") +
      (refresh ? " [refresh requested; hourly cap still enforced]" : "")
  );
  console.log(
    `Unique size keys: ${unique.size} (cache key "{driver}-{passenger}", e.g. 650-450 → "불스원 650 450")`
  );

  for (const [key, keyword] of unique) {
    const cachePath = join(cacheDir, `${key}.json`);
    const cached = readCache(cachePath);
    const searchMoreUrl = `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`;

    if (cacheValid(cached, keyword, refresh)) {
      productsBySize[key] = { ...cached, searchMoreUrl: cached.searchMoreUrl || searchMoreUrl };
      fromCacheRef.value++;
      continue;
    }

    if (!accessKey || !secretKey) {
      useStaleOrMissing(productsBySize, key, cached, keyword, searchMoreUrl, missing, fromCacheRef);
      continue;
    }

    if (stopped || fetched >= MAX_FETCH_PER_BUILD) {
      useStaleOrMissing(productsBySize, key, cached, keyword, searchMoreUrl, missing, fromCacheRef);
      continue;
    }

    const slot = reserveSearchSlot(root, { cap: hourlyCap });
    if (!slot.ok) {
      stopped = true;
      stopReason = slot.budget.hardStopped
        ? `hard-stop (${slot.budget.reason})`
        : `hourly cap ${hourlyCap} reached`;
      console.warn(`  ⛔ Coupang search stopped: ${stopReason}. Remaining sizes deferred.`);
      useStaleOrMissing(productsBySize, key, cached, keyword, searchMoreUrl, missing, fromCacheRef);
      continue;
    }

    try {
      console.log(`  Coupang search: ${keyword} (${key}) [${slot.budget.used}/${hourlyCap} this hour]`);
      const [driver, passenger] = key.split("-");
      const products = rankProducts(
        await searchCoupangProducts({
          keyword,
          limit: PRODUCT_LIMIT,
          accessKey,
          secretKey,
          subId,
        }),
        driver,
        passenger
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
        await new Promise((r) => setTimeout(r, FETCH_GAP_MS));
      }
    } catch (err) {
      if (err instanceof CoupangRateLimitError || isRateLimitResponse({ message: err.message })) {
        markHardStop(root, err.message);
        stopped = true;
        stopReason = err.message;
        console.error(`  ⛔ Coupang HARD STOP (no further search calls): ${err.message}`);
      } else {
        console.warn(`  ⚠ Coupang ${key}: ${err.message}`);
      }
      useStaleOrMissing(productsBySize, key, cached, keyword, searchMoreUrl, missing, fromCacheRef);
      // On hard-stop, remaining iterations only serve cache / mark missing (no API).
    }
  }

  console.log(
    `Products: ${fromCacheRef.value} from cache, ${fetched} fetched, ${missing.length} missing` +
      (stopped ? ` (stopped: ${stopReason})` : "")
  );
  if (missing.length) {
    console.log(`  Deferred/missing sizes (re-run build later this/next hour): ${missing.join(", ")}`);
  }

  return productsBySize;
}

export { sizeCacheKey, defaultKeyword };
