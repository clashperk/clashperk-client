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
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { SiDiscord, SiGithub, SiKofi, SiPatreon } from "react-icons/si";

const SEARCH_FEATURES = [
  "Player Profiles & Hero Equipment",
  "Army Composition Parsing",
  "Rushed Base Detection",
  "Remaining Upgrades Tracker",
  "Open War Log History",
  "Clan Capital Overview",
];

const WAR_FEATURES: { title: string; text: React.ReactNode }[] = [
  {
    title: "Attack Logs",
    text: "Every attack posted live with stars and destruction %, searchable across past wars.",
  },
  {
    title: "Reminders",
    text: "Pings members before the war ends, plus a log of every missed attack.",
  },
  {
    title: "CWL Analytics",
    text: "Round-by-round rankings and promotion forecasts.",
  },
  {
    title: "Compositions",
    text: (
      <>
        Town Hall hit rates and army trends with{" "}
        <code className="rounded-md bg-surface-strong px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
          /compo
        </code>
        .
      </>
    ),
  },
];

const EXPLORE_LINKS = [
  { href: "/invite", label: "Add to Discord" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "https://docs.clashperk.com", label: "Guide" },
];

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

const FOOTER_GROUPS = [
  {
    title: "Community",
    links: [
      {
        href: "https://discord.gg/ppuppun",
        name: "Discord",
        Icon: SiDiscord,
        hover: "hover:border-[#5865f2]/40 hover:text-[#5865f2]",
      },
      {
        href: "https://github.com/clashperk",
        name: "GitHub",
        Icon: SiGithub,
        hover: "hover:border-foreground/30 hover:text-foreground",
      },
    ],
  },
  {
    title: "Support ClashPerk",
    links: [
      {
        href: "https://www.patreon.com/clashperk",
        name: "Patreon",
        Icon: SiPatreon,
        hover: "hover:border-[#ff424d]/40 hover:text-[#ff424d]",
      },
      {
        href: "https://ko-fi.com/clashperk",
        name: "Ko-fi",
        Icon: SiKofi,
        hover: "hover:border-[#72a4f2]/50 hover:text-[#4f86d9]",
      },
    ],
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
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-semibold tracking-tight"
          >
            <Image src="/icons/icon.svg" alt="" width={32} height={32} unoptimized />
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
            The Clash of Clans Discord bot for serious clans.{" "}
            <br className="hidden md:block" />
            War logs, CWL stats, legend tracking and rosters — all in your
            server.
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
        className="mx-auto w-full max-w-7xl scroll-mt-24 px-6 pb-20"
      >
        <div className="mb-14 flex flex-col items-center space-y-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-5xl">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground">
            Every tool your clan needs, right inside Discord.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className={cn(CARD, "md:col-span-2")}>
            <div className="flex flex-col gap-6">
              <div className={ICON_TILE}>
                <Search className="size-7" />
              </div>
              <div>
                <h3 className="mb-2 text-2xl font-medium tracking-tight">
                  Advanced Search
                </h3>
                <p className="mb-6 text-muted-foreground">
                  Look up any player or clan in seconds.
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
            <div className="flex flex-col gap-6">
              <div className={ICON_TILE}>
                <Trophy className="size-7" />
              </div>
              <div>
                <h3 className="mb-2 text-2xl font-medium tracking-tight">
                  War & CWL Tracking
                </h3>
                <p className="mb-6 text-muted-foreground">
                  Follow every war from preparation to the final hit, with live
                  embeds, reminders and season reports.
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
            description="Export rosters, season war stats and member data to Google Sheets."
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
                <p className="max-w-3xl text-muted-foreground">
                  Coordinate large-scale events. Create custom Rosters for CWL,
                  manage signups with Town Hall requirements, and track
                  availability for every round.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-[28px] bg-foreground px-6 py-14 text-center text-background md:px-12 md:py-16">
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-64 bg-[radial-gradient(50%_60%_at_50%_0%,color-mix(in_oklab,var(--brand-from)_35%,transparent),transparent)]" />
          <div className="relative mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-medium tracking-tight md:text-5xl">
              Ready to Level Up{" "}
              <span className="bg-linear-to-r from-brand-from to-brand-to bg-clip-text text-transparent">
                Your Clan?
              </span>
            </h2>
            <p className="text-lg text-background/70">
              Bring war logs, reminders and rosters to your Discord server.
            </p>
            <Link
              href="/invite"
              className="inline-flex h-12 items-center justify-center rounded-full bg-linear-to-r from-brand-from to-brand-to px-8 font-semibold text-white transition-all hover:-translate-y-px hover:shadow-[0_10px_22px_-6px_#d14c0099] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
            >
              Add to Discord
            </Link>
          </div>
        </div>
      </section>

      <footer className="w-full border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:gap-x-6 md:gap-y-10">
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                <Image src="/icons/icon.svg" alt="" width={28} height={28} unoptimized />
                ClashPerk
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                The all-in-one Clash of Clans bot for Discord.
              </p>
            </div>

            <nav aria-label="Explore" className="space-y-3 md:space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Explore</p>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-foreground/80 md:flex-col md:gap-3">
                {EXPLORE_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      className="transition-colors hover:text-primary"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {FOOTER_GROUPS.map(({ title, links }) => (
              <div key={title} className="space-y-3 md:space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
                <ul className="flex flex-wrap gap-2 md:flex-col md:items-start">
                  {links.map(({ href, name, Icon, hover }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        target="_blank"
                        className={cn(
                          "inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground/80 transition-all hover:-translate-y-0.5",
                          hover,
                        )}
                      >
                        <Icon className="size-3.5" />
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <p>© 2019–{new Date().getFullYear()} ClashPerk</p>
              {LEGAL_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </div>
            <p className="max-w-xl md:text-right">
              This material is unofficial and is not endorsed by Supercell. For
              more information see{" "}
              <Link
                href="https://supercell.com/en/fan-content-policy/"
                target="_blank"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Supercell&apos;s Fan Content Policy
              </Link>
              .
            </p>
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
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
