// Simple theme persistence - leverages MkDocs Material's built-in theme system
(function () {
  // Apply saved theme immediately to prevent flash
  function applySavedTheme() {
    const savedScheme = localStorage.getItem("theme-preference");
    if (savedScheme) {
      document.documentElement.setAttribute(
        "data-md-color-scheme",
        savedScheme
      );
      // Set the correct radio button as checked
      var paletteForm = document.querySelector(
        'form[data-md-component="palette"]'
      );
      if (paletteForm) {
        var inputs = paletteForm.querySelectorAll('input[name="__palette"]');
        inputs.forEach(function (input) {
          if (input.getAttribute("data-md-color-scheme") === savedScheme) {
            input.checked = true;
          } else {
            input.checked = false;
          }
        });
      }
    }
  }

  // Save theme preference when changed
  function attachPaletteListeners() {
    var paletteForm = document.querySelector(
      'form[data-md-component="palette"]'
    );
    if (!paletteForm) return false;
    // avoid attaching twice to the same form
    if (paletteForm.getAttribute("data-theme-listeners") === "1") return true;
    var inputs = paletteForm.querySelectorAll('input[name="__palette"]');
    inputs.forEach(function (input) {
      input.addEventListener("change", function () {
        if (this.checked) {
          var scheme = this.getAttribute("data-md-color-scheme");
          document.documentElement.setAttribute("data-md-color-scheme", scheme);
          localStorage.setItem("theme-preference", scheme);
        }
      });
    });
    paletteForm.setAttribute("data-theme-listeners", "1");
    return true;
  }

  // Observe changes to the documentElement attribute for scheme changes
  function observeSchemeAttribute() {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.attributeName === "data-md-color-scheme") {
          const scheme = document.documentElement.getAttribute(
            "data-md-color-scheme"
          );
          if (scheme) {
            localStorage.setItem("theme-preference", scheme);
          }
        }
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-md-color-scheme"],
    });
  }

  // Watch the body for insertions/replacements of the palette form and re-attach listeners
  function observeBodyForPalette() {
    // Try attach immediately in case it's already present
    attachPaletteListeners();

    const bodyObserver = new MutationObserver(function (mutations) {
      // If nodes are added/removed we attempt to (re)attach listeners
      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];
        if (
          mutation.type === "childList" &&
          (mutation.addedNodes.length || mutation.removedNodes.length)
        ) {
          // small debounce: try attach; attachPaletteListeners is idempotent
          attachPaletteListeners();
        }
      }
    });
    bodyObserver.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  // Setup theme persistence (apply + observe)
  function setupThemePersistence() {
    applySavedTheme();
    observeSchemeAttribute();
    observeBodyForPalette();
  }

  // Initial setup
  setupThemePersistence();

  // Re-apply on every DOMContentLoaded (instant navigation)
  document.addEventListener("DOMContentLoaded", setupThemePersistence);
})();
