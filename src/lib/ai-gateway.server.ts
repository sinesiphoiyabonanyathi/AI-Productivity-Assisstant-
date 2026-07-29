const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.6-flash";

export type GatewayMessage = { role: "system" | "user" | "assistant"; content: string };

export async function chatCompletion(
  messages: GatewayMessage[],
  options?: { json?: boolean },
): Promise<{ ok: true; text: string } | { ok: false; status: number; error: string }> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return { ok: false, status: 500, error: "AI is not configured." };

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(options?.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`AI gateway failed [${response.status}]: ${body}`);
    const error =
      response.status === 429
        ? "Too many requests right now — please try again in a moment."
        : response.status === 402
          ? "AI credits are exhausted for this workspace."
          : "The AI service could not be reached.";
    return { ok: false, status: response.status, error };
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return { ok: true, text: data.choices?.[0]?.message?.content ?? "" };
}
