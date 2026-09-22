(function () {
  "use strict";

  var STORAGE_KEY = "wiper_coupang_reload_log";
  var WINDOW_MS = 10 * 60 * 1000;
  var MAX_RELOADS = 3;
  var G_JS = "https://ads-partners.coupang.com/g.js";

  var WIDGET = {
    id: 1007738,
    template: "carousel",
    trackingCode: "AF2348630",
    width: "680",
    height: "140",
    tsource: "",
  };

  function getNavigationType() {
    var entries = performance.getEntriesByType("navigation");
    if (entries && entries.length) return entries[0].type;

    if (performance.navigation) {
      switch (performance.navigation.type) {
        case 1:
          return "reload";
        case 2:
          return "back_forward";
        default:
          return "navigate";
      }
    }

    return "navigate";
  }

  function readReloadLog() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      var now = Date.now();
      return parsed.filter(function (t) {
        return now - t < WINDOW_MS;
      });
    } catch (_err) {
      return [];
    }
  }

  function writeReloadLog(timestamps) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timestamps));
    } catch (_err) {}
  }

  function trackReloadAndCheckAbuse() {
    var log = readReloadLog();
    if (getNavigationType() === "reload") {
      log.push(Date.now());
    }
    writeReloadLog(log);
    return log.length >= MAX_RELOADS;
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

  function init() {
    var root = document.getElementById("coupang-banner");
    var slot = document.getElementById("coupang-banner-slot");
    if (!root || !slot) return;

    if (trackReloadAndCheckAbuse()) {
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
