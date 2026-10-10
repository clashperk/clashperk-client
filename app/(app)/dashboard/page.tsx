"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/hooks/api/axios";
import { CategoryDto, LinksDto, RostersEntity } from "@/hooks/api/generated";
import { useAuth } from "@/hooks/use-auth";
import { categoryTheme } from "@/lib/clan-categories";
import { NO_GUILD_ID } from "@/lib/guild";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BadgeCheck,
  Link2,
  ListChecks,
  Settings2,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const ROSTER_PREVIEW = 4;

type Load<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: T };

function useLoad<T>(fetcher: () => Promise<T>, key: string) {
  const [state, setState] = useState<Load<T>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetcher()
      .then((data) => !cancelled && setState({ status: "ready", data }))
      .catch(
        (err: Error) =>
          !cancelled && setState({ status: "error", message: err.message }),
      );
    return () => {
      cancelled = true;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}

export default function DashboardPage() {
  const { user } = useAuth();

  if (user.guild.id === NO_GUILD_ID) return <NoServer />;
  return <Overview guildId={user.guild.id} />;
}

function Overview({ guildId }: { guildId: string }) {
  const { user } = useAuth();

  const clans = useLoad(
    () =>
      api.guilds
        .getGuildClans({ guildId })
        .then((r) => r.data.categories.filter((c) => c.clans.length > 0)),
    `clans:${guildId}`,
  );
  const rosters = useLoad(
    () => api.rosters.getRosters({ guildId }).then((r) => r.data.rosters),
    `rosters:${guildId}`,
  );
  const links = useLoad(
    () => api.links.getLinks({ userIds: [user.id] }).then((r) => r.data),
    `links:${user.id}`,
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-8">
      <ServerHero clans={clans} rosters={rosters} links={links} />
      <div className="grid gap-4 md:gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <RostersPanel rosters={rosters} />
        <ClansPanel clans={clans} />
      </div>
    </div>
  );
}

function ServerHero({
  clans,
  rosters,
  links,
}: {
  clans: Load<CategoryDto[]>;
  rosters: Load<RostersEntity[]>;
  links: Load<LinksDto[]>;
}) {
  const { user } = useAuth();

  const clanCount =
    clans.status === "ready"
      ? clans.data.reduce((total, c) => total + c.clans.length, 0)
      : 0;
  const open =
    rosters.status === "ready" ? rosters.data.filter((r) => !r.closed) : [];
  const signups = open.reduce((total, r) => total + r.members.length, 0);
  const verified =
    links.status === "ready" ? links.data.filter((l) => l.verified).length : 0;

  return (
    <Card className="relative gap-0 overflow-hidden py-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_0%_0%,color-mix(in_oklab,var(--foreground)_8%,transparent),transparent)]"
      />
      <div className="relative flex flex-col gap-5 p-5 md:flex-row md:items-center md:p-7">
        <Avatar className="size-16 shrink-0 rounded-2xl shadow-sm ring-1 ring-border md:size-20">
          {user.guild.iconUrl && (
            <AvatarImage src={user.guild.iconUrl} alt="" />
          )}
          <AvatarFallback className="rounded-2xl text-xl font-semibold">
            {user.guild.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm text-muted-foreground">
            Welcome back, {user.displayName}
          </p>
          <h2 className="truncate text-2xl font-medium tracking-tight md:text-4xl">
            {user.guild.name}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1 md:flex-none">
            <Link href="/clans">
              <Settings2 />
              Manage clans
            </Link>
          </Button>
          <Button asChild className="flex-1 md:flex-none">
            <Link href="/links">
              <Link2 />
              Link members
            </Link>
          </Button>
        </div>
      </div>

      <dl className="relative grid grid-cols-2 border-t md:grid-cols-4 [&>div]:border-border [&>div:nth-child(odd)]:border-r md:[&>div]:border-r md:[&>div:last-child]:border-r-0 [&>div:nth-child(-n+2)]:border-b md:[&>div:nth-child(-n+2)]:border-b-0">
        <HeroStat
          label="Clans"
          load={clans}
          value={clanCount}
          detail={
            clans.status === "ready"
              ? `${clans.data.length} categories`
              : undefined
          }
        />
        <HeroStat
          label="Open rosters"
          load={rosters}
          value={open.length}
          detail={
            rosters.status === "ready"
              ? `of ${rosters.data.length} rosters`
              : undefined
          }
        />
        <HeroStat
          label="Signed up"
          load={rosters}
          value={signups}
          detail="in open rosters"
        />
        <HeroStat
          label="Your accounts"
          load={links}
          value={links.status === "ready" ? links.data.length : 0}
          detail={verified > 0 ? `${verified} verified` : "none verified"}
          href="/profile"
        />
      </dl>
    </Card>
  );
}

function HeroStat({
  label,
  load,
  value,
  detail,
  href,
}: {
  label: string;
  load: Load<unknown>;
  value: number;
  detail?: string;
  href?: string;
}) {
  const body = (
    <>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1">
        {load.status === "loading" ? (
          <div className="h-8 w-14 animate-pulse rounded-md bg-muted" />
        ) : load.status === "error" ? (
          <span className="text-sm text-muted-foreground">—</span>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight tabular-nums md:text-3xl">
              {value.toLocaleString()}
            </span>
            {detail && (
              <span className="truncate text-xs text-muted-foreground">
                {detail}
              </span>
            )}
          </div>
        )}
      </dd>
    </>
  );

  return (
    <div>
      {href ? (
        <Link
          href={href}
          className="block px-5 py-4 transition-colors hover:bg-accent/50 md:px-7"
        >
          {body}
        </Link>
      ) : (
        <div className="px-5 py-4 md:px-7">{body}</div>
      )}
    </div>
  );
}

function PanelHead({
  title,
  count,
  href,
  action,
  children,
}: {
  title: string;
  count?: number;
  href: string;
  action: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h3 className="text-lg font-medium tracking-tight">
        {title}
        {count !== undefined && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {count}
          </span>
        )}
      </h3>
      {children}
      <Link
        href={href}
        className="ml-auto flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {action}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function ClansPanel({ clans }: { clans: Load<CategoryDto[]> }) {
  const [filter, setFilter] = useState<string | null>(null);

  const categories = useMemo(
    () => (clans.status === "ready" ? clans.data : []),
    [clans],
  );
  const visible = categories.filter((c) => !filter || c._id === filter);
  const total = categories.reduce((n, c) => n + c.clans.length, 0);

  return (
    <section className="min-w-0 space-y-4 xl:order-first">
      <PanelHead
        title="Clans"
        count={clans.status === "ready" ? total : undefined}
        href="/clans"
        action="Manage"
      />

      {categories.length > 1 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
          <FilterChip active={!filter} onClick={() => setFilter(null)}>
            All
          </FilterChip>
          {categories.map((category) => {
            const theme = categoryTheme(category.displayName);
            return (
              <FilterChip
                key={category._id}
                active={filter === category._id}
                onClick={() => setFilter(category._id)}
              >
                <span className={cn("size-1.5 rounded-full", theme.dot)} />
                {category.displayName}
                <span className="text-muted-foreground">
                  {category.clans.length}
                </span>
              </FilterChip>
            );
          })}
        </div>
      )}

      {clans.status === "loading" ? (
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="h-[4.5rem] animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      ) : clans.status === "error" ? (
        <Card className="p-5 text-sm text-destructive">{clans.message}</Card>
      ) : categories.length === 0 ? (
        <Card className="items-center gap-2 border-dashed p-8 text-center shadow-none">
          <p className="font-medium">No clans yet</p>
          <p className="text-sm text-muted-foreground">
            Clans added to this server show up here.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {visible.map((category) => {
            const theme = categoryTheme(category.displayName);
            return (
              <div key={category._id} className="space-y-2.5">
                {!filter && categories.length > 1 && (
                  <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <theme.Icon className="size-3.5" />
                    {category.displayName}
                  </p>
                )}
                <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                  {category.clans.map((clan) => (
                    <li key={clan.tag}>
                      <Link
                        href={`/links?tag=${encodeURIComponent(clan.tag)}`}
                        className="group flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-[0_1px_2px_rgba(13,15,13,.04)] transition-all hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-md"
                      >
                        <div
                          className={cn(
                            "flex size-11 shrink-0 items-center justify-center rounded-xl",
                            theme.tile,
                          )}
                        >
                          <theme.Icon className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium tracking-tight">
                            {clan.name}
                          </p>
                          <p className="truncate font-mono text-xs text-muted-foreground">
                            {clan.tag}
                          </p>
                        </div>
                        <ArrowRight className="size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-foreground bg-foreground text-background [&_.text-muted-foreground]:text-background/60"
          : "bg-card hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

function RostersPanel({ rosters }: { rosters: Load<RostersEntity[]> }) {
  const recent =
    rosters.status === "ready"
      ? [...rosters.data]
          .sort(
            (a, b) =>
              Number(a.closed) - Number(b.closed) ||
              Date.parse(b.lastUpdated) - Date.parse(a.lastUpdated),
          )
          .slice(0, ROSTER_PREVIEW)
      : [];

  return (
    <section className="min-w-0 space-y-4">
      <PanelHead title="Rosters" href="/rosters" action="All rosters" />

      {rosters.status === "loading" ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : rosters.status === "error" ? (
        <Card className="p-5 text-sm text-destructive">{rosters.message}</Card>
      ) : recent.length === 0 ? (
        <Card className="items-center gap-2 border-dashed p-8 text-center shadow-none">
          <ListChecks className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No rosters yet.</p>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {recent.map((roster) => {
            const filled = roster.maxMembers
              ? Math.min(roster.members.length / roster.maxMembers, 1)
              : null;
            return (
              <li key={roster._id}>
                <Link
                  href={`/rosters?roster=${roster._id}`}
                  className="block rounded-2xl border bg-card p-4 shadow-[0_1px_2px_rgba(13,15,13,.04)] transition-all hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 shrink-0 rounded-xl">
                      {roster.clan?.badgeUrl && (
                        <AvatarImage src={roster.clan.badgeUrl} alt="" />
                      )}
                      <AvatarFallback className="rounded-xl bg-foreground/[0.06] text-foreground/70">
                        <ListChecks className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium tracking-tight">
                        {roster.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {roster.clan?.name ?? "No clan"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs",
                        roster.closed
                          ? "bg-muted text-muted-foreground"
                          : "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
                      )}
                    >
                      {!roster.closed && (
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                      )}
                      {roster.closed ? "Closed" : "Open"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      {filled !== null && (
                        <div
                          className="h-full rounded-full bg-foreground/70"
                          style={{ width: `${filled * 100}%` }}
                        />
                      )}
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      <span className="text-foreground">
                        {roster.members.length}
                      </span>
                      {roster.maxMembers ? ` / ${roster.maxMembers}` : ""}{" "}
                      signed up
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/profile"
        className="flex items-center gap-3 rounded-2xl border border-dashed p-4 text-sm transition-colors hover:bg-accent/50"
      >
        <BadgeCheck className="size-4 text-muted-foreground" />
        <span className="flex-1">Link and verify your own accounts</span>
        <ArrowRight className="size-3.5 text-muted-foreground" />
      </Link>
    </section>
  );
}

function NoServer() {
  const { user } = useAuth();

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="max-w-md items-center gap-4 px-6 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground/[0.06] text-foreground/70">
          <Shield className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-medium tracking-tight">
            Hi, {user.displayName}
          </h2>
          <p className="text-sm text-muted-foreground">
            No Discord server is selected. Pick one of the servers you manage.
          </p>
        </div>
        <Button asChild>
          <Link href="/servers">
            Choose a server
            <ArrowRight />
          </Link>
        </Button>
      </Card>
    </div>
  );
}
