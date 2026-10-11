"use client";

import { Activity, ArrowLeft, ShieldCheck } from "lucide-react";

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
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavUser } from "./user-nav";

export const adminItems = [
  { title: "Usage", url: "/admin/usage", icon: <Activity /> },
];

/** Replaces the dashboard sidebar on /admin pages, which only ClashPerk admins can open. */
export function AdminSidebar() {
  const session = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const close = () => isMobile && setOpenMobile(false);

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent p-2 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] border bg-background">
            <ShieldCheck className="size-4" />
          </span>
          <span className="grid flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium tracking-tight">
              ClashPerk admin
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Only admins can see this
            </span>
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={
                      pathname === item.url ||
                      pathname.startsWith(`${item.url}/`)
                    }
                    onClick={close}
                  >
                    <Link href={item.url}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Back to dashboard"
                  onClick={close}
                >
                  <Link href="/dashboard">
                    <ArrowLeft />
                    <span>Back to dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={session.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
