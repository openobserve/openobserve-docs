'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { staticClient } from 'fumadocs-core/search/client/orama-static';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SearchItemType,
} from 'fumadocs-ui/components/dialog/search';
import type { SharedProps } from 'fumadocs-ui/contexts/search';
import { BASE_PATH } from '@/lib/constants';
import { trackDocSearch, trackDocSearchClick } from '@/lib/introspection';

/**
 * The site is exported as static HTML, so search runs entirely in the browser
 * against a prebuilt index rather than a server route.
 *
 * The `from` URL carries the `basePath` prefix explicitly: the index is fetched
 * with a plain `fetch`, which Next does not rewrite the way it rewrites
 * `next/link` hrefs. Without it the request goes to /api/search and 404s.
 *
 * This is fumadocs-ui's DefaultSearchDialog recomposed from its parts (we use
 * no tags, links or footer) so that queries and result clicks can be reported
 * like `docs/js/search-tracking.js` did on the MkDocs site: a `doc-search`
 * event once a query settles, a `doc-search-click` event on selection.
 */
export default function CustomSearchDialog(props: SharedProps) {
  const client = useMemo(() => staticClient({ from: `${BASE_PATH}/api/search` }), []);
  const { search, setSearch, query } = useDocsSearch({ client });

  const items = query.data !== 'empty' ? query.data : null;
  const resultCount = items?.length ?? 0;

  // One event per settled query, 600ms after the user stops typing — the same
  // debounce the MkDocs script used — instead of one per keystroke.
  const lastTracked = useRef('');
  useEffect(() => {
    const q = search.trim();
    if (!q) {
      lastTracked.current = '';
      return;
    }
    if (query.isLoading || q === lastTracked.current) return;
    const timer = setTimeout(() => {
      lastTracked.current = q;
      trackDocSearch(q, resultCount);
    }, 600);
    return () => clearTimeout(timer);
  }, [search, query.isLoading, resultCount]);

  // Fires for both click and keyboard selection, before navigation.
  const onSelect = (item: SearchItemType) => {
    if (item.type === 'action') return;
    // Index URLs are site-root relative (`/getting-started`); only next/link
    // prefixes `basePath`, so it has to be added here for the reported URL to
    // match the page the user actually lands on.
    const href = /^https?:/.test(item.url) ? item.url : `${BASE_PATH}${item.url}`;
    trackDocSearchClick({
      url: new URL(href, window.location.origin).href,
      title: typeof item.content === 'string' ? item.content : '',
      rank: (items?.findIndex((r) => r.id === item.id) ?? -1) + 1,
      query: search.trim(),
      resultCount,
    });
  };

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      onSelect={onSelect}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={items} />
      </SearchDialogContent>
      <SearchDialogFooter />
    </SearchDialog>
  );
}
