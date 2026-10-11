import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
        className={`${poppins.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          defaultTheme="system"
          attribute="class"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
