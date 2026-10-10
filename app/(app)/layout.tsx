import { SessionProvider } from "next-auth/react";

import { AppShell } from "@/components/app-shell";
import { LoginProvider } from "@/components/login-provider";
import { MobileHeader } from "@/components/mobile-nav";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { getSession } from "@/lib/auth";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <SessionProvider session={session}>
      <AppShell sidebar={<AppSidebar />} header={<MobileHeader />}>
        {children}
      </AppShell>
      <LoginProvider />
    </SessionProvider>
  );
}
