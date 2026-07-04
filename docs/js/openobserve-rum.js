// OpenObserve RUM + Browser Logs instrumentation for the docs site.
//
// Loads the browser-rum and browser-logs bundles from jsDelivr, then
// initializes Real User Monitoring, session replay and error log forwarding.
//
// The bundles expose the globals `window.OO_RUM` and `window.OO_LOGS`.
// Everything is guarded so it runs at most once, even with the theme's
// `navigation.instant` (SPA-style) navigation re-executing page scripts.
(function () {
  // Only instrument the live docs site — skip local previews / mkdocs serve.
  // Override with `?rum=1` to force RUM on any host (for local testing).
  var host = window.location.hostname;
  var isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host.endsWith(".local");
  var forceRum = /[?&]rum=1(&|$)/.test(window.location.search);
  if (isLocal && !forceRum) {
    return;
  }

  // Guard against double initialization (instant navigation, duplicate loads).
  if (window.__ooRumInitialized) {
    return;
  }
  window.__ooRumInitialized = true;

  var RUM_SRC =
    "https://cdn.jsdelivr.net/npm/@openobserve/browser-rum@0.3.4/bundle/openobserve-rum.min.js";
  var LOGS_SRC =
    "https://cdn.jsdelivr.net/npm/@openobserve/browser-logs@0.3.4/bundle/openobserve-logs.min.js";

  var options = {
    clientToken: "rumSrLmzRxM2F9BErL2",
    applicationId: "o2-website",
    site: "api.introspect.external.zinclabs.dev",
    service: "o2-docs",
    env: "production",
    version: "0.0.1",
    organizationIdentifier: "default",
    insecureHTTP: false,
    apiVersion: "v1",
  };

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = function () {
        reject(new Error("Failed to load " + src));
      };
      document.head.appendChild(s);
    });
  }

  Promise.all([loadScript(RUM_SRC), loadScript(LOGS_SRC)])
    .then(function () {
      var rum = window.OO_RUM;
      var logs = window.OO_LOGS;
      if (!rum || !logs) {
        return;
      }

      rum.init({
        applicationId: options.applicationId,
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
        defaultPrivacyLevel: "allow", // 'allow' | 'mask-user-input' | 'mask'
        // Enables end-to-end trace correlation from RUM to backend services by
        // injecting tracing headers into matched outgoing requests.
        allowedTracingUrls: [],
        sessionSampleRate: 100, // Track 100% of sessions
        sessionReplaySampleRate: 100, // Record 100% of sessions
      });

      logs.init({
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

      // Default anonymous user context; call setUser() elsewhere once known.
      rum.setUser({
        id: "1",
        name: "Anonymous user",
        email: "anonymous@openobserve.ai",
      });

      rum.startSessionReplayRecording();
    })
    .catch(function (err) {
      // Never let instrumentation break the page.
      if (window.console && console.warn) {
        console.warn("OpenObserve RUM failed to load:", err);
      }
    });
})();
