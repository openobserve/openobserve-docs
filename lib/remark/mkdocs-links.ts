/**
 * Rewrites MkDocs-style relative `.md` links to real site URLs.
 *
 *   [Vector](../logs/vector.md)        -> /ingestion/logs/vector
 *   [Setup](setup.md#prerequisites)    -> /user-guide/.../setup#prerequisites
 *   [Overview](index.md)               -> the containing folder's URL
 *
 * Keeping the links as `.md` in source means they stay clickable on GitHub;
 * they are resolved to URLs only at build time.
 *
 * Output is site-root relative and deliberately excludes `basePath` — links
 * render through `next/link`, which prepends it. See lib/constants.ts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import { BASE_PATH, SITE_URL } from '../constants';

const DOCS_DIR = path.resolve('docs');

export interface MkdocsLinksOptions {
  /** Called for each link that cannot be resolved to an existing file. */
  onBrokenLink?: (info: { from: string; href: string }) => void;
}

export const remarkMkdocsLinks: Plugin<[MkdocsLinksOptions?], Root> = (options = {}) => {
  return (tree, file) => {
    const filePath = file.path ? path.resolve(file.path) : null;
    if (!filePath) return;
    const fileDir = path.dirname(filePath);

    visit(tree, 'link', (node: any) => {
      const href: string = node.url;
      if (!href) return;
      // Leave fully-qualified URLs, anchors and mailto: alone.
      if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return;
      if (href.startsWith('#')) return;

      // Root-absolute links written for MkDocs (`/marketing-opt-in/`) pointed at
      // the marketing site, which lives at the domain root. `next/link` would
      // prepend `basePath` and send them to /docs/marketing-opt-in/, so anything
      // that isn't a docs page is made fully qualified instead.
      if (href.startsWith('/')) {
        if (href.startsWith(`${BASE_PATH}/`) || href === BASE_PATH) return;
        const slug = href.split(/[#?]/)[0].replace(/^\/|\/$/g, '');
        const isDocsPage =
          slug === '' ||
          fs.existsSync(path.join(DOCS_DIR, `${slug}.md`)) ||
          fs.existsSync(path.join(DOCS_DIR, slug, 'index.md'));
        if (!isDocsPage) node.url = `${SITE_URL}${href}`;
        return;
      }

      const hashIndex = href.indexOf('#');
      const hash = hashIndex === -1 ? '' : href.slice(hashIndex);
      const target = hashIndex === -1 ? href : href.slice(0, hashIndex);
      if (!target.endsWith('.md')) return;

      const absTarget = path.resolve(fileDir, target);
      const rel = path.relative(DOCS_DIR, absTarget);
      if (rel.startsWith('..')) {
        options.onBrokenLink?.({ from: filePath, href });
        return;
      }

      let slug = rel.replace(/\\/g, '/').replace(/\.md$/, '');
      // `index` maps to its folder, matching MkDocs' directory URLs.
      if (slug === 'index') slug = '';
      else slug = slug.replace(/(^|\/)index$/, '');

      node.url = `/${slug}${hash}`.replace(/^\/\//, '/');
    });
  };
};
