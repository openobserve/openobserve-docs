import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';

/**
 * §7.8 — search index.
 *
 * `staticGET` writes the prebuilt index out as a static JSON file at build time,
 * so search works on the S3 deployment with no server behind it — mandatory here
 * (Rule S-5), and why the route-handler mode is not used.
 *
 * ── Index size (mitigation 2) ────────────────────────────────────────────────
 *
 * Left to its defaults this produced 36.5 MB raw / 4.48 MB gzipped, well past
 * the ~2 MB gzipped budget — and the browser must download all of it before the
 * first query can run.
 *
 * The cost is document *count*, not text length. `remark-structure` emits one
 * searchable document per block, ~30,000 across the corpus, and Orama tokenises
 * every document's `url` and `page_id` alongside its content — so the per-block
 * overhead dominates (10 MB of the raw index is url/page_id frequencies alone).
 * Truncating block text barely moved it.
 *
 * So blocks are merged into one document per heading. That is the granularity a
 * search result actually links to, it cuts documents roughly sevenfold, and
 * every heading keeps its own deep link. Titles, descriptions and headings stay
 * whole; only the tail of a long section's prose is dropped.
 *
 * Measured (456 pages, 4,255 headings):
 *
 *   default (per-block, full text)   36.53 MB raw   4.48 MB gzip   2.66 MB brotli
 *   per-heading, 240-char sections   13.26 MB raw   1.96 MB gzip   1.12 MB brotli
 *
 * Re-measure with `npm run measure:search` after touching this.
 */
const SECTION_CHARS = 240;

/** Truncate on a word boundary so the index never ends mid-token. */
function truncate(content: string): string {
  if (content.length <= SECTION_CHARS) return content;
  const cut = content.slice(0, SECTION_CHARS);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > SECTION_CHARS * 0.6 ? cut.slice(0, lastSpace) : cut;
}

export const { staticGET: GET } = createFromSource(source, {
  buildIndex(page) {
    const structured = page.data.structuredData;

    // Merge every block under the same heading into one document, preserving
    // the order they appear in.
    const byHeading = new Map<string | undefined, string[]>();
    for (const block of structured.contents) {
      const existing = byHeading.get(block.heading);
      if (existing) existing.push(block.content);
      else byHeading.set(block.heading, [block.content]);
    }

    return {
      id: page.url,
      url: page.url,
      title: page.data.title,
      description: page.data.description,
      structuredData: {
        headings: structured.headings,
        contents: [...byHeading].map(([heading, blocks]) => ({
          heading,
          content: truncate(blocks.join(' ')),
        })),
      },
    };
  },
});

// Required by `output: 'export'` — the handler must be evaluated at build time.
export const dynamic = 'force-static';
export const revalidate = false;
