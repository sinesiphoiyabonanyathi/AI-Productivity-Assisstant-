import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2, Mic, MicOff, Sparkles, Trash2 } from "lucide-react";
import { createEmail, deleteEmail, listEmails } from "@/lib/workspace.functions";
import { useVoiceInput } from "@/lib/use-voice-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TONES = ["professional", "warm", "concise", "enthusiastic", "formal"];

export const Route = createFileRoute("/_authenticated/emails")({
  head: () => ({
    meta: [
      { title: "Smart email generator — HireLoop" },
      {
        name: "description",
        content:
          "Generate recruiting emails in seconds: pick a recipient, purpose and tone, and save every draft to your account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Smart email generator — HireLoop" },
      {
        property: "og:description",
        content: "Generate and save recruiting emails with AI.",
      },
      { name: "twitter:title", content: "Smart email generator — HireLoop" },
      { name: "twitter:description", content: "Generate and save recruiting emails with AI." },
    ],
  }),
  component: EmailsPage,
});

function EmailsPage() {
  const queryClient = useQueryClient();
  const fetchEmails = useServerFn(listEmails);
  const generate = useServerFn(createEmail);
  const remove = useServerFn(deleteEmail);

  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState("professional");
  const [context, setContext] = useState("");

  const voice = useVoiceInput((text) =>
    setContext((prev) => (prev ? `${prev} ${text}` : text)),
  );

  const emails = useQuery({ queryKey: ["emails"], queryFn: () => fetchEmails({}) });

  const createMutation = useMutation({
    mutationFn: () => generate({ data: { recipient, purpose, tone, context } }),
    onSuccess: () => {
      setPurpose("");
      setContext("");
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      toast.success("Draft ready");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Generation failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["emails"] }),
  });

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <header>
        <h1 className="font-display text-3xl font-semibold">Smart email generator</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Describe what you need to say. Every draft is saved to your account.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form
          className="space-y-4 rounded-2xl border border-border/70 bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (purpose.trim().length < 3) {
              toast.error("Tell the generator what the email is about.");
              return;
            }
            createMutation.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Maya, candidate for Senior Frontend Engineer"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Invite to a second-round interview"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tone">Tone</Label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize"
            >
              {TONES.map((t) => (
                <option key={t} value={t} className="capitalize">
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="context">Extra context</Label>
              <Button
                type="button"
                size="sm"
                variant={voice.listening ? "default" : "outline"}
                onClick={voice.listening ? voice.stop : voice.start}
              >
                {voice.listening ? (
                  <MicOff className="mr-1.5 h-3.5 w-3.5" />
                ) : (
                  <Mic className="mr-1.5 h-3.5 w-3.5" />
                )}
                {voice.listening ? "Stop" : "Dictate"}
              </Button>
            </div>
            <Textarea
              id="context"
              rows={5}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Times offered, interviewers, anything the email should mention…"
            />
            {voice.error && <p className="text-xs text-destructive">{voice.error}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate email
          </Button>
        </form>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Saved drafts</h2>
          {emails.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {emails.data?.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Nothing yet — your generated emails will collect here.
            </p>
          )}
          {emails.data?.map((mail) => (
            <article key={mail.id} className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">{mail.subject}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {mail.recipient || "No recipient"} · {mail.tone}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Copy email"
                    onClick={() => {
                      navigator.clipboard.writeText(`${mail.subject}\n\n${mail.body}`);
                      toast.success("Copied");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Delete email"
                    onClick={() => deleteMutation.mutate(mail.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{mail.body}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
