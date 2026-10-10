import { SessionProvider } from "next-auth/react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { LoginProvider } from "@/components/login-provider";
import { MobileHeader } from "@/components/mobile-nav";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { getSession } from "@/lib/auth";
import { NO_GUILD_ID } from "@/lib/guild";

/** Pages that only make sense for a selected Discord server. */
const SERVER_ROUTES = [
  "/dashboard",
  "/clans",
  "/rosters",
  "/links",
  "/reminders",
];

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const pathname = (await headers()).get("x-pathname") ?? "";

  if (
    session?.user.guild.id === NO_GUILD_ID &&
    SERVER_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  ) {
    redirect("/servers");
  }

  return (
    <SessionProvider session={session}>
      <AppShell sidebar={<AppSidebar />} header={<MobileHeader />}>
        {children}
      </AppShell>
      <LoginProvider />
    </SessionProvider>
  );
}
