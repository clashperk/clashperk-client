import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Fraunces, Geist_Mono, Nunito_Sans } from "next/font/google";
import "./globals.css";

import { AppShell } from "@/components/app-shell";
import { LoginProvider } from "@/components/login-provider";
import { MobileHeader } from "@/components/mobile-nav";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { httpClient } from "@/hooks/api/axios";
import { getSession } from "@/lib/auth";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClashPerk",
  description:
    "Feature-Rich and Powerful Clash of Clans Discord bot with everything you will ever need.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  httpClient.setSecurityData({ accessToken: session?.accessToken });

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${nunitoSans.variable} ${fraunces.variable} ${geistMono.variable} antialiased overscroll-none`}
      >
        <ThemeProvider
          defaultTheme="dark"
          attribute="class"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionProvider session={session}>
            <AppShell sidebar={<AppSidebar />} header={<MobileHeader />}>
              {children}
            </AppShell>
            <LoginProvider accessToken={session?.accessToken} />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
