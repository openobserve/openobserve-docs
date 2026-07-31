import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Repository root — every script resolves paths from here, never from cwd. */
export const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));

export const DOCS_DIR = path.join(ROOT, 'docs');
export const GEN_DIR = path.join(ROOT, '.fumadocs-gen');
export const GEN_META_DIR = path.join(GEN_DIR, 'meta');
export const OUT_DIR = path.join(ROOT, 'out');
export const PUBLIC_DIR = path.join(ROOT, 'public');
export const BASELINE_DIR = path.join(ROOT, 'baseline');
export const BASELINE_SITE_DIR = path.join(ROOT, 'site-baseline');

/**
 * The serving prefix. `next.config.mjs` sets `basePath: '/docs'`, so this is the
 * prefix that appears in *emitted static files* (sitemap, redirects, llms.txt) and
 * in every URL recorded by the verification harness.
 *
 * Rule §6.2: hrefs produced inside the React/remark pipeline must NOT carry it —
 * Next adds it once at render time.
 */
export const BASE_PATH = '/docs';

export const SITE_URL = 'https://openobserve.ai';

/** `a\b\c` → `a/b/c`. Windows is this repo's primary environment. */
export function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

/**
 * MkDocs `use_directory_urls: true` slug for a docs-relative markdown path.
 *
 * `index.md`           → ''            (site root)
 * `architecture.md`    → 'architecture'
 * `a/b/index.md`       → 'a/b'
 * `a/b/page.md`        → 'a/b/page'
 */
export function slugFromDocPath(relPath: string): string {
  const posix = toPosix(relPath).replace(/\.md$/i, '');
  if (posix === 'index') return '';
  return posix.replace(/\/index$/, '');
}

/** Slug → the directory URL MkDocs serves it at, without the basePath. */
export function urlFromSlug(slug: string): string {
  return slug === '' ? '/' : `/${slug}/`;
}
