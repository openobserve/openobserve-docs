'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { BASE_PATH } from '@/lib/constants';
import { isTelemetryEnabled } from '@/lib/telemetry';

const GTM_ID = 'GTM-5RDZ55LR';
const GA_ID = 'G-3383ZJ2HH7';

/**
 * Analytics carried over from the MkDocs theme: Google Tag Manager, GA4, the
 * Segment proxy, and OpenObserve RUM.
 *
 * Gated by lib/telemetry.ts, so nothing reports from development or localhost.
 * The tags the GTM container fires (Vector, Plausible, the Segment endpoint) all
 * reject a localhost origin, which surfaced as "Failed to fetch" errors in the
 * dev overlay. Checked in an effect so server and client agree on first paint.
 *
 * `segment.js` and `openobserve-rum.js` are the original vendored scripts,
 * copied into `public/js/` by scripts/copy-assets.mjs and loaded unmodified —
 * they are self-contained, already guard against double initialisation, and
 * rewriting them would risk changing what gets reported.
 */
export function Analytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => setEnabled(isTelemetryEnabled()), []);

  if (!enabled) return null;

  return (
    <>
      {/* Google Tag Manager */}
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>

      {/* GA4, previously injected by the Material analytics integration */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>

      <Script src={`${BASE_PATH}/js/segment.js`} strategy="afterInteractive" />
      <Script src={`${BASE_PATH}/js/openobserve-rum.js`} strategy="afterInteractive" />
    </>
  );
}

/**
 * GTM's no-JS fallback, which must sit immediately inside <body>.
 *
 * Omitted from development builds so the dev DOM matches what the tags do.
 */
export function GtmNoScript() {
  if (process.env.NODE_ENV !== 'production') return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}
