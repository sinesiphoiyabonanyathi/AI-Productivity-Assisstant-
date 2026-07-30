import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { HiringProvider } from "@/lib/hiring-store";
import { supabase } from "@/integrations/supabase/client";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Open roles — HireLoop" },
      {
        name: "description",
        content:
          "Browse open roles with full requirements and start a timed AI interview the moment you apply.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Open roles — HireLoop" },
      { name: "twitter:title", content: "Open roles — HireLoop" },
      { property: "og:description", content: "Browse open roles with full requirements and start a timed AI interview the moment you apply." },
      { name: "twitter:description", content: "Browse open roles with full requirements and start a timed AI interview the moment you apply." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c77fe37b-9f53-44fa-bac4-8f59c3e6d8f8" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c77fe37b-9f53-44fa-bac4-8f59c3e6d8f8" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter+Tight:wght@400;500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const { queryClient } = Route.useRouteContext();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 sm:px-5">
        <SidebarTrigger className="shrink-0" />
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold sm:text-base">
            HireLoop workspace
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            Jobs, timed AI interviews and recruiting tools in one place
          </p>
        </div>
        {signedIn ? (
          <button
            onClick={handleSignOut}
            className="shrink-0 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Sign out
          </button>
        ) : (
          <Link
            to="/auth"
            className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setSignedIn(Boolean(session));
      router.invalidate();
      if (event !== "SIGNED_OUT") {
        queryClient.invalidateQueries();
        const saved = sessionStorage.getItem("hireloop:redirect");
        if (saved) {
          sessionStorage.removeItem("hireloop:redirect");
          router.navigate({ to: saved as "/emails", replace: true });
        }
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <HiringProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <SiteHeader signedIn={signedIn} />
              {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
              <main className="flex-1">
                <Outlet />
              </main>
              <footer className="border-t border-border/70 px-4 py-6">
                <AiDisclaimer className="mx-auto max-w-3xl" />
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  HireLoop — demo hiring workspace. Job browsing is open; the email generator and
                  task planner require an account.
                </p>
              </footer>
            </div>
          </div>
        </SidebarProvider>
        <Toaster position="top-center" />
      </HiringProvider>
    </QueryClientProvider>
  );
}

