import './global.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
import { baseOptions } from '@/app/layout.config';
import { Analytics, GtmNoScript } from '@/components/analytics';
import { SiteStructuredData } from '@/components/structured-data';
import SearchDialog from '@/components/search-dialog';
import { BASE_PATH, SITE_URL, SOCIAL_IMAGE } from '@/lib/constants';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}${BASE_PATH}/`),
  title: {
    default: 'OpenObserve Documentation',
    template: '%s',
  },
  // Fallback for routes with no metadata of their own (the 404). Kept within the
  // ~160-character search-result limit that scripts/check-seo.mjs enforces on
  // doc pages; the previous wording ran to 197 and was truncated.
  description:
    'OpenObserve (O2) is a cloud-native observability platform that unifies logs, metrics, and traces, built for petabyte scale at 140x lower storage cost.',
  icons: { icon: `${BASE_PATH}/images/logo_circle.png` },
  // Default share card, so routes without their own metadata (the 404) still
  // get one. Doc pages restate it alongside their per-page OG data.
  openGraph: {
    siteName: 'OpenObserve Documentation',
    type: 'website',
    images: [SOCIAL_IMAGE],
  },
  twitter: { card: 'summary_large_image', images: [SOCIAL_IMAGE.url] },
  alternates: {
    types: {
      // LLM discovery, matching the MkDocs `overrides/main.html` hint. Doc pages
      // override this with their own Markdown source. Absolute because Next
      // resolves `alternates` against `metadataBase`, which already ends in
      // `/docs` — a `/docs/...` value would come out as `/docs/docs/...`.
      'text/markdown': `${SITE_URL}${BASE_PATH}/llms.txt`,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <GtmNoScript />
        <SiteStructuredData />
        <RootProvider search={{ SearchDialog }}>
          <DocsLayout tree={source.pageTree} {...baseOptions}>
            {children}
          </DocsLayout>
        </RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
