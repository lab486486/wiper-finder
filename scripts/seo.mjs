export const SITE_NAME = "자동차 와이퍼 사이즈 검색기";
/** Google 검색·OG에 노출할 사이트 브랜드명 (도메인 대신) */
export const SITE_BRAND_NAME = SITE_NAME;
export const SITE_SHORT_NAME = "와이퍼 검색";
export const SITE_ALTERNATE_NAMES = [
  SITE_SHORT_NAME,
  "WiperFinder",
  "Wiper Finder",
  "wiper-finder.com",
];
export const WARNING_LIST_TITLE = "자동차 경고등 의미, 종류, 조치방법";
export const SITE_TAGLINE = "현대·기아·제네시스 차종별 와이퍼 사이즈, 한 번에";
export const DEFAULT_OG_IMAGE_PATH = "/images/og-share.webp";
export const DEFAULT_OG_IMAGE_ALT = "자동차 와이퍼 사이즈 검색기 — 현대·기아·제네시스 차종별 mm 규격";

export function defaultOgImageUrl(siteUrl, base) {
  return absoluteUrl(siteUrl, base, DEFAULT_OG_IMAGE_PATH);
}

export const HOME_DESCRIPTION =
  "자동차 와이퍼 사이즈 검색기는 현대·기아·제네시스 차종·세대별 운전석·조수석·후방 와이퍼 사이즈(mm)를 빠르게 확인하는 무료 검색 서비스입니다. 계기판 경고등 안내도 함께 제공합니다.";

export function normalizeSiteUrl(raw, fallback = "https://wiper-finder.com") {
  const v = (raw || fallback).trim();
  return v.replace(/\/$/, "");
}

export function absoluteUrl(siteUrl, base, path) {
  const root = normalizeSiteUrl(siteUrl);
  const prefix = (base || "").replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  const url = `${root}${prefix}${suffix}`;
  return url.replace(/([^:]\/)\/+/g, "$1");
}

export function titleSuffix(main) {
  return `${main} | ${SITE_NAME}`;
}

function rearSummary(gen) {
  if (gen.rear_type === "none") return "후방·뒷유리·리어 없음";
  if (gen.rear_type === "dedicated") return "후방·뒷유리·리어 전용";
  return `후방·뒷유리·리어 ${gen.rear_mm}mm`;
}

function rearSearchHint(gen) {
  if (gen.rear_type === "none") return "";
  return " 후방·뒷유리·리어 와이퍼 검색어 포함.";
}

export function seoHome() {
  return {
    documentTitle: `${SITE_NAME} | 현대·기아·제네시스 와이퍼 사이즈 조회`,
    description: HOME_DESCRIPTION,
    path: "/",
  };
}

export function seoBrand(brand) {
  return {
    documentTitle: titleSuffix(`${brand.name} 와이퍼 사이즈`),
    description: `${brand.name} 차종별 와이퍼 사이즈(mm)를 세대별로 확인하세요. 운전석·조수석·후방·뒷유리·리어 규격과 추천 상품 | ${SITE_NAME}`,
    path: `/${brand.id}/`,
  };
}

export function seoModel(brand, model) {
  return {
    documentTitle: titleSuffix(`${model.name} 와이퍼 사이즈`),
    description: `${vehicleName(brand.name, model.name)} 세대별 와이퍼 사이즈(mm). 연식·세대별 운전석·조수석·후방·뒷유리·리어 와이퍼 규격 확인 | ${SITE_NAME}`,
    path: `/${brand.id}/${model.id}/`,
  };
}

export function seoGeneration(brand, model) {
  return {
    documentTitle: titleSuffix(`${model.name} 와이퍼 사이즈 · 세대 선택`),
    description: `${vehicleName(brand.name, model.name)} 세대별 와이퍼 사이즈 조회. 사진과 연식으로 내 차 세대를 선택하세요 | ${SITE_NAME}`,
    path: `/${brand.id}/${model.id}/`,
  };
}

export function vehicleName(brandName, label) {
  if (label.includes(brandName)) return label;
  return `${brandName} ${label}`;
}

export function seoResult(brand, model, gen) {
  const sizes = `운전석 ${gen.driver_mm}mm · 조수석 ${gen.passenger_mm}mm · ${rearSummary(gen)}`;
  return {
    documentTitle: titleSuffix(
      `${gen.label} 와이퍼 사이즈 ${gen.driver_mm}·${gen.passenger_mm}mm`
    ),
    description: `${vehicleName(brand.name, gen.label)}(${gen.years}) 와이퍼 사이즈 — ${sizes}.${rearSearchHint(gen)} 차종별 mm 규격·추천 와이퍼 | ${SITE_NAME}`,
    path: `/${brand.id}/${model.id}/${gen.id}/`,
  };
}

export function resultPageJsonLd({ siteUrl, base, brand, model, gen, description }) {
  const url = absoluteUrl(siteUrl, base, `/${brand.id}/${model.id}/${gen.id}/`);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${gen.label} 와이퍼 사이즈`,
    description,
    url,
    image: defaultOgImageUrl(siteUrl, base),
    inLanguage: "ko-KR",
  };
}

export function seoGuideList() {
  return {
    documentTitle: titleSuffix("와이퍼 가이드 — 선택·교체·트러블 해결"),
    description:
      "실리콘 vs 고무 와이퍼 비교, 고르는 기준, 교체 방법, 소리·닦임 문제 해결까지. 와이퍼 사이즈 확인 후 참고할 가이드 모음 | " +
      SITE_NAME,
    path: "/guide/",
  };
}

export function seoGuide(guide) {
  return {
    documentTitle: titleSuffix(guide.title),
    description: `${guide.summary} | ${SITE_NAME}`,
    path: `/guide/${guide.id}/`,
    h1: guide.title,
  };
}

export function faqPageJsonLd({ siteUrl, base, brand, model, gen, faqItems }) {
  const url = absoluteUrl(siteUrl, base, `/${brand.id}/${model.id}/${gen.id}/`);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
    url,
  };
}

export function seoMyCars() {
  return {
    documentTitle: titleSuffix("내 차 보기"),
    description: `저장한 차량의 와이퍼 사이즈를 빠르게 다시 확인하세요 | ${SITE_NAME}`,
    path: "/my/",
  };
}

export function seoPrivacy() {
  return {
    documentTitle: titleSuffix("개인정보처리방침"),
    description: `${SITE_NAME} 개인정보처리방침. 수집하는 정보, 이용 목적, 보관 및 파트너스 링크 안내 | ${SITE_NAME}`,
    path: "/privacy/",
  };
}

export function seoWarningList() {
  return {
    documentTitle: titleSuffix(WARNING_LIST_TITLE),
    description:
      "계기판에 노란색 느낌표, 빨간색 수도꼭지·주전자, 타이어 모양 등 보이는 아이콘 그대로 찾아 의미·조치 방법을 확인하세요. 자동차 경고등 종류별 원인과 해결 | " +
      SITE_NAME,
    path: "/warnings/",
    keywords:
      "자동차 노란색 느낌표, 자동차 노란색 수도꼭지, 자동차 노란색 주전자, 계기판 경고등, 경고등 의미, 경고등 종류",
  };
}

/** id별 한국어 검색 키워드 (구글 연관검색·자동완성 기준) */
const WARNING_SEO = {
  // Google Sheet warning_lights 탭 id
  brake_warnings: { keyword: "브레이크 경고등" },
  oil_pressure_warning: { keyword: "엔진오일 경고등" },
  battery_warning: { keyword: "배터리 경고등" },
  coolant_temp_warning: { keyword: "냉각수 경고등" },
  door_open_indicator: { keyword: "도어 열림 경고등", colorLabel: null },
  airbag_warning: { keyword: "에어백 경고등", colorLabel: null },
  seatbelt_reminder: { keyword: "안전벨트 경고등", colorLabel: null },
  engine_check_warning: { keyword: "엔진 경고등" },
  tpms_warning: { keyword: "타이어 공기압 경고등" },
  smart_key_not_detected: { keyword: "스마트키 경고등", colorLabel: null },
  low_fuel_warning: { keyword: "연료 경고등" },
  esc_warning: { keyword: "ESC 경고등" },
  abs_warning: { keyword: "ABS 경고등" },
  washer_fluid_warning: { keyword: "워셔액 부족 경고등", colorLabel: null },
  direction_indicator: { keyword: "방향지시등", colorLabel: null },
  parking_light_indicator: { keyword: "전조등·미등", colorLabel: null },
  fog_light_indicator: { keyword: "안개등", colorLabel: null },
  eco_mode_indicator: { keyword: "ECO 모드", colorLabel: null },
  high_beam_indicator: { keyword: "상향등", colorLabel: null },
  glow_plug_indicator: { keyword: "예열 플러그 경고등", colorLabel: null },
  water_separator_warning: { keyword: "연료 필터 경고등", colorLabel: null },
  // data/warning-lights.json 폴백 id
  brake: { keyword: "브레이크 경고등" },
  oil: { keyword: "엔진오일 경고등" },
  battery: { keyword: "배터리 경고등" },
  coolant: { keyword: "냉각수 경고등" },
  door: { keyword: "도어 열림 경고등", colorLabel: null },
  airbag: { keyword: "에어백 경고등", colorLabel: null },
  seatbelt: { keyword: "안전벨트 경고등", colorLabel: null },
  "check-engine": { keyword: "엔진 경고등" },
  tpms: { keyword: "타이어 공기압 경고등" },
  "smart-key": { keyword: "스마트키 경고등", colorLabel: null },
  fuel: { keyword: "연료 경고등" },
  esc: { keyword: "ESC 경고등" },
  abs: { keyword: "ABS 경고등" },
  washer: { keyword: "워셔액 부족 경고등", colorLabel: null },
  "turn-signal": { keyword: "방향지시등", colorLabel: null },
  headlight: { keyword: "전조등·미등", colorLabel: null },
  "fog-light": { keyword: "안개등", colorLabel: null },
  eco: { keyword: "ECO 모드", colorLabel: null },
  "high-beam": { keyword: "상향등", colorLabel: null },
  "glow-plug": { keyword: "예열 플러그 경고등", colorLabel: null },
  "fuel-filter": { keyword: "연료 필터 경고등", colorLabel: null },
};

const WARNING_COLOR_LABEL = {
  red: "빨간색",
  yellow: "노란색",
  green: "초록색",
  blue: "파란색",
  grey: "회색",
};

/** Sheet id → JSON 폴백 id */
const WARNING_ID_ALIAS = {
  brake_warnings: "brake",
  oil_pressure_warning: "oil",
  battery_warning: "battery",
  coolant_temp_warning: "coolant",
  door_open_indicator: "door",
  airbag_warning: "airbag",
  seatbelt_reminder: "seatbelt",
  engine_check_warning: "check-engine",
  tpms_warning: "tpms",
  smart_key_not_detected: "smart-key",
  low_fuel_warning: "fuel",
  esc_warning: "esc",
  abs_warning: "abs",
  washer_fluid_warning: "washer",
  direction_indicator: "turn-signal",
  parking_light_indicator: "headlight",
  fog_light_indicator: "fog-light",
  eco_mode_indicator: "eco",
  high_beam_indicator: "high-beam",
  glow_plug_indicator: "glow-plug",
  water_separator_warning: "fuel-filter",
};

/** 페이지에 표시 — 아이콘을 눈에 보이는 모양 그대로 (canonical id) */
const WARNING_VISUAL_TAGS = {
  brake: ["자동차 P", "자동차 BRAKE"],
  oil: ["자동차 주전자", "자동차 손잡이 물통"],
  battery: ["자동차 배터리", "자동차 빨간색 + -", "자동차 빨간색 건전지"],
  coolant: ["자동차 온도계", "자동차 물결"],
  door: ["자동차 문", "자동차 트렁크", "자동차 열린 문"],
  airbag: ["자동차 앉은 사람", "자동차 동그란 공", "자동차 동그란 원"],
  seatbelt: ["자동차 벨트 착용한 사람", "자동차 운전자", "자동차 동승자"],
  "check-engine": ["자동차 수도꼭지", "자동차 헬리콥터"],
  tpms: ["자동차 타이어", "자동차 U자 느낌표", "자동차 바퀴"],
  "smart-key": ["자동차 열쇠", "자동차 KEY"],
  fuel: ["자동차 주유기", "자동차 연료 펌프"],
  esc: ["자동차 미끄러지는 차", "자동차 ESC"],
  abs: ["자동차 ABS", "자동차 바퀴 ABS"],
  washer: ["자동차 물 분사", "자동차 워셔액"],
  "turn-signal": ["자동차 화살표", "자동차 깜빡이"],
  headlight: ["자동차 전조등", "자동차 미등"],
  "fog-light": ["자동차 안개등"],
  eco: ["자동차 ECO"],
  "high-beam": ["자동차 상향등", "자동차 하이빔"],
  "glow-plug": ["자동차 나선", "자동차 예열"],
  "fuel-filter": ["자동차 연료 필터", "자동차 물방울"],
};

/** meta·title용 — 색상+모양 조합 검색어 (canonical id) */
const WARNING_COLOR_SEARCH = {
  brake: ["자동차 빨간색 P", "자동차 빨간색 BRAKE"],
  oil: ["자동차 빨간색 기름통", "자동차 빨간색 주전자"],
  battery: ["자동차 빨간색 배터리"],
  coolant: [
    "자동차 빨간색 수도꼭지",
    "자동차 빨간색 주전자",
    "자동차 노란색 수도꼭지",
    "자동차 노란색 주전자",
  ],
  door: ["자동차 빨간색 문"],
  airbag: ["자동차 빨간색 에어백"],
  seatbelt: ["자동차 빨간색 안전벨트"],
  "check-engine": ["자동차 노란색 느낌표", "자동차 노란색 수도꼭지"],
  tpms: ["자동차 노란색 타이어", "자동차 노란색 느낌표"],
  "smart-key": ["자동차 노란색 열쇠"],
  fuel: ["자동차 노란색 주유기"],
  esc: ["자동차 노란색 ESC"],
  abs: ["자동차 노란색 ABS"],
  washer: ["자동차 노란색 워셔액", "자동차 노란색 수도꼭지"],
  "turn-signal": ["자동차 초록색 화살표"],
  headlight: ["자동차 초록색 전조등"],
  "fog-light": ["자동차 초록색 안개등"],
  eco: ["자동차 초록색 ECO"],
  "high-beam": ["자동차 파란색 상향등"],
  "glow-plug": ["자동차 회색 나선"],
  "fuel-filter": ["자동차 회색 연료 필터"],
};

function canonicalWarningId(id) {
  return WARNING_ID_ALIAS[id] ?? id;
}

function resolveWarningColorLabel(warning, entry) {
  if (entry && "colorLabel" in entry) return entry.colorLabel;
  return WARNING_COLOR_LABEL[warning.color] ?? null;
}

function warningVisualTags(warning) {
  return WARNING_VISUAL_TAGS[canonicalWarningId(warning.id)] ?? [];
}

function warningColorSearch(warning) {
  return WARNING_COLOR_SEARCH[canonicalWarningId(warning.id)] ?? [];
}

export function warningSeoMeta(warning) {
  const entry = WARNING_SEO[warning.id] ?? WARNING_SEO[canonicalWarningId(warning.id)];
  const keyword =
    entry?.keyword ??
    (String(warning.label ?? "").includes("경고")
      ? warning.label
      : `${warning.label} 경고등`);
  const colorLabel = resolveWarningColorLabel(warning, entry);
  const colorSuffix = colorLabel ? ` ${colorLabel}` : "";
  const visualTags = warningVisualTags(warning);
  const colorSearchTerms = warningColorSearch(warning);
  const primaryVisual = colorSearchTerms[0] ?? visualTags[0] ?? null;
  const pageTitle = primaryVisual
    ? `${primaryVisual} 뜻·원인·해결`
    : `${keyword}${colorSuffix} 원인·해결방법`;
  const h1 = keyword;
  const summary = warning.summary ? `${warning.summary} ` : "";
  const searchPhrases = [...colorSearchTerms, ...visualTags];
  const visualHint = searchPhrases.length
    ? `「${searchPhrases.slice(0, 4).join("」「")}」 등으로 검색해도 ${keyword} 안내입니다. `
    : "";
  const description = `${visualHint}${summary}${keyword}${colorSuffix} 뜻·원인·증상·해결 방법 | ${SITE_NAME}`;
  const topic = keyword.replace(/ 경고등$/, "").replace(/ 부족$/, "");
  const keywords = [
    ...visualTags,
    ...colorSearchTerms,
    keyword,
    colorLabel ? `자동차 ${colorLabel} ${topic}` : null,
    colorLabel ? `자동차 ${colorLabel} 경고등` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    keyword,
    colorLabel,
    h1,
    pageTitle,
    description,
    visualTags,
    colorSearchTerms,
    primaryVisual,
    keywords,
  };
}

/** 상세 페이지 본문·FAQ에 쓸 자연스러운 색·모양 검색 안내 */
export function warningSearchHint(meta) {
  const { colorLabel, keyword, visualTags, colorSearchTerms } = meta;
  if (!visualTags.length && !colorSearchTerms.length) return null;

  const shapes = visualTags.map((t) => t.replace(/^자동차\s*/, ""));
  const shapePhrase =
    shapes.length >= 2 ? `${shapes[0]}·${shapes[1]}` : shapes[0] || "아이콘";

  const searchExamples = [...colorSearchTerms.slice(0, 2), ...visualTags.slice(0, 1)]
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3);

  const intro = colorLabel
    ? `계기판 ${colorLabel} ${shapePhrase} 모양으로 찾으셔도 ${keyword} 안내입니다.`
    : `계기판 ${shapePhrase} 모양으로 찾으셔도 ${keyword} 안내입니다.`;

  const searchLine = searchExamples.length
    ? ` ${searchExamples.join(", ")} 등으로 보이는 경우에도 같은 원인입니다.`
    : "";

  return {
    plain: (intro + searchLine).trim(),
    shapePhrase,
    searchExamples,
  };
}

export function warningFaqJsonLd({ siteUrl, base, warning, meta }) {
  const url = absoluteUrl(siteUrl, base, `/warnings/${warning.id}/`);
  const hint = warningSearchHint(meta);
  const items = [];
  if (meta.primaryVisual) {
    items.push({
      q: `${meta.primaryVisual}가 켜지면 무슨 뜻인가요?`,
      a: hint?.plain ?? `${meta.keyword}입니다. ${warning.summary} ${warning.meaning}`.trim(),
    });
  }
  for (const term of meta.visualTags.slice(0, 3)) {
    items.push({
      q: `계기판 ${term} 아이콘은 무슨 경고등인가요?`,
      a: hint?.plain ?? `${meta.keyword}에 해당합니다. ${warning.summary}`,
    });
  }
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url,
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function seoWarningDetail(warning) {
  const meta = warningSeoMeta(warning);
  return {
    documentTitle: titleSuffix(meta.pageTitle),
    description: meta.description,
    path: `/warnings/${warning.id}/`,
    h1: meta.h1,
    breadcrumbLabel: meta.keyword,
    keywords: meta.keywords,
    meta,
  };
}

export function breadcrumbJsonLd(items, siteUrl, base) {
  if (!items?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(siteUrl, base, item.href),
    })),
  };
}

export function siteBrandJsonLd(siteUrl, base) {
  const homeUrl = absoluteUrl(siteUrl, base, "/");
  const logoUrl = absoluteUrl(siteUrl, base, "/icons/icon-512.png");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${homeUrl}#website`,
        name: SITE_BRAND_NAME,
        alternateName: [...SITE_ALTERNATE_NAMES],
        url: homeUrl,
        description: HOME_DESCRIPTION,
        image: defaultOgImageUrl(siteUrl, base),
        inLanguage: "ko-KR",
        publisher: { "@id": `${homeUrl}#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${homeUrl}#organization`,
        name: SITE_BRAND_NAME,
        alternateName: [...SITE_ALTERNATE_NAMES],
        url: homeUrl,
        logo: logoUrl,
      },
    ],
  };
}

export function buildJsonLd({ siteUrl, base, breadcrumb, extra = [] }) {
  const blocks = extra.filter(Boolean);
  const crumbs = breadcrumbJsonLd(breadcrumb, siteUrl, base);
  if (crumbs) blocks.push(crumbs);
  return blocks;
}

export function buildSitemapXml(siteUrl, base, urls) {
  const root = normalizeSiteUrl(siteUrl);
  const prefix = (base || "").replace(/\/$/, "");
  const today = new Date().toISOString().slice(0, 10);
  const body = urls
    .map(({ path, priority = "0.6", changefreq = "weekly" }) => {
      const loc = `${root}${prefix}${path.startsWith("/") ? path : `/${path}`}`.replace(
        /([^:]\/)\/+/g,
        "$1"
      );
      return `  <url>
    <loc>${escapeHtmlXml(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function escapeHtmlXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildRobotsTxt(siteUrl, base) {
  const sitemap = absoluteUrl(siteUrl, base, "/sitemap.xml");
  return `#DaumWebMasterTool:3a9fd463ea7bc087cf8bf8f690d026ebe66d263e4dc083b56fc65bc0af2a996d:Th0L5+QWCCuxQG6+8IaGrw==

User-agent: Daum
Allow: /

User-agent: *
Allow: /

Sitemap: ${sitemap}
`;
}

export function collectRssItems({ brands, modelsByBrand, gensByModel, warnings, guides = [] }) {
  const items = [];

  const pushSeo = (seo) => {
    items.push({
      title: seo.documentTitle,
      description: seo.description,
      path: seo.path,
    });
  };

  pushSeo(seoHome());
  pushSeo(seoMyCars());
  pushSeo(seoGuideList());
  pushSeo(seoPrivacy());
  pushSeo(seoWarningList());

  for (const guide of guides) {
    pushSeo(seoGuide(guide));
  }

  for (const w of warnings) {
    pushSeo(seoWarningDetail(w));
  }

  for (const brand of brands) {
    pushSeo(seoBrand(brand));
    for (const model of modelsByBrand[brand.id] || []) {
      pushSeo(seoModel(brand, model));
      for (const gen of gensByModel[model.id] || []) {
        pushSeo(seoResult(brand, model, gen));
      }
    }
  }

  return items;
}

export function buildRssXml(siteUrl, base, items) {
  const channelLink = absoluteUrl(siteUrl, base, "/");
  const buildDate = new Date().toUTCString();
  const body = items
    .map((item) => {
      const link = absoluteUrl(siteUrl, base, item.path);
      return `    <item>
      <title>${escapeHtmlXml(item.title)}</title>
      <link>${escapeHtmlXml(link)}</link>
      <guid isPermaLink="true">${escapeHtmlXml(link)}</guid>
      <description>${escapeHtmlXml(item.description)}</description>
      <pubDate>${buildDate}</pubDate>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeHtmlXml(SITE_NAME)}</title>
    <link>${escapeHtmlXml(channelLink)}</link>
    <description>${escapeHtmlXml(HOME_DESCRIPTION)}</description>
    <language>ko</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
${body}
  </channel>
</rss>
`;
}

export function buildLlmsTxt(siteUrl, base) {
  const home = absoluteUrl(siteUrl, base, "/");
  const my = absoluteUrl(siteUrl, base, "/my/");
  const warnings = absoluteUrl(siteUrl, base, "/warnings/");
  const guide = absoluteUrl(siteUrl, base, "/guide/");
  const privacy = absoluteUrl(siteUrl, base, "/privacy/");
  const hyundai = absoluteUrl(siteUrl, base, "/hyundai/");
  const kia = absoluteUrl(siteUrl, base, "/kia/");
  const genesis = absoluteUrl(siteUrl, base, "/genesis/");
  const sitemap = absoluteUrl(siteUrl, base, "/sitemap.xml");
  const rss = absoluteUrl(siteUrl, base, "/rss.xml");

  return `# ${SITE_NAME}

${HOME_DESCRIPTION}

## 주요 페이지

- [홈 — 브랜드 선택](${home})
- [내 차 보기](${my})
- [자동차 경고등 의미, 종류, 조치방법](${warnings})
- [와이퍼 가이드 — 선택·교체·트러블 해결](${guide})
- [개인정보처리방침](${privacy})
- [현대 와이퍼 사이즈](${hyundai})
- [기아 와이퍼 사이즈](${kia})
- [제네시스 와이퍼 사이즈](${genesis})
- [RSS 피드](${rss})
- [사이트맵](${sitemap})
`;
}
