import type { SortedResult } from 'fumadocs-core/search';

/**
 * Re-ranks Fumadocs' full-text results so the page *about* a term comes first.
 *
 * The static index stores every page title, heading and paragraph as its own
 * row, scored with BM25 on a single `content` field. Short rows win BM25, so a
 * bare `## Alerts` heading on an unrelated page (e.g. /screenshots) outranked
 * the "Alerts Overview" page itself, which often didn't make the top 8 at all.
 *
 * The full-text order is kept as the base signal. On top of it a page is
 * boosted when the query words appear in its title, more when the title *is*
 * the query, and when they appear in its URL slug. API reference pages are
 * pushed below the guide for the same topic, since their short titles
 * ("Dashboard", "Metrics") would otherwise take the top spot for generic
 * terms. Words are compared after a crude singularisation so "alert" and
 * "alerts" rank the same way.
 */

type Group = { page: SortedResult; hits: SortedResult[] };

const normalize = (word: string) => word.replace(/ies$/, 'y').replace(/(?<!s)s$/, '');

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9_]+/g) ?? []).map(normalize);
}

/** The client returns a flat list: each page entry followed by its hits. */
function toGroups(results: SortedResult[]): Group[] {
  const groups: Group[] = [];
  for (const item of results) {
    if (item.type === 'page') groups.push({ page: item, hits: [] });
    else groups.at(-1)?.hits.push(item);
  }
  return groups;
}

function share(query: string[], words: string[]): number {
  return query.filter((t) => words.includes(t)).length / query.length;
}

function score(group: Group, rank: number, query: string[]): number {
  // `content` is the title as Markdown with <mark> highlights.
  const title = tokenize(group.page.content.replace(/<[^>]+>/g, ''));
  const segments = group.page.url.split(/[/#]/).filter(Boolean);
  const slug = tokenize(segments.at(-1) ?? '');

  let s = 1 / (rank + 1);
  const inTitle = share(query, title);
  s += 2 * inTitle;
  if (inTitle === 1 && title.filter((t) => t !== 'overview').length === query.length) s += 2;
  s += share(query, slug);
  if (segments[0] === 'reference' && segments[1] === 'api') s -= 1.5;
  s -= 0.05 * segments.length;
  return s;
}

/**
 * @param fullText results of the normal search
 * @param titles results of the same search restricted to page titles, so a
 *   page whose title matches is a candidate even when its body ranks low
 */
export function rerank(query: string, fullText: SortedResult[], titles: SortedResult[]): SortedResult[] {
  const words = tokenize(query);
  const groups = toGroups(fullText);
  if (words.length === 0) return fullText;

  const seen = new Set(groups.map((g) => g.page.id));
  for (const group of toGroups(titles)) {
    if (!seen.has(group.page.id)) groups.push(group);
  }

  return groups
    .map((group, rank) => ({ group, score: score(group, rank, words) }))
    .sort((a, b) => b.score - a.score)
    .flatMap(({ group }) => [group.page, ...group.hits]);
}
