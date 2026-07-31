'use client';

import DefaultSearchDialog from 'fumadocs-ui/components/dialog/search-default';
import type { SharedProps } from 'fumadocs-ui/contexts/search';
import { BASE_PATH } from '@/lib/constants';

/**
 * The site is exported as static HTML, so search runs entirely in the browser
 * against a prebuilt index rather than a server route.
 *
 * `api` carries the `basePath` prefix explicitly: the index is fetched with a
 * plain `fetch`, which Next does not rewrite the way it rewrites `next/link`
 * hrefs. Without it the request goes to /api/search and 404s.
 */
export default function SearchDialog(props: SharedProps) {
  return <DefaultSearchDialog {...props} type="static" api={`${BASE_PATH}/api/search`} />;
}
