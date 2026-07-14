// Lightbox for content images.
// Clicking a standalone content image opens it enlarged in an overlay so it
// can be read carefully. Clicking outside the image, pressing Escape, or
// clicking the close button dismisses it.
(function () {
  "use strict";

  // Only standalone content images (their own <p><img></p>) are zoomable —
  // this matches the image-spacing rule and skips nav logos, icons, badges.
  function isZoomable(img) {
    if (!img || img.tagName !== "IMG") return false;
    if (!img.closest(".md-typeset")) return false;
    var p = img.parentElement;
    return (
      p &&
      p.tagName === "P" &&
      p.children.length === 1 &&
      !img.closest("a") // don't hijack images that are already links
    );
  }

  var overlay = null;
  var lastFocused = null;

  function buildOverlay() {
    overlay = document.createElement("div");
    overlay.className = "o2-lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Enlarged image");
    overlay.innerHTML =
      '<button type="button" class="o2-lightbox__close" aria-label="Close">&times;</button>' +
      '<img class="o2-lightbox__img" alt="" />';
    document.body.appendChild(overlay);

    // Backdrop click closes; clicking the image itself does not.
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.classList.contains("o2-lightbox__close")) {
        close();
      }
    });
  }

  function open(img) {
    if (!overlay) buildOverlay();
    var big = overlay.querySelector(".o2-lightbox__img");
    big.src = img.currentSrc || img.src;
    big.alt = img.alt || "";
    lastFocused = document.activeElement;
    overlay.classList.add("is-open");
    document.body.classList.add("o2-lightbox-open");
    overlay.querySelector(".o2-lightbox__close").focus();
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.classList.remove("o2-lightbox-open");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  // Delegated: works for images added after load (e.g. instant navigation).
  document.addEventListener("click", function (e) {
    var img = e.target.closest ? e.target.closest("img") : null;
    if (img && isZoomable(img)) {
      e.preventDefault();
      open(img);
    }
  });

  // Escape closes.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay && overlay.classList.contains("is-open")) {
      close();
    }
  });

  // Mark zoomable images so CSS can show the zoom-in cursor. Re-run on
  // Material's instant-navigation page changes if that observable exists.
  function markImages() {
    document.querySelectorAll(".md-typeset p > img").forEach(function (img) {
      if (isZoomable(img)) img.classList.add("o2-zoomable");
    });
  }
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(markImages);
  } else {
    document.addEventListener("DOMContentLoaded", markImages);
  }
})();
