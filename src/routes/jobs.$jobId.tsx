import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, BadgeEuro, Clock, MapPin } from "lucide-react";
import { useHiring } from "@/lib/hiring-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/jobs/$jobId")({
  head: () => ({
    meta: [
      { title: "Role details — HireLoop" },
      {
        name: "description",
        content: "Full requirements for this role, plus an instant timed AI interview when you apply.",
      },
      { property: "og:title", content: "Role details — HireLoop" },
      {
        property: "og:description",
        content: "Read the requirements and start your automated interview right away.",
      },
    ],
  }),
  component: JobDetail,
});

function JobDetail() {
  const { jobId } = Route.useParams();
  const { getJob } = useHiring();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const job = getJob(jobId);

  if (!job) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="text-2xl font-semibold">This role is no longer listed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Roles posted in this session disappear on refresh.
        </p>
        <Link to="/" className="mt-6 inline-block text-sm font-medium text-primary">
          Back to all jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All jobs
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="panel p-6">
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="mt-1 text-muted-foreground">
            {job.company} · {job.type}
          </p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BadgeEuro className="h-4 w-4" /> {job.salary}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {job.interviewMinutes} min interview
            </span>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-foreground/90">{job.description}</p>

          <h2 className="mt-8 text-lg font-semibold">What the company requires</h2>
          <ul className="mt-3 space-y-2.5">
            {job.requirements.map((r, i) => (
              <li key={r} className="flex gap-3 text-sm text-foreground/90">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-primary/15 text-[11px] font-semibold text-primary">
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        <aside className="panel h-fit p-6">
          <h2 className="text-lg font-semibold">Apply &amp; interview now</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Applying starts your automated interview immediately. You'll have{" "}
            {job.interviewMinutes} minutes and one question per requirement.
          </p>

          <form
            className="mt-5 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({
                to: "/interview/$jobId",
                params: { jobId: job.id },
                search: { name: name.trim() || "Candidate" },
              });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Moreau"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Apply and start interview
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            Nervous? Ask the{" "}
            <Link to="/assistant" className="text-primary underline-offset-2 hover:underline">
              interview coach
            </Link>{" "}
            first.
          </p>
        </aside>
      </div>
    </div>
  );
}
