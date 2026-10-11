"use client";

import {
  Bell,
  Clock,
  Home,
  Link2,
  Settings,
  Swords,
  User,
  Users,
} from "lucide-react";

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
import { NO_GUILD_ID } from "@/lib/guild";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminSidebar } from "./admin-sidebar";
import { ServerSwitcher } from "./server-switcher";
import { NavUser } from "./user-nav";

type NavItem = { title: string; url: string; icon: React.ReactNode };

/** Shown only while a server is open. */
export const serverItems: NavItem[] = [
  { title: "Clans", url: "/clans", icon: <Swords /> },
  { title: "Rosters", url: "/rosters", icon: <Users /> },
  { title: "Links", url: "/links", icon: <Link2 /> },
  { title: "Reminders", url: "/reminders", icon: <Bell /> },
];

export const items: NavItem[] = [
  { title: "Home", url: "/dashboard", icon: <Home /> },
  { title: "Activity", url: "/activity", icon: <Clock /> },
];

export const userItems: NavItem[] = [
  { title: "Profile", url: "/profile", icon: <User /> },
  { title: "Settings", url: "/settings", icon: <Settings /> },
];

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(`${url}/`);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive(item.url)}
                onClick={() => isMobile && setOpenMobile(false)}
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
  );
}

export function AppSidebar() {
  const session = useAuth();
  const pathname = usePathname();
  const serverOpen = session.user.guild.id !== NO_GUILD_ID;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return <AdminSidebar />;
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <ServerSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {serverOpen && <NavGroup label="Server" items={serverItems} />}
        <NavGroup label="You" items={items} />
        <NavGroup label="Account" items={userItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={session.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
