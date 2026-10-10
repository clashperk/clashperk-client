import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";

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
    "The all-in-one Clash of Clans bot for Discord. War and CWL logs, legend tracking, reminders, rosters and clan stats, all inside your server.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
