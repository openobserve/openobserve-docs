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

// Simple theme persistence - leverages MkDocs Material's built-in theme system
(function() {
  // Apply saved theme immediately to prevent flash
  function applySavedTheme() {
    const savedScheme = localStorage.getItem('theme-preference');
    if (savedScheme) {
      document.documentElement.setAttribute('data-md-color-scheme', savedScheme);
      // Set the correct radio button as checked
      var paletteForm = document.querySelector('form[data-md-component="palette"]');
      if (paletteForm) {
        var inputs = paletteForm.querySelectorAll('input[name="__palette"]');
        inputs.forEach(function(input) {
          if (input.getAttribute('data-md-color-scheme') === savedScheme) {
            input.checked = true;
          } else {
            input.checked = false;
          }
        });
      }
    }
  }

  // Save theme preference when changed
  function observeThemeChanges() {
    // Attach change event to theme radio buttons
    var paletteForm = document.querySelector('form[data-md-component="palette"]');
    if (paletteForm) {
      var inputs = paletteForm.querySelectorAll('input[name="__palette"]');
      inputs.forEach(function(input) {
        input.addEventListener('change', function() {
          if (this.checked) {
            var scheme = this.getAttribute('data-md-color-scheme');
            document.documentElement.setAttribute('data-md-color-scheme', scheme);
            localStorage.setItem('theme-preference', scheme);
          }
        });
      });
    }
    // Also keep the MutationObserver for manual changes
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'data-md-color-scheme') {
          const scheme = document.documentElement.getAttribute('data-md-color-scheme');
          if (scheme) {
            localStorage.setItem('theme-preference', scheme);
          }
        }
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-md-color-scheme']
    });
  }

  // Setup theme persistence (apply + observe)
  function setupThemePersistence() {
    applySavedTheme();
    observeThemeChanges();
  }

  // Initial setup
  setupThemePersistence();

  // Re-apply on every DOMContentLoaded (instant navigation)
  document.addEventListener('DOMContentLoaded', setupThemePersistence);
})();
