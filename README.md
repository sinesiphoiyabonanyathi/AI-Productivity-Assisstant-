# Talent Spark Interview

**Live app**: https://talent-spark-interview-27.lovable.app

Talent Spark Interview is an AI-powered recruiting platform that connects candidates with open roles and automates the early stages of the hiring process. Recruiters can post jobs, candidates can apply and immediately enter a timed, AI-guided interview, and both sides get access to workspace tools such as a smart email generator and an AI task planner.

This project was built with [Lovable](https://lovable.dev).

---

## Project overview

The application is split into two primary experiences:

- **Candidate experience** — Browse open roles, view job details, apply, and complete an automatic online interview with a real-time timeline and AI-generated feedback.
- **Recruiter / workspace experience** — Post jobs, review matched candidates, generate professional recruiting emails, and create prioritized task plans from typed or voice commands.

All AI-generated content includes a responsible-AI disclaimer, and the workspace features require authentication so each user's emails and plans are saved privately to their account.

---

## Features

### Candidate features
- **Job board** — Browse open roles with salary, location, and requirement summaries.
- **Job detail page** — Read the full description and requirements before applying.
- **Automatic timed interview** — Starts immediately after applying; includes a countdown timer, requirement timeline, and one AI question per requirement.
- **AI interview verdict** — Receives a match score, strengths, gaps, and a short summary at the end of the interview.
- **Interview coach chatbot** — Ask questions and get guidance to prepare for interviews.

### Recruiter & workspace features
- **Recruiter dashboard** — Post new roles and view candidate notifications with AI verdicts.
- **Smart email generator** — Generate professional recruiting emails by recipient, purpose, tone, and context; save, copy, and delete drafts.
- **AI task planner** — Turn typed or voice commands into prioritized, time-estimated task plans.
- **Persistent workspace** — Generated emails and task plans are stored per user and protected by authentication.

### Platform features
- **Authentication** — Email/password and Google sign-in via Lovable Cloud auth.
- **Responsive dashboard layout** — Collapsible sidebar on desktop, off-canvas drawer on mobile.
- **Responsible AI disclaimers** — Displayed on every AI-powered surface.

---

## Tools used

- [Lovable](https://lovable.dev) — Visual AI app builder and project host
- [TanStack Start](https://tanstack.com/start) — Full-stack React framework with SSR and server functions
- [React 19](https://react.dev) — UI library
- [TypeScript](https://www.typescriptlang.org) — Type-safe development
- [Tailwind CSS v4](https://tailwindcss.com) — Utility-first styling
- [shadcn/ui](https://ui.shadcn.com) — Accessible UI components
- [Lovable AI Gateway](https://ai.gateway.lovable.dev) — AI completions (Gemini model)
- [Lovable Cloud](https://lovable.dev/cloud) — Backend, authentication, and database
- [Supabase](https://supabase.com) (managed by Lovable Cloud) — Postgres database, RLS, and auth
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) — Browser-native voice input
- [Lucide React](https://lucide.dev) — Icon library
- [Sonner](https://sonner.emilkowal.ski) — Toast notifications

---

## Setup instructions

### Prerequisites

- [Node.js](https://nodejs.org) (LTS recommended) and a package manager such as `npm` or `bun`
- A Lovable account and project (backend/auth are managed by Lovable Cloud)

### 1. Clone the repository

```sh
git clone <this-repository-url>
cd <repository-name>
```

### 2. Install dependencies

With npm:

```sh
npm install
```

Or with bun:

```sh
bun install
```

### 3. Configure environment variables

Lovable generates the required environment variables automatically. If you are running the project locally, make sure the following are present in your `.env` file:

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-supabase-project-id>
LOVABLE_API_KEY=<your-lovable-api-key>
```

> Do not commit `.env` to version control.

### 4. Run the development server

With npm:

```sh
npm run dev
```

Or with bun:

```sh
bun run dev
```

The app will be available at `http://localhost:8080` by default.

### 5. Build for production

With npm:

```sh
npm run build
```

Or with bun:

```sh
bun run build
```

---

## Team members

This project was built solo with Lovable. Team members can be added here as the project grows.

---

## Learn more

- [Lovable editor](https://lovable.dev/projects/f5f777d7-d549-477c-bb23-05d20d9e25a0) — continue developing this project
- [Lovable docs](https://docs.lovable.dev) — feature guides and troubleshooting
