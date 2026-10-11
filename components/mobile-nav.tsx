"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { HomeIcon, SearchIcon, SettingsIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminItems } from "./sidebar/admin-sidebar";
import { items, serverItems, userItems } from "./sidebar/app-sidebar";

export function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-14 w-full items-center justify-around bg-background shadow-md md:h-16">
      <Link
        href="#"
        className="flex flex-col items-center justify-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary focus:text-primary"
        prefetch={false}
      >
        <HomeIcon className="h-6 w-6" />
        Home
      </Link>
      <Link
        href="#"
        className="flex flex-col items-center justify-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary focus:text-primary"
        prefetch={false}
      >
        <SearchIcon className="h-6 w-6" />
        Search
      </Link>
      <Link
        href="#"
        className="flex flex-col items-center justify-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary focus:text-primary"
        prefetch={false}
      >
        <UserIcon className="h-6 w-6" />
        Profile
      </Link>
      <Link
        href="#"
        className="flex flex-col items-center justify-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary focus:text-primary"
        prefetch={false}
      >
        <SettingsIcon className="h-6 w-6" />
        Settings
      </Link>
    </nav>
  );
}

export function MobileHeader() {
  const pathname = usePathname();
  const current = [...serverItems, ...items, ...userItems, ...adminItems].find(
    (item) => pathname === item.url || pathname.startsWith(`${item.url}/`),
  );

  // Fixed, not sticky: sticky moves with the page when phones bounce or pull to refresh.
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-15 items-center gap-4 border-b bg-background px-4 md:hidden">
        <SidebarTrigger />
        <div className="font-medium tracking-tight">
          {current?.title ?? "ClashPerk"}
        </div>
      </header>
      <div aria-hidden className="h-15 shrink-0 md:hidden" />
    </>
  );
}
