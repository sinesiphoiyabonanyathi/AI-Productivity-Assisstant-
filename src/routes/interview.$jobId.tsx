import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Circle, Loader2, Send, Timer, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useHiring, type Verdict } from "@/lib/hiring-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Turn = { role: "assistant" | "user"; content: string };

type InterviewResponse = {
  reply?: string;
  question?: string | null;
  done?: boolean;
  verdict?: Verdict | null;
  error?: string;
};

export const Route = createFileRoute("/interview/$jobId")({
  validateSearch: (search: Record<string, unknown>) => ({
    name: typeof search.name === "string" && search.name ? search.name : "Candidate",
  }),
  head: () => ({
    meta: [
      { title: "Live AI interview — HireLoop" },
      {
        name: "description",
        content:
          "Your timed automated interview: one question per requirement, with a live timeline and instant result.",
      },
      { property: "og:title", content: "Live AI interview — HireLoop" },
      {
        property: "og:description",
        content: "A timed first-round interview that reports straight back to the company.",
      },
    ],
  }),
  component: InterviewRoom,
});

function formatClock(seconds: number) {
  const m = Math.floor(Math.max(seconds, 0) / 60);
  const s = Math.max(seconds, 0) % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function InterviewRoom() {
  const { jobId } = Route.useParams();
  const { name } = Route.useSearch();
  const { getJob, notifyCompany } = useHiring();
  const navigate = useNavigate();
  const job = getJob(jobId);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [secondsLeft, setSecondsLeft] = useState((job?.interviewMinutes ?? 10) * 60);
  const started = useRef(false);
  const finished = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const send = useCallback(
    async (nextTurns: Turn[], timeUp = false) => {
      if (!job || finished.current) return;
      setBusy(true);
      try {
        const res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            job: {
              title: job.title,
              company: job.company,
              description: job.description,
              requirements: job.requirements,
            },
            candidate: name,
            transcript: nextTurns,
            timeUp,
          }),
        });
        const data = (await res.json()) as InterviewResponse;
        if (!res.ok || data.error) {
          toast.error(data.error ?? "The interviewer could not respond. Try again.");
          return;
        }

        const spoken = [data.reply, data.question].filter(Boolean).join("\n\n");
        if (spoken) setTurns((prev) => [...prev, { role: "assistant", content: spoken }]);

        if (data.done && data.verdict) {
          finished.current = true;
          setVerdict(data.verdict);
          if (data.verdict.matched) {
            notifyCompany({
              jobId: job.id,
              jobTitle: job.title,
              company: job.company,
              candidate: name,
              verdict: data.verdict,
            });
            toast.success(`Message sent to ${job.company}: we found an employee for this role.`);
          }
        }
      } catch {
        toast.error("Network problem — your answer was not sent.");
      } finally {
        setBusy(false);
      }
    },
    [job, name, notifyCompany],
  );

  useEffect(() => {
    if (!job || started.current) return;
    started.current = true;
    void send([]);
  }, [job, send]);

  useEffect(() => {
    if (!job || verdict) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          if (!finished.current) void send(turns, true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [job, verdict, turns, send]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy]);

  useEffect(() => {
    if (!busy && !verdict) inputRef.current?.focus();
  }, [busy, verdict]);

  if (!job) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="text-2xl font-semibold">Interview unavailable</h1>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-primary">
          Back to all jobs
        </Link>
      </div>
    );
  }

  const answered = turns.filter((t) => t.role === "user").length;
  const total = job.interviewMinutes * 60;
  const progress = Math.min(100, Math.round(((total - secondsLeft) / total) * 100));
  const low = secondsLeft <= 60;

  const submit = () => {
    const text = answer.trim();
    if (!text || busy || verdict) return;
    const next: Turn[] = [...turns, { role: "user", content: text }];
    setTurns(next);
    setAnswer("");
    void send(next);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[300px_1fr]">
      <aside className="panel h-fit p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Interviewing for</p>
        <h1 className="mt-1 text-lg font-semibold">{job.title}</h1>
        <p className="text-sm text-muted-foreground">{job.company}</p>

        <div className="mt-5 rounded-lg border border-border/70 bg-secondary/40 p-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Timer className="h-3.5 w-3.5" /> Time remaining
            </span>
            <span
              className={`font-display text-lg font-semibold ${low ? "text-destructive" : "text-primary"}`}
            >
              {formatClock(secondsLeft)}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${low ? "bg-destructive" : "bg-primary"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="mt-6 text-xs uppercase tracking-wide text-muted-foreground">Timeline</p>
        <ol className="mt-3 space-y-3">
          {job.requirements.map((r, i) => {
            const done = verdict ? true : i < answered;
            const active = !verdict && i === answered;
            return (
              <li key={r} className="flex gap-2.5">
                {done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Circle
                    className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-accent" : "text-muted-foreground/60"}`}
                  />
                )}
                <span
                  className={`text-xs leading-snug ${
                    active
                      ? "text-foreground"
                      : done
                        ? "text-muted-foreground line-through"
                        : "text-muted-foreground"
                  }`}
                >
                  {r}
                </span>
              </li>
            );
          })}
          <li className="flex gap-2.5">
            {verdict ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
            )}
            <span className="text-xs leading-snug text-muted-foreground">
              Decision sent to {job.company}
            </span>
          </li>
        </ol>
      </aside>

      <section className="panel flex min-h-[70vh] flex-col">
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-6">
          {turns.map((t, i) => (
            <div key={i} className={t.role === "user" ? "flex justify-end" : ""}>
              {t.role === "assistant" ? (
                <div className="max-w-[85%]">
                  <p className="mb-1 text-xs font-medium text-primary">AI Interviewer</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {t.content}
                  </p>
                </div>
              ) : (
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
                  {t.content}
                </div>
              )}
            </div>
          ))}

          {busy ? (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> The interviewer is thinking…
            </p>
          ) : null}

          {verdict ? (
            <div
              className={`rounded-xl border p-5 ${
                verdict.matched
                  ? "border-primary/50 bg-primary/10"
                  : "border-border bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-2">
                {verdict.matched ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <h2 className="text-base font-semibold">
                  {verdict.matched
                    ? `Match — ${job.company} has been notified`
                    : "Not a match this time"}
                </h2>
                <span className="ml-auto font-display text-sm text-muted-foreground">
                  {verdict.score}/100
                </span>
              </div>

              {verdict.matched ? (
                <p className="mt-3 rounded-lg border border-primary/40 bg-background/40 p-3 text-sm">
                  <span className="font-medium text-primary">Message sent to {job.company}:</span> “We
                  found an employee for you for the {job.title} role — {name} met your requirements in
                  the automated interview.”
                </p>
              ) : null}

              <p className="mt-3 text-sm text-foreground/90">{verdict.summary}</p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Strengths</p>
                  <ul className="mt-1.5 space-y-1 text-sm">
                    {verdict.strengths?.map((s) => <li key={s}>· {s}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Gaps</p>
                  <ul className="mt-1.5 space-y-1 text-sm">
                    {verdict.gaps?.length ? verdict.gaps.map((g) => <li key={g}>· {g}</li>) : <li>· None noted</li>}
                  </ul>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => navigate({ to: "/" })}>
                  Browse more jobs
                </Button>
                <Button variant="outline" onClick={() => navigate({ to: "/recruiter" })}>
                  See the recruiter inbox
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {!verdict ? (
          <div className="border-t border-border/70 p-4">
            <div className="flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder="Type your answer… (Enter to send)"
                rows={2}
                className="resize-none"
                disabled={busy}
              />
              <Button size="icon" onClick={submit} disabled={busy || !answer.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
