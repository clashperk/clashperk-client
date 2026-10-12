import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiBuymeacoffee, SiDiscord, SiGithub } from "react-icons/si";

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

const TILE_ICON = "flex size-10 shrink-0 items-center justify-center rounded-xl";

const COMMUNITY_TILES = [
  {
    href: "https://discord.gg/ppuppun",
    name: "Discord",
    blurb: "Get help and updates",
    icon: (
      <span className={cn(TILE_ICON, "bg-[#5865f2]/10 text-[#5865f2]")}>
        <SiDiscord className="size-5" />
      </span>
    ),
  },
  {
    href: "https://github.com/clashperk",
    name: "GitHub",
    blurb: "Browse the source",
    icon: (
      <span className={cn(TILE_ICON, "bg-foreground/[0.06] text-foreground")}>
        <SiGithub className="size-5" />
      </span>
    ),
  },
  {
    href: "https://buymeacoffee.com/clashperk",
    name: "Buy Me a Coffee",
    recommended: true,
    blurb: "Become a supporter",
    icon: (
      <span className={cn(TILE_ICON, "bg-[#ffdd00] text-black")}>
        <SiBuymeacoffee className="size-5" />
      </span>
    ),
  },
  {
    href: "https://www.patreon.com/clashperk",
    name: "Patreon",
    blurb: "Become a supporter",
    icon: (
      <span className={cn(TILE_ICON, "bg-foreground/[0.06]")}>
        <Image src="/icons/patreon.svg" alt="" width={20} height={20} unoptimized />
      </span>
    ),
  },
];

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {COMMUNITY_TILES.map((tile) => (
            <li key={tile.href}>
              <Link
                href={tile.href}
                target="_blank"
                className="group relative flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgba(13,15,13,.18)] md:flex-row md:items-center md:p-5"
              >
                {"recommended" in tile && (
                  <Badge className="absolute -top-2.5 left-4 bg-[#ffdd00] font-semibold text-black md:left-5">
                    Recommended
                  </Badge>
                )}
                {tile.icon}
                <span className="min-w-0">
                  <span className="block font-semibold">{tile.name}</span>
                  <span className="block text-sm text-muted-foreground">
                    {tile.blurb}
                  </span>
                </span>
                <ArrowUpRight className="absolute right-3 top-3 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 md:static md:ml-auto md:opacity-40" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 border-t border-border pt-6">
          <SiteFooterLegal />
        </div>
      </div>
    </footer>
  );
}

/** Copyright, legal links and the Supercell fan content notice. */
export function SiteFooterLegal() {
  return (
    <div className="flex flex-col gap-4 text-xs text-muted-foreground md:flex-row md:items-start md:justify-between">
      <div className="space-y-1.5">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-foreground">
          <Image
            src="/icons/icon.svg"
            alt=""
            width={20}
            height={20}
            unoptimized
          />
          ClashPerk
          <span className="w-full font-normal text-muted-foreground md:w-auto">
            <span className="hidden md:inline">· </span>
            The all-in-one Clash of Clans bot for Discord.
          </span>
        </p>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>© {new Date().getFullYear()} ClashPerk</span>
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
        This material is unofficial and is not endorsed by Supercell. For more
        information see{" "}
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
  );
}
