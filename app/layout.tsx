import './global.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Analytics } from '@/lib/analytics';
import DocsSearchDialog from '@/lib/search';
import { BASE_PATH, SITE_URL } from '@/lib/base-path';

/**
 * Inter, matching the marketing site. `overrides/main.html` pulled this from
 * Google Fonts with a preconnect pair; `next/font` self-hosts it instead, which
 * removes the third-party round trip and the flash it caused.
 */
const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}${BASE_PATH}`),
  title: {
    default: 'OpenObserve Documentation',
    template: '%s | OpenObserve Documentation',
  },
  description:
    'OpenObserve (O2) is a cloud-native observability platform that unifies logs, metrics, and traces into a single solution, built for petabyte scale with up to 140x lower storage cost than Elasticsearch.',
  icons: { icon: `${BASE_PATH}/images/logo_circle.png` },
  alternates: {
    // Ported from overrides/main.html — LLM discovery.
    types: { 'text/markdown': `${BASE_PATH}/llms.txt` },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        {/*
          No theme-flash script here: `RootProvider` wraps next-themes, which
          injects its own before hydration. `docs/js/theme.js` did this for
          Material's `data-md-color-scheme` and is deliberately not ported.
        */}
        <RootProvider
          search={{
            // Static Orama, loaded on first open — see lib/search.tsx.
            SearchDialog: DocsSearchDialog,
            // The index is a build-time JSON file; don't fetch it until the user
            // actually opens search (§7.8, mitigation 1).
            preload: false,
          }}
        >
          {children}
        </RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
