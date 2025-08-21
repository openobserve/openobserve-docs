(function() {
  // Function to extract the domain from a URL
  function getDomainFromUrl(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.hostname; // Returns the domain part of the URL
  }

  // Function to get browser and OS information
  function getBrowserAndOS() {
    var userAgent = navigator.userAgent;
    var browserName, osName;

    // Detect browser name
    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = 'Chrome';
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = 'Firefox';
    } else if (userAgent.match(/safari/i)) {
      browserName = 'Safari';
    } else if (userAgent.match(/opr\//i)) {
      browserName = 'Opera';
    } else if (userAgent.match(/edg/i)) {
      browserName = 'Edge';
    } else if (userAgent.match(/msie|trident/i)) {
      browserName = 'Internet Explorer';
    } else {
      browserName = 'Unknown';
    }

    // Detect operating system
    if (userAgent.match(/android/i)) {
      osName = 'Android';
    } else if (userAgent.match(/iphone|ipad|ipod/i)) {
      osName = 'iOS';
    } else if (userAgent.match(/win/i)) {
      osName = 'Windows';
    } else if (userAgent.match(/mac/i)) {
      osName = 'MacOS';
    } else if (userAgent.match(/linux/i)) {
      osName = 'Linux';
    } else if (userAgent.match(/unix/i)) {
      osName = 'UNIX';
    } else {
      osName = 'Unknown';
    }

    return { browser: browserName, os: osName };
  }

  // Function to get screen resolution
  function getScreenResolution() {
    return {
      width: window.screen.width,
      height: window.screen.height
    };
  }


  // Helper function to generate a UUID
  function generateUUID() {
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
      d += performance.now(); // use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  // Helper function to set a cookie
  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }

  // Helper function to get a cookie
  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }

  // Function to handle the tracking logic
  function handleTracking() {
    var uuid = getCookie("uuid");
    if (!uuid) {
      uuid = generateUUID();
      setCookie("uuid", uuid, 365); // set cookie to expire in 365 days
    }
    
    var referrerUrl = document.referrer || '';
    var referrerDomain = referrerUrl ? getDomainFromUrl(referrerUrl) : '';

    // Add browser, OS, and screen resolution to the data object
    var browserAndOS = getBrowserAndOS();
    var screenResolution = getScreenResolution();

    var data = {
      type: "track",
      event: "pageView",
      context: {
        page: {
          path: window.location.pathname,
          url: window.location.href,
          title: document.title,
          search: window.location.search,
          referrer: document.referrer
        },
        userAgent: navigator.userAgent
      },
      properties: {
        referrerDomain: referrerDomain,
        anonymousId: uuid,
        os: browserAndOS.os,
        browser: browserAndOS.browser,
        screenResolution: screenResolution
      }
    };


    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://e1.zinclabs.dev/v1/track", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  }

  // Track on history changes
  var originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(history, arguments);
    handleTracking(); // Call the tracking function when pushState is called
  };

  window.addEventListener('popstate', handleTracking); // Call the tracking function on popstate events

  // Initial track when the script loads
  handleTracking();
})();

// Enhanced theme management with proper persistence and navigation support
(function() {
  // Immediately apply saved theme before DOM loads to prevent flash
  function applyThemeImmediately() {
    const savedScheme = localStorage.getItem('data-md-color-scheme');
    if (savedScheme) {
      document.documentElement.setAttribute('data-md-color-scheme', savedScheme);
      // Also set on body for additional targeting
      document.body.setAttribute('data-md-color-scheme', savedScheme);
    }
  }

  // Apply theme immediately if DOM is already loading
  if (document.readyState === 'loading') {
    applyThemeImmediately();
  }

  function initializeThemeSystem() {
    const paletteForm = document.querySelector('form[data-md-component="palette"]');
    
    if (!paletteForm) {
      // Retry after a short delay if form not found
      setTimeout(initializeThemeSystem, 100);
      return;
    }

    const inputs = paletteForm.querySelectorAll('input[name="__palette"]');
    const labels = paletteForm.querySelectorAll('label.md-header__button');
    
    // Enhanced theme update function
    function updateTheme(scheme, persistToStorage = true) {
      if (!scheme) return;
      
      // Apply to document element
      document.documentElement.setAttribute('data-md-color-scheme', scheme);
      // Apply to body as well for better CSS targeting
      document.body.setAttribute('data-md-color-scheme', scheme);
      
      // Persist to localStorage
      if (persistToStorage) {
        localStorage.setItem('data-md-color-scheme', scheme);
      }
      
      // Update primary color based on scheme
      const primary = scheme === 'slate' ? 'black' : 'white';
      document.documentElement.setAttribute('data-md-color-primary', primary);
      
      // Force CSS recalculation
      document.documentElement.style.setProperty('--md-color-scheme', scheme);
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { scheme } }));
    }

    // Restore saved theme and update form state
    function restoreTheme() {
      const savedScheme = localStorage.getItem('data-md-color-scheme');
      if (savedScheme) {
        // Find and check the corresponding input
        const targetInput = paletteForm.querySelector(`input[data-md-color-scheme="${savedScheme}"]`);
        if (targetInput) {
          // Uncheck all inputs first
          inputs.forEach(input => input.checked = false);
          // Check the target input
          targetInput.checked = true;
          // Update theme
          updateTheme(savedScheme, false);
        }
      } else {
        // Use default theme if none saved
        const defaultInput = paletteForm.querySelector('input[name="__palette"]:first-child');
        if (defaultInput) {
          defaultInput.checked = true;
          const scheme = defaultInput.getAttribute('data-md-color-scheme');
          updateTheme(scheme);
        }
      }
    }

    // Enhanced click handlers for theme toggle
    labels.forEach((label) => {
      label.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const targetId = label.getAttribute('for');
        const targetInput = document.getElementById(targetId);
        
        if (targetInput) {
          // Uncheck all inputs
          inputs.forEach(input => input.checked = false);
          // Check target input
          targetInput.checked = true;
          
          // Get scheme and update
          const scheme = targetInput.getAttribute('data-md-color-scheme');
          updateTheme(scheme);
          
          // Trigger change event for compatibility
          targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });

    // Listen for input changes
    inputs.forEach(input => {
      input.addEventListener('change', function() {
        if (this.checked) {
          const scheme = this.getAttribute('data-md-color-scheme');
          updateTheme(scheme);
        }
      });
    });

    // Initialize theme
    restoreTheme();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeThemeSystem);
  } else {
    initializeThemeSystem();
  }

  // Handle navigation in SPA-like environments (MkDocs Material with instant navigation)
  document.addEventListener('DOMContentLoaded', function() {
    // Re-initialize theme system on navigation
    if (typeof app !== 'undefined' && app.location$) {
      app.location$.subscribe(() => {
        setTimeout(initializeThemeSystem, 50);
      });
    }
    
    // Fallback: Watch for URL changes
    let currentUrl = window.location.href;
    const checkUrlChange = () => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        setTimeout(initializeThemeSystem, 50);
      }
    };
    
    // Check for URL changes periodically
    setInterval(checkUrlChange, 100);
  });

  // Enhanced mutation observer for theme changes
  document.addEventListener('DOMContentLoaded', function() {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes') {
          if (mutation.attributeName === 'data-md-color-scheme') {
            const scheme = document.documentElement.getAttribute('data-md-color-scheme');
            if (scheme) {
              localStorage.setItem('data-md-color-scheme', scheme);
              // Ensure body also has the attribute
              document.body.setAttribute('data-md-color-scheme', scheme);
            }
          }
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-md-color-scheme', 'data-md-color-primary']
    });
  });

  // Apply theme immediately on script load
  applyThemeImmediately();
})();
