import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const emailInput = z.object({
  recipient: z.string().max(200).default(""),
  purpose: z.string().min(3).max(2000),
  tone: z.string().max(50).default("professional"),
  context: z.string().max(4000).default(""),
});

const planInput = z.object({ command: z.string().min(3).max(4000) });
const idInput = z.object({ id: z.string().uuid() });

export const listEmails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("generated_emails")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => emailInput.parse(input))
  .handler(async ({ data, context }) => {
    const { draftEmail } = await import("./workspace.server");
    const draft = await draftEmail(data);
    const { data: row, error } = await context.supabase
      .from("generated_emails")
      .insert({
        user_id: context.userId,
        recipient: data.recipient,
        purpose: data.purpose,
        tone: data.tone,
        subject: draft.subject,
        body: draft.body,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("generated_emails")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("task_plans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => planInput.parse(input))
  .handler(async ({ data, context }) => {
    const { draftPlan } = await import("./workspace.server");
    const plan = await draftPlan(data.command);
    const { data: row, error } = await context.supabase
      .from("task_plans")
      .insert({
        user_id: context.userId,
        goal: plan.goal,
        command: data.command,
        tasks: plan.tasks,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deletePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("task_plans").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
