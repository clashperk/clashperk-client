"use client";

import {
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  ChevronUp,
  CircleHelp,
  LogOut,
  Settings,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { useSidebar } from "@/components/ui/sidebar";
import { UserRoles } from "@/hooks/api/generated";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SiBuymeacoffee, SiDiscord, SiPatreon } from "react-icons/si";
import { UserAvatar } from "../user-avatar";
import { ThemeSwitcher } from "./theme-switcher";

const MENU_ITEM =
  "flex h-9 w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring [&>svg]:size-4 [&>svg]:text-muted-foreground";

const RESOURCES = [
  {
    href: "https://docs.clashperk.com/overview/getting-set-up",
    label: "Getting started",
    Icon: BookOpen,
  },
  { href: "https://docs.clashperk.com/faq", label: "FAQ", Icon: CircleHelp },
  {
    href: "https://discord.gg/ppuppun",
    label: "Support Discord",
    Icon: SiDiscord,
  },
  {
    href: "https://discord.com/oauth2/authorize?client_id=526971716711350273",
    label: "Invite ClashPerk",
    Icon: UserPlus,
  },
  {
    href: "https://www.patreon.com/clashperk",
    label: "Support on Patreon",
    Icon: SiPatreon,
  },
  {
    href: "https://buymeacoffee.com/clashperk",
    label: "Buy Me a Coffee",
    Icon: SiBuymeacoffee,
  },
] as const;

export function NavUser({ user }: { user: Session["user"] }) {
  const { state, setOpen } = useSidebar();
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const collapsed = state === "collapsed";
  const isAdmin = user.roles?.includes(UserRoles.ADMIN);
  const inAdmin = usePathname().startsWith("/admin");

  function toggle() {
    if (collapsed) {
      setOpen(true);
      setExpanded(true);
      return;
    }
    setExpanded((v) => !v);
  }

  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-sidebar-accent p-1.5 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
      <AnimatePresence initial={false}>
        {expanded && !collapsed && (
          <motion.div
            id="user-menu"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <nav className="flex flex-col gap-0.5 pb-1">
              <Link href="/profile" className={MENU_ITEM}>
                <BadgeCheck />
                My Profile
              </Link>
              <Link href="/settings" className={MENU_ITEM}>
                <Settings />
                Settings
              </Link>
              {isAdmin &&
                (inAdmin ? (
                  <Link href="/dashboard" className={MENU_ITEM}>
                    <ShieldCheck />
                    Back to dashboard
                  </Link>
                ) : (
                  <Link href="/admin" className={MENU_ITEM}>
                    <ShieldCheck />
                    Admin
                  </Link>
                ))}
              <div className="px-1 py-1">
                <ThemeSwitcher />
              </div>
              <div className="mx-2.5 my-1 h-px bg-border" />
              {RESOURCES.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(MENU_ITEM, "group/link")}
                >
                  <Icon />
                  {label}
                  <ArrowUpRight className="ml-auto opacity-0 transition-opacity group-hover/link:opacity-100" />
                </a>
              ))}
              <div className="mx-2.5 my-1 h-px bg-border" />
              <button
                type="button"
                onClick={() => signOut()}
                className={cn(
                  MENU_ITEM,
                  "text-destructive hover:text-destructive [&>svg]:text-destructive",
                )}
              >
                <LogOut />
                Log out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded && !collapsed}
        aria-controls="user-menu"
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:p-0"
      >
        <UserAvatar
          className="size-8 shrink-0 rounded-full"
          src={user.avatarUrl}
          alt={user.displayName}
        />
        <div className="grid flex-1 leading-tight group-data-[collapsible=icon]:hidden">
          <span className="truncate text-sm font-medium tracking-tight">
            {user.displayName}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            @{user.username}
          </span>
        </div>
        <ChevronUp
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform group-data-[collapsible=icon]:hidden",
            !expanded && "rotate-180",
          )}
        />
      </button>
    </div>
  );
}
