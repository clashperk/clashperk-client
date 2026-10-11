"use client";

import { useMyClans } from "@/components/my-clans-provider";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { NO_GUILD_ID } from "@/lib/guild";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { adminItems } from "./sidebar/admin-sidebar";
import { items, serverItems, userItems } from "./sidebar/app-sidebar";
import { ServerSwitcher } from "./sidebar/server-switcher";
import { NavUser } from "./sidebar/user-nav";
import { UserAvatar } from "./user-avatar";

type NavItem = (typeof items)[number];

const isAdminPath = (pathname: string) =>
  pathname === "/admin" || pathname.startsWith("/admin/");

const matches = (pathname: string, url: string) =>
  pathname === url || pathname.startsWith(`${url}/`);

/** The open server, or the default player, as a small chip in the header. */
function ContextChip({ onClick }: { onClick: () => void }) {
  const { user } = useAuth();
  const { defaultAccount } = useMyClans();
  const guild = user.guild.id === NO_GUILD_ID ? null : user.guild;
  const player = defaultAccount?.player;

  let face: React.ReactNode;
  let label: string;
  if (guild) {
    face = (
      <UserAvatar
        src={guild.iconUrl || ""}
        alt={guild.name.charAt(0)}
        className="size-6 rounded-lg"
      />
    );
    label = guild.name;
  } else if (defaultAccount) {
    face = (
      <span className="flex size-6 items-center justify-center rounded-lg bg-foreground/[0.06] text-xs font-semibold tabular-nums">
        {player?.townHallLevel ?? defaultAccount.link.name.charAt(0)}
      </span>
    );
    label = player?.name ?? defaultAccount.link.name;
  } else {
    face = (
      <UserAvatar
        src={user.avatarUrl}
        alt={user.displayName.charAt(0)}
        className="size-6 rounded-lg"
      />
    );
    label = user.displayName;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}. Open menu`}
      className="flex max-w-[50%] cursor-pointer items-center gap-1.5 rounded-full border bg-card py-0.5 pr-2.5 pl-0.5 text-xs text-muted-foreground"
    >
      {face}
      <span className="truncate">{label}</span>
    </button>
  );
}

function MenuSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const serverOpen = user.guild.id !== NO_GUILD_ID;
  const scrollerRef = useRef<HTMLDivElement>(null);

  // The account menu opens and closes upward at the bottom of the sheet. Keep the sheet
  // scrolled to the bottom while it animates, so the menu comes into view on open and
  // the account row stays put on close instead of jumping off screen.
  const followAccountMenu = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    let lastHeight = node.offsetHeight;
    const observer = new ResizeObserver(() => {
      const scroller = scrollerRef.current;
      if (scroller && node.offsetHeight !== lastHeight) {
        scroller.scrollTop = scroller.scrollHeight;
      }
      lastHeight = node.offsetHeight;
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const group = (label: string, links: NavItem[]) =>
    links.length > 0 && (
      <div className="space-y-0.5">
        <p className="px-2.5 pt-2 pb-1 text-xs text-muted-foreground">
          {label}
        </p>
        {links.map((item) => (
          <Link
            key={item.url}
            href={item.url}
            aria-current={matches(pathname, item.url) ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm transition-colors hover:bg-foreground/[0.06] [&_svg]:size-[18px] [&_svg]:text-muted-foreground",
              matches(pathname, item.url) && "bg-foreground/[0.07]",
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
      </div>
    );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="rounded-t-3xl md:hidden">
        <DrawerTitle className="sr-only">Menu</DrawerTitle>
        <DrawerDescription className="sr-only">
          Switch server and open a page
        </DrawerDescription>
        <div
          ref={scrollerRef}
          className="flex flex-col gap-2 overflow-y-auto px-3 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]"
        >
          <ServerSwitcher />
          {group("You", items)}
          {serverOpen && group("Server", serverItems)}
          {group("Account", userItems)}
          <div ref={followAccountMenu} className="pt-2">
            <NavUser user={user} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/** Phone navigation: a title bar whose menu button and chip open one sheet with every page. */
export function MobileNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const inAdmin = isAdminPath(pathname);

  // Any link in the sheet (including the account menu) closes it on arrival.
  useEffect(() => setMenuOpen(false), [pathname]);

  const current = [...serverItems, ...items, ...userItems, ...adminItems].find(
    (item) => matches(pathname, item.url),
  );

  // Fixed, not sticky: sticky moves with the page when phones bounce or pull to refresh.
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-15 items-center justify-between gap-3 border-b bg-background px-4 md:hidden">
        {/* Admin pages keep their own sidebar instead of the menu sheet. */}
        {inAdmin ? (
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger />
            <span className="truncate font-medium tracking-tight">
              {current?.title ?? "ClashPerk"}
            </span>
          </div>
        ) : (
          // The icon and the page title together are one tap target for the menu.
          <button
            type="button"
            aria-label={`${current?.title ?? "ClashPerk"}. Open menu`}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="-ml-2 flex min-w-0 cursor-pointer items-center gap-2 rounded-full py-1.5 pr-3 pl-2 transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-foreground/15 focus-visible:outline-none dark:hover:bg-accent/50"
          >
            <Menu className="size-4 shrink-0" />
            <span className="truncate font-medium tracking-tight">
              {current?.title ?? "ClashPerk"}
            </span>
          </button>
        )}
        {!inAdmin && <ContextChip onClick={() => setMenuOpen(true)} />}
      </header>
      <div aria-hidden className="h-15 shrink-0 md:hidden" />
      {!inAdmin && <MenuSheet open={menuOpen} onOpenChange={setMenuOpen} />}
    </>
  );
}
