import { SessionProvider } from "next-auth/react";

import { ApiTokenProvider } from "@/components/api-token-provider";
import { AppShell } from "@/components/app-shell";
import { MobileHeader } from "@/components/mobile-nav";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { getSession } from "@/lib/auth";

// The API token lives an hour and is reissued in its last 10 minutes when the session is fetched.
const SESSION_REFETCH_SECONDS = 5 * 60;

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <SessionProvider
      session={session}
      refetchInterval={SESSION_REFETCH_SECONDS}
    >
      <ApiTokenProvider>
        <AppShell sidebar={<AppSidebar />} header={<MobileHeader />}>
          {children}
        </AppShell>
      </ApiTokenProvider>
    </SessionProvider>
  );
}
