import {
  SITE_NAME,
  SITE_BRAND_NAME,
  WARNING_LIST_TITLE,
  SITE_TAGLINE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_PATH,
  absoluteUrl,
  defaultOgImageUrl,
  buildJsonLd,
  seoBrand,
  seoGeneration,
  seoHome,
  seoMyCars,
  seoResult,
  seoWarningDetail,
  seoWarningList,
  seoGuideList,
  seoGuide,
  seoPrivacy,
  faqPageJsonLd,
  resultPageJsonLd,
  siteBrandJsonLd,
  warningFaqJsonLd,
  warningSearchHint,
} from "./seo.mjs";
import {
  GUIDES,
  GUIDE_HUB_TITLE,
  GUIDE_HUB_SUMMARY,
  buildResultFaq,
  RESULT_RELATED_GUIDE_IDS,
  getGuide,
} from "./guides.mjs";

export const CSS = `
:root {
  --bg: #f4f6f8;
  --surface: #fff;
  --text: #1a202c;
  --muted: #475569;
  --border: #e2e8f0;
  --accent: #2563eb;
  --accent-dark: #1d4ed8;
  --green: #3e7b45;
  --green-dark: #2f5d34;
  --radius: 12px;
  --shadow: 0 2px 8px rgba(0,0,0,.04);
  --max: 480px;
  --max-wide: 960px;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  min-height: 100dvh;
}
.wrap { max-width: var(--max); margin: 0 auto; padding: 16px; }
@media (min-width: 640px) {
  .wrap { max-width: var(--max-wide); padding: 16px 20px; }
}
.app-header {
  width: 100%;
  background: var(--bg);
  margin-bottom: 8px;
}
.app-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 16px 10px;
  background: var(--bg);
}
.app-title { flex: 1; min-width: 0; }
.app-title h1 {
  margin: 0; font-size: inherit; font-weight: inherit; line-height: inherit;
}
.app-title a.site-logo {
  display: inline-block;
  color: var(--text); text-decoration: none; font-weight: 800; font-size: 1.05rem;
  letter-spacing: -.01em; line-height: 1.25;
}
.header-privacy {
  flex-shrink: 0;
  font-size: .65rem;
  color: var(--muted);
  text-decoration: none;
  line-height: 1.3;
  text-align: right;
  max-width: 42%;
}
.header-privacy:hover { color: var(--accent); text-decoration: underline; }
.app-title-rule {
  height: 2px;
  background: linear-gradient(90deg, var(--accent) 0%, #93c5fd 55%, var(--border) 100%);
  margin: 0;
}
.app-bottom-nav {
  display: flex;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}
.bottom-nav-btn {
  flex: 1;
  text-align: center;
  padding: 11px 3px 10px;
  font-size: .68rem;
  font-weight: 600;
  line-height: 1.25;
  color: var(--text);
  text-decoration: none;
  border-right: 1px solid var(--border);
  transition: background .15s, color .15s;
}
@media (min-width: 400px) {
  .bottom-nav-btn { font-size: .72rem; }
}
.bottom-nav-btn:last-child { border-right: 0; }
.bottom-nav-btn:hover { background: #f8fafc; }
.bottom-nav-btn--guide { color: var(--accent-dark); }
.bottom-nav-btn--warnings {
  background: #0a0a0a;
  color: #fff;
}
.bottom-nav-btn--warnings:hover { background: #222; color: #fff; }
.breadcrumb-back {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
  margin-right: 6px;
}
.breadcrumb-back:hover { text-decoration: underline; }
.breadcrumb {
  display: flex; flex-wrap: wrap; align-items: center; gap: 4px;
  padding: 10px 16px; font-size: .82rem; color: var(--muted);
  background: var(--bg);
}
.breadcrumb a { color: var(--muted); text-decoration: none; }
.breadcrumb a:hover { color: var(--accent); }
.breadcrumb .sep { color: #cbd5e1; }
.breadcrumb .current { color: var(--text); font-weight: 600; }
.site-logo-mark {
  background: linear-gradient(to bottom, transparent 50%, #fef08a 50%, #fef08a 92%, transparent 92%);
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  padding: 0 2px;
}
h1 { font-size: 1.25rem; margin-bottom: 4px; }
h2 { font-size: 1.15rem; margin-bottom: 4px; font-weight: 700; }
h3 { font-size: .95rem; font-weight: 700; margin: 20px 0 8px; color: var(--text); }
.sub { color: var(--muted); font-size: .9rem; margin-bottom: 16px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.grid-responsive {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
}
@media (min-width: 640px) {
  .grid-responsive { grid-template-columns: repeat(4, 1fr); }
}
.brand-btn, .model-card {
  display: block; background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 24px 16px; text-align: center;
  text-decoration: none; color: var(--text); box-shadow: var(--shadow);
  transition: border-color .15s;
}
.brand-btn:hover, .model-card:hover { border-color: var(--accent); }
.brand-btn strong { display: block; font-size: 1.35rem; margin-bottom: 4px; }
.brand-btn span, .model-card span { color: var(--muted); font-size: .85rem; }
.model-card { padding: 14px 12px; text-align: left; }
.model-card strong { display: block; font-size: 1rem; }
.gen-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
@media (min-width: 640px) {
  .gen-grid { grid-template-columns: repeat(4, 1fr); }
}
.gen-card {
  position: relative;
  display: block; background: var(--surface); border: 2px solid var(--border);
  border-radius: var(--radius); overflow: hidden; text-decoration: none; color: var(--text);
}
.gen-card-link { display: block; color: inherit; text-decoration: none; }
.gen-card:hover { border-color: var(--accent); }
.gen-card-link:hover .gen-photo img { opacity: .96; }
.gen-photo-wrap { position: relative; }
.gen-photo {
  position: relative;
  aspect-ratio: 16/10; background: #eef2f7; display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.gen-photo img { width: 100%; height: 100%; object-fit: cover; }
.gen-photo .placeholder { color: var(--muted); font-size: .75rem; padding: 8px; text-align: center; }
.gen-photo-badge {
  position: absolute; top: 6px; right: 6px; z-index: 2; margin: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,.15);
}
.fav-btn {
  position: absolute; bottom: 6px; right: 6px; z-index: 3;
  width: 28px; height: 28px; padding: 0; border: none; border-radius: 50%;
  background: rgba(255,255,255,.92); color: #cbd5e1; font-size: 1rem; line-height: 1;
  cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,.18);
  display: flex; align-items: center; justify-content: center;
}
.fav-btn--on { color: #f59e0b; }
.fav-btn:hover { background: #fff; transform: scale(1.05); }
.fav-btn--labeled {
  position: absolute; bottom: 8px; right: 8px; z-index: 3;
  width: auto; height: auto; min-height: 28px;
  padding: 6px 11px; border: none; border-radius: 999px;
  background: rgba(255,255,255,.95); color: var(--accent);
  font-size: .72rem; font-weight: 700; line-height: 1;
  cursor: pointer; box-shadow: 0 1px 6px rgba(0,0,0,.18);
  display: inline-flex; align-items: center; gap: 5px;
}
.fav-btn--labeled:hover { background: #fff; color: var(--accent-dark); }
.fav-btn--labeled .fav-icon { font-size: .82rem; color: #cbd5e1; line-height: 1; }
.fav-btn--labeled.fav-btn--on .fav-icon { color: #f59e0b; }
.result-head .head-row {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
}
.result-head .fav-btn { position: static; flex-shrink: 0; margin-top: 2px; }
.result-head .fav-btn--labeled { position: static; margin-top: 2px; }
.my-car-card {
  position: relative; background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden; margin-bottom: 10px;
}
.my-car-link { display: flex; gap: 12px; padding: 12px; padding-right: 44px; color: inherit; text-decoration: none; }
.my-car-photo {
  width: 88px; flex-shrink: 0; aspect-ratio: 16/10; background: #eef2f7;
  border-radius: 8px; overflow: hidden;
}
.my-car-photo img { width: 100%; height: 100%; object-fit: cover; }
.my-car-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.my-car-body strong { font-size: .92rem; }
.my-car-body span { font-size: .78rem; color: var(--muted); }
.my-car-body .years { font-size: .72rem; }
.my-car-card .fav-btn { bottom: 10px; right: 10px; }
.my-empty {
  text-align: center; color: var(--muted); font-size: .88rem; padding: 32px 12px;
  background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius);
}
.gen-body { padding: 10px 12px; }
.gen-body strong { display: block; font-size: .92rem; margin-bottom: 2px; }
.gen-body .years { color: var(--muted); font-size: .78rem; }
.gen-body .hint {
  color: var(--muted); font-size: .72rem; margin-top: 4px; line-height: 1.35;
  word-break: keep-all; overflow-wrap: break-word;
}
.result-head { margin-bottom: 14px; }
.badge {
  display: inline-block; background: #dbeafe; color: #1e40af;
  font-size: .75rem; padding: 2px 8px; border-radius: 999px; margin-left: 6px;
}
.power-badge {
  display: inline-block; font-size: .62rem; font-weight: 700; letter-spacing: .01em;
  padding: 1px 6px; border-radius: 4px; margin-left: 4px; vertical-align: middle;
}
.power-badge--hybrid {
  color: var(--green); background: #fff; border: 1px solid #cbd5e1;
}
.power-badge--electric {
  color: var(--accent); background: #fff; border: 1px solid #cbd5e1;
}
.title-row { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.title-row strong { font-size: .92rem; }
.size-table {
  display: grid; grid-template-columns: 1fr 1fr 1fr; background: var(--surface);
  border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin-bottom: 10px;
}
.size-cell { padding: 14px 8px; text-align: center; border-right: 1px solid var(--border); }
.size-cell:last-child { border-right: 0; }
.size-cell .label { font-size: .75rem; color: var(--muted); }
.size-cell .value { font-size: 1.35rem; font-weight: 700; margin-top: 4px; }
.size-cell .unit { font-size: .72rem; color: var(--muted); }
.rear-msg {
  background: #f8fafc; border: 1px solid var(--border); border-radius: 8px;
  padding: 10px 12px; font-size: .88rem; color: var(--muted); margin-bottom: 12px;
}
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 10px 14px; border-radius: 8px; font-size: .9rem; font-weight: 600;
  border: 1px solid var(--border); background: var(--surface); color: var(--text);
  cursor: pointer; text-decoration: none; width: 100%;
}
.btn-primary { background: var(--green); border-color: var(--green); color: #fff; }
.btn-primary:hover { background: var(--green-dark); }
.btn-cta { background: #dc2626; border-color: #dc2626; }
.btn-cta:hover { background: #b91c1c; border-color: #b91c1c; }
.product-card-cta {
  animation: card-border-blink 2.8s ease-in-out infinite;
}
@keyframes card-border-blink {
  0%, 100% { border-color: var(--border); box-shadow: none; }
  50% { border-color: #dc2626; box-shadow: 0 0 0 1px #dc2626; }
}
.section-title { font-size: .95rem; font-weight: 700; margin: 16px 0 6px; }
.section-sub { font-size: .82rem; color: var(--muted); margin-bottom: 10px; }
.product-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 12px 14px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;
}
.product-card .info { flex: 1; min-width: 0; }
.product-card .tag {
  display: inline-block; background: #f1f5f9; font-size: .7rem; padding: 2px 6px;
  border-radius: 4px; margin-bottom: 4px;
}
.product-card .title { font-size: .88rem; font-weight: 600; }
.product-card .btn { width: auto; flex-shrink: 0; padding: 8px 12px; font-size: .82rem; }
.product-section {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 12px; margin-top: 14px;
}
.product-section-head {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
}
.product-section-head .section-title { margin: 0; flex: 1; min-width: 0; }
.product-note {
  font-size: .75rem; color: var(--muted); margin: 8px 0 10px; line-height: 1.45;
  padding-left: 1.1em;
}
.product-note li { margin-bottom: .25em; }
.product-note li:last-child { margin-bottom: 0; }
.product-trust {
  font-size: .78rem; color: var(--text); line-height: 1.5;
}
.product-trust p { margin: 0 0 .35em; }
.product-trust p:last-child { margin-bottom: 0; }
.product-trust-blink {
  font-weight: 700;
  animation: trust-blink 1.1s step-end infinite;
}
@keyframes trust-blink {
  0%, 49% { color: #1a202c; }
  50%, 100% { color: #dc2626; }
}
.product-cross-section {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 10px 12px; margin-top: 8px;
}
.product-cross-section .product-card {
  margin-bottom: 0; border: none; padding: 0; background: transparent;
}
.product-cross-section .info {
  display: flex; align-items: center; gap: 6px; min-width: 0;
}
.product-cross-section .tag {
  margin-bottom: 0; flex-shrink: 0;
}
.product-cross-section .title {
  min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.product-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
}
.product-grid .product-tile:nth-child(n+3) { display: none; }
@media (min-width: 640px) {
  .product-grid { grid-template-columns: repeat(6, 1fr); gap: 8px; }
  .product-grid .product-tile:nth-child(n+3) { display: block; }
}
.product-tile {
  display: block; text-decoration: none; color: var(--text);
  border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
  background: #fff; transition: border-color .15s; min-width: 0;
}
.product-tile:hover { border-color: var(--accent); }
.product-tile-img {
  aspect-ratio: 1; background: #f8fafc; display: flex; align-items: center; justify-content: center;
  padding: 6px;
}
.product-tile-img img { max-width: 100%; max-height: 100%; object-fit: contain; }
.product-tile-body { padding: 8px; }
.product-tile-name {
  font-size: .72rem; font-weight: 600; line-height: 1.35; height: 2.7em;
  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.product-tile-meta { font-size: .65rem; color: var(--muted); margin-top: 4px; }
.product-tile-price {
  margin-top: 6px; font-size: .95rem; font-weight: 800; color: var(--accent); text-align: right;
}
.product-more {
  font-size: .82rem; font-weight: 600; color: var(--accent-dark); text-decoration: none;
  flex-shrink: 0; white-space: nowrap; line-height: 1.45;
}
.product-more:hover { color: var(--accent); text-decoration: underline; }
.product-footer {
  display: flex; flex-direction: column; gap: 8px;
  margin-top: 10px; text-align: left;
}
.product-ftc {
  font-size: .72rem; color: var(--muted); line-height: 1.45;
}
.site-footer {
  margin-top: 24px; padding-top: 12px;
  border-top: 1px solid var(--border);
  font-size: .72rem; color: var(--muted); text-align: center;
}
.warn-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
}
@media (min-width: 640px) {
  .warn-grid { grid-template-columns: repeat(5, 1fr); gap: 14px; }
}
.warn-icon-card {
  display: flex; align-items: center; justify-content: center;
  aspect-ratio: 1; background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 14px; text-decoration: none;
  box-shadow: var(--shadow); transition: border-color .15s, transform .1s;
}
.warn-icon-card:hover { border-color: var(--accent); transform: translateY(-1px); }
.warn-icon-card img { width: 100%; max-width: 72px; height: auto; object-fit: contain; }
.warn-icon-card .warn-placeholder {
  font-size: .65rem; color: var(--muted); text-align: center; line-height: 1.3;
}
.warn-detail-head {
  position: relative; text-align: center; margin-bottom: 16px; padding: 16px 12px 14px;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
}
.warn-icon-stack {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  margin: 0 auto 12px; max-width: 120px;
}
.warn-icon-stack .warn-icon-img { margin: 0; max-width: 88px; height: auto; }
.warn-icon-stack .urgency-badge { margin: 0; }
.warn-detail-head h1 { font-size: 1.15rem; margin-bottom: 6px; padding: 0 52px; }
.warn-detail-head .sub { padding: 0 8px; }
.warn-detail-head .warn-visual-tags { margin-top: 10px; justify-content: center; }
.warn-search-hint {
  font-size: .78rem; color: var(--muted); line-height: 1.5;
  margin: 10px auto 0; padding: 0 16px; word-break: keep-all;
}
.warn-search-hint-line { display: block; }
.warn-search-hint-line + .warn-search-hint-line { margin-top: 4px; }
.share-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 6px 10px; border: 1px solid var(--border); border-radius: 999px;
  background: var(--surface); color: var(--text); font-size: .72rem; font-weight: 600; cursor: pointer;
}
.share-btn--corner {
  position: absolute; top: 10px; right: 10px; margin: 0; z-index: 1;
}
.share-btn:hover { border-color: var(--accent); color: var(--accent); }
.share-btn--done { border-color: #16a34a; color: #16a34a; }
.result-hero {
  position: relative;
  margin-bottom: 14px; border-radius: var(--radius); overflow: hidden;
  border: 1px solid var(--border); background: #eef2f7;
}
.result-hero img {
  width: 100%; height: auto; display: block; aspect-ratio: 16/10; object-fit: cover;
}
.urgency-badge {
  display: inline-block; font-size: .72rem; font-weight: 700; padding: 3px 10px;
  border-radius: 999px; margin-bottom: 8px;
}
.urgency-badge--immediate { background: #fef2f2; color: #b91c1c; }
.urgency-badge--soon { background: #fefce8; color: #a16207; }
.urgency-badge--info { background: #f0fdf4; color: #15803d; }
.warn-section {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 14px; margin-bottom: 10px;
}
.warn-section h2 { font-size: .88rem; margin-bottom: 8px; color: var(--text); }
.warn-section p { font-size: .85rem; color: var(--muted); line-height: 1.55; }
.warn-section ul { margin: 0; padding-left: 18px; font-size: .85rem; color: var(--muted); }
.warn-section li { margin-bottom: 6px; line-height: 1.45; }
.warn-visual-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
.warn-visual-tags li {
  font-size: .72rem; font-weight: 500; color: var(--muted); background: #f8fafc;
  border: 1px solid var(--border); border-radius: 999px; padding: 4px 10px;
}
.warn-color-guide { margin-bottom: 18px; }
.warn-color-block {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 12px 14px; margin-bottom: 8px;
}
.warn-color-block h2 { font-size: .88rem; margin: 0 0 6px; color: var(--text); }
.warn-color-block p { font-size: .82rem; color: var(--muted); line-height: 1.55; margin: 0; }
.warn-color-note {
  font-size: .75rem; color: var(--muted); line-height: 1.5; margin: 0 0 16px;
}
.warn-disclaimer {
  font-size: .72rem; color: var(--muted); background: #f8fafc; border: 1px solid var(--border);
  border-radius: 8px; padding: 10px 12px; margin-top: 12px; line-height: 1.45;
}
.content-section {
  margin-top: 0;
  padding-top: 0;
}
.content-block {
  margin-top: 28px;
}
.content-block.post-related {
  margin-top: 44px;
}
.block-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.02rem;
  font-weight: 800;
  color: var(--text);
  margin: 0 0 12px;
  letter-spacing: -.02em;
  line-height: 1.3;
}
.block-title::before {
  content: "";
  display: block;
  width: 5px;
  height: 22px;
  background: linear-gradient(180deg, var(--accent) 0%, #60a5fa 100%);
  border-radius: 3px;
  flex-shrink: 0;
}
.section-heading {
  font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 12px;
}
.guide-body {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 20px 16px; margin-top: 8px;
}
.guide-panel {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 20px 16px; box-shadow: var(--shadow);
}
.guide-panel + .guide-panel {
  margin-top: 16px;
}
.guide-panel .guide-body {
  background: transparent; border: 0; padding: 0; margin-top: 12px;
  box-shadow: none; border-radius: 0;
}
.guide-panel--related .block-title {
  margin-bottom: 10px;
}
.guide-panel--related .post-related-list {
  margin: 0;
}
.guide-body h2 {
  font-size: 1.05rem; font-weight: 700; color: var(--text);
  margin: 1.6em 0 .65em; line-height: 1.35;
}
.guide-body h2:first-child { margin-top: 0; }
.guide-body p {
  font-size: .92rem; color: var(--text); line-height: 1.8; margin: 0 0 1em;
}
.guide-body p:last-child { margin-bottom: 0; }
.guide-body ul {
  margin: 0 0 1em; padding-left: 1.25em;
  font-size: .92rem; color: var(--text); line-height: 1.75;
}
.guide-body li { margin-bottom: .4em; }
.guide-body li:last-child { margin-bottom: 0; }
.guide-body .guide-table { margin: 1em 0; }
.guide-body .video-embed { margin: 1.2em 0; }
.faq-list { margin: 0; }
.faq-item {
  border-bottom: 1px solid var(--border);
}
.faq-item:last-child {
  border-bottom: 0;
}
.faq-section .faq-list {
  padding-bottom: 4px;
}
.faq-item summary {
  list-style: none; cursor: pointer; padding: 14px 28px 14px 0;
  font-size: .88rem; font-weight: 600; color: var(--text); line-height: 1.45;
  position: relative; user-select: none;
}
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after {
  content: "+"; position: absolute; right: 2px; top: 50%; transform: translateY(-50%);
  font-size: 1.1rem; font-weight: 400; color: var(--muted); line-height: 1;
}
.faq-item[open] summary::after { content: "−"; }
.faq-answer {
  padding: 0 0 14px; font-size: .85rem; color: var(--muted); line-height: 1.65;
}
.faq-answer a { color: var(--accent); text-decoration: none; }
.faq-answer a:hover { text-decoration: underline; }
.post-related {
  margin-top: 0; padding-top: 0; border-top: 0;
}
.post-related-title {
  font-size: .95rem; font-weight: 700; color: var(--text); margin-bottom: 10px;
}
.post-related-list {
  list-style: none; padding: 0; margin: 0;
}
.post-related-list li {
  padding: 11px 0; border-bottom: 0;
}
.post-related-list li + li {
  border-top: 1px solid #f0f0f0;
}
.post-related-list a {
  display: block; font-size: .88rem; color: #333; text-decoration: none; line-height: 1.45;
}
.post-related-list a:hover { color: var(--accent); text-decoration: underline; }
.post-related-list a::before {
  content: "·"; color: var(--muted); margin-right: 6px; font-weight: 700;
}
.guide-grid { display: grid; gap: 10px; }
.guide-card {
  display: block; background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 14px; text-decoration: none; color: var(--text);
  box-shadow: var(--shadow);
}
.guide-card:hover { border-color: var(--accent); }
.guide-card strong { display: block; font-size: .95rem; margin-bottom: 4px; }
.guide-card span { font-size: .82rem; color: var(--muted); line-height: 1.45; }
.guide-table {
  width: 100%; border-collapse: collapse; font-size: .82rem; margin: 8px 0;
}
.guide-table th, .guide-table td {
  border: 1px solid var(--border); padding: 8px 10px; text-align: left;
}
.guide-table th { background: #f8fafc; font-weight: 700; color: var(--text); }
.guide-table td { color: var(--muted); }
.video-embed {
  position: relative; width: 100%; padding-bottom: 56.25%; margin: 10px 0;
  border-radius: var(--radius); overflow: hidden; background: #000;
}
.video-embed iframe {
  position: absolute; inset: 0; width: 100%; height: 100%; border: 0;
}
.toolbar-btn--guide { background: #eff6ff; color: var(--accent-dark); }
.toolbar-btn--guide:hover { background: #dbeafe; color: var(--accent-dark); }
.privacy-section {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 18px 16px; margin-top: 8px;
}
.privacy-section h2 {
  font-size: .95rem; font-weight: 700; margin: 1.4em 0 .5em;
}
.privacy-section h2:first-child { margin-top: 0; }
.privacy-section p, .privacy-section li {
  font-size: .88rem; color: var(--text); line-height: 1.7;
}
.privacy-section ul { margin: 0 0 1em; padding-left: 1.2em; }
.privacy-section li { margin-bottom: .35em; }
`;

export function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function metaHead({
  documentTitle,
  description,
  canonical,
  ogImage,
  ogImageAlt,
  ogImageWidth,
  ogImageHeight,
  keywords = "",
  jsonLd = [],
}) {
  const ld = jsonLd.length
    ? `<script type="application/ld+json">${JSON.stringify(jsonLd.length === 1 ? jsonLd[0] : jsonLd)}</script>`
    : "";
  const ogDims =
    ogImage && ogImageWidth && ogImageHeight
      ? `<meta property="og:image:width" content="${ogImageWidth}">
  <meta property="og:image:height" content="${ogImageHeight}">`
      : "";
  const ogImg = ogImage
    ? `<meta property="og:image" content="${escapeHtml(ogImage)}">
  ${ogDims}
  <meta property="og:image:alt" content="${escapeHtml(ogImageAlt || documentTitle)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">`
    : `<meta name="twitter:card" content="summary">`;

  return `<meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(documentTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}">` : ""}
  <meta name="robots" content="index, follow">
  <meta name="naver-site-verification" content="fc4e443bcdeac68828c15f3322069961d080d4d0">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="website">
  <meta name="application-name" content="${escapeHtml(SITE_BRAND_NAME)}">
  <meta name="author" content="${escapeHtml(SITE_BRAND_NAME)}">
  <meta property="og:site_name" content="${escapeHtml(SITE_BRAND_NAME)}">
  <meta property="og:title" content="${escapeHtml(documentTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:locale" content="ko_KR">
  ${ogImg}
  ${ld}`;
}

function faviconHead(base) {
  const iconBase = (base || "").replace(/\/$/, "");
  const prefix = iconBase ? iconBase : "";
  return `<link rel="manifest" href="${prefix}/manifest.json">
  <meta name="theme-color" content="#2563eb">
  <link rel="icon" href="${prefix}/favicon.png" type="image/png" sizes="192x192">
  <link rel="apple-touch-icon" href="${prefix}/apple-touch-icon.png">`;
}

function rssHead(siteUrl, base) {
  const href = absoluteUrl(siteUrl, base, "/rss.xml");
  return `<link rel="alternate" type="application/rss+xml" title="${escapeHtml(SITE_NAME)}" href="${escapeHtml(href)}">`;
}

/** generations.hybrid: 1=Hybrid, 2=Electric, 3=Hybrid+Electric */
export function resolvePowerBadge(value) {
  const v = String(value ?? "").trim();
  if (v === "1") return "+Hybrid";
  if (v === "2") return "+Electric";
  if (v === "3") return "+Hybrid+Electric";
  return "";
}

export function powerBadgeHtml(powerBadge, hybridValue = "", { overlay = false } = {}) {
  if (!powerBadge) return "";
  const v = String(hybridValue ?? "").trim();
  let variant = "hybrid";
  if (v === "2") variant = "electric";
  else if (v === "1" || v === "3") variant = "hybrid";
  const cls = `power-badge power-badge--${variant}`;
  const overlayCls = overlay ? " gen-photo-badge" : "";
  return `<span class="${cls}${overlayCls}">${escapeHtml(powerBadge)}</span>`;
}

export function favBtnHtml({ brand, model, gen, imageFile, labeled = false }) {
  const url = `/${brand.id}/${model.id}/${gen.id}/`;
  const img = imageFile || gen.imageFile || "";
  const attrs = `type="button" aria-label="내 차 저장" aria-pressed="false"
    data-brand-id="${escapeHtml(brand.id)}" data-brand-name="${escapeHtml(brand.name)}"
    data-model-id="${escapeHtml(model.id)}" data-model-name="${escapeHtml(model.name)}"
    data-gen-id="${escapeHtml(gen.id)}" data-label="${escapeHtml(gen.label)}"
    data-years="${escapeHtml(gen.years)}" data-image="${escapeHtml(img)}"
    data-url="${escapeHtml(url)}"`;

  if (labeled) {
    return `<button class="fav-btn fav-btn--labeled" ${attrs}>
      <span class="fav-label">내차등록</span><span class="fav-icon">☆</span>
    </button>`;
  }

  return `<button class="fav-btn" ${attrs}>☆</button>`;
}

function resolveBackHref(base, breadcrumb) {
  if (!breadcrumb?.length) return null;
  if (breadcrumb.length === 1) {
    if (breadcrumb[0].href === "/") return null;
    return `${base}/`;
  }
  const parent = breadcrumb[breadcrumb.length - 2];
  return `${base}${parent.href}`;
}

function siteLogoHtml(base, { heading = false } = {}) {
  const link = `<a href="${base}/" class="site-logo" aria-label="${escapeHtml(SITE_BRAND_NAME)}"><span class="site-logo-mark">${escapeHtml(SITE_BRAND_NAME)}</span></a>`;
  return heading ? `<h1>${link}</h1>` : link;
}

function renderAppHeader({ base, breadcrumb, showBreadcrumb, homePage = false }) {
  const backHref = resolveBackHref(base, breadcrumb);
  const backLink = backHref
    ? `<a href="${backHref}" class="breadcrumb-back">← 뒤로</a>`
    : "";

  const crumbs =
    showBreadcrumb && breadcrumb.length >= 2
      ? breadcrumb
          .map((c, i) => {
            if (i === breadcrumb.length - 1) {
              return `<span class="current">${escapeHtml(c.label)}</span>`;
            }
            return `<a href="${base}${c.href}">${escapeHtml(c.label)}</a><span class="sep">/</span>`;
          })
          .join("")
      : "";

  const trail = backLink || crumbs
    ? `<nav class="breadcrumb" aria-label="경로">${backLink}${crumbs}</nav>`
    : "";

  return `<header class="app-header">
    <div class="app-title-row">
      <div class="app-title">${siteLogoHtml(base, { heading: homePage })}</div>
      <a href="${base}/privacy/" class="header-privacy">개인정보처리방침</a>
    </div>
    <div class="app-title-rule" aria-hidden="true"></div>
    ${renderAppBottomNav(base)}
    ${trail}
  </header>`;
}

function renderAppBottomNav(base) {
  return `<nav class="app-bottom-nav" aria-label="주요 메뉴">
    <a href="${base}/" class="bottom-nav-btn">자동차 선택</a>
    <a href="${base}/my/" class="bottom-nav-btn">저장 차량</a>
    <a href="${base}/guide/" class="bottom-nav-btn bottom-nav-btn--guide">와이퍼 정보</a>
    <a href="${base}/warnings/" class="bottom-nav-btn bottom-nav-btn--warnings">경고등</a>
  </nav>`;
}

export function layout({
  documentTitle,
  description,
  canonicalPath = "/",
  siteUrl,
  base,
  breadcrumb = [],
  showBreadcrumb = false,
  jsonLd = [],
  keywords = "",
  body,
  homePage = false,
}) {
  const scriptBase = base || "";
  const jsSrc = `${scriptBase}/js/favorites.js`.replace(/\/+/g, "/");
  const shareSrc = `${scriptBase}/js/share.js`.replace(/\/+/g, "/");
  const canonical = absoluteUrl(siteUrl, base, canonicalPath);
  const ogImage = defaultOgImageUrl(siteUrl, base);
  const ogAlt = DEFAULT_OG_IMAGE_ALT;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  ${metaHead({ documentTitle, description, canonical, ogImage, ogImageAlt: ogAlt, ogImageWidth: 1200, ogImageHeight: 630, keywords, jsonLd })}
  ${faviconHead(base)}
  ${rssHead(siteUrl, base)}
  <style>${CSS}</style>
  <script>window.WIPER_BASE=${JSON.stringify(scriptBase)};</script>
  <script src="${jsSrc}" defer></script>
  <script src="${shareSrc}" defer></script>
</head>
<body>
  ${renderAppHeader({ base, breadcrumb, showBreadcrumb, homePage })}
  <main class="wrap">
    ${body}
    <footer class="site-footer">
      <p>Copyright © ${year} ${escapeHtml(SITE_BRAND_NAME)}. All rights reserved.</p>
    </footer>
  </main>
</body>
</html>`;
}

export function renderBrandPage({ base, siteUrl, brands, modelsByBrand }) {
  const seo = seoHome();
  const cards = brands
    .map((b) => {
      const count = (modelsByBrand[b.id] || []).length;
      return `<a class="brand-btn" href="${base}/${b.id}/">
        <strong>${escapeHtml(b.name)}</strong>
        <span>${count}개 차종</span>
      </a>`;
    })
    .join("");

  return layout({
    documentTitle: seo.documentTitle,
    description: seo.description,
    canonicalPath: seo.path,
    siteUrl,
    base,
    breadcrumb: [],
    jsonLd: [siteBrandJsonLd(siteUrl, base)],
    homePage: true,
    body: `<h2>${escapeHtml(SITE_TAGLINE)}</h2>
<p class="sub">${escapeHtml(seo.description)}</p>
<div class="grid-2">${cards}</div>
<h3>와이퍼에 대한 모든 궁금증 해결</h3>
<a class="guide-card" href="${base}/guide/">
  <strong>${escapeHtml(GUIDE_HUB_TITLE)}</strong>
  <span>${escapeHtml(GUIDE_HUB_SUMMARY)}</span>
</a>`,
  });
}

export function renderModelPage({ base, siteUrl, brand, models }) {
  const seo = seoBrand(brand);
  const cards = models
    .map(
      (m) => `<a class="model-card" href="${base}/${brand.id}/${m.id}/">
      <strong>${escapeHtml(m.name)}</strong>
      <span>${m.genCount}개 세대</span>
    </a>`
    )
    .join("");

  const breadcrumb = [{ label: brand.name, href: `/${brand.id}/` }];

  return layout({
    documentTitle: seo.documentTitle,
    description: seo.description,
    canonicalPath: seo.path,
    siteUrl,
    base,
    breadcrumb,
    jsonLd: buildJsonLd({ siteUrl, base, breadcrumb }),
    body: `<h1>${escapeHtml(brand.name)} 와이퍼 사이즈</h1>
<p class="sub">차종을 선택하세요</p>
<div class="grid-responsive">${cards}</div>`,
  });
}

export function renderMyCarsPage({ base, siteUrl }) {
  const seo = seoMyCars();
  return layout({
    documentTitle: seo.documentTitle,
    description: seo.description,
    canonicalPath: seo.path,
    siteUrl,
    base,
    breadcrumb: [],
    body: `<h1>내 차 보기</h1>
<p class="sub">저장한 차량은 이 기기 브라우저에만 보관됩니다.</p>
<div id="my-cars-empty" class="my-empty">아직 저장한 차가 없습니다.<br>세대 선택 화면에서 ☆를 눌러 저장하세요.</div>
<div id="my-cars-list"></div>`,
  });
}

export function renderGenerationPage({ base, siteUrl, brand, model, generations, imageBase }) {
  const cards = generations
    .map((g) => {
      const img = g.imageFile;
      const imgTag = img
        ? `<img src="${imageBase}${escapeHtml(img)}" alt="${escapeHtml(g.label)}" loading="lazy">`
        : `<div class="placeholder">${escapeHtml(g.code)}<br>사진 준비 중</div>`;
      const href = `${base}/${brand.id}/${model.id}/${g.id}/`;
      return `<article class="gen-card">
        <div class="gen-photo-wrap">
          <a class="gen-card-link" href="${href}">
            <div class="gen-photo">${imgTag}${powerBadgeHtml(g.powerBadge, g.hybrid, { overlay: true })}</div>
          </a>
          ${favBtnHtml({ brand, model, gen: g, imageFile: img })}
        </div>
        <a class="gen-card-link" href="${href}">
          <div class="gen-body">
            <strong>${escapeHtml(g.label)}</strong>
            <div class="years">${escapeHtml(g.years)}</div>
            ${g.hint ? `<div class="hint">${escapeHtml(g.hint)}</div>` : ""}
          </div>
        </a>
      </article>`;
    })
    .join("");

  const seo = seoGeneration(brand, model);
  const breadcrumb = [
    { label: brand.name, href: `/${brand.id}/` },
    { label: model.name, href: `/${brand.id}/${model.id}/` },
  ];

  return layout({
    documentTitle: seo.documentTitle,
    description: seo.description,
    canonicalPath: seo.path,
    siteUrl,
    base,
    breadcrumb,
    showBreadcrumb: true,
    jsonLd: buildJsonLd({ siteUrl, base, breadcrumb }),
    body: `<h1>${escapeHtml(model.name)} 와이퍼 사이즈</h1>
<p class="sub">내 차와 비슷한 세대를 선택하세요</p>
<div class="gen-grid">${cards}</div>`,
  });
}

function productCard({ title, url, tag = "쿠팡", cta = false, ctaLabel = "보기" }) {
  if (!url) return "";
  const btnClass = cta ? "btn btn-primary btn-cta" : "btn btn-primary";
  const cardClass = cta ? "product-card product-card-cta" : "product-card";
  return `<div class="${cardClass}">
    <div class="info">
      <span class="tag">${escapeHtml(tag)}</span>
      <div class="title">${escapeHtml(title)}</div>
    </div>
    <a class="${btnClass}" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer sponsored">${escapeHtml(ctaLabel)}</a>
  </div>`;
}

function formatPrice(n) {
  const v = Number(n);
  if (!v) return "";
  return `${v.toLocaleString("ko-KR")}원`;
}

function productGridHtml(productsEntry, gen) {
  if (!productsEntry?.products?.length) return "";
  const tiles = productsEntry.products
    .slice(0, 6)
    .map((p) => {
      const meta = [p.rocket ? "로켓배송" : "", p.freeShipping ? "무료배송" : ""]
        .filter(Boolean)
        .join(" · ");
      return `<a class="product-tile" href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer sponsored">
        <div class="product-tile-img">${p.image ? `<img src="${escapeHtml(p.image)}" alt="" loading="lazy">` : ""}</div>
        <div class="product-tile-body">
          <div class="product-tile-name">${escapeHtml(p.name)}</div>
          ${meta ? `<div class="product-tile-meta">${escapeHtml(meta)}</div>` : ""}
          <div class="product-tile-price">${escapeHtml(formatPrice(p.price))}</div>
        </div>
      </a>`;
    })
    .join("");

  const moreUrl = productsEntry.searchMoreUrl || productsEntry.products[0]?.url;
  const moreLink = moreUrl
    ? `<a class="product-more" href="${escapeHtml(moreUrl)}" target="_blank" rel="noopener noreferrer sponsored">더 보기 ›</a>`
    : "";
  const sizeLabel =
    gen?.driver_mm && gen?.passenger_mm ? `${gen.driver_mm}·${gen.passenger_mm}mm` : "와이퍼 사이즈";
  const shown = productsEntry.products.length;
  const matched = productsEntry.matchedCount ?? shown;
  const notes =
    matched >= shown
      ? [
          "현재 차종의 와이퍼 사이즈와 일치하는 제품 리스트",
          "오프라인보다 저렴하게 구매해서 오래 사용해보세요!",
        ]
      : matched > 0
        ? [
            "제품 구매페이지에서 사이즈 수정이 가능합니다",
            `${sizeLabel}대로 옵션에서 선택하여 구매하세요!`,
          ]
        : [`아래 제품을 클릭하여 ${sizeLabel}를 선택하시면 구매가능합니다`];
  const noteItems = notes.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  const crossBlock =
    gen?.cross_title && gen?.cross_url
      ? `<div class="product-cross-section">${productCard({
          title: gen.cross_title,
          url: gen.cross_url,
          tag: "추천",
          ctaLabel: "쿠팡에서 보기",
        })}</div>`
      : "";
  const productFooter = `<div class="product-footer">
    <div class="product-trust">
      <p class="product-trust-blink">와이퍼 작동 시 '우드득' 소리가 나면 교체 시점입니다.</p>
    </div>
    ${crossBlock}
    <span class="product-ftc">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</span>
  </div>`;

  return `<div class="product-section">
    <div class="product-section-head">
      <p class="section-title">✅ 한번사면 오래 쓰는 가성비 와이퍼</p>
      ${moreLink}
    </div>
    <ul class="product-note">
      ${noteItems}
    </ul>
    <div class="product-grid">${tiles}</div>
    ${productFooter}
  </div>`;
}

function blockTitleHtml(title) {
  return `<h2 class="block-title">${escapeHtml(title)}</h2>`;
}

function faqSectionHtml({ brand, model, gen, base }) {
  const items = buildResultFaq({ brand, model, gen, base });
  const rows = items
    .map(({ q, a, guideId }) => {
      const link = guideId
        ? ` <a href="${base}/guide/${escapeHtml(guideId)}/">자세히 보기</a>`
        : "";
      return `<details class="faq-item">
        <summary>${escapeHtml(q)}</summary>
        <div class="faq-answer">${escapeHtml(a)}${link}</div>
      </details>`;
    })
    .join("");

  return `<section class="content-block faq-section">
    ${blockTitleHtml("자주하는 질문")}
    <div class="faq-list">${rows}</div>
  </section>`;
}

function postRelatedHtml(base, guideIds = RESULT_RELATED_GUIDE_IDS, { panel = false } = {}) {
  const links = guideIds
    .map((id) => {
      const g = getGuide(id);
      if (!g) return "";
      return `<li><a href="${base}/guide/${escapeHtml(id)}/">${escapeHtml(g.title)}</a></li>`;
    })
    .filter(Boolean)
    .join("");

  if (!links) return "";

  const inner = `${blockTitleHtml("함께 보면 좋은 글")}<ul class="post-related-list">${links}</ul>`;

  if (panel) {
    return `<section class="guide-panel guide-panel--related">${inner}</section>`;
  }

  return `<aside class="content-block post-related">${inner}</aside>`;
}

function relatedGuidesSectionHtml(base, guideIds = RESULT_RELATED_GUIDE_IDS, options = {}) {
  return postRelatedHtml(base, guideIds, options);
}

function renderGuideBlocks(blocks) {
  const inner = blocks
    .map((block) => {
      if (block.type === "h2") {
        return `<h2>${escapeHtml(block.text)}</h2>`;
      }
      if (block.type === "p") {
        return `<p>${escapeHtml(block.text)}</p>`;
      }
      if (block.type === "ul") {
        const items = (block.items || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("");
        return `<ul>${items}</ul>`;
      }
      if (block.type === "table") {
        const rows = block.rows || [];
        const [head, ...body] = rows;
        const thead = head
          ? `<thead><tr>${head.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr></thead>`
          : "";
        const tbody = body
          .map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
          .join("");
        return `<table class="guide-table">${thead}<tbody>${tbody}</tbody></table>`;
      }
      if (block.type === "youtube" && block.videoId) {
        const start = block.start ? `?start=${Number(block.start)}` : "";
        return `<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/${escapeHtml(block.videoId)}${start}" title="와이퍼 교체 방법" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      }
      return "";
    })
    .join("\n");

  return `<div class="guide-body">${inner}</div>`;
}

function relatedGuidesForGuide(base, guide) {
  const ids = guide.relatedIds?.length ? guide.relatedIds : RESULT_RELATED_GUIDE_IDS;
  return relatedGuidesSectionHtml(base, ids.filter((id) => id !== guide.id), { panel: true });
}

export function renderResultPage({ base, siteUrl, brand, model, gen, productsEntry, imageBase }) {
  const rearCell = gen.rearDisplay.value
    ? `<div class="value">${escapeHtml(gen.rearDisplay.value)}</div>${gen.rearDisplay.unit ? `<div class="unit">${escapeHtml(gen.rearDisplay.unit)}</div>` : ""}`
    : `<div class="value">—</div>`;

  const rearMsg = gen.rearMessage
    ? `<div class="rear-msg">${escapeHtml(gen.rearMessage)}</div>`
    : "";

  const frontCard = productCard({
    title: gen.product_title_front,
    url: gen.coupang_url_front,
    cta: true,
    ctaLabel: "쿠팡에서 이 사이즈로 보기",
  });

  const rearCard =
    gen.rear_type !== "none" && gen.coupang_url_rear
      ? productCard({
          title: gen.product_title_rear,
          url: gen.coupang_url_rear,
          ctaLabel: "쿠팡에서 가격 확인",
        })
      : "";

  const productGrid = productGridHtml(productsEntry, gen);
  const seo = seoResult(brand, model, gen);
  const faqItems = buildResultFaq({ brand, model, gen, base });
  const faqSection = faqSectionHtml({ brand, model, gen, base });
  const relatedSection = relatedGuidesSectionHtml(base);
  const heroImg = gen.imageFile
    ? `<div class="result-hero"><img src="${imageBase}${escapeHtml(gen.imageFile)}" alt="${escapeHtml(gen.label)}" loading="eager" fetchpriority="high">${favBtnHtml({ brand, model, gen, imageFile: gen.imageFile, labeled: true })}</div>`
    : "";
  const headFav = gen.imageFile
    ? ""
    : favBtnHtml({ brand, model, gen, imageFile: gen.imageFile, labeled: true });
  const breadcrumb = [
    { label: brand.name, href: `/${brand.id}/` },
    { label: model.name, href: `/${brand.id}/${model.id}/` },
    { label: gen.label, href: `/${brand.id}/${model.id}/${gen.id}/` },
  ];

  return layout({
    documentTitle: seo.documentTitle,
    description: seo.description,
    canonicalPath: seo.path,
    siteUrl,
    base,
    breadcrumb,
    showBreadcrumb: true,
    jsonLd: buildJsonLd({
      siteUrl,
      base,
      breadcrumb,
      extra: [
        resultPageJsonLd({ siteUrl, base, brand, model, gen, description: seo.description }),
        faqPageJsonLd({ siteUrl, base, brand, model, gen, faqItems }),
      ],
    }),
    body: `${heroImg}<div class="result-head">
      <div class="head-row">
        <h1>${escapeHtml(gen.label)}${powerBadgeHtml(gen.powerBadge, gen.hybrid)} <span class="badge">${escapeHtml(gen.years)}</span></h1>
        ${headFav}
      </div>
      <p class="sub">와이퍼 사이즈 (mm)</p>
    </div>
    <div class="size-table">
      <div class="size-cell"><div class="label">운전석</div><div class="value">${escapeHtml(gen.driver_mm)}</div><div class="unit">mm</div></div>
      <div class="size-cell"><div class="label">조수석</div><div class="value">${escapeHtml(gen.passenger_mm)}</div><div class="unit">mm</div></div>
      <div class="size-cell"><div class="label">후방</div>${rearCell}</div>
    </div>
    ${rearMsg}
    ${productGrid}
    ${frontCard ? `<p class="section-title">바로 구매</p><p class="section-sub">mm 확인 후 아래에서 바로 이동하세요.</p>${frontCard}${rearCard}` : ""}
    ${faqSection}
    ${relatedSection}`,
  });
}

const URGENCY_LABEL = {
  immediate: "즉시 조치",
  soon: "점검 필요",
  info: "참고",
};

function parseWarningList(text) {
  return String(text ?? "")
    .split(/\n|\s*\/\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function listFromMultiline(text) {
  return parseWarningList(text)
    .map((s) => `<li>${escapeHtml(s)}</li>`)
    .join("");
}

function warningTopicShort(keyword) {
  return String(keyword ?? "")
    .replace(/ 경고등$/, "")
    .replace(/ 부족$/, "")
    .trim() || "경고등";
}

/** 확인하기 쉬운 순서 (키워드 포함 여부로 정렬) */
const WARNING_CAUSE_ORDER = {
  "check-engine": ["연료", "캡", "배기", "센서", "실화"],
  engine_check_warning: ["연료", "캡", "배기", "센서", "실화"],
  fuel: ["연료", "주유", "캡"],
  low_fuel_warning: ["연료", "주유", "캡"],
  tpms: ["공기압", "타이어", "펑크"],
  tpms_warning: ["공기압", "타이어", "펑크"],
  washer: ["워셔", "액"],
  washer_fluid_warning: ["워셔", "액"],
};

function sortWarningCauses(causes, warningId) {
  const order = WARNING_CAUSE_ORDER[warningId];
  if (!order?.length) return causes;
  return [...causes].sort((a, b) => {
    const rank = (s) => {
      const i = order.findIndex((k) => s.includes(k));
      return i === -1 ? order.length : i;
    };
    return rank(a) - rank(b);
  });
}

function formatCauseSuspected(text) {
  let s = text.trim().replace(/\s*발생\s*$/, "");
  if (!s.endsWith("의심")) s = `${s} 의심`;
  return s;
}

function warningDetailSections(w, meta) {
  const topic = warningTopicShort(meta.keyword);
  const isInfo = w.urgency === "info";

  if (isInfo) {
    return {
      causeTitle: "이 표시등 안내",
      causeIntro: w.meaning || `${topic}에 대한 안내입니다.`,
      guessTitle: "확인할 내용",
      actionTitle: "이렇게 하세요",
      useSuspected: false,
    };
  }

  const meaning = String(w.meaning ?? "").trim();
  const shortMeaning = !meaning || meaning.length < 30 || /문제발생!?/.test(meaning);
  const colorLead = meta.colorLabel
    ? isInfo
      ? `${meta.colorLabel} ${topic} 표시등이 켜져 있다면 `
      : `${meta.colorLabel} ${topic} 경고등이 점등되면, `
    : "";
  const causeIntro = shortMeaning
    ? `${colorLead}${topic}에 문제가 발생한 것으로 보이며, 세부 원인은 아래와 같습니다.`
    : colorLead
      ? `${colorLead}${meaning}`
      : meaning;

  return {
    causeTitle: "이 경고등이 점등된 원인",
    causeIntro,
    guessTitle: `추정되는 ${topic} 문제`,
    actionTitle: `${topic} 문제는 이렇게 해결하세요!`,
    useSuspected: true,
  };
}

function buildWarningCauses(w, meta) {
  const sections = warningDetailSections(w, meta);
  const items = sortWarningCauses(parseWarningList(w.causes), w.id);
  const formatted = sections.useSuspected ? items.map(formatCauseSuspected) : items;
  return listFromMultiline(formatted.join("\n"));
}

function buildWarningActions(w, meta) {
  const sections = warningDetailSections(w, meta);
  const sheetItems = parseWarningList(w.actions);
  const items = [];

  if (w.urgency === "immediate") {
    if (sheetItems.length) items.push(...sheetItems);
    items.push("즉시 안전한 곳에 정차하세요.");
    items.push(
      "주행이 어렵거나 이상 증상이 있으면 더 이상 주행하지 말고, 보험사에 연락하여 견인을 요청하세요."
    );
  } else if (w.urgency === "soon") {
    const sheetText = sheetItems.join(" ");
    const needsDiagnostic = /진단|점검\s*수리/.test(sheetText);
    items.push(
      needsDiagnostic
        ? "주행이 가능하다면 서행하여 주변 정비소로 이동하여 진단 장비로 점검받는 것을 권장합니다."
        : "주행이 가능하다면 서행하여 주변 정비소로 이동하여 점검 받는 것을 권장합니다."
    );
    items.push(
      "출력 저하·시동 불량·이상 소음 등 주행이 어렵다면 정차하고, 보험사에 연락하여 견인을 요청하세요."
    );
  } else {
    items.push(...(sheetItems.length ? sheetItems : ["표시등 안내에 따라 조작하세요."]));
  }

  return { actionTitle: sections.actionTitle, html: listFromMultiline(items.join("\n")) };
}

function warningIconAlt(w, meta) {
  const shape = meta?.visualTags?.[0]?.replace(/^자동차\s*/, "") ?? w.label;
  const color = meta?.colorLabel ? `${meta.colorLabel} ` : "";
  return `${color}${w.label} (${shape} 아이콘)`;
}

function warningImgHtml(w, imageBase, { large = false, meta = null } = {}) {
  const file = w.iconFile || `${w.id}.png`;
  if (w.hasIcon === false) {
    return `<div class="warn-placeholder">${escapeHtml(w.id)}<br>준비 중</div>`;
  }
  const cls = large ? "warn-icon-img" : "";
  const src = `${imageBase}${encodeURIComponent(file)}`;
  const alt = meta ? warningIconAlt(w, meta) : w.label;
  return `<img class="${cls}" src="${src}" alt="${escapeHtml(alt)}" loading="lazy">`;
}

function warningSearchHintHtml(meta) {
  const hint = warningSearchHint(meta);
  if (!hint) return "";
  const colorPart = meta.colorLabel
    ? `<strong>${escapeHtml(meta.colorLabel)}</strong> `
    : "";
  const line1 = `<span class="warn-search-hint-line">계기판 ${colorPart}${escapeHtml(hint.shapePhrase)} 모양으로 찾으셔도 <strong>${escapeHtml(meta.keyword)}</strong> 안내입니다.</span>`;
  const examples = hint.searchExamples.slice(0, 2);
  const line2 = examples.length
    ? `<span class="warn-search-hint-line">${examples.map((s) => `<strong>${escapeHtml(s)}</strong>`).join(", ")} 등으로 보이는 경우에도 같은 원인입니다.</span>`
    : "";
  return `<p class="warn-search-hint">${line1}${line2}</p>`;
}

function warningVisualTagsHtml(meta) {
  if (!meta.visualTags?.length) return "";
  const tags = meta.visualTags.map((t) => `<li>${escapeHtml(t)}</li>`).join("");
  return `<ul class="warn-visual-tags" aria-label="아이콘 검색 표현">${tags}</ul>`;
}

const WARNING_COLOR_GUIDE = `<div class="warn-color-guide">
  <div class="warn-color-block">
    <h2>빨간색 경고등</h2>
    <p>차량의 안전이나 심각한 이상과 관련될 가능성이 있어 즉각적인 확인이 필요한 경우가 많습니다.</p>
  </div>
  <div class="warn-color-block">
    <h2>노란색·주황색 경고등</h2>
    <p>당장 운행이 불가능하다는 뜻은 아닐 수 있지만 차량에 이상이 감지됐거나 점검이 필요하다는 의미로 사용됩니다.</p>
  </div>
  <div class="warn-color-block">
    <h2>초록색·파란색 표시등</h2>
    <p>전조등, 방향지시등 등 특정 기능이 현재 작동하고 있다는 것을 알려주는 경우가 많습니다.</p>
  </div>
  <p class="warn-color-note">단, 색상만으로 모든 상황을 판단해서는 안 되며 차량 사용설명서의 정확한 의미를 확인하는 것이 가장 중요합니다.</p>
</div>`;

export function renderWarningListPage({ base, siteUrl, warnings, imageBase }) {
  const seo = seoWarningList();
  const cards = warnings
    .map(
      (w) => `<a class="warn-icon-card" href="${base}/warnings/${escapeHtml(w.id)}/" aria-label="${escapeHtml(w.label)}">
      ${warningImgHtml(w, imageBase)}
    </a>`
    )
    .join("");

  return layout({
    documentTitle: seo.documentTitle,
    description: seo.description,
    canonicalPath: seo.path,
    siteUrl,
    base,
    keywords: seo.keywords ?? "",
    body: `<h1>${escapeHtml(WARNING_LIST_TITLE)}</h1>
<p class="sub">계기판에 <strong>보이는 아이콘</strong>을 눌러 경고등 이름·원인·조치 방법을 확인하세요</p>
${WARNING_COLOR_GUIDE}
<div class="warn-grid">${cards}</div>`,
  });
}

export function renderWarningDetailPage({ base, siteUrl, warning, imageBase }) {
  const w = warning;
  const seo = seoWarningDetail(w);
  const urgency = URGENCY_LABEL[w.urgency] || URGENCY_LABEL.info;
  const sections = warningDetailSections(w, seo.meta);
  const causes = buildWarningCauses(w, seo.meta);
  const { actionTitle, html: actions } = buildWarningActions(w, seo.meta);

  const breadcrumb = [
    { label: "경고등 종류", href: "/warnings/" },
    { label: seo.breadcrumbLabel, href: `/warnings/${w.id}/` },
  ];

  const faqLd = warningFaqJsonLd({ siteUrl, base, warning: w, meta: seo.meta });

  return layout({
    documentTitle: seo.documentTitle,
    description: seo.description,
    canonicalPath: seo.path,
    siteUrl,
    base,
    breadcrumb,
    showBreadcrumb: true,
    keywords: seo.keywords ?? "",
    jsonLd: buildJsonLd({ siteUrl, base, breadcrumb, extra: [faqLd] }),
    body: `<div class="warn-detail-head">
      <button type="button" class="share-btn share-btn--corner" data-share-title="${escapeHtml(seo.h1)}" data-share-text="${escapeHtml(w.summary)}" aria-label="공유하기">공유</button>
      <div class="warn-icon-stack">
        ${warningImgHtml(w, imageBase, { large: true, meta: seo.meta })}
        <span class="urgency-badge urgency-badge--${escapeHtml(w.urgency || "info")}">${escapeHtml(urgency)}</span>
      </div>
      <h1>${escapeHtml(seo.h1)}</h1>
      <p class="sub" style="margin:0;">${escapeHtml(w.summary)}</p>
      ${warningSearchHintHtml(seo.meta)}
      ${warningVisualTagsHtml(seo.meta)}
    </div>
    <div class="warn-section">
      <h2>${escapeHtml(sections.causeTitle)}</h2>
      <p>${escapeHtml(sections.causeIntro)}</p>
    </div>
    <div class="warn-section">
      <h2>${escapeHtml(sections.guessTitle)}</h2>
      <ul>${causes}</ul>
    </div>
    <div class="warn-section">
      <h2>${escapeHtml(actionTitle)}</h2>
      <ul>${actions}</ul>
    </div>
    <p class="warn-disclaimer">※ 차종·연식에 따라 경고등 모양과 의미가 다를 수 있습니다. 참고용이며, 정확한 진단은 정비소에서 받으세요.</p>`,
  });
}

export function renderPrivacyPage({ base, siteUrl }) {
  const seo = seoPrivacy();
  const breadcrumb = [{ label: "개인정보처리방침", href: "/privacy/" }];

  return layout({
    documentTitle: seo.documentTitle,
    description: seo.description,
    canonicalPath: seo.path,
    siteUrl,
    base,
    breadcrumb,
    showBreadcrumb: true,
    body: `<h1>개인정보처리방침</h1>
<p class="sub">시행일: 2026년 8월 9일</p>
<div class="privacy-section">
  <h2>1. 개요</h2>
  <p>${escapeHtml(SITE_NAME)}(이하 「본 사이트」)는 이용자의 개인정보를 중요하게 생각합니다. 본 사이트는 회원가입 없이 이용할 수 있는 정보 제공 서비스입니다.</p>
  <h2>2. 수집하는 정보</h2>
  <ul>
    <li><strong>자동 수집:</strong> Cloudflare 등 호스팅·보안 서비스를 통해 접속 IP, 브라우저 종류, 접속 일시 등이 처리될 수 있습니다.</li>
    <li><strong>로컬 저장:</strong> 「내 차 보기」 기능 사용 시, 선택한 차량 정보가 이용자 기기의 브라우저 저장소(localStorage)에만 저장되며 서버로 전송되지 않습니다.</li>
  </ul>
  <h2>3. 이용 목적</h2>
  <ul>
    <li>와이퍼 사이즈·경고등 정보 제공</li>
    <li>서비스 안정성·보안 유지</li>
    <li>접속 통계 및 서비스 개선</li>
  </ul>
  <h2>4. 제3자 링크·광고</h2>
  <p>본 사이트는 쿠팡 파트너스 등 제휴 링크를 포함할 수 있습니다. 외부 사이트로 이동 시 해당 사이트의 개인정보처리방침이 적용됩니다. Google AdSense 등 광고 서비스를 도입하는 경우, 해당 사업자의 쿠키·광고 정책이 추가로 적용될 수 있습니다.</p>
  <h2>5. 보관 및 파기</h2>
  <p>서버에 별도로 저장하는 개인정보는 없습니다. 브라우저 localStorage에 저장된 「내 차」 정보는 이용자가 직접 삭제하거나 브라우저 데이터를 삭제하면 제거됩니다.</p>
  <h2>6. 문의</h2>
  <p>개인정보 관련 문의는 사이트 운영자에게 연락해 주세요.</p>
</div>`,
  });
}

export function renderGuideListPage({ base, siteUrl }) {
  const seo = seoGuideList();
  const cards = GUIDES.map(
    (g) => `<a class="guide-card" href="${base}/guide/${escapeHtml(g.id)}/">
      <strong>${escapeHtml(g.title)}</strong>
      <span>${escapeHtml(g.summary)}</span>
    </a>`
  ).join("");

  const breadcrumb = [{ label: GUIDE_HUB_TITLE, href: "/guide/" }];

  return layout({
    documentTitle: seo.documentTitle,
    description: seo.description,
    canonicalPath: seo.path,
    siteUrl,
    base,
    breadcrumb,
    showBreadcrumb: true,
    body: `<h1>${escapeHtml(GUIDE_HUB_TITLE)}</h1>
<p class="sub">${escapeHtml(GUIDE_HUB_SUMMARY)}</p>
<div class="guide-grid">${cards}</div>
<p class="sub" style="margin-top:16px;"><a href="${base}/" style="color:var(--accent);text-decoration:none;">← 차종별 와이퍼 사이즈 검색</a></p>`,
  });
}

export function renderGuidePage({ base, siteUrl, guide }) {
  const seo = seoGuide(guide);
  const breadcrumb = [
    { label: GUIDE_HUB_TITLE, href: "/guide/" },
    { label: guide.title, href: `/guide/${guide.id}/` },
  ];

  return layout({
    documentTitle: seo.documentTitle,
    description: seo.description,
    canonicalPath: seo.path,
    siteUrl,
    base,
    breadcrumb,
    showBreadcrumb: true,
    jsonLd: buildJsonLd({ siteUrl, base, breadcrumb }),
    body: `<article class="guide-article">
      <section class="guide-panel guide-panel--body">
        <h1>${escapeHtml(guide.title)}</h1>
        <p class="sub">${escapeHtml(guide.summary)}</p>
        ${renderGuideBlocks(guide.blocks)}
      </section>
      ${relatedGuidesForGuide(base, guide)}
      <p class="sub" style="margin-top:16px;"><a href="${base}/" style="color:var(--accent);text-decoration:none;">내 차 와이퍼 사이즈 검색 →</a></p>
    </article>`,
  });
}
