import { createFileRoute } from "@tanstack/react-router";
import { chatCompletion } from "@/lib/ai-gateway.server";

type Body = { messages?: Array<{ role: "user" | "assistant"; content: string }> };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          return new Response("Messages are required", { status: 400 });
        }

        const system = [
          "You are the HireLoop Interview Coach, an assistant inside a recruiting app.",
          "You help candidates and employees prepare for automated first-round interviews: what to expect, how the timed interview works, how to structure answers (STAR), how to talk about gaps, salary questions, and role-specific practice questions.",
          "Be warm, direct and practical. Keep answers under 180 words unless the user asks for depth. Use short markdown-free paragraphs or simple dashes for lists.",
          "If asked something unrelated to work, hiring, or interviews, answer briefly and steer back to interview preparation.",
        ].join(" ");

        const result = await chatCompletion(
          [
            { role: "system", content: system },
            ...body.messages.slice(-30).map((m) => ({
              role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
              content: String(m.content ?? ""),
            })),
          ],
        );

        if (!result.ok) {
          return Response.json({ error: result.error }, { status: result.status });
        }
        return Response.json({ reply: result.text });
      },
    },
  },
});
