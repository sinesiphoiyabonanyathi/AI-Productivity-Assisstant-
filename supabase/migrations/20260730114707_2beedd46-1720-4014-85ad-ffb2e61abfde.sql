CREATE TABLE public.generated_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  recipient TEXT NOT NULL DEFAULT '',
  purpose TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'professional',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.generated_emails TO authenticated;
GRANT ALL ON public.generated_emails TO service_role;
ALTER TABLE public.generated_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own emails" ON public.generated_emails
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.task_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  goal TEXT NOT NULL,
  command TEXT NOT NULL DEFAULT '',
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_plans TO authenticated;
GRANT ALL ON public.task_plans TO service_role;
ALTER TABLE public.task_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own plans" ON public.task_plans
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX generated_emails_user_created_idx ON public.generated_emails (user_id, created_at DESC);
CREATE INDEX task_plans_user_created_idx ON public.task_plans (user_id, created_at DESC);