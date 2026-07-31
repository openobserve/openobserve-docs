/**
 * §7.4 — `attr_list` trailing attribute blocks.
 *
 *     ![Create Firehose Stream](../../images/firehose.png){: style="height:800px"}
 *     [Slack channel](/marketing-opt-in/){:target="_blank" rel="noopener noreferrer"}
 *
 * Python-Markdown attaches `{: … }` to the element immediately before it. After
 * the default remark pipeline has run, that block is still sitting in the tree
 * as a plain text node following the image or link node — so this plugin must
 * run *after* the defaults, when those nodes exist (§7.11).
 *
 * Attributes land in `data.hProperties`, which `mdast-util-to-hast` turns into
 * element properties. A `style` string is safe there: MDX's `hast-util-to-estree`
 * runs it through `style-to-js`, producing the React style object that a raw
 * string prop would otherwise throw on.
 *
 * Measured usages: 17 sized images and 1 `target="_blank"` link.
 */
import { visit } from 'unist-util-visit';
import type { Parent, Root, RootContent, Text } from 'mdast';
import type { Transformer } from 'unified';

/** Both `{: key="v"}` and `{:key="v"}` appear in the content. */
const ATTR_BLOCK = /^\s*\{:\s*([^}]*)\}/;
const ATTR = /([a-zA-Z_][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')|([.#][\w-]+)/g;

interface Parsed {
  properties: Record<string, string>;
  classes: string[];
  id?: string;
}

export function parseAttrList(body: string): Parsed {
  const properties: Record<string, string> = {};
  const classes: string[] = [];
  let id: string | undefined;

  for (const match of body.matchAll(ATTR)) {
    const shorthand = match[4];
    if (shorthand) {
      if (shorthand.startsWith('.')) classes.push(shorthand.slice(1));
      else id = shorthand.slice(1);
      continue;
    }
    properties[match[1]!] = match[2] ?? match[3] ?? '';
  }
  return { properties, classes, id };
}

function applyTo(node: RootContent, parsed: Parsed): void {
  const data = (node.data ??= {}) as { hProperties?: Record<string, unknown> };
  const properties = (data.hProperties ??= {});
  Object.assign(properties, parsed.properties);
  if (parsed.classes.length) properties.className = parsed.classes;
  if (parsed.id) properties.id = parsed.id;
}

export function remarkMkdocsAttrList(): Transformer<Root, Root> {
  return (tree) => {
    visit(tree, (node) => {
      const parent = node as Parent;
      if (!('children' in parent) || !Array.isArray(parent.children)) return;

      for (let index = 1; index < parent.children.length; index++) {
        const child = parent.children[index]!;
        if (child.type !== 'text') continue;

        const match = ATTR_BLOCK.exec((child as Text).value);
        if (!match) continue;

        const target = parent.children[index - 1]!;
        // Only elements can carry properties; an attribute block after plain
        // text is not something Python-Markdown attaches either.
        if (target.type !== 'image' && target.type !== 'link' && target.type !== 'inlineCode') {
          continue;
        }

        applyTo(target, parseAttrList(match[1]!));
        // Drop the consumed block; anything after it (e.g. a trailing full stop)
        // stays in the document.
        (child as Text).value = (child as Text).value.slice(match[0].length);
        if ((child as Text).value === '') {
          parent.children.splice(index, 1);
          index--;
        }
      }
    });
  };
}
