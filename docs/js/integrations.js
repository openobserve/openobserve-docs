/**
 * OpenObserve Integrations Page - SEO Optimized
 * Uses server-rendered HTML with client-side filtering for better SEO and performance
 */

(function() {
  'use strict';

  // State
  let allCards = [];
  let activeCategory = 'all';
  let searchQuery = '';
  let initialized = false;

  // DOM Elements
  let gridElement;
  let searchInput;
  let countElement;
  let filterButtons;

  /**
   * Initialize the integrations page
   */
  function init() {
    // Only run on integrations page
    if (!document.querySelector('.integrations-page')) {
      return;
    }

    // Prevent double initialization
    if (initialized) {
      return;
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initElements);
    } else {
      initElements();
    }
  }

  /**
   * Initialize DOM elements and event listeners
   */
  function initElements() {
    gridElement = document.getElementById('integrationsGrid');
    searchInput = document.getElementById('integrationSearch');
    countElement = document.getElementById('integrationsCount');
    filterButtons = document.querySelectorAll('.filter-tag');

    if (!gridElement) {
      console.warn('Integrations grid not found');
      return;
    }

    // Mark as initialized
    initialized = true;

    // Get all pre-rendered cards
    allCards = Array.from(gridElement.querySelectorAll('.integration-card'));
    
    // Set up event listeners
    setupEventListeners();
    
    // Update count
    updateCount();
  }

  /**
   * Set up event listeners for filters and search
   */
  function setupEventListeners() {
    // Category filters
    if (filterButtons) {
      filterButtons.forEach(button => {
        button.addEventListener('click', function() {
          const category = this.getAttribute('data-category');
          selectCategory(category);
        });
      });
    }

    // Search input with debounce
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          searchQuery = e.target.value.toLowerCase().trim();
          applyFilters();
        }, 300);
      });
    }

    // Track integration clicks
    gridElement.addEventListener('click', function(e) {
      const link = e.target.closest('.integration-card-link');
      if (link) {
        const card = link.closest('.integration-card');
        if (card) {
          const integrationId = card.getAttribute('data-integration-id');
          trackEvent('integration_click', { integration_id: integrationId });
        }
      }
    });
  }

  /**
   * Select a category filter
   */
  function selectCategory(category) {
    activeCategory = category;
    
    // Update active state on buttons
    if (filterButtons) {
      filterButtons.forEach(btn => {
        if (btn.getAttribute('data-category') === category) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    applyFilters();
    
    // Track analytics
    trackEvent('filter_category', { category });
  }

  /**
   * Apply all active filters
   */
  function applyFilters() {
    let visibleCount = 0;

    allCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const cardTitle = card.querySelector('.integration-card-title')?.textContent.toLowerCase() || '';
      const cardDescription = card.querySelector('.integration-card-description')?.textContent.toLowerCase() || '';
      
      // Category filter
      const matchesCategory = activeCategory === 'all' || cardCategory === activeCategory;
      
      // Search filter
      const matchesSearch = !searchQuery || 
                           cardTitle.includes(searchQuery) || 
                           cardDescription.includes(searchQuery) ||
                           cardCategory.includes(searchQuery);
      
      // Show/hide card
      if (matchesCategory && matchesSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    updateCount(visibleCount);
    
    // Track search
    if (searchQuery) {
      trackEvent('search_integrations', { query: searchQuery, results: visibleCount });
    }
  }

  /**
   * Update the count display
   */
  function updateCount(count) {
    if (!countElement) return;
    
    const total = allCards.length;
    const displayCount = count !== undefined ? count : total;
    
    if (displayCount === total) {
      countElement.textContent = `Showing all ${total} integrations`;
    } else {
      countElement.textContent = `Showing ${displayCount} of ${total} integrations`;
    }
  }

  /**
   * Track analytics events
   */
  function trackEvent(eventName, properties) {
    try {
      if (window.analytics && typeof window.analytics.track === 'function') {
        window.analytics.track(eventName, properties);
      }
    } catch (err) {
      console.warn('Analytics tracking failed:', err);
    }
  }

  // Initialize on load
  init();

  // Re-initialize on page navigation (for MkDocs Material instant loading)
  document.addEventListener('DOMContentLoaded', init);
  
  // Handle MkDocs Material's instant loading
  if (typeof document$ !== 'undefined') {
    document$.subscribe(function() {
      initialized = false;
      init();
    });
  }
})();
