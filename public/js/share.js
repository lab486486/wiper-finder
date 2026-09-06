(function () {
  document.addEventListener("click", async (event) => {
    const btn = event.target.closest(".share-btn");
    if (!btn) return;

    const url = window.location.href;
    const title = btn.dataset.shareTitle || document.title;
    const text = btn.dataset.shareText || "";

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      const original = btn.textContent;
      btn.textContent = "링크 복사됨";
      btn.classList.add("share-btn--done");
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("share-btn--done");
      }, 2000);
    } catch {
      window.prompt("아래 링크를 복사하세요.", url);
    }
  });
})();
