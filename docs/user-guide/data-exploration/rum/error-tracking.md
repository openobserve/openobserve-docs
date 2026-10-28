---
title: Error Tracking
description: RUM error tracking automatically captures frontend JavaScript, network, and resource errors with stack traces, then links each one to its session replay.
---

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

Click any error to open its detail page. A strip of impact figures runs across the top. Below it the page splits into two columns. The left column holds the diagnosis path: the occurrences chart, the stack trace and the events leading up to the error. The right column holds the supporting evidence: session replay, the linked backend trace, where the error happens and who hit it. On narrower screens the two columns stack into one, in the same order.

### Header

The page title is the error type. Next to it, badges show whether the error was **handled** or **unhandled**, and the error source (for example `console`). The error message appears below the title in a highlighted banner, because it is usually the first thing you read and the thing you paste into a ticket.

Under the message, a line shows the timestamp, the event ID, the page route, and chips for the **service**, **version** and **environment** of the build that raised the error. Use **Copy event ID** to copy the identifier, or the share button next to it to copy a permalink to this error.

### Impact Strip

The impact strip shows how widespread the error is. The figures cover every occurrence of the same error (same type, message and handled state) within the time range selected on the error list. A deep link opened without a time range uses the 24 hours ending at the error.

| Stat | Description |
|------|-------------|
| **Occurrences** | Total events for this error in the time range |
| **Users affected** | Unique users who hit this error |
| **Sessions** | Unique sessions in which this error occurred |
| **First seen** | How long ago the error first appeared in the time range, as a compact age such as `3d` |
| **Last seen** | How long ago the error last fired, as a compact age such as `2h` |

While the figures load, or when one is unavailable, the tile shows a dash rather than a zero. A caption below the strip spells out the first and last occurrence in relative terms, for example "First seen 3 days ago, last seen 2 hours ago in the selected time range".

If the error has neither a type nor a message, it cannot be grouped with its other occurrences, and the caption says so.

### Occurrences Over Time

The **Occurrences over time** bar chart plots this error across the time range, so you can see whether it is spiking, fading or recurring. A caption shows the peak count per bucket. A dashed vertical line labelled **This event** marks the bucket that holds the occurrence you are viewing.

### Stack Trace

The stack trace panel shows the call sequence with file names and line numbers. If you have uploaded source maps for the service and version, the trace is translated from minified code back to your original source. See [Source Maps](./source-map.md).

### Events

The **Events** timeline shows what the user did in the same session around the error: up to 30 events before it and 5 after, with the error itself highlighted. The timeline only includes events from this error's session, so other users' activity in the same stream never appears in it.

### Session Replay

The **Session Replay** card opens the session replay at the moment of failure. Click **Play Session Replay** to watch what the user saw just before the error. The button is disabled when the error has no session ID.

### Trace Correlation

When the error, or a network request captured just before it, carries a trace ID, a trace correlation card links to the backend trace for that request.

### Where It Happens

The **Where it happens** panel breaks the error's occurrences down by **Browser**, **Operating system**, **Release** and **Page**. Each value shows its share of occurrences as a percentage bar.

When one value accounts for 80% or more of a dimension's occurrences, the panel highlights it in a banner, for example "94% of occurrences share the same Browser — Safari". Only the strongest concentration is highlighted. A dimension with a single distinct value is not highlighted, because "100% Chrome" tells you nothing when Chrome is the only browser in the data.

### Who Hit This

The **Who hit this** card describes the user and environment behind the single occurrence you are viewing:

- **User**: Initials avatar, name and email
- **Browser and OS**: Name, icon and full version number
- **Device**: Device brand and family, for example "Apple Mac"
- **Location**: City and country
- **IP**: Client IP address, when captured
- **Page URL**: The full URL where the error occurred, when captured
- **Tags**: Service, version, environment, SDK version and source

## Error Analysis

The detail page gives you several ways to analyse an error.

### Error Frequency

The occurrences chart shows how often the error fires over time. Use it to answer questions like these:

- Did a recent deployment cause a spike?
- Does the error recur on a pattern?
- Is it fading on its own or getting worse?

### Error Impact

The impact strip tells you how many users and sessions the error reaches:

**High impact** (many occurrences, many users): May indicate a systemic issue. Prioritize it.

**Low impact** (few occurrences, few users): May be an edge case or specific to some users. Watch for patterns.

### Error Patterns

The **Where it happens** panel helps you narrow down the cause:

**By Browser**: Does the error only occur in one browser? The panel highlights it when that browser accounts for 80% or more of occurrences.

**By Release**: Is the error limited to one application version? A concentration on a single release points to the deployment that introduced the bug.

**By Page**: Is the error concentrated on one page or spread across many? A narrow concentration suggests a page-specific fix.

**By OS**: Is the error tied to a particular platform? Compare the breakdown with the **Who hit this** card for the occurrence you are viewing.

### Time Patterns

The occurrences chart, together with the **First seen** and **Last seen** figures, shows how long the error has been around: whether it is brand new or has been affecting users for days.

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
2. **View Details**: Click the error to open its detail page
3. **Check Impact**: Read the impact strip for how many users and sessions are affected
4. **Review Events**: See what the user did in the session before the error
5. **Check Where It Happens**: Find the browser, release or page where the error concentrates
6. **Watch Replay**: Click **Play Session Replay** to watch the session
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
