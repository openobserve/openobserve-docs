# Performance Monitoring

Performance monitoring helps you understand how fast your application loads and responds for real users. OpenObserve RUM tracks various performance metrics automatically and displays them in an easy-to-understand dashboard.

## Performance Summary Dashboard

The Performance Summary dashboard is divided into four main sections:

1. **Overview**: High-level performance metrics and session statistics
2. **Web Vitals**: Core Web Vitals and user experience metrics
3. **Errors**: Error tracking and monitoring
4. **API**: API call performance and monitoring

You can access these sections by clicking the respective tabs in the Performance view.

## Overview Tab

The Overview tab provides a high-level view of your application's performance, including:

### Web Vitals Summary

View the three Core Web Vitals at a glance:

- **Largest Contentful Paint (LCP)**
- **First Input Delay (FID)**
- **Cumulative Layout Shift (CLS)**

These metrics help you understand the user experience quality of your application.

### Error Statistics

- **Total Errors**: Total number of errors across all sessions
- **Session with Errors**: Number of sessions that encountered at least one error
- **Total Unhandled Errors**: Errors that weren't caught by error handlers

### Session Statistics

- **Total Sessions**: Number of user sessions in the selected time range

## Web Vitals Tab

Web Vitals are user-centric performance metrics that measure real-world user experience. OpenObserve tracks all Core Web Vitals as defined by Google.

### Core Web Vitals

#### Largest Contentful Paint (LCP)

**What it measures**: The time it takes for the largest content element to become visible in the viewport.

**Why it matters**: LCP measures perceived load speed. A fast LCP helps reassure users that the page is useful.

**Good LCP scores**:

- **Good**: ≤ 2.5 seconds
- **Needs Improvement**: 2.5 - 4.0 seconds
- **Poor**: > 4.0 seconds

**What counts as LCP**:

- `<img>` elements
- `<image>` elements inside `<svg>`
- `<video>` elements with poster images
- Background images loaded via `url()`
- Block-level elements containing text

**How to improve**:

- Optimize and compress images
- Preload important resources
- Reduce server response times
- Use a CDN
- Remove render-blocking JavaScript and CSS

#### First Input Delay (FID)

**What it measures**: The time from when a user first interacts with your page (clicks a link, taps a button) to when the browser responds to that interaction.

**Why it matters**: FID measures responsiveness. It quantifies the experience users feel when trying to interact with unresponsive pages.

**Good FID scores**:

- **Good**: ≤ 100 milliseconds
- **Needs Improvement**: 100 - 300 milliseconds
- **Poor**: > 300 milliseconds

**Common causes of poor FID**:

- Long-running JavaScript tasks
- Large JavaScript bundles
- Heavy parsing and execution of scripts
- Third-party scripts

**How to improve**:

- Break up long tasks
- Optimize JavaScript execution
- Use web workers for heavy computations
- Reduce JavaScript bundle size
- Implement code splitting
- Defer unused JavaScript

#### Cumulative Layout Shift (CLS)

**What it measures**: The sum of all unexpected layout shifts that occur during the entire lifespan of the page.

**Why it matters**: CLS measures visual stability. Unexpected layout shifts can be frustrating and lead to accidental clicks.

**Good CLS scores**:

- **Good**: ≤ 0.1
- **Needs Improvement**: 0.1 - 0.25
- **Poor**: > 0.25

**Common causes of CLS**:

- Images without dimensions
- Ads, embeds, or iframes without dimensions
- Dynamically injected content
- Web fonts causing FOIT/FOUT
- Actions waiting for network response before updating DOM

**How to improve**:

- Always include width and height attributes on images and video elements
- Reserve space for ads and embeds
- Avoid inserting content above existing content
- Use `font-display: optional` for web fonts
- Preload fonts

### Additional Web Vitals

#### First Contentful Paint (FCP)

**What it measures**: The time from page start to when any part of the page's content is rendered on the screen.

**Good FCP scores**:

- **Good**: ≤ 1.8 seconds
- **Needs Improvement**: 1.8 - 3.0 seconds
- **Poor**: > 3.0 seconds

#### Time to First Byte (TTFB)

**What it measures**: The time from the request start to when the first byte of the response is received.

**Good TTFB scores**:

- **Good**: ≤ 800 milliseconds
- **Needs Improvement**: 800 - 1800 milliseconds
- **Poor**: > 1800 milliseconds

**How to improve**:

- Optimize server processing
- Use a CDN
- Implement caching
- Reduce database query times
- Use HTTP/2 or HTTP/3

#### Time to Interactive (TTI)

**What it measures**: The time from page start to when the page becomes fully interactive.

**Good TTI scores**:

- **Good**: ≤ 3.8 seconds
- **Needs Improvement**: 3.8 - 7.3 seconds
- **Poor**: > 7.3 seconds

## Errors Tab

The Errors tab provides insights into frontend errors:

### Errors by Time

A timeline chart showing error frequency over the selected time period. This helps you:

- Identify error spikes
- Correlate errors with deployments
- Track error trends over time

### Top Error Views

A table showing the most common errors, including:

- **View URL**: The page where errors are occurring
- **Error Count**: How many times each error occurred

Click on any error to:
- See detailed error information
- View affected sessions
- Jump to session replay to debug

## API Tab

The API tab monitors the performance of API calls made by your frontend:

### Top Slowest Resources

Identifies the slowest API endpoints and resources:

| Metric | Description |
|--------|-------------|
| **Resource URL** | The API endpoint or resource URL |
| **Duration (ms)** | Average response time in milliseconds |

This helps you:

- Identify slow API endpoints
- Find performance bottlenecks
- Prioritize optimization efforts

### Top Heaviest Resources

Shows resources that transfer the most data:

| Metric | Description |
|--------|-------------|
| **Resource URL** | The API endpoint or resource URL |
| **Size (kb)** | Average response size in kilobytes |

This helps you:

- Identify large payloads
- Optimize data transfer
- Reduce bandwidth usage

### Top Error Resources

Lists API endpoints with the highest error rates:

| Metric | Description |
|--------|-------------|
| **Resource URL** | The API endpoint URL |
| **Error Count** | Number of failed requests |

This helps you:

- Identify failing API calls
- Track API reliability
- Debug integration issues

## Filtering and Time Range

### Time Range Selection

Change the time range to analyze different periods:

- **Past 15 Minutes**: Real-time monitoring
- **Past Hour**: Recent performance
- **Past 6 Hours**: Short-term trends
- **Past 24 Hours**: Daily patterns
- **Past 7 Days**: Weekly trends
- **Past 30 Days**: Monthly analysis
- **Custom Range**: Specify exact date/time range

### Auto-Refresh

Enable auto-refresh to monitor performance in real-time:

- **Off**: Manual refresh only
- **10s**: Refresh every 10 seconds
- **30s**: Refresh every 30 seconds
- **1m**: Refresh every minute
- **5m**: Refresh every 5 minutes

### Filters

Apply filters to narrow down your analysis:

- **Service**: Filter by specific service name
- **Env**: Filter by environment (production, staging, development)
- **Version**: Filter by application version
- **Browser**: Filter by browser type (Chrome, Firefox, Safari, etc.)
- **Device**: Filter by device type (Desktop, Mobile, Tablet)
- **Country**: Filter by geographic location

## Performance Best Practices

### Monitoring Strategy

1. **Set Baselines**: Establish baseline metrics for your application
2. **Define Thresholds**: Set up alerts for when metrics exceed acceptable thresholds
3. **Regular Review**: Review performance metrics weekly
4. **Track Trends**: Monitor trends over time, not just absolute values
5. **Correlate with Events**: Compare metrics before and after deployments

### Optimization Workflow

1. **Identify Issues**: Use the Performance dashboard to find slow areas
2. **Prioritize**: Focus on metrics that impact the most users
3. **Investigate**: Use Session Replay to understand user context
4. **Optimize**: Make targeted improvements
5. **Measure**: Verify improvements in the dashboard
6. **Iterate**: Continue monitoring and improving

### Common Performance Issues

| Issue | Symptoms | Solutions |
|-------|----------|-----------|
| **Slow page load** | High LCP, FCP | Optimize images, reduce bundle size, use CDN |
| **Janky interactions** | High FID, long tasks | Split JavaScript, use web workers, defer scripts |
| **Layout shifts** | High CLS | Set image dimensions, reserve space for dynamic content |
| **Slow API calls** | High API duration | Optimize endpoints, add caching, use pagination |
| **Large payloads** | High resource size | Compress responses, optimize data structures |

## Interpreting Metrics

### Percentiles

Performance metrics are typically shown as percentiles:

- **p50 (Median)**: 50% of users experience this or better
- **p75**: 75% of users experience this or better
- **p95**: 95% of users experience this or better
- **p99**: 99% of users experience this or better

Focus on p75 and p95 to ensure good experience for most users.

### Regional Differences

Performance can vary significantly by region due to:

- Network latency
- CDN coverage
- Server location
- Local infrastructure

Use geographic filters to understand regional performance.

### Device and Browser Differences

Different devices and browsers have different capabilities:

- Mobile devices are generally slower than desktop
- Older browsers may have performance limitations
- Different browsers implement features differently

Filter by device and browser to understand these differences.

## Next Steps

- [Session Tracking](./sessions.md) - Learn about user sessions
- [Error Tracking](./error-tracking.md) - Deep dive into error tracking
- [Session Replay](./session-replay.md) - Use session replay for debugging
- [Metrics Reference](./metrics-reference.md) - Complete list of all metrics
