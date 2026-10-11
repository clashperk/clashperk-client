"use client";

import { ClanPicker } from "@/components/clan-picker";
import { StickyBar } from "@/components/sticky-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/hooks/api/axios";
import { LastSeenMemberDto } from "@/hooks/api/generated";
import { useClanOptions, useClanSelection } from "@/hooks/use-clan-options";
import { encodeTag } from "@/lib/tags";
import { cn } from "@/lib/utils";
import { Info, RotateCw, Search, UserRoundX } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Bucket = "all" | "today" | "week" | "inactive";
type Sort = "oldest" | "newest" | "most" | "least" | "townHall";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
/** Not seen for this long counts as inactive, matching what leaders usually act on. */
const INACTIVE_AFTER = 7 * DAY;

const BUCKETS: { id: Bucket; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "week", label: "1–7 days" },
  { id: "inactive", label: "7+ days" },
];

const SORTS: { id: Sort; label: string }[] = [
  { id: "oldest", label: "Least recently seen" },
  { id: "newest", label: "Most recently seen" },
  { id: "least", label: "Least active" },
  { id: "most", label: "Most active" },
  { id: "townHall", label: "Town Hall" },
];

const relativeFormat = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
});

function formatAgo(ms: number) {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return relativeFormat.format(-minutes, "minute");
  const hours = Math.round(ms / HOUR);
  if (hours < 48) return relativeFormat.format(-hours, "hour");
  return relativeFormat.format(-Math.round(ms / DAY), "day");
}

const sinceSeen = (member: LastSeenMemberDto, now: number) =>
  now - new Date(member.lastSeen).getTime();

function bucketOf(member: LastSeenMemberDto, now: number): Bucket {
  const age = sinceSeen(member, now);
  if (age < DAY) return "today";
  if (age < INACTIVE_AFTER) return "week";
  return "inactive";
}

// Members with no activity in 30 days come back without `scores`.
const score = (member: LastSeenMemberDto, key: "last24h" | "last30d") =>
  member.scores?.[key] ?? 0;

const SORTERS: Record<
  Sort,
  (a: LastSeenMemberDto, b: LastSeenMemberDto) => number
> = {
  oldest: (a, b) => a.lastSeen.localeCompare(b.lastSeen),
  newest: (a, b) => b.lastSeen.localeCompare(a.lastSeen),
  least: (a, b) => score(a, "last30d") - score(b, "last30d"),
  most: (a, b) => score(b, "last30d") - score(a, "last30d"),
  townHall: (a, b) => b.townHallLevel - a.townHallLevel,
};

function ThChip({ level }: { level: number }) {
  return (
    <span
      title={`Town Hall ${level}`}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold tabular-nums"
    >
      {level}
    </span>
  );
}

function MemberRow({
  member,
  now,
}: {
  member: LastSeenMemberDto;
  now: number;
}) {
  const age = sinceSeen(member, now);
  const day = score(member, "last24h");
  const month = score(member, "last30d");

  return (
    <li className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <ThChip level={member.townHallLevel} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{member.name}</p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {member.tag}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={cn(
            "text-sm tabular-nums",
            age >= INACTIVE_AFTER && "text-muted-foreground",
          )}
          title={new Date(member.lastSeen).toLocaleString()}
        >
          {formatAgo(age)}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {month === 0 ? (
            "No activity in 30 days"
          ) : (
            <>
              <span title="Activity in the last 24 hours">{day} today</span>
              {" · "}
              <span title="Activity in the last 30 days">{month} in 30d</span>
            </>
          )}
        </p>
      </div>
    </li>
  );
}

function SkeletonRows() {
  return (
    <Card
      className="gap-0 divide-y p-0"
      aria-busy="true"
      aria-label="Loading activity"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 sm:px-5">
          <div className="size-8 animate-pulse rounded-lg bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-1.5">
            <div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-3 w-28 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </Card>
  );
}

export default function ActivityPage() {
  const options = useClanOptions();
  const { clanTag, setClanTag, openTag, opening, openError } = useClanSelection(
    options.categories,
    options.status === "ready",
    options.saveClan,
  );

  const [members, setMembers] = useState<LastSeenMemberDto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const [bucket, setBucket] = useState<Bucket>("all");
  const [sort, setSort] = useState<Sort>("oldest");
  const [search, setSearch] = useState("");

  const loadMembers = useCallback(async () => {
    if (!clanTag) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.clans.getLastSeen({
        clanTag: encodeTag(clanTag),
      });
      setMembers(data.items);
      setNow(Date.now());
    } catch (err) {
      setMembers(null);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [clanTag]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const selectClan = (tag: string) => {
    setClanTag(tag);
    setBucket("all");
    setSearch("");
  };

  const counts = useMemo(() => {
    const result: Record<Bucket, number> = {
      all: 0,
      today: 0,
      week: 0,
      inactive: 0,
    };
    for (const member of members ?? []) {
      result.all++;
      result[bucketOf(member, now)]++;
    }
    return result;
  }, [members, now]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (members ?? [])
      .filter((m) => bucket === "all" || bucketOf(m, now) === bucket)
      .filter(
        (m) =>
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.tag.toLowerCase().includes(q),
      )
      .sort(SORTERS[sort]);
  }, [members, bucket, search, sort, now]);

  const filtering = bucket !== "all" || search.trim() !== "";

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
        <div className="flex-1 space-y-1">
          <h2 className="text-2xl font-medium tracking-tight md:text-4xl">
            Activity
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            When each member was last seen in the game, and how active
            they&apos;ve been.
          </p>
          <p className="flex items-start gap-1.5 pt-1 text-xs text-muted-foreground">
            <Info className="mt-px size-3.5 shrink-0" />
            Activity counts what ClashPerk saw a member do: attacks, donations,
            war and raid hits, achievements. Refreshes every 10 minutes.
          </p>
        </div>
        {options.status === "ready" && (
          <div className="flex flex-col gap-1.5 xl:items-end">
            <ClanPicker
              categories={options.categories}
              value={clanTag}
              onChange={selectClan}
              onAddTag={openTag}
            />
            {(opening || openError) && (
              <p
                role={openError ? "alert" : undefined}
                className={cn(
                  "text-xs",
                  openError ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {openError ?? "Looking up clan…"}
              </p>
            )}
          </div>
        )}
      </div>

      {options.status === "loading" ? (
        <SkeletonRows />
      ) : options.status === "error" ? (
        <Card className="items-center gap-3 py-10 text-center shadow-none">
          <p className="text-sm text-destructive">{options.error}</p>
          <Button variant="outline" size="sm" onClick={options.reload}>
            <RotateCw />
            Try again
          </Button>
        </Card>
      ) : !clanTag ? (
        <Card className="items-center gap-1 border-dashed py-12 text-center shadow-none">
          <p className="font-medium">Pick a clan to see its activity</p>
          <p className="text-sm text-muted-foreground">
            Paste any clan tag into the picker, or link your account on Profile
            to see your own clan here.
          </p>
        </Card>
      ) : (
        <section className="flex min-w-0 flex-col gap-4">
          <StickyBar className="@container">
            <div className="flex flex-col gap-2 @3xl:flex-row @3xl:items-center">
              <div className="relative min-w-0 @3xl:flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name or tag"
                  aria-label="Search members"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex min-w-0 flex-col gap-2 @xl:flex-row @xl:items-center">
                <div
                  role="radiogroup"
                  aria-label="Last seen"
                  className="flex h-10 shrink-0 items-center rounded-xl border bg-card p-1"
                >
                  {BUCKETS.map(({ id, label }) => {
                    const active = bucket === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setBucket(id)}
                        className={cn(
                          "flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "bg-foreground/[0.08] font-medium text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {label}
                        {members && (
                          <span className="text-xs font-normal tabular-nums text-muted-foreground">
                            {counts[id]}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <Select
                  value={sort}
                  onValueChange={(value) => setSort(value as Sort)}
                >
                  <SelectTrigger
                    aria-label="Sort members"
                    className="w-full @xl:w-52"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORTS.map(({ id, label }) => (
                      <SelectItem key={id} value={id}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </StickyBar>

          {loading || (!members && !error) ? (
            <SkeletonRows />
          ) : error ? (
            <Card className="items-center gap-3 py-10 text-center shadow-none">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={loadMembers}>
                <RotateCw />
                Try again
              </Button>
            </Card>
          ) : visible.length === 0 ? (
            <Card className="items-center gap-3 border-dashed py-12 text-center shadow-none">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground/[0.06] text-foreground/70">
                <UserRoundX className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">
                  {filtering
                    ? "No members match these filters"
                    : "No activity recorded for this clan yet"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {filtering
                    ? "Try another filter or clear the search."
                    : "ClashPerk starts tracking members once the clan is linked."}
                </p>
              </div>
            </Card>
          ) : (
            <Card className="gap-0 p-0">
              <ul className="divide-y">
                {visible.map((member) => (
                  <MemberRow key={member.tag} member={member} now={now} />
                ))}
              </ul>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
