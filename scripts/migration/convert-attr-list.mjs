/**
 * One-time migration: resolve MkDocs `attr_list` suffixes.
 *
 *   ![alt](img.png){ width="60%" }        ->  <img src="img.png" alt="alt" width="60%">
 *   ![](img.png){:style="height:300px"}   ->  <img src="img.png" alt="" style="height:300px">
 *   [text](/somewhere/){:target="_blank"} ->  [text](/somewhere/)
 *
 * Without this the braces render as literal text. Image sizing is preserved by
 * emitting raw HTML (`rehype-raw` turns it back into a real element, and
 * lib/remark/docs-images.ts still rewrites the `src`).
 *
 * Link attributes are simply dropped: every one of them is
 * `target="_blank" rel="noopener noreferrer"` on an off-site link, and
 * Fumadocs' link component already applies exactly that to external URLs.
 *
 * Only braces directly following a Markdown link/image are touched, and only
 * when they look like an attribute list — so regex snippets such as `){3}` in
 * inline code are left alone.
 *
 * Run: node scripts/migration/convert-attr-list.mjs [--dry]
 */
import fs from 'node:fs';
import { findMarkdownFiles } from './lib-pages.mjs';

const DRY = process.argv.includes('--dry');

const IMAGE_ATTR = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)\{([^}]*)\}/g;
const LINK_ATTR = /(?<!!)(\[[^\]]*\]\([^)]*\))\{([^}]*)\}/g;

/** An attr_list body always has `:`-prefixed or `key="value"` content. */
function isAttrList(body) {
  return /^\s*:/.test(body) || /[\w-]+\s*=\s*"/.test(body);
}

function parseAttrs(body) {
  const attrs = {};
  for (const m of body.matchAll(/([\w-]+)\s*=\s*"([^"]*)"/g)) attrs[m[1]] = m[2];
  return attrs;
}

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

const stats = { files: 0, images: 0, links: 0 };

for (const file of findMarkdownFiles()) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let inFence = null;
  let touched = false;

  for (let i = 0; i < lines.length; i++) {
    const fence = /^(\s*)(`{3,}|~{3,})(.*)$/.exec(lines[i]);
    if (fence) {
      const marker = fence[2];
      if (inFence) {
        if (marker.startsWith(inFence) && fence[3].trim() === '') inFence = null;
      } else {
        inFence = marker[0].repeat(3);
      }
      continue;
    }
    if (inFence) continue;

    const before = lines[i];

    let next = before.replace(IMAGE_ATTR, (match, alt, src, body) => {
      if (!isAttrList(body)) return match;
      const attrs = parseAttrs(body);
      const rendered = Object.entries(attrs)
        .map(([k, v]) => ` ${k}="${escapeAttr(v)}"`)
        .join('');
      stats.images++;
      return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}"${rendered}>`;
    });

    next = next.replace(LINK_ATTR, (match, link, body) => {
      if (!isAttrList(body)) return match;
      stats.links++;
      return link;
    });

    if (next !== before) {
      lines[i] = next;
      touched = true;
    }
  }

  if (touched) {
    stats.files++;
    if (!DRY) fs.writeFileSync(file, lines.join('\n'));
  }
}

console.log(`
attr_list resolved${DRY ? ' (dry run)' : ''}
  files changed : ${stats.files}
  images -> HTML: ${stats.images}
  link attrs cut: ${stats.links}
`);
