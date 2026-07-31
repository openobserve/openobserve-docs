import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseMkdocsBlocks, type Block, type ContainerBlock } from '../plugins/mkdocs-blocks.ts';
import {
  admonitionTitle,
  calloutType,
  renderCollapsible,
} from '../plugins/remark-mkdocs-admonition.ts';
import { renderTabGroup } from '../plugins/remark-mkdocs-tabs.ts';
import { convertFenceOptions } from '../plugins/remark-mkdocs-codefence.ts';
import { parseAttrList } from '../plugins/remark-mkdocs-attr-list.ts';
import { pythonMarkdownSlugify, uniqueSlug } from '../plugins/mkdocs-slug.ts';
import { normaliseMkdocsMarkdown } from '../plugins/mkdocs-markdown.ts';

function parse(source: string): Block[] {
  return parseMkdocsBlocks(source.split('\n')).blocks;
}
function containers(blocks: Block[]): ContainerBlock[] {
  return blocks.filter((b): b is ContainerBlock => b.kind === 'container');
}
function textOf(blocks: Block[]): string {
  return blocks
    .filter((b) => b.kind === 'text')
    .map((b) => (b as { lines: string[] }).lines.join('\n'))
    .join('\n');
}

test('admonition: type, title and body', () => {
  const blocks = parse(
    [
      '!!! tip "Sizing the cluster"',
      '    For recommended CPU, memory, and storage values, see',
      '    [Capacity planning](../../enterprise-setup/capacity-planning.md).',
      '',
      'After.',
    ].join('\n'),
  );

  const [callout] = containers(blocks);
  assert.equal(callout!.marker, '!!!');
  assert.deepEqual(callout!.classes, ['tip']);
  assert.equal(admonitionTitle(callout!), 'Sizing the cluster');
  assert.equal(calloutType(callout!), 'idea');
  assert.match(textOf(callout!.children), /Capacity planning/);
  assert.match(textOf(blocks), /After\./);
});

test('admonition: omitted title defaults to the capitalised class', () => {
  const [callout] = containers(parse('!!! note\n    body'));
  assert.equal(admonitionTitle(callout!), 'Note');
});

test('admonition: an explicit empty title suppresses it', () => {
  const [callout] = containers(parse('!!! note ""\n    body'));
  assert.equal(admonitionTitle(callout!), undefined);
});

test('admonition: the `node` typo maps to note styling, not an unknown type', () => {
  const [callout] = containers(parse('!!! node\n    body'));
  assert.equal(calloutType(callout!), 'info');
  assert.equal(admonitionTitle(callout!), 'Node');
});

test('admonition: an unrecognised class still renders with its own title', () => {
  const [callout] = containers(parse('!!! Configuration\n    body'));
  assert.deepEqual(callout!.classes, ['configuration']);
  assert.equal(admonitionTitle(callout!), 'Configuration');
  assert.equal(calloutType(callout!), 'info');
});

test('collapsible: `??? "Title"` with no class', () => {
  const [details] = containers(parse('??? "Step 1: Create Your Account"\n\n    Do the thing.'));
  assert.equal(details!.marker, '???');
  assert.deepEqual(details!.classes, []);
  assert.equal(admonitionTitle(details!), 'Step 1: Create Your Account');
});

test('collapsible: `???+` is the open-by-default variant', () => {
  const [details] = containers(parse('???+ note "Open"\n    body'));
  assert.equal(details!.marker, '???+');
});

test('tabs: adjacent blocks, labels preserved verbatim', () => {
  const blocks = parse(
    [
      '=== "OpenObserve Cloud (Recommended)"',
      '',
      '    Cloud body',
      '',
      '=== "Self-Hosted Installation"',
      '',
      '    Self-hosted body',
    ].join('\n'),
  );
  const tabs = containers(blocks);
  assert.equal(tabs.length, 2);
  assert.equal(tabs[0]!.title, 'OpenObserve Cloud (Recommended)');
  assert.equal(tabs[1]!.title, 'Self-Hosted Installation');
});

test('nesting: tab inside tab, admonition inside that (the getting-started shape)', () => {
  const blocks = parse(
    [
      '=== "Self-Hosted Installation"',
      '',
      '    Choose self-hosted if you need:',
      '',
      '    === "Windows"',
      '',
      '        Run the following commands:',
      '',
      '        ```cmd',
      '        openobserve.exe',
      '        ```',
      '',
      '        !!! note',
      '            You can set email and password based on your preference',
      '',
      '    === "MacOS/Linux Binaries"',
      '',
      '        Other body',
    ].join('\n'),
  );

  const outer = containers(blocks);
  assert.equal(outer.length, 1);
  assert.equal(outer[0]!.title, 'Self-Hosted Installation');

  const innerTabs = containers(outer[0]!.children);
  assert.equal(innerTabs.length, 2);
  assert.equal(innerTabs[0]!.title, 'Windows');

  const note = containers(innerTabs[0]!.children);
  assert.equal(note.length, 1);
  assert.equal(note[0]!.marker, '!!!');
  assert.match(textOf(innerTabs[0]!.children), /```cmd/);
});

test('fenced code is literal: a `!!!` inside a fence is not an admonition', () => {
  const blocks = parse(['```bash', '!!! not an admonition', '=== also not', '```'].join('\n'));
  assert.equal(containers(blocks).length, 0);
  assert.match(textOf(blocks), /!!! not an admonition/);
});

test('a fence inside an admonition body survives dedenting', () => {
  const [callout] = containers(
    parse(['!!! note', '    Text', '', '    ```bash', '    echo hi', '    ```'].join('\n')),
  );
  assert.equal(textOf(callout!.children), 'Text\n\n```bash\necho hi\n```');
});

test('body ends at the first line that is not indented past the opener', () => {
  const blocks = parse(['!!! note', '    inside', 'outside', ''].join('\n'));
  const [callout] = containers(blocks);
  assert.equal(textOf(callout!.children), 'inside');
  assert.match(textOf(blocks), /outside/);
});

test('openers indented past the block level are left alone, and reported', () => {
  const result = parseMkdocsBlocks(['1. Step', '        !!! note', '            body'].join('\n').split('\n'));
  assert.equal(result.blocks.filter((b) => b.kind === 'container').length, 0);
  assert.equal(result.skippedOpeners.length, 1);
});

test('collapsibles render as <details> so their body stays in the static HTML', () => {
  const [details] = containers(parse('??? "Step 1"\n    body'));
  const node = renderCollapsible(details!, [], 0);
  assert.equal(node.name, 'details');
  assert.equal(node.children[0]!.type, 'mdxJsxFlowElement');
  assert.equal((node.children[0] as { name: string }).name, 'summary');
  // Collapsed by default: no `open` attribute.
  assert.equal(node.attributes.some((a) => a.name === 'open'), false);
});

test('`???+` renders open by default', () => {
  const [details] = containers(parse('???+ note "Open"\n    body'));
  const node = renderCollapsible(details!, [], 0);
  assert.deepEqual(
    node.attributes.find((a) => a.name === 'open'),
    { type: 'mdxJsxAttribute', name: 'open', value: null },
  );
});

test('every tab panel is force-mounted so inactive tabs stay in the DOM', () => {
  const blocks = containers(parse('=== "A"\n    one\n\n=== "B"\n    two'));
  const node = renderTabGroup(blocks.map((block) => ({ block, children: [] })));
  const panels = node.children.filter(
    (child) => (child as { name?: string }).name === 'TabsContent',
  );
  assert.equal(panels.length, 2);
  for (const panel of panels) {
    assert.ok(
      (panel as { attributes: { name: string }[] }).attributes.some((a) => a.name === 'forceMount'),
    );
  }
});

test('duplicate tab labels get distinct values', () => {
  const blocks = containers(parse('=== "CLI"\n    one\n\n=== "CLI"\n    two'));
  const node = renderTabGroup(blocks.map((block) => ({ block, children: [] })));
  const values = node.children
    .filter((child) => (child as { name?: string }).name === 'TabsContent')
    .map((child) => (child as { attributes: { name: string; value: string | null }[] }).attributes[0]!.value);
  assert.deepEqual(values, ['CLI', 'CLI (2)']);
});

test('dialect: `##Clone` is a heading, as in Python-Markdown', () => {
  const { lines } = normaliseMkdocsMarkdown(['##Clone </br>']);
  assert.deepEqual(lines, ['## Clone </br>']);
});

test('dialect: a span-only tag line joins the content it would otherwise swallow', () => {
  const { lines } = normaliseMkdocsMarkdown([
    '<kbd>',
    '![Streams](../images/streams_list.jpg)',
    '</kbd>',
    '',
  ]);
  assert.deepEqual(lines, ['<kbd> ![Streams](../images/streams_list.jpg)', '</kbd>', '']);
});

test('dialect: a span-only tag before a block construct gets a blank line instead', () => {
  const { lines } = normaliseMkdocsMarkdown(['</br>', '> Applicable to open source version']);
  assert.deepEqual(lines, ['</br>', '', '> Applicable to open source version']);
});

test('dialect: a span-only tag straight after a fence still counts as block-starting', () => {
  const { lines } = normaliseMkdocsMarkdown(['```', 'code', '```', '</br>', '## Setup up credentials']);
  assert.deepEqual(lines, ['```', 'code', '```', '</br>', '', '## Setup up credentials']);
});

test('dialect: an indented line after a fence is paragraph content, not code', () => {
  const { lines } = normaliseMkdocsMarkdown([
    '```sql',
    'code = 200',
    '```',
    '    ![Exact Numeric Match](../../images/example-queries/code.png)',
  ]);
  assert.deepEqual(lines[3], '![Exact Numeric Match](../../images/example-queries/code.png)');
});

test('dialect: list-item continuation after a fence is left indented', () => {
  const { lines } = normaliseMkdocsMarkdown([
    '1. Step',
    '    ```bash',
    '    cmd',
    '    ```',
    '    more text',
  ]);
  assert.deepEqual(lines[4], '    more text');
});

test('dialect: markers inside fenced code are never touched', () => {
  const input = ['```html', '<br>', '##NotAHeading', '```'];
  const { lines, changed } = normaliseMkdocsMarkdown(input);
  assert.deepEqual(lines, input);
  assert.equal(changed, false);
});

test('fence options: linenums in the language position', () => {
  assert.deepEqual(convertFenceOptions('linenums="1"', null), { lang: null, meta: 'lineNumbers' });
});

test('fence options: hl_lines becomes Shiki meta-highlight syntax', () => {
  assert.deepEqual(convertFenceOptions('bash', 'linenums="1" hl_lines="29 38 36"'), {
    lang: 'bash',
    meta: 'lineNumbers {29,38,36}',
  });
});

test('fence options: a non-1 start line is preserved', () => {
  assert.deepEqual(convertFenceOptions('yaml', 'linenums="9"'), {
    lang: 'yaml',
    meta: 'lineNumbers=9',
  });
});

test('fence options: title is passed through untouched', () => {
  assert.deepEqual(convertFenceOptions('json', 'title="network_config.json"'), {
    lang: 'json',
    meta: 'title="network_config.json"',
  });
});

test('attr_list: both the spaced and unspaced forms', () => {
  assert.deepEqual(parseAttrList(' style="height:800px"').properties, {
    style: 'height:800px',
  });
  assert.deepEqual(parseAttrList('target="_blank" rel="noopener noreferrer"').properties, {
    target: '_blank',
    rel: 'noopener noreferrer',
  });
});

test('slugify matches Python-Markdown, not github-slugger', () => {
  // github-slugger would produce `c--rust` for this.
  assert.equal(pythonMarkdownSlugify('C++ / Rust'), 'c-rust');
  assert.equal(pythonMarkdownSlugify('OpenObserve Architecture and Deployment Modes'), 'openobserve-architecture-and-deployment-modes');
  assert.equal(pythonMarkdownSlugify('What is `match_all()`?'), 'what-is-match_all');
  assert.equal(pythonMarkdownSlugify('Café & Bar'), 'cafe--bar'.replace('--', '-'));
});

test('duplicate headings get Python-Markdown suffixes, not github-slugger ones', () => {
  const seen = new Set<string>();
  assert.equal(uniqueSlug('setup', seen), 'setup');
  assert.equal(uniqueSlug('setup', seen), 'setup_1');
  assert.equal(uniqueSlug('setup', seen), 'setup_2');
});

test('an empty slug still yields a usable id', () => {
  assert.equal(uniqueSlug('', new Set()), '_1');
});
