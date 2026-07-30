import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Mic, MicOff, Trash2, Wand2 } from "lucide-react";
import { createPlan, deletePlan, listPlans } from "@/lib/workspace.functions";
import { useVoiceInput } from "@/lib/use-voice-input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type PlanTask = { title: string; detail: string; priority: string; estimate: string };

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "AI task planner with voice — HireLoop" },
      {
        name: "description",
        content:
          "Speak or type a goal and get an ordered, prioritised task plan saved to your account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "AI task planner with voice — HireLoop" },
      {
        property: "og:description",
        content: "Turn a spoken command into a prioritised task plan.",
      },
      { name: "twitter:title", content: "AI task planner with voice — HireLoop" },
      {
        name: "twitter:description",
        content: "Turn a spoken command into a prioritised task plan.",
      },
    ],
  }),
  component: PlannerPage,
});

const priorityClass: Record<string, string> = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-primary/15 text-primary",
  low: "bg-secondary text-muted-foreground",
};

function PlannerPage() {
  const queryClient = useQueryClient();
  const fetchPlans = useServerFn(listPlans);
  const generate = useServerFn(createPlan);
  const remove = useServerFn(deletePlan);
  const [command, setCommand] = useState("");

  const voice = useVoiceInput((text) => {
    setCommand((prev) => (prev ? `${prev} ${text}` : text));
  });

  const plans = useQuery({ queryKey: ["plans"], queryFn: () => fetchPlans({}) });

  const createMutation = useMutation({
    mutationFn: () => generate({ data: { command } }),
    onSuccess: () => {
      setCommand("");
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plan ready");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Planning failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plans"] }),
  });

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <header>
        <h1 className="font-display text-3xl font-semibold">AI task planner</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hit the mic and say something like “plan the hiring loop for a senior frontend engineer
          next week”, or type it instead.
        </p>
      </header>

      <AiDisclaimer className="mt-5" />


      <form
        className="mt-8 rounded-2xl border border-border/70 bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (command.trim().length < 3) {
            toast.error("Say or type what you want planned.");
            return;
          }
          createMutation.mutate();
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Your command</span>
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
            {voice.listening ? "Stop listening" : "Speak"}
          </Button>
        </div>
        <Textarea
          className="mt-3"
          rows={4}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Plan onboarding for two new recruiters starting Monday…"
        />
        {voice.listening && (
          <p className="mt-2 text-xs text-primary">Listening… speak now.</p>
        )}
        {voice.error && <p className="mt-2 text-xs text-destructive">{voice.error}</p>}
        {!voice.supported && !voice.error && (
          <p className="mt-2 text-xs text-muted-foreground">
            Voice commands need Chrome or Edge — typing works everywhere.
          </p>
        )}
        <Button type="submit" className="mt-4 w-full" disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Build my plan
        </Button>
      </form>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-lg font-semibold">Saved plans</h2>
        {plans.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {plans.data?.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            No plans yet — your first one will appear here.
          </p>
        )}
        {plans.data?.map((plan) => (
          <article key={plan.id} className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">{plan.goal}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">“{plan.command}”</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Delete plan"
                onClick={() => deleteMutation.mutate(plan.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <ol className="mt-4 space-y-3">
              {((plan.tasks ?? []) as unknown as PlanTask[]).map((task, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-secondary/40 p-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-background text-xs font-semibold">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{task.title}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${priorityClass[task.priority] ?? priorityClass.low}`}
                      >
                        {task.priority}
                      </span>
                      {task.estimate && (
                        <span className="text-[11px] text-muted-foreground">{task.estimate}</span>
                      )}
                    </div>
                    {task.detail && (
                      <p className="mt-1 text-sm text-muted-foreground">{task.detail}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </section>
    </div>
  );
}
