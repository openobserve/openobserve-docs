document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(
    ".landing-tutorial-card, .landing-integration-item, .landing-community-support-item, .landing-feature-item"
  );
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const eventName = card.getAttribute("data-clarity-event") || "card_click";
      const title = card.getAttribute("data-clarity-title") || "unknown";
      const url = card.getAttribute("data-clarity-url") || "unknown";

      if (window.clarity && typeof window.clarity === "function") {
        // Fire a named event
        window.clarity("event", eventName);

        // Attach extra metadata
        window.clarity("set", "cardTitle", title);
        window.clarity("set", "cardUrl", url);
      }
    });
  });
});
