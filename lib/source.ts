import { loader } from 'fumadocs-core/source';
import { docs } from '@/.source/server';

/**
 * `baseUrl` is '/' rather than '/docs': Next's `basePath` already prefixes every
 * href rendered through `next/link`. See lib/constants.ts.
 */
export const source = loader({
  baseUrl: '/',
  source: docs.toFumadocsSource(),
});
