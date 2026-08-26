import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { MkTab, MkTabs } from '@/components/mk-tabs';
import { ZoomableImage } from '@/components/zoomable-image';
import { Details } from '@/components/details';
import { ChildPages } from '@/components/child-pages';

/**
 * Components referenced by the migrated content. The MkDocs-specific ones are
 * injected by lib/remark/mkdocs-directives.ts, which emits JSX nodes by name.
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    // Fumadocs' default `img` routes through next/image, which needs explicit
    // dimensions that Markdown images don't have.
    img: ZoomableImage,
    Details,
    MkTabs,
    MkTab,
    ChildPages,
    ...components,
  };
}
