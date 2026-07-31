import path from 'node:path';
import { defineCollections, defineConfig } from 'fumadocs-mdx/config';
import { metaSchema } from 'fumadocs-core/source/schema';
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import { transformerMetaHighlight } from '@shikijs/transformers';
import { z } from 'zod';
import rehypeRaw from 'rehype-raw';

import { firstH1, titleFromPath } from './plugins/page-title';
import { mkdocsSlug } from './plugins/mkdocs-slug';
import { remarkMkdocsBlocks } from './plugins/remark-mkdocs-blocks';
import { remarkMkdocsCodefence } from './plugins/remark-mkdocs-codefence';
import { remarkMkdocsAttrList } from './plugins/remark-mkdocs-attr-list';
import { remarkMkdocsLinks } from './plugins/remark-mkdocs-links';
import { remarkMkdocsImages } from './plugins/remark-mkdocs-images';

const DOCS_DIR = path.resolve(process.cwd(), 'docs');

// NOTE: `defineDocs()` is deliberately NOT used. It shares a single `dir` between
// its docs and meta collections, so its meta collection would have to read
// meta.json from inside `docs/` — which Rule S-1 forbids. Two independent
// collections are declared instead and combined in lib/source.ts.

export const docs = defineCollections({
  type: 'doc',
  dir: 'docs',

  // S-2: .md only, never .mdx. `fumadocs-mdx` picks the compiler mode from the
  // file extension (`build-default.js`: `filePath.endsWith('.mdx') ? 'mdx' : 'md'`),
  // and `format: 'md'` is what keeps the 218 brace-containing files compiling.
  // Widening this glob to .mdx breaks them.
  files: ['**/*.md'],

  // Replaces the git-revision-date-localized plugin.
  lastModified: true,

  // 191 files have no `title:` in frontmatter, but fumadocs' default page schema
  // requires one. Rather than edit content (S-1), derive it from the file's first
  // H1 — the schema callback receives the raw source, so this is a pure
  // build-time default.
  schema: ({ path: filePath, source }: { path: string; source: string }) =>
    z.object({
      title: z.string().default(() => firstH1(source) ?? titleFromPath(filePath)),
      description: z.string().optional(),
      keywords: z.union([z.string(), z.array(z.string())]).optional(),
      weight: z.number().optional(), // 2 files, legacy, no effect — tolerated
      template: z.string().optional(), // 1 file (index.md) — tolerated, ignored
      // `hide: [navigation, toc]` — 1 file. NOT ignored: consumed by the page
      // component to drop the sidebar/TOC.
      hide: z.array(z.string()).optional(),
    }),

  // Emit the processed markdown so llms.txt and the `<slug>/index.md` endpoints
  // can be produced without re-reading and re-parsing the source files.
  postprocess: { includeProcessedMarkdown: true },
});

// The generated navigation tree (scripts/gen-nav.mts). Lives OUTSIDE docs/ — S-1.
export const meta = defineCollections({
  type: 'meta',
  dir: '.fumadocs-gen/meta',
  files: ['**/*.json'],
  schema: metaSchema,
});

export default defineConfig({
  mdxOptions: {
    preset: 'fumadocs', // keeps remark-gfm, remark-heading, remark-structure, rehype-code…

    // §7.7 — anchor parity. Fumadocs' remark-heading defaults to github-slugger;
    // MkDocs uses Python-Markdown's `toc` slugify. They disagree on punctuation
    // runs and on duplicate-heading suffixes (`_1` vs `-1`), which silently
    // breaks deep links (risk R-3).
    remarkHeadingOptions: {
      slug: mkdocsSlug(),
      // MkDocs has no `## Heading [#custom-id]` syntax; leaving this on would
      // eat a literal `[#…]` at the end of a heading.
      customId: false,
    },

    // Next/Image is a poor fit here: 913 local images, 267 MB, static export.
    // remark-mkdocs-images emits a plain <img> with a rewritten absolute src.
    remarkImageOptions: false,

    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      // `hl_lines="3 5"` is converted to `{3,5}` by remark-mkdocs-codefence;
      // this is the transformer that reads it. Not in fumadocs' defaults, which
      // only ship the comment-notation transformers.
      transformers: [...(rehypeCodeDefaultOptions.transformers ?? []), transformerMetaHighlight()],

      // Pygments (MkDocs) accepts language names Shiki does not, and an unknown
      // language is a hard build failure in Shiki but merely renders
      // unhighlighted in Pygments. `fallbackLanguage` restores that behaviour;
      // the aliases recover highlighting where a real equivalent exists.
      langAlias: {
        golang: 'go',
        conf: 'ini',
        env: 'dotenv',
        cmd: 'bat',
        // Not known to Pygments either — these render unhighlighted today, and
        // mapping them to `text` keeps it that way rather than inventing
        // highlighting the current site does not have.
        vrl: 'text',
        promql: 'text',
        alloy: 'text',
        cron: 'text',
        journalctl: 'text',
      },
      // An alias registers its name as "loaded", so Shiki never lazy-loads the
      // *target*. Anything aliased to a real grammar must be preloaded here or
      // highlighting throws at build time. (`text` is a built-in special
      // language and needs no entry.)
      langs: ['go', 'dotenv', 'ini', 'bat'],
      // Safety net for any language neither Shiki nor this alias table knows.
      fallbackLanguage: 'text',
    },

    // Order is load-bearing — see §7.11.
    remarkPlugins: (defaults) => [
      // 1. Indentation-delimited blocks first, from the raw source: once gfm has
      //    restructured the tree into lists and indented code, the 4-space
      //    bodies are no longer recoverable as markdown.
      remarkMkdocsBlocks,
      // 2. Fence meta, before Shiki reads it.
      remarkMkdocsCodefence,
      // 3. gfm, heading, structure, code-tab.
      ...defaults,
      // 4. These need link/image nodes to already exist.
      remarkMkdocsAttrList,
      [remarkMkdocsLinks, { docsDir: DOCS_DIR }],
      [remarkMkdocsImages, { docsDir: DOCS_DIR }],
    ],

    // MANDATORY. Without rehype-raw every raw HTML node — all 81 files'
    // <iframe> YouTube embeds, <img>, <div>, <br> — is SILENTLY DROPPED. No
    // error, no warning, content simply vanishes (risk R-2).
    //
    // `passThrough` is equally mandatory: rehype-raw reserialises the tree, and
    // the MDX JSX nodes the compatibility layer emits are not HTML, so without
    // it every <Callout>, <Tabs> and <Accordion> would be destroyed too.
    rehypePlugins: (defaults) => [
      [
        rehypeRaw,
        {
          passThrough: [
            'mdxjsEsm',
            'mdxFlowExpression',
            'mdxTextExpression',
            'mdxJsxFlowElement',
            'mdxJsxTextElement',
          ],
        },
      ],
      ...defaults,
    ],
  },
});
