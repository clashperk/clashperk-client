"use client";

import { MyClansProvider } from "@/components/my-clans-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { isUnauthenticatedRoute } from "@/lib/routelist";
import { usePathname } from "next/navigation";

interface AppShellProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
}

export function AppShell({ children, sidebar, header }: AppShellProps) {
  const pathname = usePathname();
  const hideSidebar = isUnauthenticatedRoute(pathname);

  if (hideSidebar) {
    return <main className="w-full h-full">{children}</main>;
  }

  // Signed-in pages only: the provider loads the user's linked accounts and clans.
  return (
    <MyClansProvider>
      <SidebarProvider className="[--header-width:calc(--spacing(72))]">
        {sidebar}
        <div className="flex min-h-svh min-w-0 flex-1 flex-col">
          {header}
          <main className="flex-1 w-full h-full">{children}</main>
        </div>
      </SidebarProvider>
    </MyClansProvider>
  );
}
