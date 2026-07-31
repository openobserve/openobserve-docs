/**
 * §7.4 (fences) — `pymdownx.highlight` fence options → Shiki meta.
 *
 *     ```bash linenums="1" hl_lines="3 5"      →  ```bash lineNumbers {3,5}
 *     ```yaml linenums="9"                     →  ```yaml lineNumbers=9
 *     ```linenums="1"                          →  ``` lineNumbers
 *
 * The last form matters more than it looks: 29 fences in the content are written
 * with the *option in the language position* and no language at all. Left alone,
 * Shiki is asked to highlight a language called `linenums="1"`, which is a hard
 * build error rather than a rendering glitch.
 *
 * `title="…"` is passed through — fumadocs' `parseMetaString` already
 * understands it, and it is the same spelling MkDocs uses.
 */
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import type { Transformer } from 'unified';

/** `key="value"` / `key='value'` / bare `key`, as pymdownx writes them. */
const OPTION = /(^|\s)([a-zA-Z_][\w-]*)(?:=(?:"([^"]*)"|'([^']*)'))?/g;

interface Converted {
  lang: string | null;
  meta: string;
}

export function convertFenceOptions(lang: string | null, meta: string | null): Converted {
  // A "language" that is really an option: ```linenums="1"
  let language = lang;
  let rest = meta ?? '';
  if (language && /^[a-zA-Z_][\w-]*=/.test(language)) {
    rest = `${language} ${rest}`.trim();
    language = null;
  }

  const out: string[] = [];
  const remaining = rest.replace(OPTION, (match, space: string, name: string, dq?: string, sq?: string) => {
    const value = dq ?? sq;
    if (name === 'linenums') {
      // pymdownx numbers from `value`; fumadocs writes the start as a bare
      // number and omits it when numbering starts at 1.
      const start = Number(value ?? '1');
      out.push(Number.isFinite(start) && start !== 1 ? `lineNumbers=${start}` : 'lineNumbers');
      return space;
    }
    if (name === 'hl_lines') {
      // `hl_lines="29 38 36"` → `{29,38,36}`, the meta form Shiki's
      // transformerMetaHighlight reads.
      const lines = (value ?? '').trim().split(/\s+/).filter(Boolean).join(',');
      if (lines) out.push(`{${lines}}`);
      return space;
    }
    return match;
  });

  return { lang: language, meta: [remaining.trim(), ...out].filter(Boolean).join(' ') };
}

export function remarkMkdocsCodefence(): Transformer<Root, Root> {
  return (tree) => {
    visit(tree, 'code', (node) => {
      const { lang, meta } = convertFenceOptions(node.lang ?? null, node.meta ?? null);
      node.lang = lang;
      node.meta = meta === '' ? null : meta;
    });
  };
}
