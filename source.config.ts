import { defineDocs, defineConfig, frontmatterSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import { transformerMetaHighlight } from '@shikijs/transformers';
import rehypeRaw from 'rehype-raw';
import remarkDirective from 'remark-directive';
import { remarkMkdocsDirectives } from './lib/remark/mkdocs-directives';
import { remarkMkdocsLinks } from './lib/remark/mkdocs-links';
import { remarkDocsImages } from './lib/remark/docs-images';

/**
 * Content stays where MkDocs kept it: `docs/`, as `.md`. Sidebar structure lives
 * in the `meta.json` files migrated from `.pages`.
 */
export const docs = defineDocs({
  dir: 'docs',
  docs: {
    files: ['**/*.md'],
    // `title` is the short sidebar label; `metaTitle` is the long <title> tag
    // inherited from MkDocs. See scripts/migration/convert-frontmatter.mjs.
    schema: frontmatterSchema.extend({
      metaTitle: z.string().optional(),
    }),
    // Per-page "last updated", read from git history. CI must clone with full
    // history (`fetch-depth: 0`) for this to be accurate.
    lastModified: true,
  },
  meta: {
    files: ['**/meta.json'],
  },
});

// MDX node types that rehype-raw must not try to re-parse as HTML.
const MDX_NODE_TYPES = [
  'mdxFlowExpression',
  'mdxJsxFlowElement',
  'mdxJsxTextElement',
  'mdxTextExpression',
  'mdxjsEsm',
];

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (plugins) => [
      remarkDirective,
      remarkMkdocsDirectives,
      remarkMkdocsLinks,
      remarkDocsImages,
      ...plugins,
    ],
    // `.md` files compile in Markdown format, which strips raw HTML by default.
    // MkDocs rendered inline HTML (the <iframe> embeds, layout <div>s), so it is
    // parsed back into real elements before that stripping happens.
    rehypePlugins: (plugins) => [
      ...plugins,
      // Must run AFTER the syntax highlighter. rehype-raw re-serialises and
      // re-parses the whole tree, which drops hast `data` that isn't a real HTML
      // attribute - including the code-fence meta Shiki reads for `lineNumbers`,
      // `title="..."` and `{1,3-5}` line highlighting.
      [rehypeRaw, { passThrough: MDX_NODE_TYPES }],
    ],
    // Image paths are rewritten by remarkDocsImages and served as plain <img>;
    // Fumadocs' own image handling would try to route them through next/image,
    // which needs dimensions these Markdown images don't carry.
    remarkImageOptions: false,
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      // Restores MkDocs' `hl_lines`, migrated to Shiki's `{4,9,20-24}` meta.
      // Some pages tell the reader to "change the highlighted lines below", so
      // the highlighting carries meaning and isn't only decorative.
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerMetaHighlight(),
      ],
      // Pygments silently fell back for lexers it didn't know; Shiki throws and
      // fails the whole build. Render unknown languages as plain text instead,
      // so a new fence language can never break a deploy.
      fallbackLanguage: 'plaintext',
    },
  },
});
