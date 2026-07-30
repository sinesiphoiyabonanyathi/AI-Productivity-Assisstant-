import { chatCompletion } from "./ai-gateway.server";

export type EmailDraft = { subject: string; body: string };
export type PlanTask = {
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
  estimate: string;
};
export type PlanDraft = { goal: string; tasks: PlanTask[] };

function parseJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function draftEmail(input: {
  recipient: string;
  purpose: string;
  tone: string;
  context: string;
}): Promise<EmailDraft> {
  const result = await chatCompletion(
    [
      {
        role: "system",
        content:
          'You are a recruiting-operations email writer. Return strict JSON only: {"subject": string, "body": string}. The body is plain text with paragraph breaks, no markdown, no placeholder brackets unless truly unavoidable.',
      },
      {
        role: "user",
        content: [
          `Recipient: ${input.recipient || "the recipient"}`,
          `Tone: ${input.tone}`,
          `Purpose: ${input.purpose}`,
          input.context ? `Extra context: ${input.context}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ],
    { json: true },
  );

  if (!result.ok) throw new Error(result.error);

  try {
    const parsed = parseJson(result.text) as Partial<EmailDraft>;
    return {
      subject: String(parsed.subject ?? "Draft email"),
      body: String(parsed.body ?? result.text),
    };
  } catch {
    return { subject: "Draft email", body: result.text };
  }
}

export async function draftPlan(command: string): Promise<PlanDraft> {
  const result = await chatCompletion(
    [
      {
        role: "system",
        content:
          'You are a task planner. Turn the user request (which may be a transcribed voice command) into an ordered, actionable plan. Return strict JSON only: {"goal": string, "tasks": [{"title": string, "detail": string, "priority": "high"|"medium"|"low", "estimate": string}]}. Use 3-7 tasks. "estimate" is short, e.g. "30 min" or "2 days".',
      },
      { role: "user", content: command },
    ],
    { json: true },
  );

  if (!result.ok) throw new Error(result.error);

  const parsed = parseJson(result.text) as Partial<PlanDraft>;
  const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
  return {
    goal: String(parsed.goal ?? command).slice(0, 300),
    tasks: tasks.slice(0, 12).map((t) => ({
      title: String(t?.title ?? "Task"),
      detail: String(t?.detail ?? ""),
      priority: (["high", "medium", "low"] as const).includes(t?.priority as never)
        ? (t.priority as PlanTask["priority"])
        : "medium",
      estimate: String(t?.estimate ?? ""),
    })),
  };
}
