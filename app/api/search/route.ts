import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';

/**
 * Prebuilt search index. `output: 'export'` means this must be a static file,
 * so the index is generated at build time and downloaded by the browser; see
 * components/search-dialog.tsx.
 */
export const revalidate = false;
export const dynamic = 'force-static';

export const { staticGET: GET } = createFromSource(source);
