import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, MessagesSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { useHiring, type ChatMessage } from "@/lib/hiring-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AiDisclaimer } from "@/components/ai-disclaimer";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Interview coach — HireLoop" },
      {
        name: "description",
        content:
          "Ask anything about the automated interview: how it is scored, how to answer, and how to prepare for a role.",
      },
      { property: "og:title", content: "Interview coach — HireLoop" },
      {
        property: "og:description",
        content: "A always-on Q&A assistant for candidates and employees preparing for interviews.",
      },
    ],
  }),
  component: Assistant,
});

const starters = [
  "How does the timed AI interview work?",
  "How should I structure an answer about a project I led?",
  "What if I don't meet one of the requirements?",
  "Give me 5 practice questions for a data analyst role.",
];

function Assistant() {
  const { chat, setChat } = useHiring();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat, busy]);

  useEffect(() => {
    if (!busy) inputRef.current?.focus();
  }, [busy]);

  const ask = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: question };
    const history = [...chat, userMsg];
    setChat(() => history);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || data.error) {
        toast.error(data.error ?? "The coach could not answer right now.");
        return;
      }
      setChat((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: data.reply ?? "" },
      ]);
    } catch {
      toast.error("Network problem — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/20 text-accent">
          <MessagesSquare className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Interview coach</h1>
          <p className="text-sm text-muted-foreground">
            One ongoing conversation for every interview question you have.
          </p>
        </div>
      </div>

      <AiDisclaimer className="mt-4" />


      <div className="panel mt-6 flex min-h-[62vh] flex-col">
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-6">
          {chat.length === 0 ? (
            <div>
              <p className="text-sm text-muted-foreground">
                Ask me anything about preparing for, or getting through, an automated interview.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {starters.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs text-foreground/90 transition-colors hover:border-primary/60 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {chat.map((m) =>
            m.role === "assistant" ? (
              <div key={m.id} className="max-w-[88%]">
                <p className="mb-1 text-xs font-medium text-accent">Coach</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {m.content}
                </p>
              </div>
            ) : (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
                  {m.content}
                </div>
              </div>
            ),
          )}

          {busy ? (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
            </p>
          ) : null}
        </div>

        <div className="border-t border-border/70 p-4">
          <div className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void ask(input);
                }
              }}
              placeholder="Ask about the interview, a role, or how to answer…"
              className="resize-none"
              disabled={busy}
            />
            <Button size="icon" onClick={() => void ask(input)} disabled={busy || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
