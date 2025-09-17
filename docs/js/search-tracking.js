/**
 * MkDocs Search Tracking Analytics
 * Simple implementation matching Vue.js reference exactly
 */

(function () {
  "use strict";

  // Configuration - matching Vue.js reference
  const ANALYTICS_CONFIG = {
    API_ENDPOINT:
      "https://introspection.dev.zinclabs.dev/api/328BSXphtxxMrgN41UUYA7Ll9ie/website_search/_json",
    USERNAME: "vaidehi@openobserve.ai",
    PASSWORD: "vaidehikiaratechx",
    ENABLED: true,
  };

  // Tracking state - matching Vue.js reference variables
  let originatingPage = ""; // page path where search started
  let navigationUrl = ""; // full URL
  let pageType = "unknown"; // docs/blog/marketing
  let lastSearchQuery = "";
  let totalResults = 0;

  /**
   * Check if analytics is disabled via cookie
   */
  function isAnalyticsDisabled() {
    try {
      return (
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("internal_user="))
          ?.split("=")[1] === "1"
      );
    } catch {
      return false;
    }
  }

  /**
   * Infer page type from pathname - matching Vue.js reference
   */
  function inferPageType(pathname) {
    try {
      if (/\/docs(\/|$)|\/documentation(\/|$)/i.test(pathname)) return "docs";
      if (/\/guides?(\/|$)/i.test(pathname)) return "docs";
      if (/\/blog(\/|$)/i.test(pathname)) return "blog";
      if (/\/articles(\/|$)/i.test(pathname)) return "articles";
      return "marketing";
    } catch {
      return "unknown";
    }
  }

  /**
   * Initialize tracking context when page loads - enhanced to match Vue.js reference
   */
  function initializeContext() {
    try {
      const urlObj = new URL(window.location.href);
      originatingPage = urlObj.pathname; // page path
      navigationUrl = urlObj.href; // full URL
      pageType = inferPageType(urlObj.pathname); // infer docs/blog/marketing
    } catch (e) {
      console.warn("Failed to initialize search tracking context:", e);
      originatingPage = "";
      navigationUrl = "";
      pageType = "unknown";
    }
  }

  /**
   * Send analytics event - enhanced to match Vue.js reference exactly
   */
  async function sendAnalyticsEvent(eventType, payload) {
    // Check if analytics is disabled for internal users
    if (isAnalyticsDisabled()) {
      return;
    }

    if (!ANALYTICS_CONFIG.ENABLED || !ANALYTICS_CONFIG.API_ENDPOINT) {      
      return;
    }

    try {
      const now = new Date();
      await fetch(ANALYTICS_CONFIG.API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            btoa(`${ANALYTICS_CONFIG.USERNAME}:${ANALYTICS_CONFIG.PASSWORD}`),
        },
        body: JSON.stringify({
          url: navigationUrl, // full URL
          path: originatingPage, // where search started
          domain: window.location.hostname,
          type: eventType, // search / result_click
          // pageType,                // docs / blog / marketing (uncomment if needed)
          ...payload,
        }),
      });      
    } catch (error) {
      console.warn("Analytics API error:", error);
    }
  }

  /**
   * Track search query - enhanced to match Vue.js reference exactly
   */
  function trackSearchQuery(query, resultCount = 0) {
    if (!query || query.trim() === "") return;

    const _q = query.trim();
    lastSearchQuery = _q;
    totalResults = resultCount;

    // Send search event exactly like Vue.js reference
    sendAnalyticsEvent("doc-search", {
      search_query: _q,
      result_count: resultCount,
    });    
  }

  /**
   * Track result click - enhanced to match Vue.js reference exactly
   */
  function trackResultClick(resultUrl, resultTitle, resultRank) {
    const _q = lastSearchQuery.trim();

    // Send result_click event exactly like Vue.js reference
    sendAnalyticsEvent("doc-search-click", {
      result_url: resultUrl,
      result_rank: resultRank,
      result_title: resultTitle,
      search_query: _q,
      result_count: totalResults,
    });
  }

  /**
   * Track page feedback (thumbs up/down) - new functionality
   */
  function trackPageFeedback(feedbackValue, pageUrl, pageTitle) {

    // Send feedback event to same analytics endpoint
    sendAnalyticsEvent("reaction", {
      feedback_value: feedbackValue === 1 ? "like" : "dislike", // 1 for thumbs up, 0 for thumbs down
      // feedback_type: "reaction",
      page_url: pageUrl,      
    });
  }

  /**
   * Get result count from search results
   */
  function getSearchResultCount() {
    const results = document.querySelectorAll(".md-search-result__item");
    return results.length;
  }

  /**
   * Extract result information from clicked element
   */
  function extractResultInfo(clickedElement) {
    // Find the search result item - try multiple selectors
    let resultItem =
      clickedElement.closest(".md-search-result__item") ||
      clickedElement.closest(".md-search-result") ||
      clickedElement.closest("[data-md-component='search-result']");

    if (!resultItem) {
      console.warn("Could not find result item for:", clickedElement);
      return null;
    }

    // Get result URL - try multiple ways
    let linkElement =
      resultItem.querySelector("a") ||
      clickedElement.querySelector("a") ||
      clickedElement;
    if (clickedElement.tagName === "A") {
      linkElement = clickedElement;
    }

    const resultUrl = linkElement && linkElement.href ? linkElement.href : "";

    // Get result title - try multiple selectors
    let titleElement =
      resultItem.querySelector(".md-search-result__title") ||
      resultItem.querySelector("[data-md-component='search-result-title']") ||
      resultItem.querySelector("h1, h2, h3, h4, h5, h6") ||
      linkElement;

    const resultTitle = titleElement
      ? titleElement.textContent.trim()
      : "Unknown";

    // Calculate result rank - try multiple selectors for all results
    const allResults = document.querySelectorAll(
      ".md-search-result__item, .md-search-result, [data-md-component='search-result']"
    );
    const resultRank = Array.from(allResults).indexOf(resultItem) + 1;

    return {
      url: resultUrl,
      title: resultTitle,
      rank: resultRank,
    };
  }

  /**
   * Initialize search tracking - enhanced to match Vue.js reference behavior
   */
  function initializeSearchTracking() {
    let searchTimeout;
    let lastTrackedQuery = "";

    // Update context when search becomes active (like Vue.js modal opening)
    const updateContextOnSearchActivation = () => {
      try {
        const urlObj = new URL(window.location.href);
        originatingPage = urlObj.pathname; // page path where search started
        navigationUrl = urlObj.href; // full URL
        pageType = inferPageType(urlObj.pathname); // infer docs/blog/marketing
      } catch {
        originatingPage = "";
        navigationUrl = "";
        pageType = "unknown";
      }
    };

    // Track search input changes with enhanced debouncing
    document.addEventListener("input", function (e) {
      const searchInput = e.target;

      // Check if this is the MkDocs search input
      if (!searchInput.matches(".md-search__input")) return;

      // Update context when user starts searching
      updateContextOnSearchActivation();

      const query = searchInput.value.trim();

      // Clear existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Debounce search tracking (500ms like Vue.js reference)
      if (query && query !== lastTrackedQuery) {
        searchTimeout = setTimeout(() => {
          const resultCount = getSearchResultCount();
          trackSearchQuery(query, resultCount);
          lastTrackedQuery = query;
        }, 600); // Matching Vue.js 600ms debounce
      }

      // Clear tracking when input is cleared
      if (!query && lastTrackedQuery) {
        lastTrackedQuery = "";
        lastSearchQuery = "";
        totalResults = 0;
      }
    });

    // Track search result clicks with enhanced logic
    document.addEventListener("click", function (e) {
      // Multiple ways to detect search result clicks
      const isSearchResult =
        e.target.closest(".md-search-result__item") ||
        e.target.closest(".md-search-result") ||
        e.target.closest("[data-md-component='search-result']");

      // Also check if clicked element has search-related classes
      const isSearchLink =
        e.target.matches("a") &&
        (e.target.closest(".md-search-result__item") ||
          e.target.closest(".md-search-result") ||
          (e.target.href && document.querySelector(".md-search--active")));

      if (!isSearchResult && !isSearchLink) {        
        return;
      }

      // Check if search is active (more lenient check)
      const searchContainer = document.querySelector(".md-search");
      const searchInput = document.querySelector(".md-search__input");
      const hasSearchValue = searchInput && searchInput.value.trim().length > 0;

      if (
        !searchContainer ||
        (!searchContainer.classList.contains("md-search--active") &&
          !hasSearchValue)
      ) {        
        return;
      }

      // Update context right before tracking click (ensure fresh data)
      updateContextOnSearchActivation();

      const resultInfo = extractResultInfo(e.target);      

      if (resultInfo && resultInfo.url) {        
        trackResultClick(resultInfo.url, resultInfo.title, resultInfo.rank);
      } else {
        console.warn("Could not extract result info from clicked element");
      }
    });    
  }

  /**
   * Initialize feedback tracking - new functionality for page feedback
   */
  function initializeFeedbackTracking() {    

    // Track feedback button clicks
    document.addEventListener("click", function (e) {
      // Check if clicked element is a feedback button
      const feedbackButton = e.target.closest(".md-feedback__icon");

      if (!feedbackButton) {
        return;
      }      

      // Get feedback value from data-md-value attribute
      const feedbackValue = feedbackButton.getAttribute("data-md-value");

      if (feedbackValue === null) {
        console.warn("No feedback value found on button");
        return;
      }

      // Get current page information
      const pageUrl = window.location.href;
      const pageTitle = document.title || "Unknown Page";

      // Convert feedback value to number
      const feedbackValueNum = parseInt(feedbackValue, 10);


      // Track the feedback
      trackPageFeedback(feedbackValueNum, pageUrl, pageTitle);
    });
    
  }

  /**
   * Initialize when DOM is ready
   */
  function init() {
    initializeContext();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        initializeSearchTracking();
        initializeFeedbackTracking();
      });
    } else {
      initializeSearchTracking();
      initializeFeedbackTracking();
    }
  }

  // Start initialization
  init();

  // Expose for manual testing - enhanced interface
  window.SearchTracking = {
    updateConfig: function (newConfig) {
      Object.assign(ANALYTICS_CONFIG, newConfig);
    },
    getConfig: function () {
      return { ...ANALYTICS_CONFIG };
    },
    getState: function () {
      return {
        originatingPage,
        navigationUrl,
        pageType,
        lastSearchQuery,
        totalResults,
      };
    },
    sendEvent: sendAnalyticsEvent,
    trackSearch: trackSearchQuery,
    trackClick: trackResultClick,
    trackFeedback: trackPageFeedback,
    updateContext: function () {
      initializeContext();
    },
    // Debug helpers
    testClickDetection: function () {
      const searchResults = document.querySelectorAll(
        ".md-search-result__item, .md-search-result, [data-md-component='search-result']"
      );      
      return searchResults;
    },
    testFeedbackDetection: function () {
      const feedbackButtons = document.querySelectorAll(".md-feedback__icon");      
      return feedbackButtons;
    },
    getCurrentSearchState: function () {
      const searchContainer = document.querySelector(".md-search");
      const searchInput = document.querySelector(".md-search__input");
      const isActive = searchContainer?.classList.contains("md-search--active");
      const hasValue = searchInput?.value.trim().length > 0;

      return {
        searchContainer: !!searchContainer,
        isActive,
        hasValue,
        searchValue: searchInput?.value || "",
        lastSearchQuery,
        totalResults,
      };
    },
    simulateResultClick: function (index = 0) {
      const results = document.querySelectorAll(
        ".md-search-result__item, .md-search-result"
      );
      if (results[index]) {
        const link = results[index].querySelector("a");
        if (link) {          
          link.click();
        }
      }
    },
    simulateFeedbackClick: function (value = 1) {
      const feedbackButton = document.querySelector(
        `.md-feedback__icon[data-md-value="${value}"]`
      );
      if (feedbackButton) {        
        feedbackButton.click();
      }
    },
  };
})();
