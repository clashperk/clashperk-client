import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { SiteFooterLegal } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeToggle } from "./theme-toggle";

export function WebShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader actions={<ThemeToggle />} />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6 md:gap-8 md:py-10">
        {children}
      </main>
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <SiteFooterLegal />
        </div>
      </footer>
    </div>
  );
}

export function WebPage({
  title,
  subtitle,
  image,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  image?: { src: string; alt: string };
  children: React.ReactNode;
}) {
  return (
    <WebShell>
      <div className="flex items-center gap-4">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.src}
            alt={image.alt}
            className="size-14 shrink-0 object-contain"
          />
        )}
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-medium tracking-tight break-words md:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground md:text-base">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </WebShell>
  );
}

export function WebEmpty({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <WebShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed px-6 py-16 text-center">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </WebShell>
  );
}

export function WebCard({
  title,
  className,
  children,
}: {
  title?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-[0_1px_2px_rgba(13,15,13,.04),0_12px_32px_-16px_rgba(13,15,13,.12)]",
        className,
      )}
    >
      {title && (
        <h2 className="border-b px-4 py-3 text-sm font-medium">{title}</h2>
      )}
      {children}
    </section>
  );
}

export function StatGrid({
  stats,
}: {
  stats: { label: string; value: React.ReactNode }[];
}) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border bg-card px-4 py-3">
          <dt className="text-xs text-muted-foreground">{stat.label}</dt>
          <dd className="mt-0.5 text-xl font-medium tabular-nums">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Stars earned on an attack; stars already taken on that base by earlier attacks are greyed. */
export function Stars({
  stars,
  newStars = stars,
}: {
  stars: number;
  newStars?: number;
}) {
  const oldStars = stars - newStars;
  return (
    <span className="inline-flex items-center" aria-label={`${stars} stars`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < oldStars
              ? "fill-muted-foreground/60 text-muted-foreground/60"
              : i < stars
                ? "fill-amber-400 text-amber-500"
                : "text-muted-foreground/30",
          )}
        />
      ))}
    </span>
  );
}

export function TownHall({
  level,
  className,
}: {
  level: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={townHallImage(level)}
      alt={`Town Hall ${level}`}
      title={`Town Hall ${level}`}
      className={cn("size-6 shrink-0 object-contain", className)}
    />
  );
}

export function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

export const townHallImage = (level: number) =>
  `https://assets.clashperk.com/buildings/home_village/town_hall/level_${level}.webp`;
