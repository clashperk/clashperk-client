"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { unauthenticatedRoutes } from "@/lib/routelist";
import { usePathname } from "next/navigation";

interface AppShellProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
}

export function AppShell({ children, sidebar, header }: AppShellProps) {
  const pathname = usePathname();
  const hideSidebar = unauthenticatedRoutes.includes(pathname);

  if (hideSidebar) {
    return <main className="w-full h-full">{children}</main>;
  }

  return (
    <SidebarProvider className="[--header-width:calc(--spacing(72))]">
      {sidebar}
      <div className="flex flex-col flex-1 min-h-svh">
        {header}
        <main className="flex-1 w-full h-full">{children}</main>
      </div>
    </SidebarProvider>
  );
}
