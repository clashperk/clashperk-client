"use client";

import { DiscordEmbedStack } from "@/components/discord-embed-stack";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

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
    text: "Town Hall hit rates and army trends across your clan.",
  },
];

const CARD =
  "relative overflow-hidden rounded-[28px] border border-border bg-card p-6 md:p-8 shadow-[0_1px_2px_rgba(13,15,13,.04),0_18px_44px_rgba(13,15,13,.05)]";

const ICON_TILE =
  "flex size-14 items-center justify-center rounded-[15px] bg-brand-soft text-primary";

export default function Home() {
  const featuresRef = useRef<HTMLElement>(null);

  return (
    <div className="landing relative flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Starts behind the fixed header and fades in there, so overscroll shows no hard edge. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[585px] bg-[radial-gradient(60%_312px_at_50%_65px,var(--brand-soft),transparent)] mask-[linear-gradient(to_bottom,transparent,black_65px)]" />
      <SiteHeader />

      <main className="relative flex flex-col items-center overflow-hidden px-4 pb-16 pt-16 text-center md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mx-auto max-w-4xl space-y-6"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-soft px-3 py-1 text-sm font-medium text-primary">
            <Zap className="size-3.5" />
            Used in 40,000+ Discord servers
          </span>

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

        <div className="relative mt-14 w-full md:mt-16">
          <DiscordEmbedStack />
        </div>
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
        <div className="relative overflow-hidden rounded-[28px] border border-brand/15 bg-linear-to-b from-brand-soft to-surface px-6 py-14 text-center md:px-12 md:py-16">
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-64 bg-[radial-gradient(50%_60%_at_50%_0%,color-mix(in_oklab,var(--brand-to)_25%,transparent),transparent)]" />
          <div className="relative mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-medium tracking-tight md:text-5xl">
              Ready to Level Up{" "}
              <span className="bg-linear-to-r from-brand-from to-brand-to bg-clip-text text-transparent">
                Your Clan?
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Bring war logs, reminders and rosters to your Discord server.
            </p>
            <Link
              href="/invite"
              className="inline-flex h-12 items-center justify-center rounded-full bg-linear-to-r from-brand-from to-brand-to px-8 font-semibold text-white transition-all hover:-translate-y-px shadow-[0_6px_16px_-4px_#d14c004d] hover:shadow-[0_10px_22px_-6px_#d14c0066] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Add to Discord
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
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
