import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, Sparkle } from "lucide-react";
import { useHiring } from "@/lib/hiring-store";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Open roles — HireLoop" },
      {
        name: "description",
        content:
          "Browse open roles with full requirements and start a timed AI interview the moment you apply.",
      },
      { property: "og:title", content: "Open roles — HireLoop" },
      {
        property: "og:description",
        content: "Apply and interview in one sitting. Recruiters hear from us only when you match.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { jobs } = useHiring();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <section className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkle className="h-3.5 w-3.5" /> Apply, then interview instantly
        </span>
        <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
          Every application starts a real interview — not a waiting queue.
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Pick a role, read exactly what the company requires, and hit apply. A timed AI interviewer
          walks you through the requirements one by one. If you meet them, the company gets a message
          the same minute.
        </p>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold">Open roles</h2>
          <span className="text-sm text-muted-foreground">{jobs.length} live</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to="/jobs/$jobId"
              params={{ jobId: job.id }}
              className="panel group flex flex-col p-5 transition-colors hover:border-primary/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
                <Badge className="bg-secondary text-secondary-foreground">{job.type}</Badge>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>

              <ul className="mt-4 space-y-1.5">
                {job.requirements.slice(0, 3).map((r) => (
                  <li key={r} className="flex gap-2 text-sm text-foreground/85">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {r}
                  </li>
                ))}
                {job.requirements.length > 3 ? (
                  <li className="pl-3 text-xs text-muted-foreground">
                    +{job.requirements.length - 3} more requirements
                  </li>
                ) : null}
              </ul>

              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border/70 pt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {job.interviewMinutes} min interview
                </span>
                <span className="ml-auto inline-flex items-center gap-1 font-medium text-primary">
                  View role
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
