// Show/hide close icon based on .md-search-result__meta visibility
function isElementInViewport(el) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0
  );
}

function toggleCloseIconVisibility() {
  const meta = document.querySelector(".md-search-result__meta");
  const closeIcon = document.querySelector(".md-search__close");
  if (closeIcon) {
    if (isElementInViewport(meta)) {
      closeIcon.style.display = "flex";
    } else {
      closeIcon.style.display = "none";
    }
  }
}

window.addEventListener("scroll", toggleCloseIconVisibility);
window.addEventListener("resize", toggleCloseIconVisibility);
document.addEventListener("DOMContentLoaded", toggleCloseIconVisibility);
// Also run after search results update
document.addEventListener("input", function (e) {
  if (e.target.classList.contains("md-search__input")) {
    setTimeout(toggleCloseIconVisibility, 50);
  }
});
/**
 * Minimal Search Close Functionality
 * Adds click handler to the close icon in the search input
 */

document.addEventListener("DOMContentLoaded", function () {
  // Inject clear button if not present
  const searchInput = document.querySelector(".md-search__input");
  if (searchInput && !document.querySelector(".md-search__clear")) {
    const clearBtn = document.createElement("button");
    clearBtn.className = "md-search__clear";
    clearBtn.type = "button";
    clearBtn.textContent = "Clear";
    searchInput.parentNode.insertBefore(clearBtn, searchInput.nextSibling);

    clearBtn.addEventListener("click", function () {
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      searchInput.focus();
      clearBtn.style.display = "none";
    });

    searchInput.addEventListener("input", function () {
      clearBtn.style.display = searchInput.value ? "inline" : "none";
    });

    // Initial state
    clearBtn.style.display = searchInput.value ? "inline" : "none";
  }
  // Add click handler to search input when close icon area is clicked
  document.addEventListener("click", function (e) {
    const searchInput = document.querySelector(".md-search__input");
    if (!searchInput) return;

    // Check if click is in the close icon area (right side of input)
    const inputRect = searchInput.getBoundingClientRect();
    const clickX = e.clientX;
    const closeIconArea = inputRect.right - 50; // 50px from the right edge

    if (
      clickX >= closeIconArea &&
      clickX <= inputRect.right &&
      e.clientY >= inputRect.top &&
      e.clientY <= inputRect.bottom &&
      (searchInput.value !== "" || searchInput === document.activeElement)
    ) {
      // Clear the search
      searchInput.value = "";
      searchInput.blur();

      // Close search overlay
      const searchContainer = document.querySelector(".md-search");
      if (searchContainer) {
        searchContainer.classList.remove("md-search--active");
      }

      // Close mobile search
      const searchToggle = document.querySelector("#__search");
      if (searchToggle && searchToggle.checked) {
        searchToggle.checked = false;
      }

      // Trigger input event to clear results
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));

      e.preventDefault();
      e.stopPropagation();
    }
  });

  // Add escape key handler
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const searchInput = document.querySelector(".md-search__input");
      const searchContainer = document.querySelector(".md-search");

      if (
        searchInput &&
        searchContainer &&
        searchContainer.classList.contains("md-search--active")
      ) {
        searchInput.value = "";
        searchInput.blur();
        searchContainer.classList.remove("md-search--active");

        const searchToggle = document.querySelector("#__search");
        if (searchToggle && searchToggle.checked) {
          searchToggle.checked = false;
        }

        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  });
});
