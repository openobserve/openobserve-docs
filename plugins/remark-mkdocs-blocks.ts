/**
 * The single remark pass for MkDocs' indentation-delimited blocks (§7.2, §7.3).
 *
 * ── Why one pass, and why it re-parses ──────────────────────────────────────
 *
 * The plan lists `remark-mkdocs-admonition` and `remark-mkdocs-tabs` as two
 * plugins. They cannot be: `!!!`, `???` and `===` nest inside one another (20
 * files nest three deep), so whichever ran first would consume the indentation
 * the other needs. This pass scans all three together; the grammar and the
 * component mapping for each still live in their own module.
 *
 * It also has to work from the *source text*, not the parsed tree. By the time a
 * remark transformer runs, a four-space-indented admonition body has already
 * become an indented code block and the structure is gone. So the pass reparses:
 * it splits the source into a block tree, then parses each literal run and each
 * container body with the pipeline's own parser, and replaces the root's
 * children with the result. That parser is reached through `file.data._getProcessor`
 * — the hook `fumadocs-mdx` puts on every vfile — so the sub-parses see exactly
 * the same micromark extensions (GFM and friends) as the top-level parse.
 *
 * Ordering: this must be the FIRST remark plugin. See §7.11.
 */
import type { Root, RootContent } from 'mdast';
import type { Processor, Transformer } from 'unified';
import type { VFile } from 'vfile';

import { hasMkdocsBlocks, parseMkdocsBlocks, type Block, type ContainerBlock } from './mkdocs-blocks';
import {
  isAdmonition,
  isCollapsible,
  renderAdmonition,
  renderCollapsible,
} from './remark-mkdocs-admonition';
import { isTab, renderTabGroup, type TabEntry } from './remark-mkdocs-tabs';

type Parse = (source: string) => Root;

function getParse(self: Processor | undefined, file: VFile): Parse {
  const getProcessor = (file.data as { _getProcessor?: (format: string) => Processor })
    ._getProcessor;
  const processor = getProcessor?.('md') ?? self;
  if (!processor) {
    throw new Error(
      '[remark-mkdocs-blocks] no markdown parser available; MkDocs blocks cannot be rewritten',
    );
  }
  return (source: string) => processor.parse(source) as Root;
}

function renderBlocks(blocks: Block[], parse: Parse): RootContent[] {
  const out: RootContent[] = [];

  // Adjacent `===` blocks form one <Tabs>; a block of any other kind ends the
  // run. Collapsibles need no grouping — each `???` is its own <details>, just
  // as pymdownx.details emits them.
  let tabs: TabEntry[] = [];
  let collapsibleIndex = 0;

  const flushTabs = () => {
    if (!tabs.length) return;
    out.push(renderTabGroup(tabs) as unknown as RootContent);
    tabs = [];
  };
  const flushAll = () => flushTabs();

  for (const block of blocks) {
    if (block.kind === 'text') {
      // A run of blank lines between two containers is not a separator: it is
      // how MkDocs writes them, and treating it as one would split every group.
      if (block.lines.every((line) => line.trim() === '')) continue;
      flushAll();
      out.push(...parse(block.lines.join('\n')).children);
      continue;
    }

    const children = renderBlocks(block.children, parse);

    if (isTab(block)) {
      tabs.push({ block, children });
      continue;
    }
    if (isCollapsible(block)) {
      flushTabs();
      out.push(renderCollapsible(block, children, collapsibleIndex++) as unknown as RootContent);
      continue;
    }
    if (isAdmonition(block)) {
      flushAll();
      out.push(renderAdmonition(block, children) as unknown as RootContent);
      continue;
    }
  }

  flushAll();
  return out;
}

export function remarkMkdocsBlocks(this: Processor | void): Transformer<Root, Root> {
  const self = (this ?? undefined) as Processor | undefined;

  return (tree, file) => {
    const source = String(file.value);
    const { blocks, skippedOpeners, normalised } = parseMkdocsBlocks(source.split(/\r?\n/));

    // Re-parse when there is a block to rewrite *or* the dialect normaliser
    // changed a line — a `<kbd>` swallowing an image needs the same repair as an
    // admonition, and that file may contain no admonition at all.
    if (!hasMkdocsBlocks(blocks) && !normalised) return;

    tree.children = renderBlocks(blocks, getParse(self, file));

    // A skipped opener means a construct rendered as something other than a
    // block — never let that pass unnoticed.
    for (const opener of skippedOpeners) {
      file.message(
        `MkDocs block opener at an indent CommonMark reads as code or list ` +
          `continuation, left as-is: ${opener.trim()}`,
        undefined,
        'remark-mkdocs-blocks:skipped-opener',
      );
    }
  };
}
