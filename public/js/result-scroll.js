(function () {
  const TARGET_ID = "result-head";
  const PARTNERS_SELECTOR = ".product-section";
  const DELAY_MS = 1000;
  /** 쿠팡 섹션 상단이 이 비율보다 아래에 있으면 "안 보임"으로 보고 스크롤 */
  const VISIBLE_TOP_RATIO = 0.7;

  const target = document.getElementById(TARGET_ID);
  if (!target) return;

  const partners = document.querySelector(PARTNERS_SELECTOR);
  if (!partners) return;

  let cancelled = false;
  let startY = window.scrollY || window.pageYOffset || 0;

  function partnersNeedsReveal() {
    const top = partners.getBoundingClientRect().top;
    const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
    if (!viewportH) return false;
    // 세로가 짧아 사진·사이즈만 보이고 쿠팡 섹션이 거의/완전히 아래일 때
    return top > viewportH * VISIBLE_TOP_RATIO;
  }

  function cancel() {
    cancelled = true;
    cleanup();
  }

  function onUserScroll() {
    const y = window.scrollY || window.pageYOffset || 0;
    if (Math.abs(y - startY) > 8) cancel();
  }

  function cleanup() {
    window.removeEventListener("wheel", cancel, { passive: true });
    window.removeEventListener("touchmove", cancel, { passive: true });
    window.removeEventListener("scroll", onUserScroll, { passive: true });
    window.removeEventListener("keydown", onKeyScroll);
  }

  function onKeyScroll(event) {
    const keys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];
    if (keys.includes(event.key)) cancel();
  }

  window.addEventListener("wheel", cancel, { passive: true });
  window.addEventListener("touchmove", cancel, { passive: true });
  window.addEventListener("scroll", onUserScroll, { passive: true });
  window.addEventListener("keydown", onKeyScroll);

  window.setTimeout(function () {
    if (cancelled) return;
    cleanup();
    if (!partnersNeedsReveal()) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      block: "start",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, DELAY_MS);
})();
