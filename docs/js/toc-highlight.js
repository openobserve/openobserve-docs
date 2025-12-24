/**
 * Simple TOC scroll-based highlighting
 * Highlights current section in purple text
 */

(function () {
  "use strict";

  let tocLinks = [];
  let headings = [];

  function init() {
    // Find TOC links
    tocLinks = Array.from(
      document.querySelectorAll(".md-nav--secondary .md-nav__link")
    );
    if (tocLinks.length === 0) return;

    // Find corresponding headings
    headings = tocLinks
      .map((link) => {
        const href = link.getAttribute("href");
        return href && href.startsWith("#")
          ? document.getElementById(href.substring(1))
          : null;
      })
      .filter((h) => h !== null);

    if (headings.length === 0) return;

    // Listen to scroll
    window.addEventListener("scroll", updateHighlight, { passive: true });
    updateHighlight();
  }

  function updateHighlight() {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // If near bottom, highlight last item
    if (scrollTop + windowHeight >= documentHeight - 50) {
      setActive(tocLinks.length - 1);
      return;
    }

    // Find current section
    let activeIndex = -1;
    for (let i = headings.length - 1; i >= 0; i--) {
      if (headings[i] && headings[i].getBoundingClientRect().top <= 80) {
        activeIndex = i;
        break;
      }
    }

    setActive(activeIndex);
  }

  function setActive(index) {
    // Remove all active classes
    tocLinks.forEach((link) => {
      link.classList.remove("md-nav__link--active", "is-active");
    });

    // Add active class to current item and scroll into view if needed
    if (index >= 0 && index < tocLinks.length) {
      const activeLink = tocLinks[index];
      activeLink.classList.add("md-nav__link--active", "is-active");
      // Scroll the active link into view within the sidebar
      // Only if not already fully visible
      if (typeof activeLink.scrollIntoView === "function") {
        activeLink.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }

  // Initialize when ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Re-initialize on page changes
  let currentUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== currentUrl) {
      currentUrl = location.href;
      setTimeout(init, 100);
    }
  }).observe(document, { childList: true, subtree: true });
})();
