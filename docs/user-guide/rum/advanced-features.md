# Advanced Features

This guide covers advanced RUM features for power users who want to get the most out of OpenObserve RUM monitoring.

## Global Context Management

Global context allows you to attach custom attributes to all RUM events. This is useful for tracking business context, feature flags, user segments, and other application-specific data.

### Setting Global Context

Set the entire global context at once:

```javascript
openobserveRum.setGlobalContext({
  environment: 'production',
  deployment_version: 'v2.5.1',
  data_center: 'us-east-1',
  customer_tier: 'enterprise'
});
```

### Setting Individual Properties

Add or update individual properties without replacing the entire context:

```javascript
openobserveRum.setGlobalContextProperty('subscription_plan', 'premium');
openobserveRum.setGlobalContextProperty('feature_new_ui', true);
openobserveRum.setGlobalContextProperty('account_age_days', 45);
```

### Getting Global Context

Retrieve the current global context:

```javascript
const context = openobserveRum.getGlobalContext();
console.log(context);
// {
//   environment: 'production',
//   deployment_version: 'v2.5.1',
//   subscription_plan: 'premium',
//   ...
// }
```

### Removing Properties

Remove a property from the global context:

```javascript
openobserveRum.removeGlobalContextProperty('temporary_flag');
```

### Use Cases

#### Feature Flags

Track which features are enabled for each user:

```javascript
openobserveRum.setGlobalContext({
  feature_flags: {
    new_checkout: true,
    dark_mode: false,
    beta_features: true
  }
});
```

Then analyze performance or errors by feature flag:
- "Are users with new_checkout experiencing more errors?"
- "Is dark_mode affecting performance?"

#### A/B Testing

Track experiment variants:

```javascript
openobserveRum.setGlobalContextProperty('experiment_checkout_flow', 'variant_b');
openobserveRum.setGlobalContextProperty('experiment_homepage', 'control');
```

Analyze results:
- Compare conversion rates by variant
- Check error rates across variants
- Measure performance impact of experiments

#### Business Context

Add business-relevant context:

```javascript
openobserveRum.setGlobalContext({
  account_type: 'business',
  subscription_tier: 'professional',
  monthly_spend: 'high',
  industry: 'fintech',
  company_size: '100-500'
});
```

Segment analysis by business metrics:
- "Do enterprise customers have better performance?"
- "Are fintech customers experiencing more errors?"

#### Technical Context

Add deployment and infrastructure context:

```javascript
openobserveRum.setGlobalContext({
  deployment_id: 'deploy-2024-123',
  build_number: '1.2.345',
  canary_release: true,
  feature_branch: 'main'
});
```

Track deployment impact:
- "Did the new deployment cause errors?"
- "Is the canary release performing well?"

### Best Practices

**Keep it lean**: Don't add too many properties (recommended < 20)

**Use consistent naming**: Use snake_case or camelCase consistently

**Don't include sensitive data**: Never add passwords, credit cards, or PII

**Update when context changes**: Update context when user changes state

**Clean up on logout**: Remove user-specific context when user logs out

```javascript
function onLogout() {
  openobserveRum.clearUser();
  openobserveRum.setGlobalContext({}); // Clear user-specific context
  // Keep application-level context
  openobserveRum.setGlobalContextProperty('deployment_version', 'v2.5.1');
}
```

---

## View Context Management

View context allows you to add context specific to the current view/page. This is especially useful for Single Page Applications (SPAs).

### Setting View Name

Override the automatic view name for better organization:

```javascript
// Automatic: "https://example.com/products?category=electronics"
// Custom: "Product Listing - Electronics"
openobserveRum.setViewName('Product Listing - Electronics');
```

### Setting View Context

Add view-specific context that applies only to the current view:

```javascript
openobserveRum.setViewContext({
  page_type: 'product_listing',
  category: 'electronics',
  filters_active: true,
  sort_order: 'price_asc',
  results_count: 42
});
```

### Setting Individual View Properties

Update individual properties:

```javascript
openobserveRum.setViewContextProperty('results_count', 156);
openobserveRum.setViewContextProperty('filters_active', false);
```

### Getting View Context

Retrieve current view context:

```javascript
const viewContext = openobserveRum.getViewContext();
console.log(viewContext);
```

### SPA View Tracking

For Single Page Applications, manually track views when routes change:

#### React Example with React Router

```javascript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { openobserveRum } from '@openobserve/browser-rum';

function App() {
  const location = useLocation();

  useEffect(() => {
    // Set custom view name based on route
    const routeNames = {
      '/': 'Home',
      '/products': 'Product Listing',
      '/product/:id': 'Product Details',
      '/cart': 'Shopping Cart',
      '/checkout': 'Checkout'
    };

    const viewName = routeNames[location.pathname] || location.pathname;
    openobserveRum.setViewName(viewName);

    // Add view-specific context
    openobserveRum.setViewContext({
      route: location.pathname,
      search: location.search
    });
  }, [location]);

  return <div>{/* App content */}</div>;
}
```

#### Vue Example with Vue Router

```javascript
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { openobserveRum } from '@openobserve/browser-rum';

export default {
  setup() {
    const route = useRoute();

    watch(
      () => route.path,
      (newPath) => {
        // Set custom view name
        const viewName = route.meta?.title || route.name || newPath;
        openobserveRum.setViewName(viewName);

        // Add view context
        openobserveRum.setViewContext({
          route_name: route.name,
          route_params: route.params,
          route_meta: route.meta
        });
      },
      { immediate: true }
    );
  }
};
```

### Use Cases

#### E-commerce Product Pages

```javascript
// On product page load
openobserveRum.setViewName('Product Details - ' + product.name);
openobserveRum.setViewContext({
  product_id: product.id,
  product_category: product.category,
  product_price: product.price,
  in_stock: product.inStock,
  related_products_count: product.related.length
});
```

#### Dashboard Views

```javascript
// On dashboard load
openobserveRum.setViewName('Analytics Dashboard');
openobserveRum.setViewContext({
  dashboard_type: 'analytics',
  time_range: '30d',
  widgets_count: 8,
  data_loaded: true
});
```

#### Search Results

```javascript
// On search results
openobserveRum.setViewName('Search Results');
openobserveRum.setViewContext({
  search_query: sanitizeQuery(query),
  results_count: results.length,
  search_type: 'full_text',
  filters_applied: filters.length
});
```

---

## Custom Timings

Custom timings allow you to measure application-specific operations that aren't captured by standard Web Vitals.

### Adding Custom Timings

```javascript
// Measure specific operation
const startTime = Date.now();

// ... perform operation ...

openobserveRum.addTiming('data_processing_complete', Date.now() - startTime);
```

### Use Cases

#### API Data Loading

```javascript
async function loadUserData() {
  const start = Date.now();

  try {
    const data = await fetch('/api/user/profile');
    const elapsed = Date.now() - start;

    openobserveRum.addTiming('user_profile_load_time', elapsed);

    return data;
  } catch (error) {
    openobserveLogs.logger.error('Failed to load user data', { error });
  }
}
```

#### Feature Initialization

```javascript
async function initializeApp() {
  const initStart = Date.now();

  // Initialize various features
  await initAuth();
  openobserveRum.addTiming('auth_init_time', Date.now() - initStart);

  const configStart = Date.now();
  await loadConfig();
  openobserveRum.addTiming('config_load_time', Date.now() - configStart);

  const dataStart = Date.now();
  await loadInitialData();
  openobserveRum.addTiming('initial_data_load_time', Date.now() - dataStart);

  openobserveRum.addTiming('total_init_time', Date.now() - initStart);
}
```

#### User Journey Milestones

```javascript
// Checkout flow timing
function trackCheckoutMilestone(step) {
  const stepTimes = {
    'cart_view': Date.now(),
    'shipping_info': Date.now(),
    'payment_info': Date.now(),
    'order_review': Date.now(),
    'order_complete': Date.now()
  };

  openobserveRum.addTiming(`checkout_${step}_reached`, stepTimes[step]);
}

// Usage
trackCheckoutMilestone('cart_view');
// ... user fills shipping info ...
trackCheckoutMilestone('shipping_info');
```

#### Heavy Computation

```javascript
function processLargeDataset(data) {
  const start = performance.now();

  // Heavy processing
  const result = data.map(item => {
    // Complex calculations
    return transform(item);
  });

  const duration = performance.now() - start;
  openobserveRum.addTiming('dataset_processing_time', duration);

  return result;
}
```

---

## Tracking Consent Management

For GDPR and privacy compliance, manage user tracking consent.

### Setting Tracking Consent

```javascript
// User granted consent
openobserveRum.setTrackingConsent('granted');

// User denied consent
openobserveRum.setTrackingConsent('not-granted');
```

### Before Initialization

Set consent before initializing RUM:

```javascript
import { openobserveRum } from '@openobserve/browser-rum';

// Check stored consent preference
const hasConsent = localStorage.getItem('tracking_consent') === 'true';

// Initialize with tracking consent
openobserveRum.init({
  // ... config
  trackingConsent: hasConsent ? 'granted' : 'not-granted'
});
```

### After Initialization

Update consent when user changes preference:

```javascript
function handleConsentChange(userGrantedConsent) {
  const consent = userGrantedConsent ? 'granted' : 'not-granted';

  // Update RUM tracking consent
  openobserveRum.setTrackingConsent(consent);

  // Store preference
  localStorage.setItem('tracking_consent', userGrantedConsent);
}

// In your consent banner
document.getElementById('accept-cookies').addEventListener('click', () => {
  handleConsentChange(true);
});

document.getElementById('decline-cookies').addEventListener('click', () => {
  handleConsentChange(false);
});
```

### Consent Banner Example

```html
<div id="consent-banner" style="display: none;">
  <p>We use cookies and tracking to improve your experience.</p>
  <button id="accept-tracking">Accept</button>
  <button id="decline-tracking">Decline</button>
</div>

<script>
// Show banner if no consent decision made
if (!localStorage.getItem('tracking_consent')) {
  document.getElementById('consent-banner').style.display = 'block';
}

document.getElementById('accept-tracking').addEventListener('click', () => {
  openobserveRum.setTrackingConsent('granted');
  localStorage.setItem('tracking_consent', 'granted');
  document.getElementById('consent-banner').style.display = 'none';
});

document.getElementById('decline-tracking').addEventListener('click', () => {
  openobserveRum.setTrackingConsent('not-granted');
  localStorage.setItem('tracking_consent', 'not-granted');
  document.getElementById('consent-banner').style.display = 'none';
});
</script>
```

### How It Works

- When consent is **granted**: RUM collects and sends all data
- When consent is **not-granted**: RUM stops collecting and sending data
- Buffered data is discarded when consent is not granted
- Setting to granted will resume data collection going forward

---

## Advanced Sampling Strategies

Control which sessions are tracked and recorded to optimize costs and performance.

### Basic Sampling

Set overall session sampling and replay sampling rates:

```javascript
openobserveRum.init({
  // ... other config
  sessionSampleRate: 100, // Track 100% of sessions
  sessionReplaySampleRate: 20 // But only record 20% of sessions
});
```

### Conditional Sampling

Sample based on user properties or conditions:

```javascript
// Sample more for paid users, less for free users
const user = getCurrentUser();
const sampleRate = user.isPaid ? 100 : 10;

openobserveRum.init({
  // ... other config
  sessionSampleRate: sampleRate
});
```

### Route-Based Sampling

Record more sessions on critical pages:

```javascript
import { openobserveRum } from '@openobserve/browser-rum';

// Initialize with low sampling
openobserveRum.init({
  // ... config
  sessionReplaySampleRate: 10 // 10% default
});

// Force recording on critical pages
if (window.location.pathname.includes('/checkout')) {
  openobserveRum.startSessionReplayRecording({ force: true });
}

if (window.location.pathname.includes('/payment')) {
  openobserveRum.startSessionReplayRecording({ force: true });
}
```

### Error-Based Recording

Record session replay only when errors occur:

```javascript
openobserveRum.init({
  // ... config
  sessionSampleRate: 100, // Track all sessions
  sessionReplaySampleRate: 0 // Don't record by default
});

// Start recording when error occurs
window.addEventListener('error', () => {
  openobserveRum.startSessionReplayRecording({ force: true });
});

window.addEventListener('unhandledrejection', () => {
  openobserveRum.startSessionReplayRecording({ force: true });
});
```

### Time-Based Sampling

Sample differently based on time of day:

```javascript
function getSampleRate() {
  const hour = new Date().getHours();

  // Higher sampling during business hours (9am - 5pm)
  if (hour >= 9 && hour <= 17) {
    return 50; // 50% during business hours
  }

  return 10; // 10% otherwise
}

openobserveRum.init({
  // ... config
  sessionReplaySampleRate: getSampleRate()
});
```

### Cost Optimization Strategy

Recommended sampling strategy for cost optimization:

```javascript
const user = getCurrentUser();
const isProduction = process.env.NODE_ENV === 'production';
const isCriticalPage = ['/checkout', '/payment', '/signup'].some(path =>
  window.location.pathname.includes(path)
);

let sessionSampleRate = 100; // Always track sessions
let replaySampleRate = 100;  // Default replay rate

if (isProduction) {
  if (isCriticalPage) {
    replaySampleRate = 100; // Record all critical page sessions
  } else if (user && user.isPaid) {
    replaySampleRate = 50; // Record 50% of paid user sessions
  } else {
    replaySampleRate = 10; // Record 10% of free user sessions
  }
} else {
  // Non-production: record everything
  replaySampleRate = 100;
}

openobserveRum.init({
  // ... other config
  sessionSampleRate,
  sessionReplaySampleRate: replaySampleRate
});
```

---

## beforeSend Hook

The `beforeSend` hook allows you to intercept, modify, or discard events before they're sent to OpenObserve. This is powerful for data sanitization, filtering, and enrichment.

### Basic Usage

```javascript
openobserveRum.init({
  // ... other config
  beforeSend: (event) => {
    // Modify event
    event.context.custom_field = 'value';

    // Return event to send it
    return event;

    // Return false/undefined to discard event
    // return false;
  }
});
```

### Use Cases

#### Sanitizing Sensitive Data

Remove sensitive information from URLs and errors:

```javascript
openobserveRum.init({
  // ... config
  beforeSend: (event) => {
    // Remove query parameters from URLs
    if (event.view?.url) {
      event.view.url = event.view.url.split('?')[0];
    }

    // Sanitize error messages
    if (event.error?.message) {
      event.error.message = event.error.message
        .replace(/email=[^&]+/g, 'email=REDACTED')
        .replace(/token=[^&]+/g, 'token=REDACTED')
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, 'EMAIL_REDACTED');
    }

    return event;
  }
});
```

#### Filtering Out Specific Errors

Ignore known or irrelevant errors:

```javascript
openobserveRum.init({
  // ... config
  beforeSend: (event) => {
    if (event.type === 'error') {
      const message = event.error?.message || '';

      // Ignore browser extension errors
      if (message.includes('chrome-extension://')) {
        return false;
      }

      // Ignore third-party script errors
      if (event.error?.stack?.includes('google-analytics')) {
        return false;
      }

      // Ignore specific known errors
      const ignoredErrors = [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'Script error.' // Cross-origin script errors
      ];

      if (ignoredErrors.some(ignored => message.includes(ignored))) {
        return false;
      }
    }

    return event;
  }
});
```

#### Adding Custom Context

Enrich events with additional data:

```javascript
openobserveRum.init({
  // ... config
  beforeSend: (event) => {
    // Add runtime information
    event.context = event.context || {};
    event.context.memory_usage = performance.memory?.usedJSHeapSize;
    event.context.connection_type = navigator.connection?.effectiveType;
    event.context.battery_level = navigator.getBattery?.()?.level;

    // Add business context
    const cart = getShoppingCart();
    if (cart) {
      event.context.cart_items = cart.length;
      event.context.cart_value = cart.total;
    }

    return event;
  }
});
```

#### Rate Limiting Events

Limit the number of certain event types:

```javascript
const eventCounts = {};
const EVENT_LIMITS = {
  'error': 100,      // Max 100 errors per session
  'action': 1000,    // Max 1000 actions per session
  'resource': 500    // Max 500 resource events per session
};

openobserveRum.init({
  // ... config
  beforeSend: (event) => {
    const eventType = event.type;

    // Initialize counter
    if (!eventCounts[eventType]) {
      eventCounts[eventType] = 0;
    }

    // Check limit
    const limit = EVENT_LIMITS[eventType];
    if (limit && eventCounts[eventType] >= limit) {
      console.warn(`Event limit reached for ${eventType}`);
      return false; // Discard event
    }

    // Increment counter
    eventCounts[eventType]++;

    return event;
  }
});
```

#### Sampling by Event Type

Apply different sampling rates to different event types:

```javascript
openobserveRum.init({
  // ... config
  beforeSend: (event) => {
    // Sample different event types at different rates
    const samplingRates = {
      'error': 1.0,      // 100% of errors
      'resource': 0.1,   // 10% of resource events
      'action': 0.5,     // 50% of user actions
      'view': 1.0        // 100% of view events
    };

    const rate = samplingRates[event.type] || 1.0;

    // Random sampling
    if (Math.random() > rate) {
      return false; // Discard event
    }

    return event;
  }
});
```

#### Categorizing Errors

Add error categories for better organization:

```javascript
openobserveRum.init({
  // ... config
  beforeSend: (event) => {
    if (event.type === 'error') {
      const message = event.error?.message || '';
      const stack = event.error?.stack || '';

      // Categorize errors
      let category = 'unknown';
      let severity = 'medium';

      if (message.includes('Network') || message.includes('fetch')) {
        category = 'network';
        severity = 'high';
      } else if (message.includes('TypeError') || message.includes('ReferenceError')) {
        category = 'javascript';
        severity = 'high';
      } else if (stack.includes('node_modules')) {
        category = 'third_party';
        severity = 'low';
      } else if (message.includes('timeout')) {
        category = 'performance';
        severity = 'medium';
      }

      // Add category to event
      event.context = event.context || {};
      event.context.error_category = category;
      event.context.error_severity = severity;
    }

    return event;
  }
});
```

#### Debug Mode

Log events in development without sending them:

```javascript
const isDevelopment = process.env.NODE_ENV === 'development';

openobserveRum.init({
  // ... config
  beforeSend: (event) => {
    if (isDevelopment) {
      console.log('[RUM Event]', event.type, event);
      // Optionally don't send in development
      // return false;
    }

    return event;
  }
});
```

### Best Practices

**Keep it fast**: The beforeSend hook runs synchronously - avoid heavy operations

**Don't throw errors**: Errors in beforeSend will discard the event

**Test thoroughly**: Ensure you're not accidentally discarding important events

**Document your filters**: Keep track of what you're filtering and why

**Monitor discarded events**: Log when you discard events for debugging

```javascript
openobserveRum.init({
  // ... config
  beforeSend: (event) => {
    try {
      // Your logic here
      if (shouldDiscard(event)) {
        console.debug('RUM event discarded:', event.type, event);
        return false;
      }

      return event;
    } catch (error) {
      console.error('Error in beforeSend hook:', error);
      return event; // Send event despite error
    }
  }
});
```

---

## Next Steps

- [Use Cases](./use-cases.md) - Practical applications of advanced features
- [Best Practices](./best-practices.md) - Production deployment recommendations
- [Performance Monitoring](./performance-monitoring.md) - Use advanced features for performance analysis
- [Error Tracking](./error-tracking.md) - Enhanced error tracking with context
