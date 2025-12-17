# Best Practices

This guide covers production-ready best practices for deploying and managing OpenObserve RUM at scale.

## Initialization and Configuration

### Initialize Early

Initialize RUM as early as possible in your application lifecycle:

```javascript
// ✅ Good: Initialize in <head> before other scripts
<script>
  import { openobserveRum } from '@openobserve/browser-rum';

  openobserveRum.init({
    clientToken: 'YOUR_CLIENT_TOKEN',
    applicationId: 'YOUR_APP_ID',
    site: 'your-openobserve-instance.com',
    service: 'web-app',
    env: 'production',
    version: '1.2.3',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true
  });
</script>

// ❌ Bad: Initialize late or conditionally
window.addEventListener('load', () => {
  // Too late - early errors and performance metrics missed
  openobserveRum.init({ /* config */ });
});
```

### Use Environment Variables

Manage configuration across environments:

```javascript
const getRUMConfig = () => {
  const env = process.env.NODE_ENV || 'production';

  const baseConfig = {
    clientToken: process.env.OPENOBSERVE_RUM_TOKEN,
    applicationId: process.env.OPENOBSERVE_APP_ID,
    site: process.env.OPENOBSERVE_SITE,
    service: 'web-app',
    version: process.env.APP_VERSION || '1.0.0',
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true
  };

  // Environment-specific settings
  const envConfig = {
    development: {
      env: 'development',
      sessionSampleRate: 100,
      sessionReplaySampleRate: 100,
      silentMultipleInit: true
    },
    staging: {
      env: 'staging',
      sessionSampleRate: 100,
      sessionReplaySampleRate: 50
    },
    production: {
      env: 'production',
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20
    }
  };

  return { ...baseConfig, ...envConfig[env] };
};

openobserveRum.init(getRUMConfig());
```

### Version Tracking

Always include version information:

```javascript
openobserveRum.init({
  // ... other config
  version: '1.2.3', // Git tag, commit SHA, or build number
  service: 'web-app'
});

// Also set in global context for easier filtering
openobserveRum.setGlobalContext({
  app_version: '1.2.3',
  build_number: process.env.BUILD_NUMBER,
  git_commit: process.env.GIT_COMMIT?.substring(0, 7),
  deployment_date: process.env.DEPLOYMENT_DATE
});
```

## Sampling Strategies

### Smart Sampling for Cost Optimization

Implement intelligent sampling based on business priorities:

```javascript
function getOptimalSamplingRates() {
  const user = getCurrentUser();
  const route = window.location.pathname;
  const isProduction = process.env.NODE_ENV === 'production';

  // Critical pages that should always be recorded
  const criticalRoutes = [
    '/checkout',
    '/payment',
    '/signup',
    '/login',
    '/onboarding'
  ];

  const isCriticalRoute = criticalRoutes.some(r => route.includes(r));

  let sessionReplaySampleRate = 100;

  if (isProduction) {
    if (isCriticalRoute) {
      // Record all sessions on critical pages
      sessionReplaySampleRate = 100;
    } else if (user?.tier === 'enterprise') {
      // Higher sampling for enterprise users
      sessionReplaySampleRate = 50;
    } else if (user?.tier === 'paid') {
      // Medium sampling for paid users
      sessionReplaySampleRate = 30;
    } else {
      // Lower sampling for free users
      sessionReplaySampleRate = 10;
    }
  }

  return {
    sessionSampleRate: 100,  // Always track basic metrics
    sessionReplaySampleRate
  };
}

openobserveRum.init({
  // ... other config
  ...getOptimalSamplingRates()
});
```

### Error-Based Recording

Start recording when errors occur:

```javascript
openobserveRum.init({
  // ... config
  sessionSampleRate: 100,
  sessionReplaySampleRate: 0  // Don't record by default
});

// Start recording on error
window.addEventListener('error', (event) => {
  openobserveRum.startSessionReplayRecording({ force: true });
});

window.addEventListener('unhandledrejection', (event) => {
  openobserveRum.startSessionReplayRecording({ force: true });
});

// Also start for critical user actions
document.getElementById('submit-payment').addEventListener('click', () => {
  openobserveRum.startSessionReplayRecording({ force: true });
});
```

## Privacy and Security

### PII Protection

Never send personally identifiable information:

```javascript
openobserveRum.init({
  // ... other config
  beforeSend: (event) => {
    // Remove PII from URLs
    if (event.view?.url) {
      event.view.url = sanitizeUrl(event.view.url);
    }

    // Remove PII from error messages
    if (event.error?.message) {
      event.error.message = sanitizePII(event.error.message);
    }

    return event;
  }
});

function sanitizePII(text) {
  return text
    // Remove emails
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
    // Remove phone numbers
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
    // Remove credit cards
    .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD]')
    // Remove SSN
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
}

function sanitizeUrl(url) {
  const urlObj = new URL(url);

  // Remove sensitive query parameters
  const sensitiveParams = ['token', 'api_key', 'password', 'email', 'ssn'];
  sensitiveParams.forEach(param => {
    if (urlObj.searchParams.has(param)) {
      urlObj.searchParams.set(param, '[REDACTED]');
    }
  });

  return urlObj.toString();
}
```

### Session Replay Privacy

Mask sensitive form inputs:

```html
<!-- Automatically masked by RUM SDK -->
<input type="password" name="password" />
<input type="email" name="email" />
<input type="tel" name="phone" />

<!-- Manually mask using data attributes -->
<input type="text" name="ssn" data-dd-privacy="mask" />
<div class="sensitive-content" data-dd-privacy="mask">
  Sensitive information here
</div>

<!-- Hide completely (not recorded in replay) -->
<div class="internal-notes" data-dd-privacy="hidden">
  Internal notes not visible in replay
</div>
```

### User Consent

Implement proper consent management:

```javascript
class ConsentManager {
  constructor() {
    this.consentKey = 'tracking_consent';
    this.initializeConsent();
  }

  initializeConsent() {
    const consent = this.getStoredConsent();

    openobserveRum.init({
      // ... other config
      trackingConsent: consent || 'not-granted'
    });

    if (!consent) {
      this.showConsentBanner();
    }
  }

  getStoredConsent() {
    const stored = localStorage.getItem(this.consentKey);
    return stored === 'true' ? 'granted' : stored === 'false' ? 'not-granted' : null;
  }

  grantConsent() {
    localStorage.setItem(this.consentKey, 'true');
    openobserveRum.setTrackingConsent('granted');
    this.hideConsentBanner();
  }

  denyConsent() {
    localStorage.setItem(this.consentKey, 'false');
    openobserveRum.setTrackingConsent('not-granted');
    this.hideConsentBanner();
  }

  showConsentBanner() {
    // Your banner implementation
  }

  hideConsentBanner() {
    // Your banner implementation
  }
}

const consentManager = new ConsentManager();
```

## Error Handling

### Filter Noise

Filter out irrelevant errors:

```javascript
openobserveRum.init({
  // ... config
  beforeSend: (event) => {
    if (event.type !== 'error') return event;

    const message = event.error?.message || '';
    const stack = event.error?.stack || '';

    // Filter browser extension errors
    if (message.includes('chrome-extension://') ||
        message.includes('moz-extension://') ||
        stack.includes('extensions/')) {
      return false;
    }

    // Filter known harmless errors
    const harmlessErrors = [
      'ResizeObserver loop',
      'Non-Error promise rejection captured',
      'Script error.', // Cross-origin errors
      'SecurityError', // Usually from iframes
      'Loading chunk',  // Webpack chunk errors (often network)
      'cancelled' // User-cancelled requests
    ];

    if (harmlessErrors.some(err => message.includes(err))) {
      return false;
    }

    // Filter third-party script errors in production
    if (process.env.NODE_ENV === 'production') {
      const thirdPartyDomains = [
        'google-analytics.com',
        'googletagmanager.com',
        'facebook.net',
        'doubleclick.net'
      ];

      if (thirdPartyDomains.some(domain => stack.includes(domain))) {
        return false;
      }
    }

    return event;
  }
});
```

### Error Categorization

Categorize errors for better organization:

```javascript
function categorizeError(error) {
  const message = error.message || '';
  const stack = error.stack || '';

  // Network errors
  if (message.includes('fetch') ||
      message.includes('Network') ||
      message.includes('timeout')) {
    return {
      category: 'network',
      severity: 'high',
      actionable: true
    };
  }

  // API errors
  if (message.includes('API') ||
      message.includes('status') ||
      stack.includes('/api/')) {
    return {
      category: 'api',
      severity: 'high',
      actionable: true
    };
  }

  // Type errors
  if (message.includes('TypeError') ||
      message.includes('undefined') ||
      message.includes('null')) {
    return {
      category: 'type_error',
      severity: 'high',
      actionable: true
    };
  }

  // Third-party errors
  if (stack.includes('node_modules') ||
      stack.includes('vendor')) {
    return {
      category: 'third_party',
      severity: 'low',
      actionable: false
    };
  }

  return {
    category: 'unknown',
    severity: 'medium',
    actionable: true
  };
}

openobserveRum.init({
  // ... config
  beforeSend: (event) => {
    if (event.type === 'error' && event.error) {
      const classification = categorizeError(event.error);

      event.context = event.context || {};
      event.context.error_category = classification.category;
      event.context.error_severity = classification.severity;
      event.context.error_actionable = classification.actionable;
    }

    return event;
  }
});
```

## Performance Optimization

### Lazy Loading

Don't impact initial page load:

```javascript
// Load RUM asynchronously
(function() {
  const script = document.createElement('script');
  script.src = 'path/to/openobserve-rum.js';
  script.async = true;
  script.onload = function() {
    openobserveRum.init({ /* config */ });
  };
  document.head.appendChild(script);
})();
```

### Resource Tracking

Be selective about what resources to track:

```javascript
openobserveRum.init({
  // ... config
  trackResources: true,
  beforeSend: (event) => {
    // Filter out tracking pixels and analytics
    if (event.type === 'resource') {
      const url = event.resource?.url || '';

      const ignorePatterns = [
        'analytics.google.com',
        'tracking-pixel.png',
        'facebook.com/tr',
        '.gif?'  // Tracking pixels
      ];

      if (ignorePatterns.some(pattern => url.includes(pattern))) {
        return false;
      }
    }

    return event;
  }
});
```

### Action Tracking

Track meaningful interactions only:

```javascript
// ✅ Good: Track business-critical actions
openobserveRum.addAction('purchase_completed', {
  order_id: '12345',
  total: 99.99
});

openobserveRum.addAction('feature_used', {
  feature: 'export_data',
  format: 'csv'
});

// ❌ Bad: Don't track every click
document.addEventListener('click', (e) => {
  // Too noisy and expensive
  openobserveRum.addAction('click', { target: e.target.id });
});
```

## Monitoring and Alerting

### Set Up Alerts

Monitor key metrics:

```javascript
// Track critical metrics that should trigger alerts
function monitorCriticalMetrics() {
  // Monitor error rate
  let errorCount = 0;
  const ERROR_THRESHOLD = 10; // 10 errors per minute

  window.addEventListener('error', () => {
    errorCount++;

    if (errorCount > ERROR_THRESHOLD) {
      openobserveRum.addAction('error_threshold_exceeded', {
        count: errorCount,
        threshold: ERROR_THRESHOLD
      });
    }
  });

  // Reset counter every minute
  setInterval(() => {
    errorCount = 0;
  }, 60000);

  // Monitor performance degradation
  import { onLCP } from 'web-vitals';

  onLCP((metric) => {
    if (metric.value > 4000) { // 4 seconds
      openobserveRum.addAction('performance_degraded', {
        metric: 'lcp',
        value: metric.value,
        threshold: 4000
      });
    }
  });
}
```

### Health Checks

Verify RUM is working correctly:

```javascript
class RUMHealthCheck {
  constructor() {
    this.checks = [];
    this.runHealthChecks();
  }

  async runHealthChecks() {
    // Check RUM is initialized
    this.checkInitialized();

    // Check data is being sent
    this.checkDataFlow();

    // Check session tracking
    this.checkSessionTracking();

    // Report health status
    this.reportHealth();
  }

  checkInitialized() {
    const isInitialized = typeof openobserveRum !== 'undefined';
    this.checks.push({
      name: 'rum_initialized',
      passed: isInitialized
    });
  }

  checkDataFlow() {
    // Track a test event and verify it's sent
    const testId = `health_check_${Date.now()}`;
    openobserveRum.addAction('health_check', { test_id: testId });

    this.checks.push({
      name: 'data_flow',
      passed: true // Would need backend verification
    });
  }

  checkSessionTracking() {
    const hasSessionId = !!openobserveRum.getInternalContext?.()?.session_id;
    this.checks.push({
      name: 'session_tracking',
      passed: hasSessionId
    });
  }

  reportHealth() {
    const allPassed = this.checks.every(check => check.passed);

    openobserveRum.addAction('rum_health_check', {
      status: allPassed ? 'healthy' : 'unhealthy',
      checks: this.checks
    });
  }
}

// Run health check on app start
if (process.env.NODE_ENV === 'production') {
  setTimeout(() => {
    new RUMHealthCheck();
  }, 5000); // After 5 seconds
}
```

## Team Workflows

### Naming Conventions

Use consistent naming:

```javascript
// Custom actions: verb_noun format
openobserveRum.addAction('click_purchase_button');
openobserveRum.addAction('complete_checkout');
openobserveRum.addAction('export_report');

// Custom timings: noun_action format
openobserveRum.addTiming('dashboard_load_time', duration);
openobserveRum.addTiming('api_response_time', duration);

// View names: Page/Section format
openobserveRum.setViewName('Dashboard/Analytics');
openobserveRum.setViewName('Product/Details');
openobserveRum.setViewName('Checkout/Payment');

// Context properties: snake_case
openobserveRum.setGlobalContextProperty('user_tier', 'enterprise');
openobserveRum.setGlobalContextProperty('feature_flag_enabled', true);
```

### Documentation

Document your RUM implementation:

```javascript
/**
 * RUM Implementation Guide
 *
 * Global Context:
 * - user_tier: string - User subscription tier (free, paid, enterprise)
 * - feature_flags: object - Active feature flags
 * - deployment_version: string - Current deployment version
 *
 * Custom Actions:
 * - purchase_completed: Fired when order is placed
 * - feature_used: Fired when user uses a key feature
 * - export_started: Fired when user exports data
 *
 * Custom Timings:
 * - dashboard_load_time: Time to load dashboard
 * - report_generation_time: Time to generate report
 *
 * View Names:
 * - Format: Section/Page
 * - Examples: Dashboard/Analytics, Product/Details
 */
```

## Deployment Checklist

Before deploying to production:

- [ ] Client token and app ID configured
- [ ] Environment correctly set (production)
- [ ] Version tracking implemented
- [ ] Sampling rates optimized
- [ ] Privacy measures in place (PII sanitization)
- [ ] Consent management implemented
- [ ] Error filtering configured
- [ ] Critical user actions tracked
- [ ] Performance budgets defined
- [ ] Alerts configured
- [ ] Team documentation complete
- [ ] Staging environment tested

## Next Steps

- [Troubleshooting Guide](./troubleshooting-guide.md) - Debug common issues
- [Advanced Features](./advanced-features.md) - Advanced RUM capabilities
- [Use Cases](./use-cases.md) - Real-world implementation examples
