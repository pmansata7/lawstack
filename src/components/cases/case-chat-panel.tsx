"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const STARTER_PROMPTS = [
  "What should I complete in setup before moving on?",
  "What facts or documents should I gather next?",
  "Which legal elements look thin so far?",
];

function storageKey(caseId: string) {
  return `lawstack-case-chat-${caseId}`;
}

function ChatBody({
  caseId,
  className,
}: {
  caseId: string;
  className?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey(caseId));
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch {
      /* ignore */
    }
    hydrated.current = true;
  }, [caseId]);

  useEffect(() => {
    if (!hydrated.current) return;
    sessionStorage.setItem(storageKey(caseId), JSON.stringify(messages));
  }, [caseId, messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch(`/api/cases/${caseId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Could not get a response",
          );
        }
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: String(data.reply ?? ""),
          },
        ]);
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        setInput(trimmed);
        toast.error(
          err instanceof Error ? err.message : "Chat request failed",
        );
      } finally {
        setLoading(false);
      }
    },
    [caseId, loading, messages],
  );

  const showWelcome = messages.length === 0 && !loading;

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-white", className)}>
      <div className="border-b border-navy-950/10 px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          Case assistant
        </p>
        <p className="mt-0.5 text-[13px] text-ink-600">
          Ask about this matter, procedure, or next steps.
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {showWelcome && (
          <div className="space-y-3">
            <p className="text-[14px] leading-relaxed text-ink-600">
              Start with a question—or pick a prompt. Answers use what&apos;s
              already in this case file.
            </p>
            <div className="flex flex-col gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  className="rounded-md border border-navy-950/10 bg-paper px-3 py-2 text-left text-[13px] text-navy-950 transition-colors hover:bg-tint"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <ul className="space-y-4">
          {messages.map((msg) => (
            <li
              key={msg.id}
              className={cn(
                "text-[14px] leading-relaxed",
                msg.role === "user" ? "text-right" : "text-left",
              )}
            >
              <span
                className={cn(
                  "inline-block max-w-[95%] rounded-md px-3 py-2 text-left",
                  msg.role === "user"
                    ? "bg-navy-950 text-white"
                    : "border border-navy-950/10 bg-paper text-navy-950",
                )}
              >
                {msg.content}
              </span>
            </li>
          ))}
          {loading && (
            <li className="flex items-center gap-2 text-[13px] text-ink-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking…
            </li>
          )}
        </ul>
      </div>

      <form
        className="border-t border-navy-950/10 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this case…"
          rows={3}
          className="min-h-[72px] resize-none rounded-md border-navy-950/15 bg-paper text-[14px]"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
        />
        <div className="mt-2 flex justify-end">
          <Button
            type="submit"
            size="sm"
            className="h-9 gap-1.5 rounded-md bg-navy-950 hover:bg-navy-900"
            disabled={loading || !input.trim()}
          >
            <Send className="h-3.5 w-3.5" />
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}

export function CaseChatPanel({ caseId }: { caseId: string }) {
  return (
    <>
      <div className="hidden h-full w-[22rem] shrink-0 border-l border-navy-950/10 lg:flex lg:flex-col">
        <ChatBody caseId={caseId} className="h-full" />
      </div>

      <div className="fixed right-4 bottom-4 z-40 lg:hidden">
        <MobileCaseChat caseId={caseId} />
      </div>
    </>
  );
}

function MobileCaseChat({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="lg"
        className="h-12 rounded-full bg-navy-950 px-5 shadow-hard hover:bg-navy-900"
        onClick={() => setOpen(true)}
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        Ask
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between border-b border-navy-950/10 px-4 py-3">
            <span className="text-[15px] font-semibold text-navy-950">
              Case assistant
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
          <div className="min-h-0 flex-1">
            <ChatBody caseId={caseId} className="h-full" />
          </div>
        </div>
      )}
    </>
  );
}
