/**
 * §7.6 — relative image paths → absolute, docs-rooted URLs.
 *
 *     ![Kinesis](../../images/databases/firehose-stream.png)
 *   → <img src="/images/databases/firehose-stream.png">
 *
 * `next/image` is deliberately not used (`remarkImageOptions: false` in
 * `source.config.ts`): 913 local images totalling 267 MB, and `output: 'export'`
 * forces `images.unoptimized`, so it would add build cost and a layout-shift
 * wrapper for no benefit — and the existing lightbox behaviour depends on plain
 * `<img>` semantics. `lib/mdx-components.tsx` maps `img` to a plain element that
 * applies the basePath.
 *
 * As with links, the emitted src carries no `/docs` prefix (§6.2). Alt text is
 * preserved verbatim.
 */
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import type { Transformer } from 'unified';

import {
  assetPathToUrl,
  docsAssetFiles,
  docsRelativePath,
  isExternal,
  resolveDocsRelative,
  resolveUrlRelative,
  rewriteHtmlAttribute,
  splitHash,
} from './mkdocs-paths';

export interface MkdocsImagesOptions {
  /** absolute path of the content directory */
  docsDir: string;
}

export function remarkMkdocsImages(options: MkdocsImagesOptions): Transformer<Root, Root> {
  const { docsDir } = options;

  return (tree, file) => {
    if (!file.path) return;
    const self = docsRelativePath(docsDir, file.path);
    const assets = docsAssetFiles(docsDir);
    const missing: string[] = [];

    /**
     * `resolve` differs between markdown and raw HTML: MkDocs rewrites markdown
     * image paths relative to the source file, but leaves raw HTML untouched for
     * the browser to resolve against the page's directory URL — one level
     * deeper. See `resolveUrlRelative`.
     */
    const rewriteWith =
      (resolve: (from: string, href: string) => string) =>
      (src: string): string | undefined => {
        if (isExternal(src) || src.startsWith('/')) return undefined;

        const [pathPart, hash] = splitHash(src);
        const target = resolve(self, decodeURI(pathPart));
        if (!assets.has(target)) missing.push(src);

        // Re-encode: 9 asset filenames contain spaces (`Log Search.svg`).
        return `${assetPathToUrl(target.split('/').map(encodeURIComponent).join('/'))}${hash}`;
      };

    const rewrite = rewriteWith(resolveDocsRelative);
    const rewriteRawHtml = rewriteWith(resolveUrlRelative);

    visit(tree, 'image', (node) => {
      const next = rewrite(node.url);
      if (next !== undefined) node.url = next;
    });

    visit(tree, 'definition', (node) => {
      // Image reference definitions share the `definition` node type with link
      // definitions; only rewrite ones that point at a real asset.
      if (/\.md$/i.test(splitHash(node.url)[0])) return;
      const next = rewrite(node.url);
      if (next !== undefined) node.url = next;
    });

    // `<img src="…">` inside the raw-HTML files.
    visit(tree, 'html', (node) => {
      node.value = rewriteHtmlAttribute(node.value, 'src', (value) =>
        // Leave `<iframe src>` and `<script src>` alone: only relative paths
        // that resolve to a real asset are ours to rewrite.
        isExternal(value) || value.startsWith('/') ? undefined : rewriteRawHtml(value),
      );
    });

    for (const src of missing) {
      file.message(
        `image not found under docs/: ${src}`,
        undefined,
        'remark-mkdocs-images:missing',
      );
    }
  };
}
