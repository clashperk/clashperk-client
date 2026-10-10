import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

import { AppShell } from "@/components/app-shell";
import { LoginProvider } from "@/components/login-provider";
import { MobileHeader } from "@/components/mobile-nav";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { httpClient } from "@/hooks/api/axios";
import { getSession } from "@/lib/auth";

const googleSans = localFont({
  src: "../public/fonts/GoogleSansFlex-300-800.woff2",
  variable: "--font-google-sans",
  weight: "300 800",
  display: "swap",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${googleSans.variable} ${geistMono.variable} antialiased overscroll-none`}
      >
        <ThemeProvider
          defaultTheme="system"
          attribute="class"
          enableSystem
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
