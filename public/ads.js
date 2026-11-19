"use strict";

(() => {
  const desktop = matchMedia("(min-width: 728px)");
  const mobile = matchMedia("(min-width: 320px)");
  const formats = {
    desktop: { size: "desktop", width: 728, height: 90 },
    mobile: { size: "mobile", width: 320, height: 50 }
  };
  const slots = document.querySelectorAll("[data-ad-slot]");
  let active;

  function renderAds() {
    const format = desktop.matches ? formats.desktop : mobile.matches ? formats.mobile : null;
    if (active === format) return;
    active = format;

    for (const slot of slots) {
      if (!format) {
        slot.replaceChildren();
        continue;
      }
      const { size, width, height } = format;
      const frame = document.createElement("iframe");
      frame.title = `Advertisement (${slot.dataset.adSlot})`;
      frame.width = width;
      frame.height = height;
      frame.setAttribute("sandbox", "allow-scripts");
      frame.src = `ad-frame.html?${size}`;
      slot.replaceChildren(frame);
    }
  }

  desktop.addEventListener("change", renderAds);
  mobile.addEventListener("change", renderAds);
  renderAds();
})();
