import { Link, useRouterState } from "@tanstack/react-router";
import { Briefcase, MessageSquareText, Users, Mail, ListChecks } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const candidateItems = [
  { title: "Jobs", url: "/", icon: Briefcase },
  { title: "Interview coach", url: "/assistant", icon: MessageSquareText },
] as const;

const workspaceItems = [
  { title: "For recruiters", url: "/recruiter", icon: Users },
  { title: "Email generator", url: "/emails", icon: Mail },
  { title: "Task planner", url: "/planner", icon: ListChecks },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (router) => router.location.pathname });

  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  const renderItems = (items: readonly { title: string; url: string; icon: typeof Briefcase }[]) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
            <Link to={item.url} className="flex items-center gap-2">
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex min-w-0 items-center gap-2 px-1 py-1.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sidebar-primary font-display text-sm font-bold text-sidebar-primary-foreground">
            HL
          </span>
          {!collapsed && (
            <span className="truncate font-display text-base font-semibold">HireLoop</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Candidates</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(candidateItems)}</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(workspaceItems)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter>
          <p className="px-2 pb-1 text-[11px] leading-snug text-sidebar-foreground/60">
            AI-assisted output. Always review before sending or deciding.
          </p>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
