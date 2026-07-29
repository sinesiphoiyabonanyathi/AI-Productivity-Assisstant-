import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  interviewMinutes: number;
};

export type Verdict = {
  matched: boolean;
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
};

export type Notification = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  candidate: string;
  verdict: Verdict;
  createdAt: number;
};

export type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

const seedJobs: Job[] = [
  {
    id: "senior-frontend-engineer",
    title: "Senior Frontend Engineer",
    company: "Northwind Labs",
    location: "Remote — EU",
    type: "Full-time",
    salary: "€75,000 – €95,000",
    description:
      "Own the product surface of our analytics platform: design systems, performance budgets, and accessible interfaces used by 40,000 daily operators.",
    requirements: [
      "5+ years building production React applications",
      "Strong TypeScript and component architecture skills",
      "Experience with performance profiling and Core Web Vitals",
      "Comfortable owning features end to end with a designer",
    ],
    interviewMinutes: 10,
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    company: "Meridian Health",
    location: "Hybrid — Berlin",
    type: "Full-time",
    salary: "€52,000 – €64,000",
    description:
      "Turn clinical operations data into decisions. You will build dashboards, define metrics, and partner with care teams on weekly reviews.",
    requirements: [
      "2+ years in an analytics role",
      "Advanced SQL and one of Python or R",
      "Dashboarding experience (Looker, Metabase, or similar)",
      "Ability to explain findings to non-technical stakeholders",
    ],
    interviewMinutes: 8,
  },
  {
    id: "customer-success-manager",
    title: "Customer Success Manager",
    company: "Loop Logistics",
    location: "On-site — Amsterdam",
    type: "Full-time",
    salary: "€48,000 + bonus",
    description:
      "Be the operational partner for 25 mid-market logistics accounts, from onboarding through renewal.",
    requirements: [
      "3+ years in B2B customer success or account management",
      "Track record of retaining and expanding accounts",
      "Fluent English; Dutch is a plus",
      "Comfortable with CRM hygiene and QBR preparation",
    ],
    interviewMinutes: 8,
  },
];

type HiringState = {
  jobs: Job[];
  notifications: Notification[];
  chat: ChatMessage[];
  addJob: (job: Omit<Job, "id">) => Job;
  getJob: (id: string) => Job | undefined;
  notifyCompany: (n: Omit<Notification, "id" | "createdAt">) => void;
  setChat: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void;
};

const HiringContext = createContext<HiringState | null>(null);

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "role";

export function HiringProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(seedJobs);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chat, setChatState] = useState<ChatMessage[]>([]);

  const addJob = useCallback((job: Omit<Job, "id">) => {
    const created: Job = { ...job, id: `${slug(job.title)}-${Date.now().toString(36)}` };
    setJobs((prev) => [created, ...prev]);
    return created;
  }, []);

  const notifyCompany = useCallback((n: Omit<Notification, "id" | "createdAt">) => {
    setNotifications((prev) => [
      { ...n, id: `n-${Date.now().toString(36)}`, createdAt: Date.now() },
      ...prev,
    ]);
  }, []);

  const setChat = useCallback((updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setChatState(updater);
  }, []);

  const value = useMemo<HiringState>(
    () => ({
      jobs,
      notifications,
      chat,
      addJob,
      getJob: (id) => jobs.find((j) => j.id === id),
      notifyCompany,
      setChat,
    }),
    [jobs, notifications, chat, addJob, notifyCompany, setChat],
  );

  return <HiringContext.Provider value={value}>{children}</HiringContext.Provider>;
}

export function useHiring() {
  const ctx = useContext(HiringContext);
  if (!ctx) throw new Error("useHiring must be used inside HiringProvider");
  return ctx;
}
