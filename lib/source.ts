import { loader } from 'fumadocs-core/source';
import { toFumadocsSource } from 'fumadocs-mdx/runtime/server';
import { docs, meta } from '@/.source/server';
import { navTransformers } from './nav-transformers';

export const source = loader({
  // IMPORTANT: '/' not '/docs'. Next's basePath prepends /docs to every
  // <Link href>. Setting baseUrl to '/docs' as well yields /docs/docs/… — this
  // is the single most likely URL bug in the migration (risk R-1).
  baseUrl: '/',
  source: toFumadocsSource(docs, meta),
  pageTree: { transformers: navTransformers },
});
