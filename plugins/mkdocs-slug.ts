/**
 * §7.7 — heading anchor parity.
 *
 * Fumadocs' `remark-heading` slugs headings with `github-slugger`; MkDocs uses
 * Python-Markdown's `toc` slugify. They agree on most headings and disagree on:
 *
 *   - punctuation runs — `C++ / Rust` → `c-rust` here, `c--rust` in github-slugger
 *   - duplicates       — Python-Markdown appends `_1`, `_2`; github-slugger `-1`, `-2`
 *   - non-ASCII        — Python-Markdown drops it entirely after NFKD
 *
 * Every mismatch silently breaks a deep link: the page still loads, it just does
 * not scroll, and nothing errors. 101 in-repo anchor links depend on this, plus
 * an unknown number of inbound external links — which is the real risk (R-3).
 *
 * This is wired through `remarkHeadingOptions.slug` rather than as a separate
 * rehype plugin. It is the same slugger fumadocs itself calls, so the ids land
 * on the headings *and* in the extracted TOC by construction, with no ordering
 * constraint to get wrong.
 */

/**
 * Port of `markdown.extensions.toc.slugify` with `separator='-'`, `unicode=False`:
 *
 *     value = unicodedata.normalize('NFKD', value)
 *     value = value.encode('ascii', 'ignore').decode('ascii')
 *     value = re.sub(r'[^\w\s-]', '', value).strip().lower()
 *     return re.sub(r'[-\s]+', '-', value)
 */
export function pythonMarkdownSlugify(value: string): string {
  // Python-Markdown slugs the *rendered text*, from which the toc extension has
  // already removed any HTML. mdast keeps raw HTML as literal text, so strip it
  // here or `<code>x</code>` would contribute the word "code" to the slug.
  const text = value.replace(/<[^>]*>/g, '');

  // NFKD then drop everything non-ASCII — combining marks included, which is
  // what Python's `.encode('ascii', 'ignore')` does.
  const ascii = text.normalize('NFKD').replace(/[^\x00-\x7F]/g, '');

  const cleaned = ascii
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase();

  return cleaned.replace(/[-\s]+/g, '-');
}

/**
 * Port of `toc.unique`: on collision append `_1`, incrementing an existing
 * numeric suffix rather than stacking new ones. An empty slug is also treated as
 * a collision, so a heading of pure punctuation becomes `_1`.
 */
export function uniqueSlug(slug: string, seen: Set<string>): string {
  let candidate = slug;
  while (candidate === '' || seen.has(candidate)) {
    const match = /^(.*)_(\d+)$/.exec(candidate);
    candidate = match ? `${match[1]}_${Number(match[2]) + 1}` : `${candidate}_1`;
  }
  seen.add(candidate);
  return candidate;
}

/**
 * Factory for `remarkHeadingOptions.slug`.
 *
 * A fresh `seen` set per document is required: Python-Markdown's duplicate
 * counter resets for every page, so sharing one across the 456 files would push
 * every repeated heading to a different anchor than MkDocs produces.
 */
export function mkdocsSlug(): (root: unknown, heading: unknown, text: string) => string {
  const perDocument = new WeakMap<object, Set<string>>();

  return (root, _heading, text) => {
    const key = root as object;
    let seen = perDocument.get(key);
    if (!seen) {
      seen = new Set<string>();
      perDocument.set(key, seen);
    }
    return uniqueSlug(pythonMarkdownSlugify(text), seen);
  };
}
