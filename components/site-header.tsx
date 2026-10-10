import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
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
  );
}
