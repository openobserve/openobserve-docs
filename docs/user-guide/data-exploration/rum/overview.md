---
title: RUM Overview
description: OpenObserve RUM captures real user sessions in production, recording actual interactions, performance metrics, and errors across every device and browser.
---

# RUM (Real User Monitoring) - Overview

## What is RUM?

Real User Monitoring (RUM) is a full frontend monitoring tool. It shows how real users experience your app in production. Synthetic monitoring uses scripted tests. RUM instead captures what real users do, how fast pages load, and which errors occur, as it happens.

## Why Use RUM?

RUM helps you see:

- **Real-world performance**: See how your app performs across devices, browsers, networks, and locations.
- **User behavior**: Learn how users move through and use your app.
- **Error tracking**: Catch frontend errors that don't appear in server logs.
- **Performance bottlenecks**: Find slow pages, API calls, and resources that hurt the user experience.
- **Business impact**: Link technical metrics to user engagement and satisfaction.

## Key Features

OpenObserve RUM covers four main areas:

### 1. Performance Monitoring
Track key metrics to make sure your app is fast and responsive:

- **Web Vitals**: Core Web Vitals (LCP, INP, CLS) and other performance metrics.
- **Page Load Performance**: Full page load time, time to first byte, and DOM content loaded.
- **Resource Monitoring**: Track load times for images, scripts, stylesheets, and other assets.
- **API Performance**: Monitor response times and success rates of API calls.
- **Long Tasks**: Find JavaScript work that blocks the main thread.

### 2. Session Tracking
Understand user sessions and behavior:

- **Session Timeline**: See all user activity from start to finish.
- **User Context**: Track user details, device, browser, and location.
- **Session Duration**: Monitor how long users spend in your app.
- **Error Count per Session**: See which sessions had errors.
- **Geographic Distribution**: See where your users are.

### 3. Error Tracking
Capture and debug frontend errors:

- **Error Details**: Get full error messages, stack traces, and context.
- **Error Frequency**: Track how often each error occurs.
- **Error Impact**: See how many users each error affects.
- **Session Replay Integration**: Jump straight to session replay to see what led to the error.
- **Unhandled Errors**: Catch errors that would otherwise go unnoticed.

### 4. Session Replay
Debug issues by watching exactly what users did:

- **Video-like Playback**: Watch user actions as they happened.
- **Event Timeline**: See all clicks, scrolls, page changes, and form submissions.
- **Error Integration**: Jump to the moment an error occurred.
- **Privacy Controls**: Mask sensitive user input automatically.
- **Performance Context**: See performance metrics next to user actions.

## How It Works

To use OpenObserve RUM, you add a small JavaScript library to your frontend app. Then it works in four steps:

1. **Data Collection**: The RUM SDK automatically collects performance metrics, errors, and user actions.
2. **Data Transmission**: The SDK sends data to OpenObserve servers in real time.
3. **Analysis**: OpenObserve processes and stores the data for analysis.
4. **Visualization**: Go to **Experience** > **RUM** in the left navigation. The page has four tabs:

   - **Performance**: View metrics and charts.
   - **Sessions**: View the session list, with session replay for each session.
   - **Error Tracking**: View errors grouped together.
   - **Source Maps**: Upload source maps so stack traces show your original code.

## Privacy and Security

OpenObserve RUM is built with privacy in mind:

- **Configurable Privacy Levels**: Choose from `allow`, `mask-user-input`, or `mask` modes.
- **Input Masking**: Automatically hide sensitive form inputs.
- **Data Control**: You control what data is collected and stored.
- **Secure Transmission**: All data is sent securely.
- **Compliance**: Helps you meet GDPR and other privacy rules.

## Getting Started

To start using OpenObserve RUM:

1. **Install the SDK**: Add the OpenObserve JavaScript libraries to your project.
2. **Configure**: Set your application ID, client token, and options.
3. **Deploy**: Push your changes to production.
4. **Monitor**: Start viewing real user data in the OpenObserve dashboard.

See the [Setup Guide](./setup.md) for detailed installation instructions.

## What's Next?

- [Setup Guide](./setup.md): Install and set up RUM in your app.
- [Performance Monitoring](./performance-monitoring.md): Learn about performance metrics and Web Vitals.
- [Session Tracking](./sessions.md): Understand session data and user behavior.
- [Error Tracking](./error-tracking.md): Track and debug frontend errors.
- [Session Replay](./session-replay.md): Debug issues with session replay.
- [Metrics Reference](./metrics-reference.md): See the full list of metrics collected.
