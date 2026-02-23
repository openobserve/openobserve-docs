# Use Cases and Real-World Examples

This guide demonstrates practical applications of OpenObserve RUM in real-world scenarios. Each use case includes complete implementation examples and analysis strategies.

## E-commerce Monitoring

### Product Page Performance

Track how quickly product pages load and when key elements become visible:

```javascript
// On product page load
function trackProductPage(product) {
  // Set view name and context
  openobserveRum.setViewName(`Product: ${product.name}`);
  openobserveRum.setViewContext({
    product_id: product.id,
    product_category: product.category,
    product_price: product.price,
    in_stock: product.inStock,
    has_reviews: product.reviews > 0,
    image_count: product.images.length
  });

  // Track when product images load
  const imageLoadStart = Date.now();
  Promise.all(
    product.images.map(img => loadImage(img))
  ).then(() => {
    openobserveRum.addTiming('product_images_loaded', Date.now() - imageLoadStart);
  });

  // Track when product recommendations load
  const recsStart = Date.now();
  loadRecommendations(product.id).then(() => {
    openobserveRum.addTiming('recommendations_loaded', Date.now() - recsStart);
  });
}
```

### Checkout Flow Tracking

Monitor the entire checkout process and identify drop-off points:

```javascript
// Initialize checkout tracking
const checkoutSteps = {
  'cart': 1,
  'shipping': 2,
  'payment': 3,
  'review': 4,
  'confirmation': 5
};

let checkoutStartTime = null;

function trackCheckoutStep(step, data) {
  // Start tracking on first step
  if (step === 'cart') {
    checkoutStartTime = Date.now();
  }

  // Set view and context
  openobserveRum.setViewName(`Checkout: ${step}`);
  openobserveRum.setViewContext({
    checkout_step: checkoutSteps[step],
    checkout_step_name: step,
    cart_items: data.itemCount,
    cart_total: data.total,
    has_coupon: !!data.coupon,
    time_in_checkout: checkoutStartTime ? Date.now() - checkoutStartTime : 0
  });

  // Track custom action
  openobserveRum.addAction('checkout_step_reached', {
    step: step,
    step_number: checkoutSteps[step],
    items: data.itemCount,
    total: data.total
  });

  // Track completion time
  if (step === 'confirmation') {
    const totalTime = Date.now() - checkoutStartTime;
    openobserveRum.addTiming('checkout_complete_time', totalTime);
  }
}

// Usage
trackCheckoutStep('cart', { itemCount: 3, total: 89.99 });
trackCheckoutStep('shipping', { itemCount: 3, total: 89.99, shippingMethod: 'standard' });
trackCheckoutStep('payment', { itemCount: 3, total: 94.99 });
```

### Cart Abandonment Tracking

Track why users abandon their carts:

```javascript
function setupCartAbandonmentTracking() {
  const cart = getCart();

  if (cart.items.length === 0) return;

  // Track cart state
  openobserveRum.setGlobalContext({
    has_cart: true,
    cart_items: cart.items.length,
    cart_value: cart.total,
    cart_age_minutes: getCartAge()
  });

  // Track when user leaves without purchasing
  window.addEventListener('beforeunload', (e) => {
    if (cart.items.length > 0 && !cart.purchased) {
      openobserveRum.addAction('cart_abandoned', {
        items: cart.items.length,
        value: cart.total,
        last_page: window.location.pathname,
        time_on_site: Date.now() - sessionStartTime
      });
    }
  });
}
```

## SaaS Application Monitoring

### Feature Usage Tracking

Monitor which features users interact with:

```javascript
function trackFeatureUsage(featureName, action, metadata = {}) {
  openobserveRum.addAction(`feature_${action}`, {
    feature_name: featureName,
    ...metadata
  });

  // Track feature-specific timings
  if (action === 'completed') {
    openobserveRum.addTiming(`${featureName}_completion_time`, metadata.duration);
  }
}

// Usage examples
trackFeatureUsage('report_generation', 'started', { report_type: 'sales' });
trackFeatureUsage('report_generation', 'completed', {
  report_type: 'sales',
  duration: 2300,
  row_count: 1500
});

trackFeatureUsage('data_export', 'started', { format: 'csv', rows: 10000 });
trackFeatureUsage('data_export', 'completed', {
  format: 'csv',
  rows: 10000,
  duration: 5400
});
```

### Onboarding Flow

Track user progress through onboarding:

```javascript
const onboardingSteps = [
  'account_created',
  'profile_completed',
  'first_project_created',
  'invited_team_member',
  'completed_tutorial',
  'first_action_performed'
];

function trackOnboardingProgress(step, data = {}) {
  const stepIndex = onboardingSteps.indexOf(step);
  const progress = ((stepIndex + 1) / onboardingSteps.length) * 100;

  openobserveRum.setGlobalContextProperty('onboarding_progress', progress);
  openobserveRum.setGlobalContextProperty('onboarding_step', step);

  openobserveRum.addAction('onboarding_step_completed', {
    step: step,
    step_number: stepIndex + 1,
    progress_percent: progress,
    ...data
  });

  // Track if user completes entire onboarding
  if (step === 'first_action_performed') {
    const timeSinceSignup = data.accountAge || 0;
    openobserveRum.addTiming('onboarding_completion_time', timeSinceSignup);
    openobserveRum.addAction('onboarding_completed', {
      time_to_complete: timeSinceSignup
    });
  }
}
```

### Dashboard Performance

Monitor dashboard loading and interaction performance:

```javascript
async function loadDashboard(dashboardId) {
  const loadStart = Date.now();

  // Set dashboard context
  openobserveRum.setViewName(`Dashboard: ${dashboardId}`);
  openobserveRum.setViewContext({
    dashboard_id: dashboardId,
    dashboard_type: 'analytics'
  });

  try {
    // Track data fetching
    const dataStart = Date.now();
    const data = await fetchDashboardData(dashboardId);
    openobserveRum.addTiming('dashboard_data_fetch', Date.now() - dataStart);

    // Track rendering
    const renderStart = Date.now();
    renderDashboard(data);
    openobserveRum.addTiming('dashboard_render', Date.now() - renderStart);

    // Track total load time
    openobserveRum.addTiming('dashboard_total_load', Date.now() - loadStart);

    // Add dashboard metadata
    openobserveRum.setViewContextProperty('widget_count', data.widgets.length);
    openobserveRum.setViewContextProperty('data_points', data.totalDataPoints);

  } catch (error) {
    openobserveLogs.logger.error('Dashboard load failed', {
      dashboard_id: dashboardId,
      error: error.message,
      load_time: Date.now() - loadStart
    });
  }
}

// Track widget interactions
function trackWidgetInteraction(widgetId, action) {
  openobserveRum.addAction('widget_interaction', {
    widget_id: widgetId,
    action: action,
    dashboard_id: currentDashboard.id
  });
}
```

## Content and Media Sites

### Article Reading Tracking

Monitor how users consume content:

```javascript
function trackArticleReading(article) {
  const startTime = Date.now();
  let maxScrollDepth = 0;
  let readingTime = 0;

  // Set article context
  openobserveRum.setViewName(`Article: ${article.title}`);
  openobserveRum.setViewContext({
    article_id: article.id,
    article_category: article.category,
    article_word_count: article.wordCount,
    article_author: article.author,
    has_video: article.hasVideo,
    has_images: article.images.length
  });

  // Track scroll depth
  window.addEventListener('scroll', throttle(() => {
    const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    maxScrollDepth = Math.max(maxScrollDepth, scrollPercent);

    if (scrollPercent > 25) openobserveRum.addAction('article_25_percent_read');
    if (scrollPercent > 50) openobserveRum.addAction('article_50_percent_read');
    if (scrollPercent > 75) openobserveRum.addAction('article_75_percent_read');
    if (scrollPercent > 90) openobserveRum.addAction('article_completed');
  }, 1000));

  // Track time spent reading
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      readingTime += Date.now() - startTime;
    }
  });

  // Track engagement on page leave
  window.addEventListener('beforeunload', () => {
    openobserveRum.addAction('article_engagement', {
      max_scroll_depth: maxScrollDepth,
      reading_time_seconds: Math.floor(readingTime / 1000),
      article_id: article.id
    });
  });
}
```

### Video Performance Tracking

Monitor video loading and playback:

```javascript
function trackVideoPerformance(videoElement, videoData) {
  const videoId = videoData.id;
  let loadStartTime = Date.now();
  let playStartTime = null;
  let totalWatchTime = 0;
  let bufferingTime = 0;
  let bufferingStart = null;

  // Track video load
  videoElement.addEventListener('loadeddata', () => {
    const loadTime = Date.now() - loadStartTime;
    openobserveRum.addTiming('video_load_time', loadTime);

    openobserveRum.setViewContextProperty('video_duration', videoElement.duration);
    openobserveRum.setViewContextProperty('video_quality', videoData.quality);
  });

  // Track playback start
  videoElement.addEventListener('play', () => {
    if (!playStartTime) {
      playStartTime = Date.now();
      const timeToPlay = playStartTime - loadStartTime;
      openobserveRum.addTiming('video_time_to_play', timeToPlay);
    }
  });

  // Track buffering
  videoElement.addEventListener('waiting', () => {
    bufferingStart = Date.now();
  });

  videoElement.addEventListener('playing', () => {
    if (bufferingStart) {
      bufferingTime += Date.now() - bufferingStart;
      bufferingStart = null;
    }
  });

  // Track completion
  videoElement.addEventListener('ended', () => {
    openobserveRum.addAction('video_completed', {
      video_id: videoId,
      duration: videoElement.duration,
      buffering_time: bufferingTime,
      total_watch_time: totalWatchTime
    });
  });
}
```

## Conversion Funnel Analysis

### Signup Funnel

Track users through the signup process:

```javascript
const signupFunnel = {
  steps: [
    'landing_page_viewed',
    'signup_button_clicked',
    'email_entered',
    'password_entered',
    'terms_accepted',
    'account_created',
    'email_verified'
  ],

  trackStep(step, data = {}) {
    const stepIndex = this.steps.indexOf(step);

    openobserveRum.addAction('signup_funnel_step', {
      step: step,
      step_number: stepIndex + 1,
      funnel: 'signup',
      ...data
    });

    // Store progress in global context
    openobserveRum.setGlobalContextProperty('signup_progress', step);
    openobserveRum.setGlobalContextProperty('signup_step_number', stepIndex + 1);
  },

  trackAbandonment(currentStep, reason = 'unknown') {
    openobserveRum.addAction('signup_abandoned', {
      abandoned_at: currentStep,
      reason: reason,
      time_in_funnel: Date.now() - funnelStartTime
    });
  }
};

// Usage
signupFunnel.trackStep('landing_page_viewed');
signupFunnel.trackStep('signup_button_clicked', { button_location: 'hero' });
signupFunnel.trackStep('email_entered', { email_domain: 'gmail.com' });

// Track abandonment
window.addEventListener('beforeunload', () => {
  const currentStep = openobserveRum.getGlobalContext().signup_progress;
  if (currentStep && currentStep !== 'account_created') {
    signupFunnel.trackAbandonment(currentStep);
  }
});
```

### Purchase Funnel

Track the complete purchase journey:

```javascript
class PurchaseFunnel {
  constructor() {
    this.steps = [
      'product_viewed',
      'add_to_cart',
      'cart_viewed',
      'checkout_started',
      'shipping_entered',
      'payment_entered',
      'order_placed'
    ];
    this.startTime = Date.now();
    this.stepTimes = {};
  }

  trackStep(step, metadata = {}) {
    const stepTime = Date.now();
    this.stepTimes[step] = stepTime;

    const stepIndex = this.steps.indexOf(step);
    const previousStep = this.steps[stepIndex - 1];
    const timeFromPrevious = previousStep
      ? stepTime - this.stepTimes[previousStep]
      : 0;

    openobserveRum.addAction('purchase_funnel_step', {
      step: step,
      step_number: stepIndex + 1,
      time_from_previous: timeFromPrevious,
      time_from_start: stepTime - this.startTime,
      ...metadata
    });

    // Track conversion if order placed
    if (step === 'order_placed') {
      this.trackConversion(metadata);
    }
  }

  trackConversion(orderData) {
    const totalTime = Date.now() - this.startTime;

    openobserveRum.addAction('purchase_completed', {
      order_id: orderData.orderId,
      order_value: orderData.total,
      item_count: orderData.itemCount,
      time_to_purchase: totalTime,
      payment_method: orderData.paymentMethod
    });

    openobserveRum.addTiming('purchase_funnel_completion', totalTime);
  }

  trackDropOff(currentStep, reason) {
    openobserveRum.addAction('purchase_funnel_dropoff', {
      dropped_at: currentStep,
      reason: reason,
      time_in_funnel: Date.now() - this.startTime,
      steps_completed: Object.keys(this.stepTimes).length
    });
  }
}
```

## A/B Testing Analysis

### Experiment Tracking

Track experiment variants and their performance:

```javascript
class ABTestTracker {
  constructor(experimentId, variant) {
    this.experimentId = experimentId;
    this.variant = variant;

    // Set experiment in global context
    openobserveRum.setGlobalContext({
      [`experiment_${experimentId}`]: variant,
      active_experiments: this.getActiveExperiments()
    });
  }

  trackVariantShown() {
    openobserveRum.addAction('ab_test_variant_shown', {
      experiment_id: this.experimentId,
      variant: this.variant
    });
  }

  trackConversion(conversionType, value = null) {
    openobserveRum.addAction('ab_test_conversion', {
      experiment_id: this.experimentId,
      variant: this.variant,
      conversion_type: conversionType,
      conversion_value: value
    });
  }

  trackMetric(metricName, value) {
    openobserveRum.addAction('ab_test_metric', {
      experiment_id: this.experimentId,
      variant: this.variant,
      metric_name: metricName,
      metric_value: value
    });
  }

  getActiveExperiments() {
    const context = openobserveRum.getGlobalContext();
    return Object.keys(context)
      .filter(key => key.startsWith('experiment_'))
      .map(key => ({
        id: key.replace('experiment_', ''),
        variant: context[key]
      }));
  }
}

// Usage
const checkoutExperiment = new ABTestTracker('checkout_v2', 'variant_b');
checkoutExperiment.trackVariantShown();

// Track performance metrics by variant
checkoutExperiment.trackMetric('page_load_time', 1200);
checkoutExperiment.trackMetric('time_to_interactive', 2100);

// Track conversion
if (orderCompleted) {
  checkoutExperiment.trackConversion('purchase', orderTotal);
}
```

## Performance Budgets

### Monitor Performance Thresholds

Alert when performance degrades:

```javascript
const performanceBudgets = {
  lcp: 2500,        // 2.5 seconds
  fid: 100,         // 100 milliseconds
  cls: 0.1,         // 0.1
  ttfb: 800,        // 800 milliseconds
  customApiCall: 1000  // 1 second
};

function checkPerformanceBudget(metric, value) {
  const budget = performanceBudgets[metric];

  if (!budget) return;

  if (value > budget) {
    openobserveLogs.logger.warn('Performance budget exceeded', {
      metric: metric,
      value: value,
      budget: budget,
      exceeded_by: value - budget,
      page: window.location.pathname
    });

    openobserveRum.addAction('performance_budget_exceeded', {
      metric: metric,
      value: value,
      budget: budget
    });
  }
}

// Usage with Web Vitals
import { onLCP, onFID, onCLS } from 'web-vitals';

onLCP((metric) => checkPerformanceBudget('lcp', metric.value));
onFID((metric) => checkPerformanceBudget('fid', metric.value));
onCLS((metric) => checkPerformanceBudget('cls', metric.value));

// Usage with custom timings
async function criticalApiCall() {
  const start = Date.now();
  const response = await fetch('/api/critical-data');
  const duration = Date.now() - start;

  checkPerformanceBudget('customApiCall', duration);

  return response;
}
```

## Next Steps

- [Best Practices](./best-practices.md) - Production deployment recommendations
- [Advanced Features](./advanced-features.md) - Advanced RUM capabilities
- [Performance Monitoring](./performance-monitoring.md) - Performance tracking details
- [Error Tracking](./error-tracking.md) - Error monitoring strategies
