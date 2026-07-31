/**
 * Python-Markdown vs CommonMark: two divergences that silently destroy content.
 *
 * Both are *dialect* differences, not MkDocs extensions, so they show up in
 * ordinary-looking markdown and produce no error — the page just renders wrong.
 * Rule S-1 forbids fixing them in the source, so they are normalised here, on
 * the line array, before anything is parsed.
 *
 * ── 1. Lax ATX headings ─────────────────────────────────────────────────────
 *
 *     ##Clone
 *
 * Python-Markdown's `HashHeaderProcessor` does not require a space after the
 * hashes; CommonMark does. Seven headings in the content are written this way,
 * and under CommonMark they become paragraphs — losing the heading, its anchor
 * and its TOC entry.
 *
 * ── 2. Span-level HTML on its own line ──────────────────────────────────────
 *
 *     <kbd>
 *     ![Streams](../images/streams_list.jpg)
 *     </kbd>
 *
 * Python-Markdown only starts an HTML block for *block-level* tags, so this is
 * one paragraph containing inline HTML and a real image. CommonMark's HTML
 * block type 7 starts at any complete tag alone on a line and runs to the next
 * blank line — swallowing the image, which then renders as the literal text
 * `![Streams](../images/streams_list.jpg)`. 152 places in the content do this.
 *
 * The repair depends on what follows: content that would still parse as part of
 * a paragraph is joined onto the tag's line (so no HTML block starts, matching
 * Python-Markdown's `<p><kbd>…</p>`); content that starts a block of its own —
 * a heading, a list, a blockquote, an admonition — gets a blank line inserted
 * instead, so the tag becomes its own block and the construct survives.
 *
 * ── 3. Indented line straight after a fence ─────────────────────────────────
 *
 *     ```sql
 *     code = 200
 *     ```
 *         ![Exact Numeric Match](../../images/example-queries/code.png)
 *
 * Python-Markdown splits blocks on blank lines, so with none here the image is
 * paragraph content. CommonMark closes the fence and then reads four spaces as
 * an indented code block, turning the image into literal text. Ten images in the
 * content are written this way.
 */

/** Tags Python-Markdown treats as span-level, and so never block-starting. */
const SPAN_ONLY_LINE =
  /^[ \t]*(?:<\/?(?:br|b|i|em|strong|span|small|sup|sub|u|kbd|code|abbr|cite|q|mark|s|del|ins)\s*\/?>[ \t]*)+$/i;

/** Lines that begin a block construct and must not be joined onto a tag line. */
const BLOCK_START =
  /^[ \t]{0,3}(?:#{1,6}[ \t]|>|[-*+][ \t]|\d+[.)][ \t]|`{3,}|~{3,}|\||-{3,}[ \t]*$|={3,}[ \t]*$|!!![ \t]|\?{3}\+?[ \t"]|===[ \t"])/;

const FENCE = /^[ \t]*(`{3,}|~{3,})/;
const LAX_ATX = /^([ \t]{0,3})(#{1,6})([^#\s].*)$/;
/** Lines after which a new block starts, so an HTML block may begin. */
const ENDS_BLOCK = /^[ \t]{0,3}(?:`{3,}|~{3,}|#{1,6}[ \t])/;

export interface NormaliseResult {
  lines: string[];
  /** Whether anything changed — lets the caller skip a redundant re-parse. */
  changed: boolean;
}

export function normaliseMkdocsMarkdown(source: string[]): NormaliseResult {
  // Rules 1 and 3 are line-local; running them as a pre-pass means rule 2 sees
  // already-repaired lines. That matters: `</br>` followed by `##Setup` must
  // recognise the *fixed* `## Setup` as a heading, or it joins the two lines and
  // destroys the heading it was trying to protect.
  const first = repairLines(source);
  const input = first.lines;

  const out: string[] = [];
  let changed = first.changed;
  let fence: { char: string; length: number } | null = null;

  for (let index = 0; index < input.length; index++) {
    const line = input[index]!;

    const fenceMatch = FENCE.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1]!;
      if (fence !== null && marker[0] === fence.char && marker.length >= fence.length) fence = null;
      else if (fence === null) fence = { char: marker[0]!, length: marker.length };
      out.push(line);
      continue;
    }
    if (fence !== null) {
      out.push(line);
      continue;
    }

    // 2. A span-level tag alone on a line, where a new block begins — after a
    //    blank line, but also straight after a fence or a heading, which is
    //    where the `</br>` before a `## Heading` in the tracing guides sits.
    const previous = out[out.length - 1];
    const startsBlock =
      previous === undefined || previous.trim() === '' || ENDS_BLOCK.test(previous);
    if (!startsBlock || !SPAN_ONLY_LINE.test(line)) {
      out.push(line);
      continue;
    }

    // Collect the whole run of such lines.
    const run: string[] = [line];
    let cursor = index + 1;
    while (cursor < input.length && SPAN_ONLY_LINE.test(input[cursor]!)) {
      run.push(input[cursor]!);
      cursor++;
    }

    const next = input[cursor];
    if (next === undefined || next.trim() === '') {
      // Nothing to swallow; CommonMark's HTML block ends here anyway.
      out.push(...run);
      index = cursor - 1;
      continue;
    }

    changed = true;
    if (BLOCK_START.test(next)) {
      // Keep the construct intact by ending the HTML block explicitly.
      out.push(...run, '');
      index = cursor - 1;
    } else {
      // One paragraph, inline HTML — what Python-Markdown produces.
      out.push(`${run.join(' ')} ${next.trim()}`);
      index = cursor;
    }
  }

  return { lines: out, changed };
}

/**
 * Rules 1 and 3: the two line-local repairs, applied in one fence-aware pass.
 */
function repairLines(input: string[]): NormaliseResult {
  const out: string[] = [];
  let changed = false;
  let fence: { char: string; length: number; indent: number } | null = null;
  /** Indent of the fence that just closed, or `null` if the previous line was not one. */
  let closedFenceIndent: number | null = null;

  for (const original of input) {
    let line = original;

    const fenceMatch = FENCE.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1]!;
      const indent = /^[ \t]*/.exec(line)![0].length;
      if (fence !== null && marker[0] === fence.char && marker.length >= fence.length) {
        closedFenceIndent = fence.indent;
        fence = null;
      } else {
        if (fence === null) fence = { char: marker[0]!, length: marker.length, indent };
        closedFenceIndent = null;
      }
      out.push(line);
      continue;
    }
    if (fence !== null) {
      out.push(line);
      continue;
    }

    // 3. An indented line straight after a fence close is paragraph content in
    //    Python-Markdown, not an indented code block.
    //
    //    Only when the fence itself sat at the block level. A fence indented
    //    inside a list item owns that indentation, and dedenting what follows
    //    would pull the continuation out of the item.
    if (
      closedFenceIndent !== null &&
      closedFenceIndent <= 3 &&
      line.trim() !== '' &&
      /^(?: {4,}|\t)/.test(line)
    ) {
      line = line.replace(/^(?: {4}|\t)/, '');
      changed = true;
    }
    closedFenceIndent = null;

    // 1. `##Clone` → `## Clone`
    const lax = LAX_ATX.exec(line);
    if (lax) {
      line = `${lax[1]}${lax[2]} ${lax[3]}`;
      changed = true;
    }

    out.push(line);
  }

  return { lines: out, changed };
}
