import { createFileRoute } from "@tanstack/react-router";
import { chatCompletion } from "@/lib/ai-gateway.server";

type Body = {
  job?: { title?: string; company?: string; requirements?: string[]; description?: string };
  candidate?: string;
  transcript?: Array<{ role: "assistant" | "user"; content: string }>;
  timeUp?: boolean;
};

export const Route = createFileRoute("/api/interview")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const job = body.job;
        if (!job?.title || !Array.isArray(job.requirements)) {
          return new Response("A job with requirements is required", { status: 400 });
        }

        const transcript = Array.isArray(body.transcript) ? body.transcript.slice(-40) : [];
        const answered = transcript.filter((m) => m.role === "user").length;

        const system = [
          `You are the automated first-round interviewer for ${job.company ?? "the company"}, hiring a ${job.title}.`,
          `Role summary: ${job.description ?? "n/a"}`,
          `The company's requirements are:`,
          ...job.requirements.map((r, i) => `${i + 1}. ${r}`),
          "",
          "Conduct a short conversational interview. Ask exactly ONE question per turn, each mapped to a requirement, and probe briefly when an answer is vague.",
          "Ask at most 6 questions in total. After the candidate has answered every requirement (or the time is up), finish the interview and judge whether the candidate meets the company's requirements.",
          "Judge honestly: matched = true only when the candidate clearly demonstrates the majority of requirements, including the essential ones.",
          body.timeUp
            ? "TIME IS UP. You must finish now: set done=true and produce the verdict from whatever was said."
            : `Questions answered so far: ${answered}.`,
          "",
          'Reply with JSON only: {"reply": string, "question": string | null, "done": boolean, "verdict": null | {"matched": boolean, "score": number, "summary": string, "strengths": string[], "gaps": string[]}}',
          "`reply` is a short spoken line to the candidate (1-2 sentences). When done=false, `question` is your next question and verdict is null. When done=true, `question` is null and `verdict` is filled in, with score 0-100.",
        ].join("\n");

        const messages = [
          { role: "system" as const, content: system },
          ...(transcript.length === 0
            ? [
                {
                  role: "user" as const,
                  content: `Candidate ${body.candidate ?? "the candidate"} has joined. Greet them briefly and ask your first question.`,
                },
              ]
            : transcript.map((m) => ({
                role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
                content: m.content,
              }))),
        ];

        const result = await chatCompletion(messages, { json: true });
        if (!result.ok) {
          return Response.json({ error: result.error }, { status: result.status });
        }

        try {
          const parsed = JSON.parse(result.text);
          return Response.json(parsed);
        } catch {
          return Response.json({
            reply: result.text || "Let's continue.",
            question: null,
            done: false,
            verdict: null,
          });
        }
      },
    },
  },
});
