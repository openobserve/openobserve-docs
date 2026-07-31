/**
 * The scanner behind §7.2 and §7.3.
 *
 * MkDocs' three block constructs — `!!!` admonitions, `???` collapsibles and
 * `===` content tabs — are all *indentation-delimited with no closing marker*:
 *
 *     === "Self-Hosted Installation"
 *
 *         === "Windows"
 *
 *             !!! note
 *                 You can set email and password based on your preference
 *
 * They nest in each other freely (20 files nest three deep), so they cannot be
 * three independent remark passes: by the time one has rewritten the tree the
 * others can no longer see the indentation. This module parses all three in one
 * pass, over raw source lines, before any markdown parsing happens.
 *
 * Bodies are dedented by their own measured indent rather than a fixed 4/8/12
 * ladder, so unusual indentation still nests correctly (risk R-4).
 */

import { normaliseMkdocsMarkdown } from './mkdocs-markdown';

export type Marker = '!!!' | '???' | '???+' | '===';

export interface TextBlock {
  kind: 'text';
  lines: string[];
}

export interface ContainerBlock {
  kind: 'container';
  marker: Marker;
  /** lower-cased class list from the opener; `[]` when none was given */
  classes: string[];
  /**
   * `undefined` — no title given, so the renderer derives one.
   * `''`        — an explicit `""`, which Python-Markdown treats as "no title".
   */
  title: string | undefined;
  children: Block[];
}

export type Block = TextBlock | ContainerBlock;

/**
 * Python-Markdown's admonition opener: a required-ish class list, then an
 * optional quoted title. `pymdownx.details` relaxes the class list to optional,
 * which is how 577 of this repo's collapsibles are written (`??? "Title"`).
 */
const OPENER = /^([ \t]*)(!!!|\?\?\?\+|\?\?\?|===)(?:[ \t]+(.*?))?[ \t]*$/;
const OPENER_ARGS = /^([\w-]+(?:[ \t]+[\w-]+)*)?[ \t]*(?:"(.*)")?[ \t]*$/;
const FENCE = /^([ \t]*)(`{3,}|~{3,})(.*)$/;

/** Openers indented four or more spaces are code/list continuation, not blocks. */
const MAX_OPENER_INDENT = 3;

export interface ParseResult {
  blocks: Block[];
  /**
   * Openers that were skipped because they sit at an indent CommonMark reads as
   * code or list continuation. Surfaced so a silent drop can never happen.
   */
  skippedOpeners: string[];
  /**
   * Whether the Python-Markdown dialect normaliser changed anything. A document
   * with no MkDocs blocks but a normalisation still has to be re-parsed.
   */
  normalised: boolean;
}

function indentWidth(line: string): number {
  let width = 0;
  for (const char of line) {
    if (char === ' ') width += 1;
    else if (char === '\t') width += 4 - (width % 4);
    else break;
  }
  return width;
}

function parseOpener(line: string): { indent: number; block: ContainerBlock } | null {
  const match = OPENER.exec(line);
  if (!match) return null;

  const indent = indentWidth(match[1]!);
  const marker = match[2]! as Marker;
  const rest = (match[3] ?? '').trim();

  if (marker === '===') {
    // pymdownx.tabbed labels are always quoted in this repo, but tolerate bare.
    const quoted = /^"(.*)"$/.exec(rest);
    return {
      indent,
      block: {
        kind: 'container',
        marker,
        classes: [],
        title: quoted ? quoted[1]! : rest,
        children: [],
      },
    };
  }

  const args = OPENER_ARGS.exec(rest);
  if (!args) return null;

  return {
    indent,
    block: {
      kind: 'container',
      marker,
      classes: (args[1] ?? '').toLowerCase().split(/[ \t]+/).filter(Boolean),
      title: args[2],
      children: [],
    },
  };
}

/** Remove the common indent of every non-blank line. */
function dedent(lines: string[]): string[] {
  let min = Infinity;
  for (const line of lines) {
    if (line.trim() === '') continue;
    min = Math.min(min, indentWidth(line));
  }
  if (min === Infinity || min === 0) return lines;
  return lines.map((line) => {
    if (line.trim() === '') return '';
    let removed = 0;
    let index = 0;
    while (index < line.length && removed < min) {
      if (line[index] === ' ') removed += 1;
      else if (line[index] === '\t') removed += 4 - (removed % 4);
      else break;
      index++;
    }
    return line.slice(index);
  });
}

export function parseMkdocsBlocks(lines: string[]): ParseResult {
  const blocks: Block[] = [];
  const skippedOpeners: string[] = [];
  let normalised = false;
  let text: string[] = [];

  /**
   * Dialect normalisation is applied per *text run*, never to a whole level.
   * A container body is still indented at this point, and that indentation is
   * structural — normalising across it would dedent body lines and cut the
   * container short. Bodies get their own pass after `dedent()`, via the
   * recursive call below.
   */
  const flush = () => {
    if (!text.length) return;
    const result = normaliseMkdocsMarkdown(text);
    normalised ||= result.changed;
    blocks.push({ kind: 'text', lines: result.lines });
    text = [];
  };

  let fence: { char: string; length: number; indent: number } | null = null;
  let index = 0;

  while (index < lines.length) {
    const line = lines[index]!;

    // Inside a fence everything is literal — a `!!!` in a shell sample is not an
    // admonition, and misreading one would silently eat the rest of the block.
    if (fence) {
      text.push(line);
      const close = FENCE.exec(line);
      if (
        close &&
        close[2]![0] === fence.char &&
        close[2]!.length >= fence.length &&
        close[3]!.trim() === '' &&
        indentWidth(close[1]!) <= fence.indent + 3
      ) {
        fence = null;
      }
      index++;
      continue;
    }

    const open = FENCE.exec(line);
    if (open && indentWidth(open[1]!) <= MAX_OPENER_INDENT) {
      fence = { char: open[2]![0]!, length: open[2]!.length, indent: indentWidth(open[1]!) };
      text.push(line);
      index++;
      continue;
    }

    const opener = parseOpener(line);
    if (opener) {
      if (opener.indent > MAX_OPENER_INDENT) {
        skippedOpeners.push(line);
        text.push(line);
        index++;
        continue;
      }

      // The body runs to the first non-blank line that is not indented past the
      // opener. Trailing blank lines belong to the document, not the container.
      const body: string[] = [];
      let cursor = index + 1;
      while (cursor < lines.length) {
        const candidate = lines[cursor]!;
        if (candidate.trim() === '') {
          body.push('');
          cursor++;
          continue;
        }
        if (indentWidth(candidate) > opener.indent) {
          body.push(candidate);
          cursor++;
          continue;
        }
        break;
      }
      while (body.length && body[body.length - 1]!.trim() === '') body.pop();

      flush();
      const inner = parseMkdocsBlocks(dedent(body));
      skippedOpeners.push(...inner.skippedOpeners);
      normalised ||= inner.normalised;
      blocks.push({ ...opener.block, children: inner.blocks });
      index = cursor;
      continue;
    }

    text.push(line);
    index++;
  }

  flush();
  return { blocks, skippedOpeners, normalised };
}

/** Whether a document contains anything this layer needs to rewrite. */
export function hasMkdocsBlocks(blocks: Block[]): boolean {
  return blocks.some((block) => block.kind === 'container');
}
