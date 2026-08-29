# Error Tracking

Error tracking is crucial for maintaining application quality and user experience. Unlike server-side errors, frontend errors often go unnoticed unless you have proper monitoring in place. OpenObserve RUM automatically captures and tracks all frontend errors, giving you complete visibility into issues affecting your users.

## What Gets Tracked?

OpenObserve RUM automatically captures various types of errors:

### JavaScript Errors

**Uncaught Exceptions**:
```javascript
// This will be automatically captured
throw new Error("Something went wrong");
```

**Unhandled Promise Rejections**:
```javascript
// This will be automatically captured
Promise.reject(new Error("Failed to fetch data"));
```

**Console Errors**:
```javascript
// This will be automatically captured
console.error("This is an error message");
```

### Network Errors

- Failed fetch/XHR requests
- HTTP error status codes (4xx, 5xx)
- CORS errors
- Timeout errors

### Resource Loading Errors

- Failed image loads
- Failed script loads
- Failed stylesheet loads
- Failed font loads

### Custom Errors

You can also manually log errors:

```javascript
import { openobserveLogs } from '@openobserve/browser-logs';

openobserveLogs.logger.error('Custom error message', {
  context: 'checkout_flow',
  userId: '12345',
  orderId: 'ORD-789'
});
```

## Error Tracking Dashboard

The Error Tracking tab in the RUM dashboard provides a comprehensive view of all errors occurring in your application.

### Error List View

The main view shows a list of errors with the following information:

#### Error Badge
A colored badge labeled "Error" helps quickly identify error entries in the list.

#### Error Message
**Example**: `Uncaught "ResizeObserver loop completed with undelivered notifications."`

The actual error message that occurred. This is the primary information for understanding what went wrong.

**Types of error messages you might see**:

- JavaScript errors: `Uncaught TypeError: Cannot read property 'x' of undefined`
- Network errors: `Failed to fetch`
- Resource errors: `Failed to load resource: net::ERR_BLOCKED_BY_CLIENT`
- Custom errors: Your custom error messages

#### Application Context
**Example**: `my-web-application`

The service/application name where the error occurred. Useful when monitoring multiple applications.

#### Error State
**Example**: `unhandled`

Indicates whether the error was handled or unhandled:

- **unhandled**: Error was not caught by any error handler (critical)
- **handled**: Error was caught but still logged for tracking

#### Timestamp
**Example**: `Dec 15, 2025 17:42:58.507 +05:30`

The exact date and time when the error occurred, with timezone offset.

#### Events Count
**Example**: `1`

The number of times this specific error occurred. Higher numbers indicate:

- Frequently occurring errors
- Errors affecting many users
- Critical issues requiring immediate attention

#### View URL
**Example**: `http://localhost:5080/web/logs?stream_type=logs&stream=default&from=...`

The URL of the page where the error occurred. This helps you:

- Identify which pages have errors
- Prioritize fixes based on page importance
- Reproduce errors by visiting the URL

## Error Details View

Click on any error to see a two-column triage surface: the diagnosis path on the left, corroborating evidence on the right.

![TODO: screenshot of error detail page showing two-column layout](images/placeholder.png)

### Header and Identity

The **ErrorHeader** shows the error type as the page title. Badges indicate whether the error was **handled** or **unhandled**, and the source (e.g. `console`, `browser`). The error message appears in a prominent alert banner — it carries the diagnosis and is the first thing you should read.

![TODO: screenshot of redesigned ErrorHeader showing type, badges, and message banner](images/placeholder.png)

Below the message, a context line carries the **event ID**, the **page route**, the **timestamp**, and deployment identity chips (**service**, **version**, **environment**). Use the **Copy link** button to share a permalink to this exact error occurrence, or **Copy event ID** to paste the identifier into a ticket.

### Impact Strip

The **ErrorImpactStrip** gives you an at-a-glance read on how bad this error is:

| Stat | Description |
|------|-------------|
| **Occurrences** | Total events for this error signature in the selected time range |
| **Users** | Unique users who encountered this error |
| **Sessions** | Unique sessions in which this error occurred |
| **First seen** | When this issue first appeared (compact age, e.g. `3d`) |
| **Last seen** | How recently this issue fired (compact age, e.g. `2h`) |

When a count is unavailable, the tile shows a dash instead of a zero — a zero is a claim, a dash is the absence of one. A caption below the strip shows the absolute timestamps (e.g. "First seen 3 days ago, last seen 2 hours ago in the selected time range").

If the error has no type or message, it cannot be grouped and the strip explains why instead of showing empty tiles.

### Occurrences Chart

The **ErrorOccurrencesChart** plots this error's signature over time as a bar chart, so you can see whether the issue is spiking, subsiding, or recurring. A dashed vertical line marks the bucket that holds the event you are currently viewing, placing this exact occurrence in the issue's lifecycle.

![TODO: screenshot of occurrences chart with current-event marker](images/placeholder.png)

### Stack Trace

The **ErrorStackTrace** panel shows the full stack trace with function call sequence, file names, and line numbers. When source maps are uploaded, the stack trace is automatically translated from minified references back to your original source code.

### Breadcrumb Trail

The breadcrumb trail shows what the user was doing in their session before the error. It scopes the query to the **session ID** of this error, so you see only this user's actions — not other users' clicks from the same stream.

### Facet Breakdown

The **ErrorFacetBreakdown** panel shows where this error concentrates, by browser, operating system, release version, and page. Each dimension is shown as a share-of-occurrences bar, ranked by volume.

![TODO: screenshot of ErrorFacetBreakdown showing browser and release distribution](images/placeholder.png)

When a single value in any dimension owns **80% or more** of the traffic, the panel calls it out with an insight banner — for example, *"94% of occurrences share the same browser — Safari"* or *"100% of occurrences share the same release — v2.4.1"*. This turns the stack trace (the symptom) into a lead (the fix).

### Context Card

The **ErrorContextCard** replaces the old flat tag strip with a structured view of the user and environment behind this occurrence:

- **Identity**: User avatar (initials), name, and email
- **Environment**: Browser and OS with recognizable icons and full version numbers
- **Device**: Device brand and family (e.g. "Apple Mac")
- **Location**: City and country (e.g. "Ankara, Turkiye")
- **IP**: Client IP address
- **Page URL**: The full URL where the error occurred
- **Deployment chips**: Service, version, environment, and SDK version

![TODO: screenshot of ErrorContextCard showing identity, environment, and deployment chips](images/placeholder.png)

### Session Replay and Trace Correlation

The right column also surfaces a **session replay** link to watch exactly what the user experienced leading up to this error, and a **trace correlation card** when the error is linked to a backend trace.

## Error Analysis

The error detail page gives you several lenses for analysis:

### Error Frequency

The **ErrorOccurrencesChart** shows how often this error fires over time. Use it to answer questions like:

- Did a recent deployment cause a spike?
- Is the error recurring predictably?
- Is it subsiding on its own or getting worse?

### Error Impact

The **ErrorImpactStrip** quantifies the issue at a glance:

**High impact** (many occurrences, many users): May indicate systemic issues. Should be prioritized.

**Low impact** (few occurrences, few users): May be edge cases or user-specific. Monitor for patterns.

### Error Patterns

The **ErrorFacetBreakdown** helps you pinpoint where to fix:

**By Browser**: Does the error only occur in Safari? The breakdown's dominant-value insight calls this out immediately when one browser owns 80%+ of the traffic.

**By Release**: Is the error exclusive to a specific application version? A deployment pattern like "100% v2.4.1" points directly at the release that introduced the bug.

**By Page**: Is the error concentrated on a single page or spread across many? Narrow concentration suggests a page-specific fix.

**By Device / OS**: Is the error tied to a particular platform? Use the facet breakdown alongside the **ErrorContextCard** to correlate.

### Time Patterns

The occurrences chart combined with the **first seen / last seen** figures in the impact strip tells you the issue's lifespan — whether it is brand new or has been quietly affecting users for days.

## Error States

### Unhandled Errors

**What they are**: Errors that weren't caught by `try-catch` blocks or error handlers.

**Why they matter**:

- Indicate gaps in error handling
- Can cause application crashes
- Poor user experience

**How to handle**:
```javascript
// Wrap risky code in try-catch
try {
  riskyOperation();
} catch (error) {
  openobserveLogs.logger.error('Operation failed', { error });
  // Show user-friendly message
  showErrorMessage('Something went wrong. Please try again.');
}
```

### Handled Errors

**What they are**: Errors caught by error handlers but still logged.

**Why they matter**:

- Show you handled the error gracefully
- Still important to track frequency
- May indicate issues to fix at source

**Example**:
```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    openobserveLogs.logger.error('Failed to fetch data', {
      error,
      endpoint: '/api/data'
    });
    // Return fallback data or show error message
    return getFallbackData();
  }
}
```

## Debugging Errors with Session Replay

The most powerful feature of error tracking is integration with session replay:

### Workflow

1. **Identify Error**: Find error in Error Tracking tab
2. **View Details**: Click error to see the two-column triage page
3. **Check Impact**: Read the ErrorImpactStrip for volume and reach
4. **Review Breadcrumbs**: See what the user did in their session before the crash
5. **Examine Facet Breakdown**: Pinpoint the browser, release, or page where the error concentrates
6. **Watch Replay**: Click play button to watch session
7. **Understand Context**: See exactly what user did before error
8. **Reproduce**: Follow same steps to reproduce error
9. **Fix**: Implement fix based on understanding
10. **Verify**: Monitor error frequency after fix

### What You'll See in Session Replay

- All user interactions leading up to error
- Page state when error occurred
- Console logs and network requests
- Error highlighted in timeline
- User's device and browser context

## Common Error Scenarios

### "ResizeObserver loop completed with undelivered notifications"

**What it means**: A ResizeObserver callback took too long to execute.

**Impact**: Usually benign, doesn't affect functionality.

**How to fix**:

- This is often from browser extensions or third-party scripts
- Can be safely ignored in most cases
- Filter out if it's noise in your error tracking

```javascript
// Filter out ResizeObserver errors if needed
window.addEventListener('error', (event) => {
  if (event.message.includes('ResizeObserver')) {
    event.preventDefault(); // Prevent logging
  }
});
```

### "Cannot read property 'X' of undefined"

**What it means**: Trying to access a property on an undefined/null value.

**Impact**: Can break functionality.

**How to fix**:
```javascript
// Bad
const value = user.profile.name; // Error if user or profile is undefined

// Good
const value = user?.profile?.name ?? 'Anonymous'; // Optional chaining
```

### "Failed to fetch"

**What it means**: Network request failed (timeout, no internet, CORS, etc.).

**Impact**: Prevents data loading.

**How to fix**:
```javascript
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) {
        openobserveLogs.logger.error('Fetch failed after retries', {
          error,
          url,
          retries
        });
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### "Script error"

**What it means**: Error from cross-origin script (CORS restriction prevents details).

**Impact**: You can't see error details.

**How to fix**:

1. Add `crossorigin="anonymous"` to script tags
2. Set `Access-Control-Allow-Origin` header on script server

```html
<!-- Add crossorigin attribute -->
<script src="https://cdn.example.com/script.js" crossorigin="anonymous"></script>
```

## Error Filtering and Search

### Filter by Error Type

- JavaScript errors
- Network errors
- Resource errors
- Custom errors

### Filter by Status

- Unhandled errors
- Handled errors
- All errors

### Filter by Context

- **URL**: Show errors from specific pages
- **Browser**: Show errors from specific browsers
- **Device**: Show mobile vs desktop errors
- **Environment**: Production vs staging errors
- **Version**: Show errors from specific versions

### Search

Search errors by:
- Error message text
- Stack trace content
- URL paths
- User information

## Error Alerting

Set up alerts for critical errors:

### Alert Conditions

- **Error count threshold**: Alert when errors exceed X per hour
- **New error detected**: Alert on first occurrence of new error
- **Error rate increase**: Alert on sudden spike in error rate
- **Critical errors**: Alert immediately for unhandled errors

### Alert Channels

- Email notifications
- Slack messages
- PagerDuty integration
- Webhook to custom systems

## Error Resolution Workflow

### 1. Triage

Review new errors daily:

- Check error frequency
- Assess impact (users affected)
- Determine severity
- Assign priority

### 2. Investigation

For high-priority errors:

- Review error details and stack trace
- Watch session replays
- Identify patterns
- Determine root cause

### 3. Fix

Implement appropriate fix:

- Code changes
- Configuration updates
- Third-party library updates
- Documentation updates

### 4. Verification

After deploying fix:

- Monitor error frequency
- Verify error stopped occurring
- Check for new related errors
- Update error status

### 5. Prevention

Prevent similar errors:

- Add error handling
- Add validation
- Add tests
- Update documentation

## Best Practices

### Error Handling Strategy

**Do**:

- Catch and handle errors gracefully
- Provide user-friendly error messages
- Log errors with context
- Use specific error types
- Add error boundaries (React)

**Don't**:

- Swallow errors silently
- Show technical errors to users
- Log sensitive information
- Ignore handled errors completely

### Error Context

Always include helpful context:

```javascript
openobserveLogs.logger.error('Payment processing failed', {
  orderId: order.id,
  amount: order.total,
  paymentMethod: order.paymentMethod,
  userId: user.id,
  step: 'authorization',
  // Don't include sensitive data like card numbers!
});
```

### Error Grouping

Similar errors should be grouped:

- Same error message and type
- Same location in code
- Same root cause

This helps you:


- See true error count
- Prioritize common issues
- Track resolution progress

### Error Monitoring

Regularly review:

- New errors introduced
- Error trends over time
- Resolved vs open errors
- User impact metrics

## Privacy Considerations

### Don't Log Sensitive Data

Never include in error logs:

- Passwords
- Credit card numbers
- Social security numbers
- API keys or tokens
- Personal health information

### Sanitize Error Messages

```javascript
// Bad - exposes sensitive data
openobserveLogs.logger.error('Login failed', {
  password: userPassword // Never log passwords!
});

// Good - safe information only
openobserveLogs.logger.error('Login failed', {
  username: username, // Username is usually OK
  reason: 'invalid_credentials'
});
```

### Stack Trace Sanitization

Ensure stack traces don't expose:

- Internal server paths
- Database connection strings
- Environment variables

## Advanced Error Tracking

### Custom Error Boundaries (React)

```javascript
import React from 'react';
import { openobserveLogs } from '@openobserve/browser-logs';

class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    openobserveLogs.logger.error('React error boundary caught error', {
      error: error.toString(),
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    return this.props.children;
  }
}
```

### Global Error Handlers

```javascript
// Catch unhandled errors
window.addEventListener('error', (event) => {
  openobserveLogs.logger.error('Unhandled error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  openobserveLogs.logger.error('Unhandled promise rejection', {
    reason: event.reason,
  });
});
```

### Error Sampling

For very high traffic, sample errors:

```javascript
// Only log 10% of errors
function logError(message, context) {
  if (Math.random() < 0.1) {
    openobserveLogs.logger.error(message, context);
  }
}
```

Note: Critical errors should always be logged, only sample non-critical errors.

## Metrics and KPIs

Track these error-related metrics:

### Error Rate
Percentage of sessions with errors.

**Target**: < 5%

### Time to Resolution
How quickly errors are fixed after detection.

**Target**: Critical errors < 24 hours

### Affected Users
Number of users impacted by errors.

**Target**: Minimize affected users

### Recurrence Rate
How often fixed errors come back.

**Target**: < 5% recurrence

## Next Steps

- [Session Replay](./session-replay.md) - Learn how to debug errors with session replay
- [Metrics Reference](./metrics-reference.md) - Complete list of error-related metrics
- [Performance Monitoring](./performance-monitoring.md) - Track performance issues that may cause errors
