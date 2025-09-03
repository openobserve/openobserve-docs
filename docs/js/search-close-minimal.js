/**
 * Minimal Search Close Functionality
 * Adds click handler to the close icon in the search input
 */

document.addEventListener("DOMContentLoaded", function () {
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
