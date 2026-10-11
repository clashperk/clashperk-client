"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/hooks/api/axios";
import {
  AggregateAttackHistoryDto,
  AggregateClanWarLeagueHistoryDto,
  GlobalClanHistoryEntity,
  LinksDto,
} from "@/hooks/api/generated";
import { encodeTag } from "@/lib/tags";
import { cn } from "@/lib/utils";
import { ArrowUpRight, RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const HISTORY_MONTHS = 6;
/** The tracker records players outside any clan under this tag. */
const NO_CLAN_TAG = "#00000";

type Load<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: T };

function useLoad<T>(fetcher: () => Promise<T>, key: string) {
  const [state, setState] = useState<Load<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

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
  }, [key, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  return [state, () => setAttempt((n) => n + 1)] as const;
}

const formatSeason = (season: string) =>
  new Date(`${season}-01T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

const formatMonth = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });

const percent = (part: number, whole: number) =>
  whole ? `${Math.round((part / whole) * 100)}%` : "—";

function StatsCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-0 p-0">
      <div className="space-y-0.5 border-b px-5 py-4">
        <h4 className="font-medium tracking-tight">{title}</h4>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </Card>
  );
}

function CardState<T>({
  load,
  retry,
  empty,
  isEmpty,
  children,
}: {
  load: Load<T>;
  retry: () => void;
  empty: string;
  isEmpty: (data: T) => boolean;
  children: (data: T) => React.ReactNode;
}) {
  if (load.status === "loading") {
    return (
      <div className="space-y-3 p-5" aria-busy="true">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
      </div>
    );
  }
  if (load.status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
        <p className="text-sm text-destructive">{load.message}</p>
        <Button variant="outline" size="sm" onClick={retry}>
          <RotateCw />
          Try again
        </Button>
      </div>
    );
  }
  if (isEmpty(load.data)) {
    return (
      <div className="m-4 rounded-xl border border-dashed px-5 py-8 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    );
  }
  return <>{children(load.data)}</>;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-medium tabular-nums tracking-tight">{value}</p>
    </div>
  );
}

function WarsCard({ tag, startDate }: { tag: string; startDate: string }) {
  const [load, retry] = useLoad(
    () =>
      api.players
        .aggregateAttackHistory({ playerTag: encodeTag(tag), startDate })
        .then((r) => r.data.items),
    `wars:${tag}`,
  );

  return (
    <StatsCard
      title="All wars"
      subtitle={`Regular, friendly and CWL wars in the last ${HISTORY_MONTHS} months`}
    >
      <CardState
        load={load}
        retry={retry}
        isEmpty={(items) => items.length === 0}
        empty={`No wars in the last ${HISTORY_MONTHS} months.`}
      >
        {(items: AggregateAttackHistoryDto[]) => {
          const total = items.reduce(
            (sum, s) => ({
              wars: sum.wars + s.totalWars,
              attacks: sum.attacks + s.totalAttacks,
              triples: sum.triples + s.total3Stars,
              missed: sum.missed + s.totalMissed,
            }),
            { wars: 0, attacks: 0, triples: 0, missed: 0 },
          );
          const seasons = [...items].sort((a, b) =>
            b.season.localeCompare(a.season),
          );
          return (
            <>
              <div className="grid grid-cols-2 gap-4 px-5 py-4 sm:grid-cols-4">
                <Stat label="Wars" value={total.wars} />
                <Stat label="Attacks" value={total.attacks} />
                <Stat
                  label="3-star rate"
                  value={percent(total.triples, total.attacks)}
                />
                <Stat label="Missed" value={total.missed} />
              </div>
              <ul className="divide-y border-t text-sm">
                {seasons.map((s) => (
                  <li
                    key={s.season}
                    className="flex items-center justify-between gap-3 px-5 py-2.5"
                  >
                    <span className="font-medium">
                      {formatSeason(s.season)}
                    </span>
                    <span className="text-right tabular-nums text-muted-foreground">
                      {s.totalWars} {s.totalWars === 1 ? "war" : "wars"} ·{" "}
                      {s.total3Stars}/{s.totalAttacks} triples
                      {s.totalMissed > 0 && (
                        <span className="text-foreground">
                          {" "}
                          · {s.totalMissed} missed
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          );
        }}
      </CardState>
    </StatsCard>
  );
}

function CwlCard({ tag, startDate }: { tag: string; startDate: string }) {
  const [load, retry] = useLoad(
    () =>
      api.players
        .aggregateClanWarLeagueHistory({
          playerTag: encodeTag(tag),
          startDate,
        })
        .then((r) => r.data.items),
    `cwl:${tag}`,
  );

  return (
    <StatsCard
      title="Clan War League"
      subtitle={`Each CWL season in the last ${HISTORY_MONTHS} months`}
    >
      <CardState
        load={load}
        retry={retry}
        isEmpty={(items) => items.length === 0}
        empty={`No CWL in the last ${HISTORY_MONTHS} months.`}
      >
        {(items: AggregateClanWarLeagueHistoryDto[]) => {
          // A player can play two CWL groups in one month (e.g. after changing clans).
          const perSeason = new Map<string, number>();
          for (const s of items) {
            perSeason.set(s.season, (perSeason.get(s.season) ?? 0) + 1);
          }
          const seen = new Map<string, number>();
          return (
            <ul className="divide-y text-sm">
              {[...items]
                .sort((a, b) => b.season.localeCompare(a.season))
                .map((s) => {
                  const nth = (seen.get(s.season) ?? 0) + 1;
                  seen.set(s.season, nth);
                  const count = perSeason.get(s.season)!;
                  return (
                    <li
                      key={`${s.season}-${nth}`}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3"
                    >
                      <span className="font-medium">
                        {formatSeason(s.season)}
                        {count > 1 && (
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            ({nth} of {count})
                          </span>
                        )}
                      </span>
                      <span className="flex flex-wrap gap-x-3 tabular-nums text-muted-foreground">
                        <span>{s.totalStars} stars</span>
                        <span title="Rounds this account played">
                          {s.totalWars}/{s.rounds} rounds
                        </span>
                        <span title="Average destruction per attack">
                          {s.totalAttacks
                            ? `${Math.round(s.totalDestruction / s.totalAttacks)}% avg`
                            : "—"}
                        </span>
                        {s.totalMissed > 0 && (
                          <span className="text-foreground">
                            {s.totalMissed} missed
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
            </ul>
          );
        }}
      </CardState>
    </StatsCard>
  );
}

function HistoryCard({ tag }: { tag: string }) {
  const [load, retry] = useLoad(
    () =>
      api.players
        .getClanHistory({ playerTag: encodeTag(tag) })
        .then((r) => r.data.items),
    `history:${tag}`,
  );

  return (
    <StatsCard
      title="Clan history"
      subtitle="Clans ClashPerk has seen this account in"
    >
      <CardState
        load={load}
        retry={retry}
        isEmpty={(items) => items.length === 0}
        empty="ClashPerk hasn't seen this account in a clan yet."
      >
        {(items: GlobalClanHistoryEntity[]) => {
          return (
            <ul className="divide-y text-sm">
              {[...items]
                .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
                .map((entry) => {
                  const noClan = entry.clan.tag === NO_CLAN_TAG;
                  const from = formatMonth(entry.firstSeen);
                  const to = formatMonth(entry.lastSeen);
                  return (
                    <li
                      key={`${entry.clan.tag}-${entry.firstSeen}`}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "truncate font-medium",
                            noClan && "text-muted-foreground",
                          )}
                        >
                          {noClan ? "Not in a clan" : entry.clan.name}
                        </p>
                        {!noClan && (
                          <p className="font-mono text-xs text-muted-foreground">
                            {entry.clan.tag}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-right tabular-nums text-muted-foreground">
                        {from === to ? from : `${from} – ${to}`}
                      </span>
                    </li>
                  );
                })}
            </ul>
          );
        }}
      </CardState>
    </StatsCard>
  );
}

export function AccountStats({ players }: { players: LinksDto[] }) {
  const [selected, setSelected] = useState(players[0]?.tag ?? "");
  // Computed once so every card asks for the same window and caches stay warm.
  const [startDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - HISTORY_MONTHS);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  });

  const player = players.find((p) => p.tag === selected) ?? players[0] ?? null;
  if (!player) return null;

  return (
    <section className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-lg font-medium tracking-tight">Account stats</h3>
          <p className="text-sm text-muted-foreground">
            War performance and clan history for your linked accounts.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/web/players/${encodeTag(player.tag)}/wars`}>
            Full war history
            <ArrowUpRight />
          </Link>
        </Button>
      </div>

      {players.length > 1 && (
        <div
          role="tablist"
          aria-label="Account"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {players.map((p) => {
            const active = p.tag === player.tag;
            return (
              <button
                key={p.tag}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelected(p.tag)}
                className={cn(
                  "flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-transparent bg-foreground/[0.07] font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p.name}
                <span className="font-mono text-xs text-muted-foreground">
                  {p.tag}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
        <div className="space-y-4">
          <WarsCard tag={player.tag} startDate={startDate} />
          <CwlCard tag={player.tag} startDate={startDate} />
        </div>
        <HistoryCard tag={player.tag} />
      </div>
    </section>
  );
}
