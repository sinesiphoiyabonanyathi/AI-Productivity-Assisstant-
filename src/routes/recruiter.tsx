import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Inbox, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useHiring } from "@/lib/hiring-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/recruiter")({
  head: () => ({
    meta: [
      { title: "Recruiter workspace — HireLoop" },
      {
        name: "description",
        content:
          "Post a role with its exact requirements and get notified the moment a candidate passes the automated interview.",
      },
      { property: "og:title", content: "Recruiter workspace — HireLoop" },
      {
        property: "og:description",
        content: "Define requirements once; the AI interviewer screens every applicant against them.",
      },
    ],
  }),
  component: Recruiter,
});

function Recruiter() {
  const { addJob, notifications } = useHiring();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Full-time");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [minutes, setMinutes] = useState(10);
  const [requirements, setRequirements] = useState<string[]>(["", ""]);

  const setReq = (i: number, v: string) =>
    setRequirements((prev) => prev.map((r, idx) => (idx === i ? v : r)));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = requirements.map((r) => r.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      toast.error("Add at least one requirement — the interviewer asks about each one.");
      return;
    }
    const job = addJob({
      title: title.trim(),
      company: company.trim(),
      location: location.trim() || "Remote",
      type,
      salary: salary.trim() || "Competitive",
      description: description.trim(),
      requirements: cleaned,
      interviewMinutes: Math.min(30, Math.max(3, Number(minutes) || 10)),
    });
    toast.success(`${job.title} is live — candidates can interview now.`);
    setTitle("");
    setCompany("");
    setLocation("");
    setSalary("");
    setDescription("");
    setRequirements(["", ""]);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 lg:grid-cols-[1.15fr_1fr]">
      <section className="panel p-6">
        <h1 className="text-2xl font-bold">Post a role</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every requirement becomes an interview question. Candidates are only forwarded to you when
          they meet them.
        </p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Job title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote — EU"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Employment type</Label>
              <Input id="type" value={type} onChange={(e) => setType(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salary">Salary range</Label>
              <Input
                id="salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="€60,000 – €70,000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minutes">Interview length (minutes)</Label>
              <Input
                id="minutes"
                type="number"
                min={3}
                max={30}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Role description</Label>
            <Textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Requirements</Label>
            {requirements.map((r, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={r}
                  onChange={(e) => setReq(i, e.target.value)}
                  placeholder={`Requirement ${i + 1}`}
                />
                {requirements.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setRequirements((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRequirements((prev) => [...prev, ""])}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add requirement
            </Button>
          </div>

          <Button type="submit" className="w-full">
            Publish role
          </Button>
        </form>
      </section>

      <section className="panel h-fit p-6">
        <div className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Matched candidates</h2>
          <span className="ml-auto text-sm text-muted-foreground">{notifications.length}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Messages generated automatically when a candidate meets your requirements.
        </p>

        {notifications.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No matches yet. Try an interview from the{" "}
            <Link to="/" className="text-primary underline-offset-2 hover:underline">
              job board
            </Link>{" "}
            to see it arrive here.
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {notifications.map((n) => (
              <li key={n.id} className="rounded-xl border border-primary/40 bg-primary/10 p-4">
                <p className="text-sm font-medium text-primary">
                  We found an employee for you for the {n.jobTitle} role
                </p>
                <p className="mt-1 text-sm">
                  {n.candidate} · match score {n.verdict.score}/100 · {n.company}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{n.verdict.summary}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleTimeString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
