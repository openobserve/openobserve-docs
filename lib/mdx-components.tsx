import type { AnchorHTMLAttributes, ImgHTMLAttributes } from 'react';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Tab, Tabs, TabsContent, TabsList, TabsTrigger } from 'fumadocs-ui/components/tabs';
import { Callout } from 'fumadocs-ui/components/callout';
import type { MDXComponents } from 'mdx/types';
import { withBasePath } from './base-path';

/**
 * Plain `<img>`, not `next/image`.
 *
 * `remark-mkdocs-images` emits docs-rooted srcs with no `/docs` prefix, matching
 * every other href in the pipeline; Next does not rewrite a raw `src`, so the
 * prefix is applied here (§6.2). `next/image` is unsuitable regardless: it needs
 * intrinsic dimensions that markdown images do not carry, and `output: 'export'`
 * disables optimisation anyway.
 */
function Image({ src, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={withBasePath(typeof src === 'string' ? src : undefined)} {...props} />;
}

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & { 'data-site-root'?: string };

/**
 * Links that were already site-absolute in the source address the marketing
 * site, not the docs — `/marketing-opt-in/`. `remark-mkdocs-links` tags them,
 * and they render as a plain anchor so Next's `basePath` is not prepended;
 * everything else keeps fumadocs' `Link`, which routes through `next/link` and
 * so *does* get the prefix (§6.2).
 */
function Anchor({ 'data-site-root': siteRoot, ...props }: AnchorProps) {
  if (siteRoot) return <a {...props} />;
  const Default = defaultMdxComponents.a;
  return <Default {...props} />;
}

/**
 * The component map every compiled page renders through.
 *
 * The compatibility plugins emit `Callout` (§7.2), `Accordions`/`Accordion`
 * (§7.2) and `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` (§7.3), so all of
 * those names must resolve here.
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    a: Anchor,
    img: Image,
    Callout,
    Accordion,
    Accordions,
    Tab,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    ...components,
  };
}
