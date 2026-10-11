"use client";

import { MyClansProvider } from "@/components/my-clans-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { isAdminPath } from "@/components/mobile-nav";
import { isUnauthenticatedRoute } from "@/lib/routelist";
import { cn } from "@/lib/utils";
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
          <main
            className={cn(
              "flex-1 w-full h-full",
              // Room for the floating tab bar so the last card isn't hidden behind it.
              !isAdminPath(pathname) &&
                "pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0",
            )}
          >
            {children}
          </main>
        </div>
      </SidebarProvider>
    </MyClansProvider>
  );
}
