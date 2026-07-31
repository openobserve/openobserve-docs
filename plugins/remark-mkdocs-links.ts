/**
 * §7.5 — relative `.md` links → resolved directory URLs.
 *
 * 1,289 links across the content, and the resolution must mirror MkDocs'
 * `use_directory_urls: true` exactly:
 *
 *   in `docs/a/b/page.md`     MkDocs          emitted href
 *   ─────────────────────     ────────────    ────────────
 *   `../../c.md`              /docs/c/        /c/
 *   `./sibling.md`            /docs/a/b/sibling/   /a/b/sibling/
 *   `index.md`                /docs/a/b/      /a/b/
 *   `page.md#anchor`          /docs/a/b/page/#anchor   /a/b/page/#anchor
 *   `https://…`               unchanged       unchanged
 *   `/marketing-opt-in/`      unchanged       unchanged
 *
 * The emitted hrefs carry NO `/docs` prefix — Next's `basePath` adds it once at
 * render time, and fumadocs' `a` component routes through `next/link` so it is
 * applied to raw HTML anchors too. Emitting it here produces `/docs/docs/…`,
 * which is risk R-1.
 */
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import type { Transformer } from 'unified';

import {
  assetPathToUrl,
  docPathToUrl,
  docsAssetFiles,
  docsMarkdownFiles,
  docsRelativePath,
  isExternal,
  resolveDocsRelative,
  resolveUrlRelative,
  rewriteHtmlAttribute,
  splitHash,
} from './mkdocs-paths';

/**
 * Marks a link that already pointed at a site-absolute path in the source.
 *
 * MkDocs leaves those untouched (it logs "contains an absolute link, it was left
 * as is"), because they address the *marketing site*, not the docs — e.g.
 * `/marketing-opt-in/`. Next's `basePath` would turn them into
 * `/docs/marketing-opt-in/`, a 404. `lib/mdx-components.tsx` renders anything
 * carrying this attribute as a plain anchor so the prefix is never added.
 */
export const SITE_ROOT_ATTRIBUTE = 'data-site-root';

export interface MkdocsLinksOptions {
  /** absolute path of the content directory */
  docsDir: string;
}

export function remarkMkdocsLinks(options: MkdocsLinksOptions): Transformer<Root, Root> {
  const { docsDir } = options;

  return (tree, file) => {
    if (!file.path) return;
    const self = docsRelativePath(docsDir, file.path);
    const known = docsMarkdownFiles(docsDir);
    const assets = docsAssetFiles(docsDir);
    const unresolved: string[] = [];

    const rewrite = (href: string): string | undefined => {
      if (isExternal(href) || href.startsWith('/')) return undefined;

      const [pathPart, hash] = splitHash(href);
      const target = resolveDocsRelative(self, decodeURI(pathPart));

      // A page link.
      if (/\.md$/i.test(pathPart)) {
        if (!known.has(target)) unresolved.push(href);
        return `${docPathToUrl(target)}${hash}`;
      }

      // A link *to an asset* — `[![Enable syslog](./images/syslog.png)](./images/syslog.png)`
      // is a common lightbox idiom here. MkDocs resolves any relative link that
      // hits a file in docs_dir, so these need resolving too.
      if (assets.has(target)) {
        return `${assetPathToUrl(target.split('/').map(encodeURIComponent).join('/'))}${hash}`;
      }

      // Anything else — bare filenames such as `docker-compose.yml` — is left
      // alone. MkDocs leaves them alone too and warns; they are pre-existing
      // broken links, not migration damage.
      return undefined;
    };

    /** Root-absolute in the source ⇒ addresses the site, not the docs. */
    const markSiteRoot = (node: { url: string; data?: unknown }) => {
      if (!node.url.startsWith('/') || node.url.startsWith('//')) return;
      const data = ((node as { data?: Record<string, unknown> }).data ??= {});
      const properties = ((data.hProperties ??= {}) as Record<string, unknown>);
      properties[SITE_ROOT_ATTRIBUTE] = 'true';
    };

    visit(tree, 'link', (node) => {
      const next = rewrite(node.url);
      if (next !== undefined) node.url = next;
      else markSiteRoot(node);
    });

    // Link reference definitions (`[label]: ../x.md`) resolve the same way.
    visit(tree, 'definition', (node) => {
      const next = rewrite(node.url);
      if (next !== undefined) node.url = next;
    });

    // `<a href="…">` inside the 81 raw-HTML files. MkDocs leaves raw HTML
    // untouched, so these resolve against the page's directory URL rather than
    // the source file's directory — see `resolveUrlRelative`.
    visit(tree, 'html', (node) => {
      node.value = rewriteHtmlAttribute(node.value, 'href', (href) => {
        if (isExternal(href) || href.startsWith('/')) return undefined;
        const [pathPart, hash] = splitHash(href);
        const target = resolveUrlRelative(self, decodeURI(pathPart));
        if (/\.md$/i.test(pathPart)) return `${docPathToUrl(target)}${hash}`;
        if (assets.has(target)) {
          return `${assetPathToUrl(target.split('/').map(encodeURIComponent).join('/'))}${hash}`;
        }
        return undefined;
      });
    });

    // A warning, not a failure: these are broken links in the source today, and
    // failing the build on them would block the migration on a content problem.
    for (const href of unresolved) {
      file.message(
        `link target does not resolve to a page: ${href}`,
        undefined,
        'remark-mkdocs-links:unresolved',
      );
    }
  };
}
