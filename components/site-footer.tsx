import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiDiscord, SiGithub, SiKofi, SiPatreon } from "react-icons/si";

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

const COMMUNITY_TILES = [
  {
    href: "https://discord.gg/ppuppun",
    name: "Discord",
    blurb: "Get help and updates",
    Icon: SiDiscord,
    tint: "bg-[#5865f2]/10 text-[#5865f2]",
  },
  {
    href: "https://github.com/clashperk",
    name: "GitHub",
    blurb: "Browse the source",
    Icon: SiGithub,
    tint: "bg-foreground/[0.06] text-foreground",
  },
  {
    href: "https://www.patreon.com/clashperk",
    name: "Patreon",
    blurb: "Become a supporter",
    Icon: SiPatreon,
    tint: "bg-[#ff424d]/10 text-[#ff424d]",
  },
  {
    href: "https://ko-fi.com/clashperk",
    name: "Ko-fi",
    blurb: "Buy us a coffee",
    Icon: SiKofi,
    tint: "bg-[#72a4f2]/15 text-[#4f86d9]",
  },
];

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {COMMUNITY_TILES.map(({ href, name, blurb, Icon, tint }) => (
            <li key={href}>
              <Link
                href={href}
                target="_blank"
                className="group relative flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgba(13,15,13,.18)] md:flex-row md:items-center md:p-5"
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    tint,
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{name}</span>
                  <span className="block text-sm text-muted-foreground">
                    {blurb}
                  </span>
                </span>
                <ArrowUpRight className="absolute right-3 top-3 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 md:static md:ml-auto md:opacity-40" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-start md:justify-between">
          <div className="space-y-1.5">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-foreground">
              <Image src="/icons/icon.svg" alt="" width={20} height={20} unoptimized />
              ClashPerk
              <span className="w-full font-normal text-muted-foreground md:w-auto">
                <span className="hidden md:inline">· </span>
                The all-in-one Clash of Clans bot for Discord.
              </span>
            </p>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>© 2019–{new Date().getFullYear()} ClashPerk</span>
              {LEGAL_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </p>
          </div>
          <p className="max-w-md md:text-right">
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
  );
}
