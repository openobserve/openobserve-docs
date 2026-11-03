import DOMPurify from 'dompurify';
import { marked } from 'marked';

/**
 * "Ask AI": a chat over the docs and website, answered by
 * o2-ai-assistant-backend. Ported from the marketing site (website5,
 * `src/utils/aiAssistant.ts`) so both sites behave the same.
 *
 * Base URL of the backend, read at build time from
 * NEXT_PUBLIC_AI_ASSISTANT_API_URL: `.env` locally, the `AI_ASSISTANT_API_URL`
 * repository variable in the deploy workflows. While it is empty, the dialog
 * and every entry point into it render nothing.
 */
export const AI_ASSISTANT_API_URL = (process.env.NEXT_PUBLIC_AI_ASSISTANT_API_URL ?? '').replace(
  /\/$/,
  '',
);

export const isAiAssistantEnabled = AI_ASSISTANT_API_URL !== '';

/** Sent as `site` so the backend can tell docs questions from website ones. */
export const AI_ASSISTANT_SITE = 'docs';

export const aiAssistantContent = {
  label: 'Ask AI',
  title: 'OpenObserve AI',
  open: 'Open the OpenObserve AI assistant',
  close: 'Close assistant',
  clear: 'New chat',
  send: 'Send question',
  stop: 'Stop answering',
  placeholder: 'Ask a question...',
  emptyHeading: 'How can I help?',
  emptyDescription:
    'Ask anything about OpenObserve. Answers come from the docs and website, with links to the sources.',
  suggestions: [
    'How do I get started with OpenObserve?',
    'How do I send logs to OpenObserve?',
    'How do I create an alert?',
    'How do I query logs with SQL?',
  ],
  thinking: 'Searching the docs...',
  sources: 'Sources',
  disclaimer: 'AI answers can be wrong. Check the linked sources.',
  errors: {
    generic: 'Something went wrong while answering. Please try again.',
    rateLimited: 'Too many questions right now. Please wait a minute and try again.',
    cutOff: 'This answer was cut short. Ask a follow-up to continue.',
    interrupted: 'The connection dropped, so this answer may be incomplete. Please try again.',
    stopped: 'Stopped before answering.',
    unavailable: 'The assistant has reached its limit for today. Please try again tomorrow.',
  },
};

export interface AiSource {
  id: number;
  title: string;
  url: string;
  type: 'docs' | 'website';
}

const OPEN_EVENT = 'ai-assistant:open';

declare global {
  interface Window {
    /** A question asked before the dialog has hydrated. */
    __aiAssistantPending?: { query: string };
  }
}

/** Opens the dialog from any component, and asks `query` when one is given. */
export function openAiAssistant(query = ''): void {
  window.__aiAssistantPending = { query };
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

/** Runs `handler` for each open request, including one made before this call. */
export function onAiAssistantOpen(handler: (query: string) => void): () => void {
  const flush = () => {
    const pending = window.__aiAssistantPending;
    if (!pending) return;
    window.__aiAssistantPending = undefined;
    handler(pending.query);
  };
  window.addEventListener(OPEN_EVENT, flush);
  flush();
  return () => window.removeEventListener(OPEN_EVENT, flush);
}

// Citations stay plain text inside code, where [1] is usually an array index.
const CODE_SEGMENT = /(<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>)/;
const CITATION_CLASS = 'oo-ai-citation';

const CITATION = /\[(\d+(?:\s*,\s*\d+)*)\]/g;
const MARKDOWN_CODE = /```[\s\S]*?(?:```|$)|`[^`\n]*`/g;

function linkCitations(html: string, sources: AiSource[]): string {
  const urlById = new Map(sources.map((source) => [String(source.id), source.url]));
  return html
    .split(CODE_SEGMENT)
    .map((segment, index) =>
      index % 2 === 1
        ? segment
        : segment.replace(CITATION, (citation, list: string) => {
            const links = list
              .split(/\s*,\s*/)
              .filter((id) => urlById.has(id))
              .map((id) => `<a href="${urlById.get(id)}" class="${CITATION_CLASS}">${id}</a>`);
            return links.join('') || citation;
          }),
    )
    .join('');
}

/** Source ids cited in an answer that never reached the API's `done` event. */
export function citedSourceIds(markdown: string, sources: AiSource[]): number[] {
  const known = new Set(sources.map((source) => source.id));
  const cited = [...markdown.replace(MARKDOWN_CODE, '').matchAll(CITATION)].flatMap((match) =>
    match[1]!.split(',').map(Number),
  );
  return [...new Set(cited)].filter((id) => known.has(id));
}

// Links open in a new tab so following a source doesn't lose the open dialog.
// The dialog is client-only, but this module can still be evaluated during the
// static export, where DOMPurify has no window and no hook API.
if (DOMPurify.isSupported) {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/**
 * Renders an answer to HTML. It goes into dangerouslySetInnerHTML and comes
 * from a model that reads visitor input, so it is always sanitized. Images are
 * dropped because loading one sends a request to whatever URL the model wrote.
 */
export function renderAnswer(markdown: string, sources: AiSource[]): string {
  const html = marked.parse(markdown, { async: false, gfm: true, breaks: true });
  return DOMPurify.sanitize(linkCitations(html, sources), { FORBID_TAGS: ['img'] });
}
