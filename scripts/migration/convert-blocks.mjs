/**
 * One-time migration: rewrite MkDocs block syntax as remark directives.
 *
 *   !!! note "Title"          ->  :::note[Title]
 *       body                        body
 *                                 :::
 *
 *   ??? "Step 1: Install"     ->  :::accordion[Step 1: Install]
 *   ???+ tip "Open by default"->  :::accordion{defaultOpen}[Open by default]
 *
 *   === "npm"                 ->  ::::tabs
 *       npm i                     :::tab[npm]
 *   === "pnpm"                    npm i
 *       pnpm i                    :::
 *                                 :::tab[pnpm]
 *                                 pnpm i
 *                                 :::
 *                                 ::::
 *
 * MkDocs indents block content by four spaces, which plain Markdown would parse
 * as an indented code block, so the body is dedented as part of the conversion.
 * Nested blocks get progressively longer `:` fences, as remark-directive
 * requires the outer fence to be longer than any fence it contains.
 *
 * Fenced code blocks are tracked so that MkDocs syntax quoted inside a code
 * sample is left alone.
 *
 * Run: node scripts/migration/convert-blocks.mjs [--dry] [path...]
 */
import fs from 'node:fs';
import path from 'node:path';
import { findMarkdownFiles } from './lib-pages.mjs';

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const targets = args.filter((a) => !a.startsWith('--'));

/** MkDocs admonition type -> Fumadocs Callout type. */
const CALLOUT_TYPES = {
  note: 'note',
  info: 'info',
  todo: 'info',
  abstract: 'info',
  summary: 'info',
  tldr: 'info',
  tip: 'tip',
  hint: 'tip',
  important: 'tip',
  success: 'success',
  check: 'success',
  done: 'success',
  question: 'question',
  help: 'question',
  faq: 'question',
  warning: 'warning',
  caution: 'warning',
  attention: 'warning',
  failure: 'danger',
  fail: 'danger',
  missing: 'danger',
  danger: 'danger',
  error: 'danger',
  bug: 'danger',
  example: 'info',
  quote: 'info',
  cite: 'info',
};

const ADMONITION_RE = /^(!!!|\?\?\?\+?)([^\n]*)$/;
const TAB_RE = /^===\s+(?:"([^"]*)"|'([^']*)')\s*$/;
const FENCE_RE = /^(\s*)(```+|~~~+)/;

/** Escape a directive label so `[` / `]` don't terminate it early. */
function escapeLabel(text) {
  return text.replace(/([[\]])/g, '\\$1');
}

/**
 * Split `note "Some title"` into its type and title.
 * Returns `{ type, title }` where either may be null.
 */
function parseAdmonitionHead(rest) {
  const trimmed = rest.trim();
  if (!trimmed) return { type: null, title: null };

  // A quoted title with no preceding type, e.g. `??? "Prerequisites"`.
  const quotedOnly = /^(?:"([^"]*)"|'([^']*)')$/.exec(trimmed);
  if (quotedOnly) return { type: null, title: quotedOnly[1] ?? quotedOnly[2] };

  // `type [more classes] ["Title"]`
  const m = /^([A-Za-z][\w-]*)((?:\s+[\w-]+)*)\s*(?:"([\s\S]*)"|'([\s\S]*)')?\s*$/.exec(trimmed);
  if (m) {
    const title = m[3] ?? m[4] ?? null;
    return { type: m[1].toLowerCase(), title };
  }
  return { type: null, title: trimmed.replace(/^["']|["']$/g, '') };
}

/** Remove up to `n` leading spaces from a line. */
function dedent(line, n) {
  let i = 0;
  while (i < n && i < line.length && line[i] === ' ') i++;
  return line.slice(i);
}

/**
 * Collect the indented body that follows a MkDocs block opener.
 * Returns `{ body, next }` where `next` is the index of the first line after it.
 */
function collectBody(lines, start, indent) {
  const body = [];
  let i = start;
  let lastContent = start;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      body.push('');
      i++;
      continue;
    }
    const leading = line.length - line.trimStart().length;
    if (leading < indent) break;
    body.push(dedent(line, indent));
    i++;
    lastContent = i;
  }
  // Drop trailing blank lines that belong to the surrounding document.
  while (body.length && body[body.length - 1] === '') body.pop();
  return { body, next: lastContent };
}

/**
 * Convert a block of lines, returning the converted lines plus the longest
 * directive fence used, so a caller can pick a longer one for itself.
 */
function convert(lines, stats) {
  const out = [];
  let maxFence = 0;
  let i = 0;
  let inFence = null; // the opening fence marker while inside a code block

  while (i < lines.length) {
    const line = lines[i];

    // Track fenced code blocks; never rewrite anything inside one.
    const fence = FENCE_RE.exec(line);
    if (fence) {
      const marker = fence[2];
      if (inFence === null) inFence = marker[0].repeat(3);
      else if (marker.startsWith(inFence)) inFence = null;
      out.push(line);
      i++;
      continue;
    }
    if (inFence !== null) {
      out.push(line);
      i++;
      continue;
    }

    // --- tabbed blocks: gather every consecutive `=== "..."` sibling ---------
    const tab = TAB_RE.exec(line);
    if (tab) {
      const tabs = [];
      let j = i;
      while (j < lines.length) {
        const t = TAB_RE.exec(lines[j]);
        if (!t) break;
        const title = t[1] ?? t[2] ?? '';
        const { body, next } = collectBody(lines, j + 1, 4);
        tabs.push({ title, body });
        j = next;
        // Skip blank lines between sibling tabs.
        while (j < lines.length && lines[j].trim() === '' && TAB_RE.test(lines[j + 1] ?? '')) j++;
      }

      const inner = [];
      let innerMax = 0;
      for (const t of tabs) {
        const converted = convert(t.body, stats);
        innerMax = Math.max(innerMax, converted.maxFence);
        inner.push({ title: t.title, lines: converted.lines });
      }

      const tabFence = ':'.repeat(Math.max(3, innerMax + 1));
      const groupFence = ':'.repeat(Math.max(4, innerMax + 2));

      out.push(groupFence + 'tabs');
      for (const t of inner) {
        out.push(`${tabFence}tab[${escapeLabel(t.title)}]`);
        out.push(...t.lines);
        out.push(tabFence);
      }
      out.push(groupFence);
      maxFence = Math.max(maxFence, groupFence.length);
      stats.tabs++;
      i = j;
      continue;
    }

    // --- admonitions --------------------------------------------------------
    const adm = ADMONITION_RE.exec(line);
    if (adm) {
      const marker = adm[1];
      const { type, title } = parseAdmonitionHead(adm[2]);
      const { body, next } = collectBody(lines, i + 1, 4);
      const converted = convert(body, stats);
      const fenceStr = ':'.repeat(Math.max(3, converted.maxFence + 1));

      const collapsible = marker.startsWith('???');
      let open;
      if (collapsible) {
        // MkDocs renders `???` collapsed and `???+` expanded.
        const attrs = marker === '???+' ? '{defaultOpen}' : '';
        // MkDocs falls back to the type name when a collapsible has no title.
        const label = title || (type ? capitalize(type) : 'Details');
        open = `${fenceStr}accordion${attrs}[${escapeLabel(label)}]`;
        stats.accordions++;
      } else {
        const calloutType = CALLOUT_TYPES[type ?? ''] ?? 'note';
        // An explicit empty title (`!!! note ""`) means "no heading" in MkDocs.
        const label = title === '' ? null : (title ?? (type ? capitalize(type) : null));
        open = `${fenceStr}${calloutType}${label ? `[${escapeLabel(label)}]` : ''}`;
        stats.callouts++;
        if (type && !(type in CALLOUT_TYPES)) stats.unknownTypes.add(type);
      }

      out.push(open);
      out.push(...converted.lines);
      out.push(fenceStr);
      maxFence = Math.max(maxFence, fenceStr.length, converted.maxFence);
      i = next;
      continue;
    }

    out.push(line);
    i++;
  }

  return { lines: out, maxFence };
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

const files = targets.length ? targets : findMarkdownFiles();
const stats = { callouts: 0, accordions: 0, tabs: 0, changed: 0, unknownTypes: new Set() };

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const fm = FRONTMATTER_RE.exec(raw);
  const head = fm ? fm[0] : '';
  const body = raw.slice(head.length);

  const { lines } = convert(body.split('\n'), stats);
  const next = head + lines.join('\n');

  if (next !== raw) {
    stats.changed++;
    if (!DRY) fs.writeFileSync(file, next);
  }
}

console.log(`
MkDocs blocks converted${DRY ? ' (dry run)' : ''}
  files changed : ${stats.changed}
  callouts      : ${stats.callouts}
  accordions    : ${stats.accordions}
  tab groups    : ${stats.tabs}
  unmapped types: ${[...stats.unknownTypes].join(', ') || '(none)'}
`);
