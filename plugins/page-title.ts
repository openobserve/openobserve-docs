/**
 * Title resolution for a docs page — shared by the content pipeline and the
 * navigation generator so both agree on every label.
 *
 * 265 of the 456 files carry `title:` in frontmatter; the other 191 do not, and
 * Rule S-1 forbids adding it. MkDocs/Material derives the page title from the
 * first H1 in that case, so we do the same, at build time.
 */

const FRONTMATTER = /^﻿?---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/;

/** Strip a leading YAML frontmatter block, if any. */
export function stripFrontmatter(source: string): string {
  return source.replace(FRONTMATTER, '');
}

/**
 * The first ATX H1 (`# Title`) in the body, unwrapped from inline markdown.
 * Fenced code blocks are skipped so a `# comment` line inside a shell sample is
 * never mistaken for a heading.
 */
export function firstH1(source: string): string | undefined {
  const body = stripFrontmatter(source);
  let fence: string | null = null;

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const fenceMatch = /^\s{0,3}(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1]!;
      if (fence === null) fence = marker[0]!;
      else if (marker[0] === fence) fence = null;
      continue;
    }
    if (fence !== null) continue;

    const heading = /^\s{0,3}#\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) return cleanInline(heading[1]!);
  }
  return undefined;
}

/** Remove the inline markdown a heading may carry, leaving display text. */
function cleanInline(text: string): string {
  return text
    .replace(/!?\[([^\]]*)]\([^)]*\)/g, '$1') // links / images
    .replace(/`([^`]*)`/g, '$1') // code spans
    .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, '$1$2') // bold
    .replace(/\*([^*]+)\*|_([^_]+)_/g, '$1$2') // italics
    .replace(/\{[:#][^}]*\}\s*$/, '') // trailing attr_list
    .trim();
}

/**
 * Last-resort title, reproducing MkDocs' `Page._set_title` fallback exactly
 * (`mkdocs/structure/pages.py`):
 *
 *     title = file.name.replace('-', ' ').replace('_', ' ')
 *     if title.lower() == title:
 *         title = title.capitalize()
 *
 * Note that this is Python's `capitalize()` — first character upper, *rest
 * lower* — not title case. `work-group-v2` becomes `Work group v2`, not
 * `Work Group V2`. A mixed-case stem is left alone.
 */
export function titleFromPath(filePath: string): string {
  const base = filePath.split(/[\\/]/).pop() ?? filePath;
  const name = base.replace(/\.md$/i, '').replace(/[-_]/g, ' ');
  if (name.toLowerCase() !== name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/** Read `title:` out of a frontmatter block without a full YAML parse. */
export function frontmatterTitle(source: string): string | undefined {
  const match = FRONTMATTER.exec(source);
  if (!match) return undefined;
  for (const line of match[1]!.split(/\r?\n/)) {
    const kv = /^title:\s*(.*)$/.exec(line);
    if (!kv) continue;
    let value = kv[1]!.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    return value.length ? value : undefined;
  }
  return undefined;
}

/**
 * The effective page title: frontmatter `title`, else the first H1, else a
 * humanised file name. This is exactly what Material renders in the sidebar.
 */
export function resolveTitle(filePath: string, source: string): string {
  return frontmatterTitle(source) ?? firstH1(source) ?? titleFromPath(filePath);
}
