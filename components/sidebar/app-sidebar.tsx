"use client";

import {
  AudioWaveform,
  Bell,
  Command,
  GalleryVerticalEnd,
  Home,
  Settings,
  Swords,
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
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { ModeToggle } from "../theme-toggle";
import { TeamSwitcher } from "./team-switcher";
import { NavUser } from "./user-nav";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <Home />,
  },
  {
    title: "Clans",
    url: "/clans",
    icon: <Swords />,
  },
  {
    title: "Rosters",
    url: "/rosters",
    icon: <Users />,
  },
  {
    title: "Reminders",
    url: "/reminders",
    icon: <Bell />,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: <Settings />,
  },
];

const teams = [
  {
    name: "Acme Inc",
    logo: <GalleryVerticalEnd />,
    plan: "Enterprise",
  },
  {
    name: "Acme Corp.",
    logo: <AudioWaveform />,
    plan: "Startup",
  },
  {
    name: "Evil Corp.",
    logo: <Command />,
    plan: "Free",
  },
];

export function AppSidebar() {
  const session = useAuth();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Clan Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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
      </SidebarContent>

      <SidebarFooter>
        <ModeToggle />
        <NavUser user={session.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
