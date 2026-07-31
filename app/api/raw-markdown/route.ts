import { source } from '@/lib/source';
import { isIncludedInLlms } from '@/lib/llms-sections';

/**
 * Build-time data source for `scripts/copy-raw-markdown.mts` (§7.10).
 *
 * The processed markdown lives inside the bundler graph — it comes from
 * `postprocess: { includeProcessedMarkdown: true }` on the docs collection — so
 * a plain Node script cannot read it. This route exports it once, as JSON, and
 * the post-build script materialises the individual `.md` files from it.
 *
 * The script deletes this file afterwards: it is a build intermediate, not a
 * URL the site serves, and leaving it would add a 13 MB endpoint nobody asked
 * for.
 */
export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  const entries: Record<string, string> = {};

  for (const page of source.getPages()) {
    // Only pages `mkdocs-llmstxt` included have a `<slug>/index.md` URL today.
    if (!isIncludedInLlms(page.path)) continue;
    entries[page.path] = await page.data.getText('processed');
  }

  return Response.json(entries);
}
