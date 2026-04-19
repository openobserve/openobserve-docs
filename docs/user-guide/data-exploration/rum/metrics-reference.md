# Metrics Reference

This document provides a comprehensive reference of all metrics collected by OpenObserve RUM. Understanding these metrics will help you analyze and optimize your application's performance and user experience.

## Overview

OpenObserve RUM automatically collects metrics in the following categories:

1. **Web Vitals**: User experience and performance metrics
2. **Navigation Timing**: Page load performance breakdown
3. **Resource Timing**: Individual resource load performance
4. **User Actions**: User interaction tracking
5. **Session Metrics**: Session-level statistics
6. **Error Metrics**: Error tracking and counts
7. **Custom Metrics**: User-defined metrics

## Web Vitals

Web Vitals are user-centric performance metrics developed by Google to measure real-world user experience.

### Core Web Vitals

These are the essential metrics that every website should track:

#### Largest Contentful Paint (LCP)

**Metric ID**: `largest_contentful_paint`

**What it measures**: Time from page start to when the largest content element becomes visible.

**Unit**: Milliseconds (ms) or Seconds (s)

**Good threshold**: ≤ 2500 ms (2.5 seconds)

**Acceptable threshold**: ≤ 4000 ms (4.0 seconds)

**Poor threshold**: > 4000 ms (4.0 seconds)

**Collected from**: [Performance Observer API - Largest Contentful Paint](https://developer.mozilla.org/en-US/docs/Web/API/LargestContentfulPaint)

**Sample values**:

- Good: 1200 ms
- Needs improvement: 3200 ms
- Poor: 5800 ms

**Factors that affect LCP**:

- Server response time
- Resource load time
- Client-side rendering
- JavaScript and CSS blocking render

---

#### First Input Delay (FID)

**Metric ID**: `first_input_delay`

**What it measures**: Time from when user first interacts with the page to when browser responds.

**Unit**: Milliseconds (ms)

**Good threshold**: ≤ 100 ms

**Acceptable threshold**: ≤ 300 ms

**Poor threshold**: > 300 ms

**Collected from**: [Performance Observer API - First Input](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEventTiming)

**Sample values**:

- Good: 45 ms
- Needs improvement: 180 ms
- Poor: 450 ms

**Factors that affect FID**:

- JavaScript execution time
- Long tasks blocking main thread
- Heavy parsing and compilation
- Third-party scripts

---

#### Cumulative Layout Shift (CLS)

**Metric ID**: `cumulative_layout_shift`

**What it measures**: Sum of all unexpected layout shifts during page lifetime.

**Unit**: Dimensionless score (0 to infinity, practically 0-1)

**Good threshold**: ≤ 0.1

**Acceptable threshold**: ≤ 0.25

**Poor threshold**: > 0.25

**Collected from**: [Performance Observer API - Layout Shift](https://developer.mozilla.org/en-US/docs/Web/API/LayoutShift)

**Sample values**:

- Good: 0.05
- Needs improvement: 0.18
- Poor: 0.42

**Factors that affect CLS**:

- Images without dimensions
- Ads and embeds without reserved space
- Dynamically injected content
- Web fonts causing FOIT/FOUT

---

### Additional Web Vitals

#### First Contentful Paint (FCP)

**Metric ID**: `first_contentful_paint`

**What it measures**: Time from page start to when first content is rendered.

**Unit**: Milliseconds (ms)

**Good threshold**: ≤ 1800 ms (1.8 seconds)

**Acceptable threshold**: ≤ 3000 ms (3.0 seconds)

**Poor threshold**: > 3000 ms (3.0 seconds)

**Collected from**: [Navigation Timing API](https://developer.mozilla.org/en-US/docs/Web/API/PerformancePaintTiming)

**Sample values**:

- Good: 1200 ms
- Needs improvement: 2400 ms
- Poor: 3800 ms

---

#### Time to First Byte (TTFB)

**Metric ID**: `time_to_first_byte`

**What it measures**: Time from request start to when first byte is received.

**Unit**: Milliseconds (ms)

**Good threshold**: ≤ 800 ms

**Acceptable threshold**: ≤ 1800 ms

**Poor threshold**: > 1800 ms

**Collected from**: [Navigation Timing API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming)

**Sample values**:

- Good: 400 ms
- Needs improvement: 1200 ms
- Poor: 2500 ms

**Components**:

- Redirect time
- Service worker startup time
- DNS lookup
- Connection and TLS negotiation
- Request time until response start

---

#### Time to Interactive (TTI)

**Metric ID**: `time_to_interactive`

**What it measures**: Time until page is fully interactive and responds quickly to user input.

**Unit**: Milliseconds (ms)

**Good threshold**: ≤ 3800 ms (3.8 seconds)

**Acceptable threshold**: ≤ 7300 ms (7.3 seconds)

**Poor threshold**: > 7300 ms (7.3 seconds)

**Collected from**: Calculated from Performance Observer data

**Sample values**:
- Good: 2500 ms
- Needs improvement: 5200 ms
- Poor: 8900 ms

---

#### Interaction to Next Paint (INP)

**Metric ID**: `interaction_to_next_paint`

**What it measures**: Responsiveness of all user interactions throughout page lifetime.

**Unit**: Milliseconds (ms)

**Good threshold**: ≤ 200 ms

**Acceptable threshold**: ≤ 500 ms

**Poor threshold**: > 500 ms

**Collected from**: [Performance Observer API - Event Timing](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEventTiming)

**Sample values**:
- Good: 120 ms
- Needs improvement: 350 ms
- Poor: 680 ms

**Note**: INP is replacing FID as a Core Web Vital.

---

## Navigation Timing Metrics

These metrics provide detailed breakdown of page load performance.

### DOM Timing

#### DOM Content Loaded

**Metric ID**: `dom_content_loaded`

**What it measures**: Time until DOMContentLoaded event fires.

**Unit**: Milliseconds (ms)

**Collected from**: `PerformanceNavigationTiming.domContentLoadedEventEnd`

**Typical range**: 500-3000 ms

---

#### DOM Complete

**Metric ID**: `dom_complete`

**What it measures**: Time until DOM is fully constructed and all resources loaded.

**Unit**: Milliseconds (ms)

**Collected from**: `PerformanceNavigationTiming.domComplete`

**Typical range**: 1000-5000 ms

---

#### DOM Interactive

**Metric ID**: `dom_interactive`

**What it measures**: Time until DOM is parsed and ready for interaction.

**Unit**: Milliseconds (ms)

**Collected from**: `PerformanceNavigationTiming.domInteractive`

**Typical range**: 500-2500 ms

---

### Load Timing

#### Load Event End

**Metric ID**: `load_event_end`

**What it measures**: Time until load event completes.

**Unit**: Milliseconds (ms)

**Collected from**: `PerformanceNavigationTiming.loadEventEnd`

**Typical range**: 1000-5000 ms

---

### Network Timing

#### DNS Lookup Time

**Metric ID**: `dns_lookup_duration`

**What it measures**: Time to resolve domain name.

**Unit**: Milliseconds (ms)

**Collected from**: `domainLookupEnd - domainLookupStart`

**Typical range**: 0-200 ms (0 if cached)

---

#### Connection Time

**Metric ID**: `connection_duration`

**What it measures**: Time to establish TCP connection.

**Unit**: Milliseconds (ms)

**Collected from**: `connectEnd - connectStart`

**Typical range**: 0-500 ms (0 if keep-alive)

---

#### TLS Negotiation Time

**Metric ID**: `tls_negotiation_duration`

**What it measures**: Time for SSL/TLS handshake.

**Unit**: Milliseconds (ms)

**Collected from**: `connectEnd - secureConnectionStart`

**Typical range**: 0-300 ms (0 if not HTTPS)

---

#### Request Duration

**Metric ID**: `request_duration`

**What it measures**: Time from request start to response start.

**Unit**: Milliseconds (ms)

**Collected from**: `responseStart - requestStart`

**Typical range**: 50-1000 ms

---

#### Response Duration

**Metric ID**: `response_duration`

**What it measures**: Time to download response.

**Unit**: Milliseconds (ms)

**Collected from**: `responseEnd - responseStart`

**Typical range**: 10-500 ms

---

## Resource Timing Metrics

Metrics for individual resources loaded by the page.

### Resource Load Metrics

#### Resource Duration

**Metric ID**: `resource.duration`

**What it measures**: Total time to load resource.

**Unit**: Milliseconds (ms)

**Collected from**: [Resource Timing API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming)

**Typical range**: 10-5000 ms depending on resource size

**Available for**: Images, scripts, stylesheets, fonts, XHR/fetch requests

---

#### Resource Size

**Metric ID**: `resource.size`

**What it measures**: Size of resource transferred over network.

**Unit**: Bytes (B) or Kilobytes (KB)

**Collected from**: `transferSize` from Resource Timing API

**Typical range**:
- Small resources: < 10 KB
- Medium resources: 10-100 KB
- Large resources: > 100 KB

---

#### Resource Type

**Metric ID**: `resource.type`

**What it measures**: Type of resource loaded.

**Values**:
- `script`: JavaScript files
- `css`: Stylesheets
- `img`: Images
- `font`: Web fonts
- `xhr`: XMLHttpRequest
- `fetch`: Fetch API requests
- `other`: Other resources

**Collected from**: `initiatorType` from Resource Timing API

---

### API Call Metrics

#### API Response Time

**Metric ID**: `api.response_time`

**What it measures**: Time for API call to complete.

**Unit**: Milliseconds (ms)

**Collected from**: Resource Timing for XHR/fetch requests

**Typical range**: 50-2000 ms

**Breakdowns**:
- DNS: < 5 ms (usually cached)
- Connection: < 50 ms
- Request: 50-1000 ms
- Response: 10-500 ms

---

#### API Status Code

**Metric ID**: `api.status_code`

**What it measures**: HTTP response status code.

**Values**: 200, 201, 400, 401, 403, 404, 500, 502, 503, etc.

**Categories**:
- 2xx: Success
- 3xx: Redirection
- 4xx: Client errors
- 5xx: Server errors

---

## User Action Metrics

Metrics related to user interactions.

### Action Types

#### Click Actions

**Metric ID**: `action.click`

**What it measures**: User clicked on an element.

**Attributes captured**:
- Element text content
- Element ID
- Element class
- XPath to element
- Timestamp

**Example**: `click on "Submit Form"` button

---

#### Form Submission

**Metric ID**: `action.submit`

**What it measures**: User submitted a form.

**Attributes captured**:
- Form ID
- Form action URL
- Number of fields
- Timestamp

---

#### Input Change

**Metric ID**: `action.input`

**What it measures**: User changed input field value.

**Attributes captured**:
- Input field name (value is masked for privacy)
- Input type
- Timestamp

**Note**: Actual input values are not captured for privacy.

---

#### Custom Actions

**Metric ID**: Custom defined by developer

**What it measures**: Application-specific user actions.

**Example usage**:
```javascript
openobserveRum.addAction('video_played', {
  video_id: 'intro-video',
  duration: 120,
  quality: '1080p'
});
```

---

## Session Metrics

Metrics that aggregate data across an entire session.

### Session Duration

**Metric ID**: `session.duration`

**What it measures**: Total length of session.

**Unit**: Milliseconds (ms) or formatted time (e.g., "5.18 min")

**Calculation**: Last event timestamp - first event timestamp

**Typical range**:
- Short: < 1 minute
- Medium: 1-10 minutes
- Long: > 10 minutes

---

### Page Views per Session

**Metric ID**: `session.view_count`

**What it measures**: Number of pages viewed in session.

**Unit**: Count

**Typical range**: 1-20 pages

---

### Actions per Session

**Metric ID**: `session.action_count`

**What it measures**: Total user actions in session.

**Unit**: Count

**Typical range**: 0-100 actions

---

### Errors per Session

**Metric ID**: `session.error_count`

**What it measures**: Total errors in session.

**Unit**: Count

**Typical range**:
- Good: 0 errors
- Acceptable: 1-5 errors
- Poor: > 5 errors

---

## Error Metrics

Metrics related to errors and exceptions.

### Error Count

**Metric ID**: `error.count`

**What it measures**: Total number of errors.

**Unit**: Count

**Aggregations**:
- Total errors
- Errors per page
- Errors per session
- Errors per user

---

### Error Rate

**Metric ID**: `error.rate`

**What it measures**: Percentage of sessions with errors.

**Unit**: Percentage (%)

**Calculation**: (Sessions with errors / Total sessions) × 100

**Targets**:
- Excellent: < 5%
- Good: 5-10%
- Poor: > 10%

---

### Error Types

**Metric ID**: `error.type`

**What it measures**: Category of error.

**Values**:
- `javascript`: JavaScript runtime errors
- `network`: Network request failures
- `resource`: Resource loading failures
- `console`: Console errors
- `custom`: Manually logged errors

---

### Error Status

**Metric ID**: `error.status`

**What it measures**: Whether error was handled.

**Values**:
- `unhandled`: Not caught by error handler
- `handled`: Caught but logged

---

## Long Task Metrics

Metrics for long-running tasks that block the main thread.

### Long Task Duration

**Metric ID**: `long_task.duration`

**What it measures**: Duration of task that blocked main thread.

**Unit**: Milliseconds (ms)

**Threshold**: > 50 ms is considered a long task

**Collected from**: [Long Tasks API](https://developer.mozilla.org/en-US/docs/Web/API/Long_Tasks_API)

**Impact**: Long tasks cause poor FID and INP scores

---

## Custom Metrics

You can define custom metrics specific to your application.

### Adding Custom Metrics

```javascript
// Add custom timing metric
openobserveRum.addTiming('checkout_completion_time', 3450);

// Add custom metric with context
openobserveRum.addAction('purchase_completed', {
  order_value: 149.99,
  items_count: 3,
  payment_method: 'credit_card',
  checkout_duration_ms: 3450
});
```

### Custom Metric Best Practices

**Naming conventions**:
- Use lowercase with underscores: `checkout_completion_time`
- Be descriptive: `video_play_count` not `vpc`
- Use consistent prefixes: `api_`, `user_`, `error_`

**Value types**:
- Numbers for measurements
- Strings for categories
- Booleans for flags

**Context attributes**:
- Add relevant context for filtering
- Don't include sensitive data
- Keep attribute count reasonable (< 20 per metric)

---

## User Context Attributes

Attributes set via `setUser()` that enrich all metrics.

### Standard User Attributes

#### User ID

**Attribute**: `user.id`

**Description**: Unique identifier for the user.

**Example**: `"user-12345"`

---

#### User Name

**Attribute**: `user.name`

**Description**: Display name of the user.

**Example**: `"John Doe"`

---

#### User Email

**Attribute**: `user.email`

**Description**: Email address of the user.

**Example**: `"john.doe@example.com"`

---

### Custom User Attributes

You can add any custom attributes:

```javascript
openobserveRum.setUser({
  id: "user-12345",
  name: "John Doe",
  email: "john@example.com",
  // Custom attributes
  subscription_plan: "premium",
  account_age_days: 45,
  feature_flags: {
    new_checkout: true,
    dark_mode: false
  }
});
```

---

## Technical Context Attributes

Automatically collected attributes about the user's environment.

### Browser Information

#### Browser Name

**Attribute**: `browser.name`

**Values**: Chrome, Firefox, Safari, Edge, Opera, etc.

---

#### Browser Version

**Attribute**: `browser.version`

**Example**: `"120.0.0.0"`

---

### Device Information

#### Device Type

**Attribute**: `device.type`

**Values**: Desktop, Mobile, Tablet

---

#### Operating System

**Attribute**: `os.name`

**Values**: Windows, Mac OS X, Linux, iOS, Android

---

#### OS Version

**Attribute**: `os.version`

**Example**: `"10.15.7"` (Mac OS X)

---

#### Screen Resolution

**Attribute**: `screen.resolution`

**Example**: `"1920x1080"`

---

#### Viewport Size

**Attribute**: `viewport.size`

**Example**: `"1440x900"`

---

### Network Information

#### Connection Type

**Attribute**: `network.connection_type`

**Values**: wifi, ethernet, cellular, 4g, 3g, 2g, unknown

---

#### Effective Connection Type

**Attribute**: `network.effective_type`

**Values**: 4g, 3g, 2g, slow-2g

---

### Geographic Information

#### Country

**Attribute**: `geo.country`

**Example**: `"United States"`

---

#### City

**Attribute**: `geo.city`

**Example**: `"New York"` (if available)

---

## Application Context

Attributes set during RUM initialization.

### Service Name

**Attribute**: `service`

**Description**: Name of the application/service.

**Example**: `"my-web-application"`

---

### Environment

**Attribute**: `env`

**Description**: Deployment environment.

**Values**: production, staging, development

---

### Version

**Attribute**: `version`

**Description**: Application version.

**Example**: `"1.2.3"`

---

## Metric Aggregations

How metrics are aggregated and displayed.

### Percentiles

Most metrics are shown as percentiles:

- **p50 (Median)**: 50% of values are at or below this
- **p75**: 75% of values are at or below this
- **p90**: 90% of values are at or below this
- **p95**: 95% of values are at or below this
- **p99**: 99% of values are at or below this

**Why percentiles matter**:
- Average can be skewed by outliers
- p75 and p95 show experience for most users
- p99 shows worst-case scenarios

### Time-Based Aggregations

Metrics can be aggregated over time periods:

- Last 15 minutes
- Last hour
- Last 24 hours
- Last 7 days
- Last 30 days
- Custom time range

### Grouping Dimensions

Metrics can be grouped by:

- **Page URL**: Performance per page
- **Browser**: Performance per browser
- **Device Type**: Mobile vs desktop
- **Country**: Geographic performance
- **User Segment**: Custom user attributes
- **Application Version**: Compare versions

---

## Using Metrics for Optimization

### Identify Issues

1. **High LCP**: Optimize largest content element loading
2. **High FID**: Reduce JavaScript execution time
3. **High CLS**: Add dimensions to images, reserve space for dynamic content
4. **High TTFB**: Optimize server response time
5. **High Error Rate**: Fix bugs affecting users
6. **High API Response Time**: Optimize backend or add caching

### Set Baselines

Track metrics over time to establish baselines:
- Normal p75 LCP for your homepage
- Expected error rate for your application
- Typical session duration

### Monitor Trends

Watch for:
- Degradation after deployments
- Improvement after optimizations
- Seasonal patterns
- Regional differences

### Create Alerts

Set up alerts for:
- Metrics exceeding thresholds
- Sudden changes in metrics
- New types of errors
- High error rates

---

## Next Steps

- [Performance Monitoring](./performance-monitoring.md) - Learn how to use these metrics
- [Setup Guide](./setup.md) - Configure which metrics to collect
- [Error Tracking](./error-tracking.md) - Understand error metrics in detail
