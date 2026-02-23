# RUM (Real User Monitoring) - Overview

## What is RUM?

Real User Monitoring (RUM) is a comprehensive frontend monitoring solution that helps you understand how real users experience your application in production. Unlike synthetic monitoring, RUM captures actual user interactions, performance metrics, and errors as they happen in real-world conditions.

## Why Use RUM?

RUM provides critical insights into:

- **Real-world performance**: See how your application performs across different devices, browsers, networks, and geographic locations
- **User behavior**: Understand how users navigate and interact with your application
- **Error tracking**: Catch frontend errors that don't appear in server logs
- **Performance bottlenecks**: Identify slow pages, API calls, and resources that impact user experience
- **Business impact**: Correlate technical metrics with user engagement and satisfaction

## Key Features

OpenObserve RUM provides three main categories of monitoring:

### 1. Performance Monitoring
Track critical performance metrics to ensure your application is fast and responsive:

- **Web Vitals**: Core Web Vitals (LCP, FID, CLS) and other performance metrics
- **Page Load Performance**: Full page load time, time to first byte, DOM content loaded
- **Resource Monitoring**: Track loading times for images, scripts, stylesheets, and other assets
- **API Performance**: Monitor response times and success rates of API calls
- **Long Tasks**: Identify JavaScript operations that block the main thread

### 2. Session Tracking
Understand user sessions and behavior:

- **Session Timeline**: Complete view of user activity from start to finish
- **User Context**: Track user information, device, browser, location
- **Session Duration**: Monitor how long users spend in your application
- **Error Count per Session**: See which sessions encountered errors
- **Geographic Distribution**: Understand where your users are located

### 3. Error Tracking
Capture and debug frontend errors effectively:

- **Error Details**: Full error messages, stack traces, and context
- **Error Frequency**: Track how often specific errors occur
- **Error Impact**: See how many users are affected by each error
- **Session Replay Integration**: Jump directly to session replay to see what led to the error
- **Unhandled Errors**: Catch errors that would otherwise go unnoticed

### 4. Session Replay
Debug issues by watching exactly what users did:

- **Video-like Playback**: Watch user interactions as they happened
- **Event Timeline**: See all clicks, scrolls, navigation, and form submissions
- **Error Integration**: Jump to the moment an error occurred
- **Privacy Controls**: Mask sensitive user input automatically
- **Performance Context**: See performance metrics alongside user actions

## How It Works

OpenObserve RUM works by adding a lightweight JavaScript library to your frontend application:

1. **Data Collection**: The RUM SDK automatically collects performance metrics, errors, and user interactions
2. **Data Transmission**: Data is sent to OpenObserve servers in real-time
3. **Analysis**: OpenObserve processes and stores the data for analysis
4. **Visualization**: View insights through the OpenObserve dashboard with multiple tabs:

   - Performance summary with metrics and charts
   - Session list with detailed user information
   - Error tracking with aggregated error views
   - Session replay with full interaction playback

## Privacy and Security

OpenObserve RUM is designed with privacy in mind:

- **Configurable Privacy Levels**: Choose from `allow`, `mask-user-input`, or `mask` modes
- **Input Masking**: Automatically hide sensitive form inputs
- **Data Control**: Full control over what data is collected and stored
- **Secure Transmission**: All data is transmitted securely
- **Compliance**: Helps you meet GDPR and other privacy requirements

## Getting Started

To start using OpenObserve RUM:

1. **Install the SDK**: Add the OpenObserve JavaScript libraries to your project
2. **Configure**: Set up your application ID, client token, and options
3. **Deploy**: Push your changes to production
4. **Monitor**: Start viewing real user data in the OpenObserve dashboard

See the [Setup Guide](./setup.md) for detailed installation instructions.

## What's Next?

- [Setup Guide](./setup.md) - Install and configure RUM in your application
- [Performance Monitoring](./performance-monitoring.md) - Learn about performance metrics and Web Vitals
- [Session Tracking](./sessions.md) - Understand session data and user behavior
- [Error Tracking](./error-tracking.md) - Track and debug frontend errors
- [Session Replay](./session-replay.md) - Debug issues with session replay
- [Metrics Reference](./metrics-reference.md) - Complete list of all metrics collected
