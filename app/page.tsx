"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  ClipboardList,
  Crown,
  FileSpreadsheet,
  Rss,
  Search,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { SiDiscord, SiGithub, SiPatreon, SiPaypal } from "react-icons/si";

const SEARCH_FEATURES = [
  "Player Profiles & Hero Equipment",
  "Army Composition Parsing",
  "Rushed Base Detection",
  "Remaining Upgrades Tracker",
  "Open War Log History",
  "Clan Capital Overview",
];

const WAR_FEATURES = [
  {
    title: "War & CWL Logs",
    text: "Real-time attack logging with destruction % and star tracking.",
  },
  {
    title: "Attack Reminders",
    text: "Automated pings for missed attacks before war ends.",
  },
  {
    title: "CWL Analytics",
    text: "Round-by-round rankings, promotion forecasting, and star stats.",
  },
  {
    title: "Composition Analytics",
    text: "Monitor Town Hall hit rates and composition trends via /compo.",
  },
  {
    title: "Missed Attacks Log",
    text: "Identify repeat offenders with automated logs for every missed attack.",
  },
  {
    title: "War Log History",
    text: "Maintain a searchable history of past wars to track performance trends.",
  },
];

const CARD =
  "relative overflow-hidden rounded-[28px] border border-border bg-card p-6 md:p-8 shadow-[0_1px_2px_rgba(13,15,13,.04),0_18px_44px_rgba(13,15,13,.05)]";

const ICON_TILE =
  "flex size-14 items-center justify-center rounded-[15px] bg-brand-soft text-primary";

export default function Home() {
  const featuresRef = useRef<HTMLElement>(null);

  return (
    <div className="landing flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            ClashPerk
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium md:gap-4">
            <Link
              href="https://docs.clashperk.com"
              target="_blank"
              className="hidden px-3 py-2 text-foreground/60 transition-colors hover:text-foreground md:block"
            >
              Guide
            </Link>
            <Link
              href="https://discord.gg/ppuppun"
              target="_blank"
              className="hidden px-3 py-2 text-foreground/60 transition-colors hover:text-foreground md:block"
            >
              Discord
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-full border border-brand bg-card px-5 font-semibold transition-all hover:-translate-y-px hover:shadow-[0_10px_22px_-8px_rgba(13,13,26,0.28)]"
            >
              Log In
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,var(--brand-soft),transparent)]" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mx-auto max-w-4xl space-y-8"
        >
          <h1 className="text-[38px] font-medium leading-[0.98] tracking-[-1.2px] sm:text-[48px] md:text-[64px]">
            Build the Best <br />
            <span className="bg-linear-to-r from-brand-from to-brand-to bg-clip-text text-transparent">
              Discord Community
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            The ultimate Clash of Clans Discord bot.{" "}
            <br className="hidden md:block" />
            Analyze wars, track legends, and manage your clan like a pro.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Link
              href="/invite"
              className="inline-flex h-12 items-center justify-center rounded-full bg-linear-to-r from-brand-from to-brand-to px-8 font-semibold text-white shadow-[0_6px_16px_-4px_#d14c004d] transition-all hover:-translate-y-px hover:shadow-[0_10px_22px_-6px_#d14c0066] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Add to Discord
            </Link>

            <button
              onClick={() => {
                featuresRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-border bg-card px-8 font-semibold transition-all hover:-translate-y-px hover:shadow-[0_10px_22px_-8px_rgba(13,13,26,0.18)]"
            >
              View Features
            </button>
          </div>
        </motion.div>
      </main>

      <section
        id="features"
        ref={featuresRef}
        className="mx-auto w-full max-w-7xl scroll-mt-24 px-6 pb-32"
      >
        <div className="mb-14 flex flex-col items-center space-y-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-5xl">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground">
            Powering top clans worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className={cn(CARD, "md:col-span-2")}>
            <div className="flex h-full flex-col justify-between gap-8">
              <div className={ICON_TILE}>
                <Search className="size-7" />
              </div>
              <div>
                <h3 className="mb-2 text-2xl font-medium tracking-tight">
                  Advanced Search
                </h3>
                <p className="mb-6 text-lg text-muted-foreground">
                  Deep-dive into player and clan data with powerful analytical
                  commands and real-time insights.
                </p>
                <ul className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  {SEARCH_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-brand" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className={cn(CARD, "bg-surface md:row-span-2")}>
            <div className="flex h-full flex-col gap-8">
              <div className={ICON_TILE}>
                <Trophy className="size-7" />
              </div>
              <div>
                <h3 className="mb-2 text-2xl font-medium tracking-tight">
                  War & CWL Tracking
                </h3>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  Professional-grade tracking for every War phase. From live War
                  Embeds to deep-dive performance reports, we cover every star.
                </p>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  {WAR_FEATURES.map(({ title, text }) => (
                    <li key={title} className="flex items-start gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                      <span>
                        <strong className="font-semibold text-foreground">
                          {title}:
                        </strong>{" "}
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <FeatureCard
            icon={<Rss className="size-6" />}
            title="Live Clan Logs"
            description="Real-time logs for member joins, role changes, Town Hall upgrades, and donation summaries."
          />
          <FeatureCard
            icon={<Activity className="size-6" />}
            title="Activity & Clan Games"
            description="Visualize engagement with hourly Activity Graphs, Last Seen status, and live Clan Games contribution tracking."
          />
          <FeatureCard
            icon={<ShieldCheck className="size-6" />}
            title="Auto Role System"
            description="Automate generic roles, Town Hall roles, and League roles. Secure your server with verified link requirements."
          />
          <FeatureCard
            icon={<FileSpreadsheet className="size-6" />}
            title="Advanced Data Exports"
            description="Export complete clan rosters, seasonal War stats, and member analytics key for external analysis."
          />
          <FeatureCard
            icon={<Crown className="size-6" />}
            title="Legend League Tracking"
            description="Monitor daily attacks, defenses, and net trophies with dedicated Legend Logs and leaderboard tracking."
          />

          <div
            className={cn(
              CARD,
              "border-transparent md:col-span-3 [background:linear-gradient(var(--card),var(--card))_padding-box,linear-gradient(-8.5deg,var(--brand-from),var(--brand-to))_border-box]",
            )}
          >
            <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
              <div className={cn(ICON_TILE, "shrink-0")}>
                <ClipboardList className="size-7" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-2xl font-medium tracking-tight">
                  Clan Rosters
                </h3>
                <p className="max-w-3xl text-lg text-muted-foreground">
                  Coordinate large-scale events. Create custom Rosters for CWL,
                  manage signups with Town Hall requirements, and track
                  availability for every round.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-12 md:flex-row">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl font-semibold tracking-tight">ClashPerk</h4>
            <p className="text-sm text-muted-foreground">
              Copyright © ClashPerk 2019-{new Date().getFullYear()}
            </p>
          </div>

          <div className="flex items-center gap-8 text-muted-foreground">
            <Link
              href="https://www.patreon.com/clashperk"
              target="_blank"
              className="transition-all hover:-translate-y-0.5 hover:text-foreground"
              title="Support on Patreon"
            >
              <SiPatreon className="size-6" />
            </Link>
            <Link
              href="https://www.paypal.com/ncp/payment/3MHCY7FZYEZ6L"
              target="_blank"
              className="transition-all hover:-translate-y-0.5 hover:text-foreground"
              title="Donate via PayPal"
            >
              <SiPaypal className="size-6" />
            </Link>
            <Link
              href="https://github.com/clashperk"
              target="_blank"
              className="transition-all hover:-translate-y-0.5 hover:text-foreground"
            >
              <SiGithub className="size-6" />
            </Link>
            <Link
              href="https://discord.gg/ppuppun"
              target="_blank"
              className="transition-all hover:-translate-y-0.5 hover:text-foreground"
            >
              <SiDiscord className="size-6" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className={cn(CARD, "transition-all duration-300 hover:-translate-y-1")}>
      <div className="flex flex-col gap-4">
        <div className={ICON_TILE}>{icon}</div>
        <div>
          <h3 className="mb-2 text-xl font-medium tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
