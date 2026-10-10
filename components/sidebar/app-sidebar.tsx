"use client";

import { Bell, Home, Link2, Settings, Swords, User, Users } from "lucide-react";

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

import { UserAvatar } from "../user-avatar";
import { ServerSummary } from "./server-summary";
import { NavUser } from "./user-nav";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    disabled: false,
    icon: <Home />,
  },
  {
    title: "Clans",
    url: "/clans",
    disabled: false,
    icon: <Swords />,
  },
  {
    title: "Rosters",
    url: "/rosters",
    disabled: false,
    icon: <Users />,
  },
  {
    title: "Links",
    url: "/links",
    disabled: false,
    icon: <Link2 />,
  },
  {
    title: "Reminders",
    url: "/reminders",
    disabled: false,
    icon: <Bell />,
  },
];

const userItems = [
  {
    title: "Profile",
    url: "/profile",
    disabled: false,
    icon: <User />,
  },
  {
    title: "Settings",
    url: "/settings",
    disabled: false,
    icon: <Settings />,
  },
];

export function AppSidebar() {
  const session = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div
          title={`Server ID: ${session.user.guild.id}`}
          className="flex items-center gap-3 rounded-xl bg-sidebar-accent p-2 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0"
        >
          <UserAvatar
            src={session.user.guild.iconUrl || ""}
            alt={session.user.guild.name.charAt(0)}
            className="size-8 shrink-0 rounded-[10px]"
          />
          <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium tracking-tight text-foreground">
              {session.user.guild.name}
            </span>
            <ServerSummary guildId={session.user.guild.id} />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* CLAN MANAGEMENT */}
        <SidebarGroup>
          <SidebarGroupLabel>Clan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild={!item.disabled}
                    disabled={item.disabled}
                    tooltip={item.title}
                    onClick={() => isMobile && setOpenMobile(false)}
                  >
                    {item.disabled ? (
                      <>
                        {item.icon}
                        <span>{item.title}</span>
                      </>
                    ) : (
                      <Link href={item.url}>
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* USER MANAGEMENT */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild={!item.disabled}
                    disabled={item.disabled}
                    tooltip={item.title}
                    onClick={() => isMobile && setOpenMobile(false)}
                  >
                    {item.disabled ? (
                      <>
                        {item.icon}
                        <span>{item.title}</span>
                      </>
                    ) : (
                      <Link href={item.url}>
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
