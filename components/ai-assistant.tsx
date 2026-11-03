'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import {
  aiAssistantContent as content,
  isAiAssistantEnabled,
  onAiAssistantOpen,
  openAiAssistant,
  renderAnswer,
} from '@/lib/ai-assistant';
import { useAiAssistantChat, type AiChatMessage } from '@/lib/use-ai-assistant-chat';

/**
 * "Ask AI" for the docs, matching the marketing site's assistant (website5,
 * `src/components/ai-assistant/`): one dialog mounted in the root layout, opened
 * with openAiAssistant() from the sidebar button or the landing page prompt.
 * Every piece renders nothing until NEXT_PUBLIC_AI_ASSISTANT_API_URL is set.
 */

function Icon({ children, size = 16 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

function SparklesIcon({ size }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M9.9 2.6 8.6 7.2a2 2 0 0 1-1.4 1.4L2.6 9.9l4.6 1.3a2 2 0 0 1 1.4 1.4l1.3 4.6 1.3-4.6a2 2 0 0 1 1.4-1.4l4.6-1.3-4.6-1.3a2 2 0 0 1-1.4-1.4Z" />
      <path d="M19 14v4M17 16h4M18 3v3M16.5 4.5h3" />
    </Icon>
  );
}

const ICON_BUTTON =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-fd-border text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground';
const ROUND_BUTTON =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50';

/** Sidebar "Ask AI" button, below "Get Started Free". */
export function AskAiButton() {
  if (!isAiAssistantEnabled) return null;
  return (
    <button
      type="button"
      onClick={() => openAiAssistant()}
      title={content.open}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-fd-border bg-fd-secondary px-4 py-2 text-sm font-semibold text-fd-secondary-foreground transition-colors hover:border-[var(--oo-brand)]/50 hover:text-[var(--oo-brand)]"
    >
      <span className="text-[var(--oo-brand)]">
        <SparklesIcon />
      </span>
      {content.label}
    </button>
  );
}

/**
 * Inline "Ask AI" prompt, as on the marketing site's hero: submitting opens the
 * dialog with the question already asked.
 */
export function AskAiBar({ placeholder = 'How do I send logs from Kubernetes?' }: { placeholder?: string }) {
  const [query, setQuery] = useState('');
  if (!isAiAssistantEnabled) return null;

  const ask = (event: FormEvent) => {
    event.preventDefault();
    openAiAssistant(query.trim());
    setQuery('');
  };

  return (
    <form
      role="search"
      aria-label={content.label}
      onSubmit={ask}
      className="flex w-full max-w-2xl items-center gap-3 rounded-xl border border-fd-border bg-fd-card py-2 pl-4 pr-2 shadow-[0_0_24px_-6px_color-mix(in_oklab,var(--oo-brand)_45%,transparent)] transition-shadow focus-within:ring-2 focus-within:ring-[var(--oo-brand)]/40"
    >
      <span className="flex shrink-0 items-center gap-2 text-base font-semibold">
        <span className="text-[var(--oo-brand)]">
          <SparklesIcon size={20} />
        </span>
        {content.label}
      </span>
      <span className="h-6 w-px shrink-0 bg-fd-border" aria-hidden="true" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        type="text"
        name="ask-ai"
        autoComplete="off"
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm placeholder:text-fd-muted-foreground focus:outline-none sm:text-base"
      />
      <button
        type="submit"
        aria-label={content.send}
        className={`${ROUND_BUTTON} bg-[var(--oo-brand)]/10 text-[var(--oo-brand)] hover:bg-[var(--oo-brand)]/20`}
      >
        <Icon>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </Icon>
      </button>
    </form>
  );
}

function citedSources(message: AiChatMessage) {
  return (message.sources ?? []).filter((source) => message.cited?.includes(source.id));
}

/**
 * The assistant dialog. A native <dialog> so showModal() provides the backdrop,
 * Escape and the focus trap. Full screen on phones.
 */
export function AiAssistantDialog() {
  const { messages, isStreaming, isWaiting, send, stop, clear } = useAiAssistantChat();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  // Following the answer stops once the reader scrolls up to read it.
  const followAnswer = useRef(true);
  const streaming = useRef(isStreaming);
  streaming.current = isStreaming;

  const ask = (question: string) => {
    followAnswer.current = true;
    void send(question);
  };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (isStreaming || !draft.trim()) return;
    ask(draft);
    setDraft('');
  };

  // During IME composition Enter confirms the text. Safari reports it only
  // through keyCode 229.
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    event.preventDefault();
    submit();
  };

  const onScroll = () => {
    const el = scroller.current!;
    followAnswer.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  };

  useEffect(() => {
    if (!followAnswer.current) return;
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    document.documentElement.toggleAttribute('data-ai-assistant-open', isOpen);
    if (!isOpen) {
      if (el.open) el.close();
      return;
    }
    if (!el.open) el.showModal();
    input.current?.focus({ preventScroll: true });
  }, [isOpen]);

  useEffect(() => {
    if (!isAiAssistantEnabled) return;
    return onAiAssistantOpen((query) => {
      setIsOpen(true);
      if (!query) return;
      // Only one answer streams at a time, so a question asked during one waits
      // in the input rather than being lost.
      if (streaming.current) setDraft(query);
      else ask(query);
    });
    // `ask` only wraps the stable `send`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAiAssistantEnabled) return null;

  return (
    <dialog
      ref={dialog}
      aria-label={content.title}
      // Clicks on the dialog's content land on its children, so only the
      // backdrop reports the dialog itself as the target.
      onClick={(event) => {
        if (event.target === dialog.current) setIsOpen(false);
      }}
      onClose={() => setIsOpen(false)}
      className="oo-ai-dialog m-auto h-dvh max-h-none w-full max-w-none flex-col overflow-hidden bg-fd-background text-fd-foreground shadow-2xl open:flex sm:h-[min(85dvh,46rem)] sm:max-w-2xl sm:rounded-2xl sm:border sm:border-fd-border"
    >
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-fd-border pl-4 pr-2">
        <span className="text-[var(--oo-brand)]">
          <SparklesIcon size={18} />
        </span>
        <h2 className="flex-1 text-sm font-semibold">{content.title}</h2>
        {messages.length > 0 && (
          <button type="button" onClick={clear} aria-label={content.clear} title={content.clear} className={ICON_BUTTON}>
            <Icon>
              <path d="M12 5v14M5 12h14" />
            </Icon>
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label={content.close}
          title={content.close}
          className={ICON_BUTTON}
        >
          <Icon>
            <path d="M18 6 6 18M6 6l12 12" />
          </Icon>
        </button>
      </header>

      <div ref={scroller} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col justify-center">
            <h3 className="text-lg font-semibold">{content.emptyHeading}</h3>
            <p className="mt-1 text-sm text-fd-muted-foreground">{content.emptyDescription}</p>
            <ul className="mt-5 flex flex-col gap-2">
              {content.suggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => ask(suggestion)}
                    className="w-full cursor-pointer rounded-lg border border-fd-border px-3 py-2 text-left text-sm transition-colors hover:border-[var(--oo-brand)] hover:text-[var(--oo-brand)]"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ol aria-live="polite" className="flex flex-col gap-5">
            {messages.map((message, index) => (
              <li key={index}>
                {message.role === 'user' ? (
                  <p className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap break-words rounded-xl bg-fd-muted px-3 py-2 text-sm">
                    {message.content}
                  </p>
                ) : (
                  <AssistantMessage
                    message={message}
                    waiting={isWaiting && index === messages.length - 1}
                  />
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      <form onSubmit={submit} className="shrink-0 border-t border-fd-border p-3">
        <div className="flex items-end gap-2 rounded-xl border border-fd-border bg-fd-card p-2 transition-colors focus-within:border-[var(--oo-brand)]">
          <textarea
            ref={input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={4000}
            name="ai-assistant-question"
            placeholder={content.placeholder}
            aria-label={content.placeholder}
            className="max-h-32 min-h-8 flex-1 resize-none bg-transparent px-1 py-1 text-sm [field-sizing:content] placeholder:text-fd-muted-foreground focus:outline-none"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={stop}
              aria-label={content.stop}
              title={content.stop}
              className={`${ROUND_BUTTON} bg-fd-primary text-fd-primary-foreground hover:bg-[var(--oo-brand-hover)]`}
            >
              <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden="true">
                <rect x="5" y="5" width="14" height="14" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label={content.send}
              title={content.send}
              className={`${ROUND_BUTTON} bg-[var(--oo-brand)]/10 text-[var(--oo-brand)] enabled:hover:bg-[var(--oo-brand)]/20`}
            >
              <Icon>
                <path d="m5 12 7-7 7 7M12 19V5" />
              </Icon>
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-fd-muted-foreground">{content.disclaimer}</p>
      </form>
    </dialog>
  );
}

function AssistantMessage({ message, waiting }: { message: AiChatMessage; waiting: boolean }) {
  const sources = citedSources(message);
  return (
    <div>
      {message.content ? (
        <div
          className="oo-ai-answer prose max-w-none break-words text-sm"
          dangerouslySetInnerHTML={{ __html: renderAnswer(message.content, message.sources ?? []) }}
        />
      ) : waiting ? (
        <p className="animate-pulse text-sm text-fd-muted-foreground">{content.thinking}</p>
      ) : null}
      {message.error && (
        <p role="alert" className="mt-2 text-sm text-fd-muted-foreground">
          {message.error}
        </p>
      )}
      {sources.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-fd-muted-foreground">{content.sources}</p>
          <ol className="mt-1 flex flex-col gap-1">
            {sources.map((source) => (
              <li key={source.id} className="flex gap-1.5 text-xs">
                <span className="text-fd-muted-foreground">{source.id}.</span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--oo-brand)] hover:underline"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
