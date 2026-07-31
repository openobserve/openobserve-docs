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
 *
 * Intrinsic width/height are also read off the file and set as attributes. None
 * of the Markdown images carry dimensions, so without this the page reflows as
 * each one loads — layout shift that counts against Core Web Vitals. Paired with
 * the `max-width:100%; height:auto` rule in global.css, the browser derives an
 * aspect ratio and reserves the space up front.
 */
import fs from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import { imageSize } from 'image-size';
import { BASE_PATH } from '../constants';

const DOCS_DIR = path.resolve('docs');

/** Dimensions are read once per file; a full build touches the same ones often. */
const sizeCache = new Map<string, { width: number; height: number } | null>();

function intrinsicSize(absPath: string) {
  if (sizeCache.has(absPath)) return sizeCache.get(absPath)!;
  let result: { width: number; height: number } | null = null;
  try {
    const { width, height } = imageSize(fs.readFileSync(absPath));
    if (width && height) result = { width, height };
  } catch {
    // Unreadable or an unsupported format: fall back to no dimensions.
  }
  sizeCache.set(absPath, result);
  return result;
}

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

      // `next` is `/docs/<rel>`; the file itself lives at `docs/<rel>`.
      const publicPath = next ?? node.url;
      if (typeof publicPath !== 'string' || !publicPath.startsWith(`${BASE_PATH}/`)) return;
      const size = intrinsicSize(path.join(DOCS_DIR, publicPath.slice(BASE_PATH.length + 1)));
      if (!size) return;
      node.data = node.data ?? {};
      node.data.hProperties = { ...(node.data.hProperties ?? {}), width: size.width, height: size.height };
    });

    // Raw <img src="..."> inside HTML blocks, which MkDocs also allowed.
    visit(tree, 'html', (node: any) => {
      node.value = node.value.replace(
        /(<img\b)([^>]*?\bsrc=)(["'])(.*?)\3/gi,
        (match: string, tag: string, prefix: string, quote: string, src: string) => {
          const next = rewrite(src, fileDir);
          const url = next ?? src;
          let dims = '';
          // Only add dimensions when the author hasn't set their own.
          if (!/\bwidth=/i.test(match) && !/\bheight=/i.test(match) && url.startsWith(`${BASE_PATH}/`)) {
            const size = intrinsicSize(path.join(DOCS_DIR, url.slice(BASE_PATH.length + 1)));
            if (size) dims = ` width="${size.width}" height="${size.height}"`;
          }
          return next ? `${tag}${dims}${prefix}${quote}${next}${quote}` : `${tag}${dims}${prefix}${quote}${src}${quote}`;
        },
      );
    });
  };
};
