'use client';

import { useEffect } from 'react';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { staticClient } from 'fumadocs-core/search/client/orama-static';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { BASE_PATH } from './base-path';

declare global {
  interface Window {
    trackSearchQuery?: (query: string, resultCount?: number) => void;
    trackResultClick?: (url: string, title: string, position?: number) => void;
  }
}

/**
 * The static Orama client is created lazily, on first render of the dialog.
 *
 * That is mitigation 1 from §7.8: the index is only fetched once the user opens
 * search, so its download never sits on the critical path of a page view.
 */
let client: ReturnType<typeof staticClient> | undefined;
function getClient() {
  // `from` carries the basePath explicitly: this is a plain fetch, not a
  // <Link>, so Next does not prefix it (§6.2).
  client ??= staticClient({ from: `${BASE_PATH}/api/search` });
  return client;
}

export default function DocsSearchDialog(props: SharedProps) {
  const { search, setSearch, query } = useDocsSearch({ type: 'static', client: getClient() });

  // Rule S-5: the analytics events docs/js/search-tracking.js emits today must
  // keep firing with the same payloads. That script is loaded unchanged and
  // exposes these entry points on `window`; here they are called from the new
  // dialog instead of from Material's.
  useEffect(() => {
    if (search.trim() === '' || query.isLoading) return;
    const results = Array.isArray(query.data) ? query.data.length : 0;
    const timer = setTimeout(() => window.trackSearchQuery?.(search, results), 600);
    return () => clearTimeout(timer);
  }, [search, query.isLoading, query.data]);

  const items = Array.isArray(query.data) ? query.data : null;

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      onSelect={(item) => {
        if (!('url' in item)) return;
        const position = items?.findIndex((result) => result.id === item.id) ?? -1;
        window.trackResultClick?.(item.url, String(item.content ?? ''), position);
      }}
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
    </SearchDialog>
  );
}
