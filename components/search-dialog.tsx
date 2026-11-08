'use client';

import { useMemo } from 'react';
import { useDocsSearch, type SearchClient } from 'fumadocs-core/search/client';
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
} from 'fumadocs-ui/components/dialog/search';
import type { SharedProps } from 'fumadocs-ui/contexts/search';
import { BASE_PATH } from '@/lib/constants';
import { rerank } from '@/lib/search-rank';

/**
 * The site is exported as static HTML, so search runs entirely in the browser
 * against a prebuilt index rather than a server route.
 *
 * The `from` URL carries the `basePath` prefix explicitly: the index is fetched
 * with a plain `fetch`, which Next does not rewrite the way it rewrites
 * `next/link` hrefs. Without it the request goes to /api/search.json and 404s.
 *
 * The `.json` suffix is load-bearing — see app/api/search.json/route.ts.
 *
 * This is fumadocs-ui's DefaultSearchDialog recomposed from its parts; we use
 * no tags or links.
 */
export default function CustomSearchDialog(props: SharedProps) {
  // Two queries against the same (cached) index: the normal full-text search,
  // and one over page titles only so the page named after the query is always
  // a candidate. `rerank` merges them — see lib/search-rank.ts.
  const client = useMemo<SearchClient>(() => {
    const from = `${BASE_PATH}/api/search.json`;
    const fullText = staticClient({ from });
    const titles = staticClient({ from, search: { where: { type: 'page' }, limit: 20 } });
    return {
      async search(q) {
        const [all, titled] = await Promise.all([fullText.search(q), titles.search(q)]);
        return rerank(q, all, titled);
      },
    };
  }, []);
  const { search, setSearch, query } = useDocsSearch({ client });

  const items = query.data !== 'empty' ? query.data : null;

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
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
