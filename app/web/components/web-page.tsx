import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import Link from "next/link";

export function WebPage({
  title,
  subtitle,
  aside,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-sky-400">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {aside}
      </header>
      <div className="rounded-lg border bg-card">{children}</div>
      <footer className="mt-6 text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          ClashPerk
        </Link>
      </footer>
    </div>
  );
}

export function WebEmpty({ message }: { message: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

/** Stars earned on an attack; `newStars` highlights the stars that were new for the base. */
export function Stars({
  stars,
  newStars = stars,
}: {
  stars: number;
  newStars?: number;
}) {
  const oldStars = stars - newStars;
  return (
    <span className="inline-flex items-center">
      {Array.from({ length: 3 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < oldStars
              ? "fill-muted-foreground text-muted-foreground"
              : i < stars
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30",
          )}
        />
      ))}
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
  `https://cdn.coc.guide/static/imgs/other/town-hall-${level}.png`;
