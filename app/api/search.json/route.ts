import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';
import path from 'node:path';

/**
 * Undo the CommonMark backslash-escaping that `fumadocs-core`'s remark-structure
 * plugin applies when it stringifies a table cell back into plain text for the
 * search index (it round-trips through `mdast-util-to-markdown`, which escapes
 * ASCII punctuation defensively so the emitted string stays valid Markdown).
 * A table row like `| ZO_FILE_FORMAT | ... |` is indexed as the literal
 * string `ZO\_FILE\_FORMAT` — nobody searches with the backslashes, so every
 * variable/term with an underscore, asterisk, bracket, or backtick in a table
 * (i.e. most of the env var / config reference tables on this site) was
 * unsearchable. Headings and paragraphs go through the same stringifier and
 * can carry the same escaping, so this runs over both.
 */
function unescapeMarkdown(text: string): string {
  return text.replace(/\\([!-/:-@[-`{-~])/g, '$1');
}

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
 *
 * `buildIndex` re-implements Fumadocs' own default (see `buildIndexDefault` in
 * fumadocs-core's `search/server`) purely to run `unescapeMarkdown` over the
 * structured data it hands to the indexer - everything else is unchanged.
 */
export const revalidate = false;
export const dynamic = 'force-static';

export const { staticGET: GET } = createFromSource(source, {
  buildIndex: (page) => {
    const raw = page.data.structuredData;

    return {
      title: page.data.title ?? path.basename(page.path, path.extname(page.path)),
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: {
        headings: raw.headings.map((h) => ({ ...h, content: unescapeMarkdown(h.content) })),
        contents: raw.contents.map((c) => ({ ...c, content: unescapeMarkdown(c.content) })),
      },
    };
  },
});
