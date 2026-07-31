/**
 * Rewrites relative image paths to the public URLs the assets are copied to.
 *
 *   ![](../images/logs.png)  ->  /docs/images/logs.png
 *
 * `scripts/copy-assets.mjs` mirrors every non-Markdown file from `docs/` into
 * `public/`, so a path relative to the docs root is also its public path.
 *
 * Unlike links, the `basePath` prefix IS included here: images render as plain
 * `<img>` tags, which Next does not rewrite. See lib/constants.ts.
 */
import path from 'node:path';
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import { BASE_PATH } from '../constants';

const DOCS_DIR = path.resolve('docs');

export interface DocsImagesOptions {
  onMissing?: (info: { from: string; src: string }) => void;
}

function rewrite(src: string, fileDir: string): string | null {
  if (!src) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(src) || src.startsWith('//')) return null;
  if (src.startsWith(BASE_PATH + '/')) return null;

  const abs = src.startsWith('/')
    ? path.join(DOCS_DIR, src)
    : path.resolve(fileDir, src);
  const rel = path.relative(DOCS_DIR, abs).replace(/\\/g, '/');
  if (rel.startsWith('..')) return null;

  return `${BASE_PATH}/${rel}`;
}

export const remarkDocsImages: Plugin<[DocsImagesOptions?], Root> = (options = {}) => {
  return (tree, file) => {
    const filePath = file.path ? path.resolve(file.path) : null;
    if (!filePath) return;
    const fileDir = path.dirname(filePath);

    visit(tree, 'image', (node: any) => {
      const next = rewrite(node.url, fileDir);
      if (next) node.url = next;
    });

    // Raw <img src="..."> inside HTML blocks, which MkDocs also allowed.
    visit(tree, 'html', (node: any) => {
      node.value = node.value.replace(
        /(<img\b[^>]*?\bsrc=)(["'])(.*?)\2/gi,
        (match: string, prefix: string, quote: string, src: string) => {
          const next = rewrite(src, fileDir);
          return next ? `${prefix}${quote}${next}${quote}` : match;
        },
      );
    });
  };
};
