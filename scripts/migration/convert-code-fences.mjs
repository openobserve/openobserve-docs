/**
 * One-time migration: translate `pymdownx.highlight` fence attributes into the
 * meta syntax Fumadocs/Shiki understands.
 *
 *   ```sql linenums="1"          ->  ```sql lineNumbers
 *   ```linenums="15"             ->  ```text lineNumbers=15
 *   ```yaml linenums="1" hl_lines="4 9"
 *                                ->  ```yaml lineNumbers {4,9}
 *
 * `title="..."` is already supported and is left alone. A fence carrying
 * attributes but no language gets `text`, because Shiki would otherwise read the
 * first attribute as the language name and fail the build.
 *
 * Run: node scripts/migration/convert-code-fences.mjs [--dry]
 */
import fs from 'node:fs';
import { findMarkdownFiles } from './lib-pages.mjs';

const DRY = process.argv.includes('--dry');

const FENCE_OPEN = /^(\s*)(`{3,}|~{3,})(.*)$/;

const stats = { files: 0, fences: 0, hlLines: 0 };

/** Convert `4 9 44-54` into Shiki's `{4,9,44-54}` range syntax. */
function toShikiRanges(value) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return parts.length ? `{${parts.join(',')}}` : '';
}

function convertInfo(info) {
  let rest = info;
  let changed = false;

  // Line numbers.
  rest = rest.replace(/\blinenums=(?:"(\d+)"|'(\d+)'|(\d+))/g, (_m, a, b, c) => {
    changed = true;
    const start = Number(a ?? b ?? c);
    return start === 1 ? 'lineNumbers' : `lineNumbers=${start}`;
  });

  // Highlighted lines.
  rest = rest.replace(/\bhl_lines=(?:"([^"]*)"|'([^']*)')/g, (_m, a, b) => {
    changed = true;
    stats.hlLines++;
    return toShikiRanges(a ?? b ?? '');
  });

  if (!changed) return null;

  rest = rest.replace(/\s+/g, ' ').trim();

  // Shiki reads the first token as the language; give it a real one.
  if (!/^[A-Za-z0-9_+#-]+(\s|$)/.test(rest) || /^(lineNumbers|\{)/.test(rest)) {
    rest = `text ${rest}`.trim();
  }
  return rest;
}

for (const file of findMarkdownFiles()) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let inFence = null;
  let touched = false;

  for (let i = 0; i < lines.length; i++) {
    const m = FENCE_OPEN.exec(lines[i]);
    if (!m) continue;
    const [, indent, marker, info] = m;

    if (inFence) {
      // A closing fence carries no info string.
      if (marker.startsWith(inFence) && info.trim() === '') inFence = null;
      continue;
    }
    inFence = marker[0].repeat(3);

    const next = convertInfo(info);
    if (next !== null) {
      lines[i] = `${indent}${marker}${next}`;
      touched = true;
      stats.fences++;
    }
  }

  if (touched) {
    stats.files++;
    if (!DRY) fs.writeFileSync(file, lines.join('\n'));
  }
}

console.log(`
code fences converted${DRY ? ' (dry run)' : ''}
  files changed        : ${stats.files}
  fences rewritten     : ${stats.fences}
  hl_lines -> {ranges} : ${stats.hlLines}
`);
