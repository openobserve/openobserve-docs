/**
 * Path resolution shared by §7.5 (links) and §7.6 (images).
 *
 * Both must reproduce MkDocs' `use_directory_urls: true` behaviour exactly, and
 * both must also reach inside raw HTML: 81 files contain `<a href>` and
 * `<img src>` written as HTML rather than markdown, and those are opaque `html`
 * nodes to remark.
 */
import fs from 'node:fs';
import path from 'node:path';

/** A URL remark must not touch: external, protocol-relative, or a bare anchor. */
export function isExternal(url: string): boolean {
  return (
    url === '' ||
    url.startsWith('#') ||
    url.startsWith('//') ||
    /^[a-z][a-z0-9+.-]*:/i.test(url)
  );
}

export function splitHash(url: string): [string, string] {
  const index = url.indexOf('#');
  return index === -1 ? [url, ''] : [url.slice(0, index), url.slice(index)];
}

/** Resolve `href` relative to the docs-relative file it appears in. */
export function resolveDocsRelative(fromDocsRelPath: string, href: string): string {
  const base = path.posix.dirname(fromDocsRelPath);
  return clampToRoot(path.posix.normalize(path.posix.join(base === '.' ? '' : base, href)));
}

/**
 * Resolve `href` the way a *browser* would on the built page.
 *
 * MkDocs rewrites relative paths in markdown links and images, but leaves raw
 * HTML completely untouched — so an `<img src="../../x.png">` inside a `<div>`
 * is resolved by the browser against the page's directory URL, which under
 * `use_directory_urls: true` is one level deeper than the source file's
 * directory (`docs/a/b/page.md` serves at `/a/b/page/`). Resolving those against
 * the file path instead loses a `..` and lands one directory too high.
 */
export function resolveUrlRelative(fromDocsRelPath: string, href: string): string {
  const base = fromDocsRelPath.replace(/\.md$/i, '').replace(/(^|\/)index$/, '');
  return clampToRoot(path.posix.normalize(path.posix.join(base, href)));
}

/**
 * Drop `..` segments that escape the content root. Browsers clamp at the origin
 * root, and several raw-HTML srcs in the content rely on that.
 */
function clampToRoot(resolved: string): string {
  return resolved.replace(/^(?:\.\.\/)+/, '').replace(/^\.\//, '');
}

/**
 * MkDocs `use_directory_urls: true` mapping, without the `/docs` prefix (§6.2).
 *
 *   `c.md`         → `/c/`
 *   `a/b/index.md` → `/a/b/`
 *   `index.md`     → `/`
 */
export function docPathToUrl(docsRelPath: string): string {
  const slug = docsRelPath.replace(/\.md$/i, '').replace(/(^|\/)index$/, '');
  return slug === '' ? '/' : `/${slug}/`;
}

/** Absolute, docs-rooted URL for an asset, without the `/docs` prefix (§6.2). */
export function assetPathToUrl(docsRelPath: string): string {
  return `/${docsRelPath}`;
}

/**
 * The set of markdown files under `docs/`, used to warn about links that point
 * at nothing. Read once per process — the content is a read-only build input.
 */
let markdownFiles: Set<string> | undefined;

export function docsMarkdownFiles(docsDir: string): Set<string> {
  if (markdownFiles) return markdownFiles;
  markdownFiles = new Set(
    fs
      .readdirSync(docsDir, { recursive: true, encoding: 'utf8' })
      .filter((entry) => entry.endsWith('.md'))
      .map((entry) => entry.split(path.sep).join('/')),
  );
  return markdownFiles;
}

let assetFiles: Set<string> | undefined;

export function docsAssetFiles(docsDir: string): Set<string> {
  if (assetFiles) return assetFiles;
  assetFiles = new Set(
    fs
      .readdirSync(docsDir, { recursive: true, encoding: 'utf8' })
      .filter((entry) => !entry.endsWith('.md') && !entry.endsWith('.pages'))
      .map((entry) => entry.split(path.sep).join('/')),
  );
  return assetFiles;
}

/** The docs-relative path of the file a vfile represents. */
export function docsRelativePath(docsDir: string, filePath: string): string {
  return path.relative(docsDir, filePath).split(path.sep).join('/');
}

/**
 * Rewrite one attribute across every tag in a raw HTML string.
 *
 * A regex rather than a parse: these `html` mdast nodes are frequently *partial*
 * markup (an opening `<div>` on its own, closed several markdown blocks later),
 * so a real parser would either reject them or silently balance them. Only the
 * attribute value is touched, so partial markup passes through untouched.
 */
export function rewriteHtmlAttribute(
  html: string,
  attribute: 'href' | 'src',
  rewrite: (value: string) => string | undefined,
): string {
  const pattern = new RegExp(`(\\s${attribute}\\s*=\\s*)("([^"]*)"|'([^']*)')`, 'gi');
  return html.replace(pattern, (match, prefix: string, _quoted: string, dq?: string, sq?: string) => {
    const value = dq ?? sq ?? '';
    const next = rewrite(value);
    if (next === undefined) return match;
    const quote = dq !== undefined ? '"' : "'";
    return `${prefix}${quote}${next}${quote}`;
  });
}
