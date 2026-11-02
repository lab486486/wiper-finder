(function () {
  const DELAY_MS = 1000;

  const target =
    document.getElementById("model-scroll-hint") || document.getElementById("wiper-size");
  if (!target) return;

  let cancelled = false;
  let startY = window.scrollY || window.pageYOffset || 0;

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
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      block: "start",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, DELAY_MS);
})();
