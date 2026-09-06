(function () {
  const KEY = "wiperfinder_mycars";
  const base = window.WIPER_BASE || "";

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  }

  function write(cars) {
    localStorage.setItem(KEY, JSON.stringify(cars));
  }

  function carKey(car) {
    return `${car.brandId}/${car.modelId}/${car.genId}`;
  }

  function isSaved(key) {
    return read().some((c) => carKey(c) === key);
  }

  function save(car) {
    const key = carKey(car);
    const cars = read().filter((c) => carKey(c) !== key);
    cars.unshift({ ...car, savedAt: Date.now() });
    write(cars.slice(0, 20));
  }

  function remove(key) {
    write(read().filter((c) => carKey(c) !== key));
  }

  function toggle(car) {
    const key = carKey(car);
    if (isSaved(key)) remove(key);
    else save(car);
    syncButtons();
    renderMyPage();
  }

  function carFromButton(btn) {
    return {
      brandId: btn.dataset.brandId,
      brandName: btn.dataset.brandName,
      modelId: btn.dataset.modelId,
      modelName: btn.dataset.modelName,
      genId: btn.dataset.genId,
      label: btn.dataset.label,
      years: btn.dataset.years,
      image: btn.dataset.image,
      url: btn.dataset.url,
    };
  }

  function syncButtons() {
    document.querySelectorAll(".fav-btn").forEach((btn) => {
      const key = `${btn.dataset.brandId}/${btn.dataset.modelId}/${btn.dataset.genId}`;
      const saved = isSaved(key);
      btn.classList.toggle("fav-btn--on", saved);
      btn.setAttribute("aria-pressed", saved ? "true" : "false");
      const icon = btn.querySelector(".fav-icon");
      if (icon) {
        icon.textContent = saved ? "★" : "☆";
      } else {
        btn.textContent = saved ? "★" : "☆";
      }
    });
  }

  function renderMyPage() {
    const root = document.getElementById("my-cars-list");
    const empty = document.getElementById("my-cars-empty");
    if (!root) return;

    const cars = read();
    if (empty) empty.hidden = cars.length > 0;
    root.innerHTML = cars
      .map((car) => {
        const href = `${base}${car.url}`;
        const img = car.image
          ? `<img src="${base}/images/cars/${car.image}" alt="" loading="lazy">`
          : `<div class="placeholder">${car.genId}</div>`;
        const key = carKey(car);
        return `<article class="my-car-card">
          <a href="${href}" class="my-car-link">
            <div class="my-car-photo">${img}</div>
            <div class="my-car-body">
              <strong>${car.label}</strong>
              <span>${car.brandName} · ${car.modelName}</span>
              <span class="years">${car.years || ""}</span>
            </div>
          </a>
          <button type="button" class="fav-btn fav-btn--on my-car-remove"
            data-brand-id="${car.brandId}" data-brand-name="${car.brandName}"
            data-model-id="${car.modelId}" data-model-name="${car.modelName}"
            data-gen-id="${car.genId}" data-label="${car.label}"
            data-years="${car.years || ""}" data-image="${car.image || ""}"
            data-url="${car.url}" aria-label="저장 해제">★</button>
        </article>`;
      })
      .join("");
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".fav-btn");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    toggle(carFromButton(btn));
  });

  document.addEventListener("DOMContentLoaded", () => {
    syncButtons();
    renderMyPage();
  });
})();
