"use client";

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
import { Kanit } from "next/font/google"; // Import Kanit font
import Link from "next/link";
import { useRef } from "react";
import { SiDiscord, SiGithub, SiPatreon, SiPaypal } from "react-icons/si";

// Setup Kanit font options
const kanit = Kanit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function Home() {
  const featuresRef = useRef<HTMLElement>(null);

  return (
    <div
      className={`flex flex-col min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30 ${kanit.className}`}
    >
      {/* 
        PREMIUM BACKGROUND EFFECTS 
        - Uses a subtle grid mesh 
        - Add multiple glowing orbs for depth
      */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Deep radial gradient base */}
        <div className="absolute inset-0 bg-[#0a0a0a]" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Floating Glow Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar - Glassmorphism */}
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0a]/70 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0a0a0a]/60">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold tracking-wider text-white hover:text-blue-400 transition-colors"
            >
              CLASHPERK
            </Link>
            <nav className="flex items-center gap-4 md:gap-8 text-sm font-medium text-gray-400">
              <Link
                href="https://docs.clashperk.com"
                target="_blank"
                className="hidden md:block hover:text-white transition-colors"
              >
                Guide
              </Link>
              <Link
                href="https://discord.gg/ppuppun"
                target="_blank"
                className="hidden md:block hover:text-white transition-colors"
              >
                Discord
              </Link>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all border border-white/5 font-semibold"
              >
                Log In
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex flex-col items-center justify-center text-center px-4 py-20 min-h-[calc(100dvh-4rem)]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto space-y-10"
          >
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl leading-[1.1]">
              BUILD THE BEST <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x bg-[length:200%_auto]">
                DISCORD COMMUNITY
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
              The ultimate Clash of Clans Discord bot.{" "}
              <br className="hidden md:block" />
              Analyze wars, track legends, and manage your clan like a pro.
            </p>

            <div className="pt-8 flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="#"
                className="relative inline-flex h-14 items-center justify-center overflow-hidden rounded-lg bg-blue-600 px-8 font-bold text-white shadow-lg transition-all hover:bg-blue-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] animate-[shimmer_2s_infinite]" />
                ADD TO DISCORD
              </Link>

              <button
                onClick={() => {
                  featuresRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                className="inline-flex h-14 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-8 font-bold text-white transition-all hover:bg-white/10 hover:border-white/20 cursor-pointer"
              >
                VIEW FEATURES
              </button>
            </div>
          </motion.div>
        </main>

        {/* Features Section - Bento Grid Style */}
        <section
          id="features"
          ref={featuresRef}
          className="w-full max-w-7xl mx-auto px-6 pb-32 scroll-mt-24"
        >
          <div className="flex flex-col items-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Everything You Need
            </h2>
            <p className="text-gray-400 text-lg">
              Powering top clans worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Card - Advanced Search */}
            <div className="md:col-span-2 relative group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-8 hover:bg-white/[0.04] transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                <div className="flex items-start justify-between">
                  <div className="p-3 w-fit rounded-xl bg-blue-500/20 text-blue-400">
                    <Search className="w-8 h-8" />
                  </div>
                  {/* Badge Removed */}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Advanced Search
                  </h3>
                  <p className="text-gray-400 text-lg mb-6">
                    Deep-dive into player and clan data with powerful analytical
                    commands and real-time insights.
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                      Player Profiles & Hero Equipment
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                      Army Composition Parsing
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                      Rushed Base Detection
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                      Remaining Upgrades Tracker
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                      Open War Log History
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                      Clan Capital Overview
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tall Card - War Management */}
            <div className="md:row-span-2 relative group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-8 hover:bg-white/[0.04] transition-colors">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col h-full gap-8">
                <div className="p-3 w-fit rounded-xl bg-purple-500/20 text-purple-400">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    War & CWL Tracking
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    Professional-grade tracking for every War phase. From live
                    War Embeds to deep-dive performance reports, we cover every
                    star.
                  </p>
                  <ul className="space-y-4 text-sm text-gray-300">
                    <li className="flex items-start gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
                      <span>
                        <strong className="text-white">War & CWL Logs:</strong>{" "}
                        Real-time attack logging with destruction % and star
                        tracking.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
                      <span>
                        <strong className="text-white">
                          Attack Reminders:
                        </strong>{" "}
                        Automated pings for missed attacks before war ends.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
                      <span>
                        <strong className="text-white">CWL Analytics:</strong>{" "}
                        Round-by-round rankings, promotion forecasting, and star
                        stats.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
                      <span>
                        <strong className="text-white">
                          Composition Analytics:
                        </strong>{" "}
                        Monitor Town Hall hit rates and composition trends via
                        /compo.
                      </span>
                    </li>
                  </ul>
                  <div className="mt-4 space-y-4">
                    <ul className="space-y-4 text-sm text-gray-300">
                      <li className="flex items-start gap-3">
                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
                        <span>
                          <strong className="text-white">
                            Missed Attacks Log:
                          </strong>{" "}
                          Identify repeat offenders with automated logs for
                          every missed attack.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
                        <span>
                          <strong className="text-white">
                            War Log History:
                          </strong>{" "}
                          Maintain a searchable history of past wars to track
                          performance trends.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature: Clan Logs */}
            <FeatureCard
              icon={<Rss className="w-6 h-6" />}
              color="text-green-400"
              bg="bg-green-500/20"
              title="Live Clan Logs"
              description="Real-time logs for member joins, role changes, Town Hall upgrades, and donation summaries."
            />

            {/* Feature: Activity & Games */}
            <FeatureCard
              icon={<Activity className="w-6 h-6" />}
              color="text-orange-400"
              bg="bg-orange-500/20"
              title="Activity & Clan Games"
              description="Visualize engagement with hourly Activity Graphs, Last Seen status, and live Clan Games contribution tracking."
            />

            {/* Feature: Auto Roles */}
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6" />}
              color="text-red-400"
              bg="bg-red-500/20"
              title="Auto Role System"
              description="Automate generic roles, Town Hall roles, and League roles. Secure your server with verified link requirements."
            />

            {/* Feature: Exports */}
            <FeatureCard
              icon={<FileSpreadsheet className="w-6 h-6" />}
              color="text-cyan-400"
              bg="bg-cyan-500/20"
              title="Advanced Data Exports"
              description="Export complete clan rosters, seasonal War stats, and member analytics key for external analysis."
            />

            {/* Feature: Legends Tracking */}
            <FeatureCard
              icon={<Crown className="w-6 h-6" />}
              color="text-yellow-400"
              bg="bg-yellow-500/20"
              title="Legend League Tracking"
              description="Monitor daily attacks, defenses, and net trophies with dedicated Legend Logs and leaderboard tracking."
            />

            {/* Feature: Roster Management (Full Width) */}
            <div className="md:col-span-3 relative group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-8 hover:bg-white/[0.04] transition-colors">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400 shrink-0">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-bold text-white">
                    Clan Rosters
                  </h3>
                  <p className="text-gray-400 text-lg max-w-3xl">
                    Coordinate large-scale events. Create custom Rosters for
                    CWL, manage signups with Town Hall requirements, and track
                    availability for every round.
                  </p>
                </div>
                {/* Visual Flair for Roster */}
                <div className="hidden md:flex items-center gap-1 ml-auto opacity-50 group-hover:opacity-100 transition-opacity">
                  <div className="h-8 w-2 bg-indigo-500 rounded-sm translate-y-2" />
                  <div className="h-12 w-2 bg-purple-500 rounded-sm" />
                  <div className="h-6 w-2 bg-pink-500 rounded-sm translate-y-4" />
                  <div className="h-10 w-2 bg-blue-500 rounded-sm translate-y-1" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-white/5 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h4 className="font-bold text-xl tracking-wider">CLASHPERK</h4>
              <p className="text-gray-500 text-sm">
                Copyright © ClashPerk 2019-{new Date().getFullYear()}
              </p>
            </div>

            <div className="flex items-center gap-8">
              <Link
                href="https://www.patreon.com/clashperk"
                target="_blank"
                className="text-gray-500 hover:text-[#f96854] transition-colors"
                title="Support on Patreon"
              >
                <SiPatreon className="w-6 h-6" />
              </Link>
              <Link
                href="https://www.paypal.com/ncp/links/3MHCY7FZYEZ6L"
                target="_blank"
                className="text-gray-500 hover:text-[#00457C] transition-colors"
                title="Donate via PayPal"
              >
                <SiPaypal className="w-6 h-6" />
              </Link>
              <Link
                href="https://github.com/clashperk"
                target="_blank"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <SiGithub className="w-6 h-6" />
              </Link>
              <Link
                href="https://discord.gg/ppuppun"
                target="_blank"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <SiDiscord className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  bg,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-8 hover:bg-white/[0.04] transition-all hover:-translate-y-1 duration-300">
      <div className="relative z-10 flex flex-col gap-4">
        <div className={`p-3 w-fit rounded-xl ${bg} ${color}`}>{icon}</div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}
