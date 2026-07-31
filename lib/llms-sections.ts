/**
 * §7.10 — the `llmstxt` plugin's section configuration, transcribed from
 * `mkdocs.yml`.
 *
 * Two things depend on this list, and both must agree with it:
 *
 *  - `/docs/llms.txt` — the sections and their order.
 *  - the 368 `<slug>/index.md` endpoints — `mkdocs-llmstxt` writes a processed
 *    markdown file for every page it *includes*, and only for those. The 19
 *    pages the globs do not match have no such URL today, so emitting one would
 *    be inventing a URL rather than preserving one.
 */

export interface LlmsSection {
  title: string;
  patterns: string[];
}

export const LLMS_SECTIONS: LlmsSection[] = [
  { title: 'Getting started', patterns: ['index.md', 'getting-started.md', 'architecture.md'] },
  { title: 'User guide', patterns: ['user-guide/*.md'] },
  { title: 'Ingestion', patterns: ['ingestion/*.md'] },
  { title: 'Integrations', patterns: ['integration/*.md'] },
  { title: 'Features', patterns: ['features/*.md'] },
  { title: 'Administration', patterns: ['administration/*.md'] },
  { title: 'Reference', patterns: ['reference/*.md'] },
  { title: 'Migration', patterns: ['migration/**/*.md'] },
  { title: 'Releases', patterns: ['releases.md'] },
];

/**
 * `mkdocs-llmstxt` matches with Python's `fnmatch`, where `*` matches **any**
 * character including `/`. That is not glob semantics and the difference is
 * load-bearing: `user-guide/*.md` matches `user-guide/data-exploration/logs/logs.md`
 * (which is why 368 pages are included, not 30), while `migration/**\/*.md`
 * requires a literal second `/` and so skips `migration/v0.5.3.md`.
 *
 * Verified against the baseline build: this reproduces exactly the 368 pages
 * MkDocs emitted.
 */
function fnmatchToRegExp(pattern: string): RegExp {
  let source = '';
  for (const char of pattern) {
    if (char === '*') source += '.*';
    else if (char === '?') source += '.';
    else source += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${source}$`);
}

const COMPILED = LLMS_SECTIONS.map((section) => ({
  ...section,
  matchers: section.patterns.map(fnmatchToRegExp),
}));

/** The section a docs-relative path belongs to, or `undefined` if excluded. */
export function sectionFor(docsRelPath: string): string | undefined {
  for (const section of COMPILED) {
    if (section.matchers.some((matcher) => matcher.test(docsRelPath))) return section.title;
  }
  return undefined;
}

export function isIncludedInLlms(docsRelPath: string): boolean {
  return sectionFor(docsRelPath) !== undefined;
}
