"use client";

import { Bell, Home, Settings, Swords, User, Users } from "lucide-react";

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
        <div className="flex items-center gap-3 px-1 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <UserAvatar
              src={session.user.guild.iconUrl || ""}
              alt={session.user.guild.name.charAt(0)}
              className="size-8 rounded-lg"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-bold tracking-tight text-foreground uppercase">
              {session.user.guild.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {session.user.guild.id}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* CLAN MANAGEMENT */}
        <SidebarGroup>
          <SidebarGroupLabel>CLAN</SidebarGroupLabel>
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
          <SidebarGroupLabel>USER</SidebarGroupLabel>
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
