import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';

/**
 * Prebuilt search index. `output: 'export'` means this must be a static file,
 * so the index is generated at build time and downloaded by the browser; see
 * components/search-dialog.tsx.
 *
 * The route is `search.json`, not Fumadocs' default `search`, because the
 * CloudFront Function in front of the bucket redirects every extension-less
 * path to its trailing-slash form: `/docs/api/search` became a 301 to
 * `/docs/api/search/`, which has no `index.html` and served the 404 page, so
 * the client threw instead of loading an index. Anything with a file extension
 * is passed through untouched.
 */
export const revalidate = false;
export const dynamic = 'force-static';

export const { staticGET: GET } = createFromSource(source);
