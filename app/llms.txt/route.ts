import { source } from '@/lib/source';
import { BASE_PATH, SITE_URL } from '@/lib/base-path';
import { LLMS_SECTIONS, sectionFor } from '@/lib/llms-sections';

/**
 * §7.10 — `/docs/llms.txt`, replacing the `mkdocs-llmstxt` plugin.
 *
 * Sections, their order and their membership come from `lib/llms-sections.ts`,
 * which transcribes the plugin's config out of `mkdocs.yml`.
 *
 * `app/llms.txt/route.ts` emits `out/llms.txt` under static export — the URL is
 * the directory name, so it lands at exactly the path it has today.
 */
export const dynamic = 'force-static';
export const revalidate = false;

export function GET() {
  const pages = source.getPages();

  const bySection = new Map<string, { title: string; url: string; description?: string }[]>();
  for (const page of pages) {
    // `page.path` is the virtual path relative to the collection dir, i.e. the
    // same docs-relative path the plugin's globs were written against.
    const section = sectionFor(page.path);
    if (!section) continue;
    const list = bySection.get(section) ?? [];
    list.push({
      title: page.data.title,
      url: `${SITE_URL}${BASE_PATH}${page.url.endsWith('/') ? page.url : `${page.url}/`}`,
      description: page.data.description,
    });
    bySection.set(section, list);
  }

  const lines: string[] = ['# OpenObserve Documentation', ''];
  const site = pages.find((page) => page.url === '/');
  if (site?.data.description) lines.push(`> ${site.data.description}`, '');

  for (const section of LLMS_SECTIONS) {
    const entries = bySection.get(section.title);
    if (!entries?.length) continue;
    entries.sort((a, b) => a.url.localeCompare(b.url));
    lines.push(`## ${section.title}`, '');
    for (const entry of entries) {
      lines.push(`- [${entry.title}](${entry.url})${entry.description ? `: ${entry.description}` : ''}`);
    }
    lines.push('');
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
