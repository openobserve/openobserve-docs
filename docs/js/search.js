function replaceMetaText(el) {
  const html = `
    <div class="search_container">
      <div class="key-container">
        <span class="key-arrow">↑</span>
        <span class="key-arrow">↓</span> to navigate
        <span class="key">Enter</span> to select
      </div>
      <div class="key-close">
        <span class="key">Esc</span> to close
      </div>
    </div>
  `;
  // Only add if not already present
  if (!el.querySelector(".search_container")) {
    el.insertAdjacentHTML("beforeend", html);
  }
}

// Watch the entire body for any new meta elements
const observer = new MutationObserver(() => {
  document.querySelectorAll(".md-search-result__meta").forEach(replaceMetaText);
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial update
document.querySelectorAll(".md-search-result__meta").forEach(replaceMetaText);

// Initial update
document.querySelectorAll(".md-search-result__meta").forEach(replaceMetaText);
