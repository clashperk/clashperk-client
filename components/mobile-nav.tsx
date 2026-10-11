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
import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { adminItems } from "./sidebar/admin-sidebar";
import { items, serverItems, userItems } from "./sidebar/app-sidebar";
import { ServerSwitcher } from "./sidebar/server-switcher";
import { NavUser } from "./sidebar/user-nav";
import { UserAvatar } from "./user-avatar";

type NavItem = (typeof items)[number];

const byUrl = (url: string) =>
  [...serverItems, ...items, ...userItems].find((i) => i.url === url)!;

// The bar holds at most five tabs; everything else lives in the More sheet.
const TABS_NO_SERVER = ["/dashboard", "/activity", "/profile"].map(byUrl);
const TABS_SERVER = ["/dashboard", "/clans", "/rosters", "/activity"].map(byUrl);

export const isAdminPath = (pathname: string) =>
  pathname === "/admin" || pathname.startsWith("/admin/");

const matches = (pathname: string, url: string) =>
  pathname === url || pathname.startsWith(`${url}/`);

const TAB_CLASS =
  "flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-full px-1 pt-1.5 pb-1 text-xs text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-5 [&_svg]:shrink-0";
const TAB_ACTIVE = "bg-foreground/[0.07] text-foreground";

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

function MoreSheet({
  open,
  onOpenChange,
  serverLinks,
  accountLinks,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverLinks: NavItem[];
  accountLinks: NavItem[];
}) {
  const { user } = useAuth();
  const pathname = usePathname();

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
        <DrawerTitle className="sr-only">More</DrawerTitle>
        <DrawerDescription className="sr-only">
          Switch server and open other pages
        </DrawerDescription>
        <div className="flex flex-col gap-2 overflow-y-auto px-3 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <ServerSwitcher />
          {group("Server", serverLinks)}
          {group("Account", accountLinks)}
          <div className="pt-2">
            <NavUser user={user} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/** Phone navigation: a title bar at the top and a floating tab bar at the bottom. */
export function MobileNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const serverOpen = user.guild.id !== NO_GUILD_ID;
  const inAdmin = isAdminPath(pathname);

  // Any link in the sheet (including the account menu) closes it on arrival.
  useEffect(() => setMoreOpen(false), [pathname]);

  const tabs = serverOpen ? TABS_SERVER : TABS_NO_SERVER;
  const serverLinks = serverOpen
    ? serverItems.filter((i) => !tabs.includes(i))
    : [];
  const accountLinks = userItems.filter((i) => !tabs.includes(i));
  const inMore = [...serverLinks, ...accountLinks].some((i) =>
    matches(pathname, i.url),
  );

  const current = [...serverItems, ...items, ...userItems, ...adminItems].find(
    (item) => matches(pathname, item.url),
  );

  // Fixed, not sticky: sticky moves with the page when phones bounce or pull to refresh.
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-15 items-center justify-between gap-3 border-b bg-background px-4 md:hidden">
        <div className="flex min-w-0 items-center gap-3">
          {/* Admin pages keep their own sidebar instead of the tab bar. */}
          {inAdmin && <SidebarTrigger />}
          <span className="truncate font-medium tracking-tight">
            {current?.title ?? "ClashPerk"}
          </span>
        </div>
        {!inAdmin && <ContextChip onClick={() => setMoreOpen(true)} />}
      </header>
      <div aria-hidden className="h-15 shrink-0 md:hidden" />

      {!inAdmin && (
        <>
          <nav
            aria-label="Main"
            className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md gap-0.5 rounded-full border bg-background/80 p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl md:hidden"
          >
            {tabs.map((item) => {
              const active = matches(pathname, item.url);
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  aria-current={active ? "page" : undefined}
                  className={cn(TAB_CLASS, active && TAB_ACTIVE)}
                >
                  {item.icon}
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              className={cn(TAB_CLASS, (inMore || moreOpen) && TAB_ACTIVE)}
            >
              <Ellipsis />
              <span>More</span>
            </button>
          </nav>
          <MoreSheet
            open={moreOpen}
            onOpenChange={setMoreOpen}
            serverLinks={serverLinks}
            accountLinks={accountLinks}
          />
        </>
      )}
    </>
  );
}
