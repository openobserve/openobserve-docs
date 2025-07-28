---
description: >-
  Track real user performance, errors, and sessions with RUM in OpenObserve.
  Gain insights, debug issues, and optimize your frontend experience easily.
---
# RUM (Real User Monitoring)

Front end monitoring is vital for understanding how your users are experiencing your application. RUM (Real User Monitoring) is a feature that allows you to track the performance of your application from the perspective of your users. RUM is a powerful tool for understanding how your application is performing in the real world, and can help you identify and fix performance issues before they impact your users.

It can be divided into three main categories:

1. **Performance Monitoring**: This includes metrics like page load time, time to first byte, and other performance metrics and web vitals that can help you understand how your application is performing.
1. **Error Tracking**: This includes tracking errors that occur in your application, and can help you identify and fix issues that are impacting your users. This is important since the errors that happen in browser will not appear
3. **Session Replay**: This includes tracking user interactions with your application, and can help you understand how users are interacting with your application. Think of being able to see exactly what a user did before they encountered an error, or how they interacted with a particular feature. You will feel like standing next to the user seeing every interaction user did with your application.

## Setup

In order to start monitoring your front end application, you need to add the OpenObserve JavaScript snippet to your application. This snippet will automatically track performance metrics, errors, and user interactions in your application, and send them to OpenObserve for analysis.

There are 2 steps for setting up OpenObserve:

1. **Import the OpenObserve JavaScript library**:

```shell
npm i @openobserve/browser-rum @openobserve/browser-logs
```


2. **Add the OpenObserve JavaScript snippet to your application**:

You can copy the below snippet together with the token from the Ingestion menu from the OpenObserve. Below is what it will look like:

```javascript

import { openobserveRum } from '@openobserve/browser-rum';
import { openobserveLogs } from '@openobserve/browser-logs';

const options = {
  clientToken: 'tokenvalue', // Get this from the Ingestion page in the OpenObserve
  applicationId: 'web-application-id',
  site: 'localhost:5080',
  service: 'my-web-application',
  env: 'production',
  version: '0.0.1',
  organizationIdentifier: 'default',
  insecureHTTP: true,
  apiVersion: 'v1',
};

openobserveRum.init({
  applicationId: options.applicationId, // required, any string identifying your application
  clientToken: options.clientToken,
  site: options.site,
  organizationIdentifier: options.organizationIdentifier,
  service: options.service,
  env: options.env,
  version: options.version,
  trackResources: true,
  trackLongTasks: true,
  trackUserInteractions: true,
  apiVersion: options.apiVersion,
  insecureHTTP: options.insecureHTTP,
  defaultPrivacyLevel: 'allow' // 'allow' or 'mask-user-input' or 'mask'. Use one of the 3 values.
});

openobserveLogs.init({
  clientToken: options.clientToken,
  site: options.site,
  organizationIdentifier: options.organizationIdentifier,
  service: options.service,
  env: options.env,
  version: options.version,
  forwardErrorsToLogs: true,
  insecureHTTP: options.insecureHTTP,
  apiVersion: options.apiVersion,
});

// You can set a user context
openobserveRum.setUser({
  id: "1",
  name: "Captain Hook",
  email: "captainhook@example.com",
});

openobserveRum.startSessionReplayRecording();
```

## Performance Monitoring

Front end monitoring is vital for understanding how your users are experiencing your application. Performance analytics is a feature that allows you to track the performance of your application from the perspective of your users. It is a powerful tool for understanding how your application is performing in the real world, and can help you identify and fix performance issues before they impact your users.

![Performance Monitoring](../../images/frontend/performance.png)

## Error Tracking

Error tracking for front end application is generally tricky as errors that happen in browser will not appear in server logs. OpenObserve provides a way to track errors that occur in your front end application, and can help you identify and fix issues that are impacting your users.

In order to track errors, you need to add the OpenObserve JavaScript snippet to your application. This snippet will automatically track errors that occur in your application, and send them to OpenObserve for analysis.

Once you have the errors being tracked, you can view them in the OpenObserve dashboard. The error tracking dashboard provides you with a list of errors that have occurred in your application, along with details like the error message, the URL where the error occurred, and the browser and operating system of the user who encountered the error. You can create custom dashboards to track errors based on specific criteria, and set up alerts to notify you when errors occur. You can additionally also jump to the session replay of the user who encountered the error to see exactly what they did before the error occurred.

Below is a screenshot of the error tracking dashboard in OpenObserve:

![Error Tracking](../../images/frontend/error-tracking.webp)


## Session Replay

Session replay works by recording user interactions like clicks, scrolls, and form submissions, and then replaying those interactions in the OpenObserve. This can help you understand how users are interacting with your application, and can provide valuable insights into how users are using your application. 

Session replay can be particularly useful for debugging issues that are difficult to reproduce, since you can see exactly what a user did before they encountered an error. You can also use session replay to understand how users are interacting with a particular feature, and identify areas where users are getting stuck or having difficulty.

![Session Replay](../../images/frontend/session-replay.png)
