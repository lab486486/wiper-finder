(function () {
  "use strict";

  var COUNT_KEY = "page_refresh_count";
  var BLOCK_KEY = "coupang_block_until";
  var MAX_RELOAD = 3;
  var BLOCK_TIME_MS = 10 * 60 * 1000;
  var G_JS = "https://ads-partners.coupang.com/g.js";

  var WIDGET = {
    id: 1007738,
    template: "carousel",
    trackingCode: "AF2348630",
    width: "680",
    height: "140",
    tsource: "",
  };

  function isReloadNavigation() {
    var perfEntries = performance.getEntriesByType("navigation");
    if (perfEntries.length > 0 && perfEntries[0].type === "reload") return true;
    if (performance.navigation && performance.navigation.type === 1) return true;
    return false;
  }

  function hideBanner(root) {
    root.classList.add("coupang-banner--hidden");
    root.setAttribute("aria-hidden", "true");
  }

  function initWidget() {
    if (!window.PartnersCoupang || typeof window.PartnersCoupang.G !== "function") return;
    new window.PartnersCoupang.G(WIDGET);
  }

  function loadBannerScripts(slot) {
    if (window.PartnersCoupang && typeof window.PartnersCoupang.G === "function") {
      initWidget();
      return;
    }

    var gScript = document.createElement("script");
    gScript.src = G_JS;
    gScript.async = true;
    gScript.onload = function () {
      var widgetScript = document.createElement("script");
      widgetScript.text =
        "new PartnersCoupang.G(" + JSON.stringify(WIDGET) + ");";
      slot.appendChild(widgetScript);
    };
    slot.appendChild(gScript);
  }

  function shouldBlockBanner() {
    var now = Date.now();
    var blockUntil = parseInt(localStorage.getItem(BLOCK_KEY) || "0", 10);

    if (now < blockUntil) return true;

    if (blockUntil && now >= blockUntil) {
      localStorage.removeItem(BLOCK_KEY);
    }

    var count = parseInt(sessionStorage.getItem(COUNT_KEY) || "0", 10);

    if (isReloadNavigation()) {
      count += 1;
      sessionStorage.setItem(COUNT_KEY, String(count));
    }

    if (count >= MAX_RELOAD) {
      localStorage.setItem(BLOCK_KEY, String(now + BLOCK_TIME_MS));
      sessionStorage.removeItem(COUNT_KEY);
      return true;
    }

    return false;
  }

  function init() {
    var root = document.getElementById("coupang-banner");
    var slot = document.getElementById("coupang-banner-slot");
    if (!root || !slot) return;

    if (shouldBlockBanner()) {
      hideBanner(root);
      return;
    }

    loadBannerScripts(slot);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
