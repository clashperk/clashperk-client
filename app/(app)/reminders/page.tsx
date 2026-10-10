"use client";

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
import {
  CapitalRaidReminderDto,
  ClanGamesReminderDto,
  ClanWarReminderDto,
  GuildRemindersDto,
} from "@/hooks/api/generated";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  BellOff,
  Clock,
  Hash,
  Info,
  RotateCw,
  Search,
  Shield,
  Swords,
  Trophy,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Kind = "clanWars" | "capitalRaids" | "clanGames";
type AnyReminder =
  ClanWarReminderDto | CapitalRaidReminderDto | ClanGamesReminderDto;
type Fact = { label: string; value: string };

const KINDS: { id: Kind; label: string; event: string; Icon: typeof Swords }[] =
  [
    { id: "clanWars", label: "Clan wars", event: "war", Icon: Swords },
    {
      id: "capitalRaids",
      label: "Capital raids",
      event: "raid weekend",
      Icon: Shield,
    },
    { id: "clanGames", label: "Clan games", event: "clan games", Icon: Trophy },
  ];

const ROLE_NAMES: Record<string, string> = {
  leader: "Leader",
  coLeader: "Co-Leader",
  admin: "Elder",
  member: "Member",
};

const WAR_TYPE_NAMES: Record<string, string> = {
  normal: "Regular",
  friendly: "Friendly",
  cwl: "CWL",
};

const ALL_CLANS = "all";

/** Matches how the bot prints durations: hours and minutes, zero parts dropped. */
function formatDuration(ms: number) {
  const totalMinutes = Math.round(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes}m`;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

/** Collapses consecutive numbers into ranges: [12,13,14,16] → "12–14, 16". */
function formatRanges(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    parts.push(i === j ? `${sorted[i]}` : `${sorted[i]}–${sorted[j]}`);
    i = j;
  }
  return parts.join(", ");
}

const formatRoles = (roles: string[]) =>
  roles.length >= Object.keys(ROLE_NAMES).length
    ? "Any role"
    : roles.map((role) => ROLE_NAMES[role] ?? role).join(", ");

function warFacts(reminder: ClanWarReminderDto): Fact[] {
  if (reminder.silent) return [];
  return [
    { label: "Roles", value: formatRoles(reminder.roles) },
    {
      label: "Town Halls",
      value:
        reminder.townHalls.length >= 17
          ? "Any"
          : `TH ${formatRanges(reminder.townHalls)}`,
    },
    {
      label: "Attacks left",
      value:
        reminder.remaining.length === 0 || reminder.remaining.length === 2
          ? "Any"
          : reminder.remaining.join(", "),
    },
    {
      label: "War types",
      value:
        reminder.warTypes.length === 3
          ? "Any"
          : reminder.warTypes.map((t) => WAR_TYPE_NAMES[t] ?? t).join(", "),
    },
  ];
}

function raidFacts(reminder: CapitalRaidReminderDto): Fact[] {
  return [
    { label: "Roles", value: formatRoles(reminder.roles) },
    {
      label: "Members",
      value: reminder.allMembers ? "All members" : "Only participants",
    },
    reminder.minThreshold
      ? { label: "Min. attacks", value: `${reminder.minThreshold}` }
      : {
          label: "Attacks left",
          value:
            reminder.remaining.length === 6
              ? "Any"
              : reminder.remaining.join(", "),
        },
  ];
}

function gamesFacts(reminder: ClanGamesReminderDto): Fact[] {
  return [
    { label: "Roles", value: formatRoles(reminder.roles) },
    {
      label: "Members",
      value: reminder.allMembers ? "All members" : "Only participants",
    },
    {
      label: "Min. points",
      value: reminder.minPoints === 0 ? "Until maxed" : `${reminder.minPoints}`,
    },
  ];
}

function badgesFor(kind: Kind, reminder: AnyReminder) {
  const badges: { label: string; tone: "muted" | "warn" }[] = [];
  if (kind === "clanWars") {
    const war = reminder as ClanWarReminderDto;
    if (war.disabled) badges.push({ label: "Disabled", tone: "warn" });
    if (war.silent) badges.push({ label: "Message only", tone: "muted" });
    if (war.smartSkip) badges.push({ label: "Skips at 100%", tone: "muted" });
    if (war.randomLimit)
      badges.push({ label: `${war.randomLimit} random`, tone: "muted" });
  }
  if (reminder.linkedOnly) badges.push({ label: "Linked only", tone: "muted" });
  return badges;
}

function factsFor(kind: Kind, reminder: AnyReminder) {
  if (kind === "clanWars") return warFacts(reminder as ClanWarReminderDto);
  if (kind === "capitalRaids")
    return raidFacts(reminder as CapitalRaidReminderDto);
  return gamesFacts(reminder as ClanGamesReminderDto);
}

function ReminderCard({
  kind,
  reminder,
}: {
  kind: Kind;
  reminder: AnyReminder;
}) {
  const event = KINDS.find((k) => k.id === kind)!.event;
  const badges = badgesFor(kind, reminder);
  const facts = factsFor(kind, reminder);
  const disabled =
    kind === "clanWars" && (reminder as ClanWarReminderDto).disabled;

  return (
    <Card className={cn("gap-4 p-4 sm:p-5", disabled && "opacity-60")}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand">
          <Clock className="size-3.5" />
          {formatDuration(reminder.duration)} before {event} ends
        </span>
        {badges.map((badge) => (
          <span
            key={badge.label}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              badge.tone === "warn"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                : "bg-muted text-muted-foreground",
            )}
          >
            {badge.label}
          </span>
        ))}
        <span
          className="ml-auto font-mono text-xs text-muted-foreground"
          title="Reminder ID shown by the bot in Discord"
        >
          {reminder.shortId}
        </span>
      </div>

      <p className="line-clamp-4 whitespace-pre-line text-sm leading-relaxed">
        {reminder.message || (
          <span className="text-muted-foreground">No message</span>
        )}
      </p>

      {facts.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-muted/50 p-3 sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="min-w-0">
              <dt className="text-xs text-muted-foreground">{fact.label}</dt>
              <dd className="truncate text-sm font-medium" title={fact.value}>
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1">
          <Hash className="size-3.5 shrink-0" />
          <span className="truncate">
            {reminder.channelName ?? reminder.channelId}
            {reminder.threadId && " · thread"}
          </span>
        </span>
        <span className="flex flex-wrap gap-1.5">
          {reminder.clans.length === 0 ? (
            <span className="rounded-md border px-2 py-0.5 text-xs">
              All clans
            </span>
          ) : (
            reminder.clans.map((clan) => (
              <span
                key={clan.tag}
                className="rounded-md border px-2 py-0.5 text-xs text-foreground"
                title={clan.tag}
              >
                {clan.name}
              </span>
            ))
          )}
        </span>
      </div>
    </Card>
  );
}

function SkeletonCards() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Loading reminders">
      {[0, 1, 2].map((i) => (
        <Card key={i} className="gap-3 p-5">
          <div className="h-6 w-44 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-14 animate-pulse rounded-xl bg-muted" />
        </Card>
      ))}
    </div>
  );
}

export default function RemindersPage() {
  const session = useAuth();
  const guildId = session.user.guild.id;

  const [data, setData] = useState<GuildRemindersDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<Kind>("clanWars");
  const [clanTag, setClanTag] = useState(ALL_CLANS);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.guilds.getGuildReminders({ guildId });
      setData(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    load();
  }, [load]);

  const clans = useMemo(() => {
    const byTag = new Map<string, string>();
    for (const list of Object.values(data ?? {}) as AnyReminder[][]) {
      for (const reminder of list) {
        for (const clan of reminder.clans) byTag.set(clan.tag, clan.name);
      }
    }
    return [...byTag].sort((a, b) => a[1].localeCompare(b[1]));
  }, [data]);

  const reminders = useMemo(() => {
    const list: AnyReminder[] = data?.[kind] ?? [];
    const q = search.trim().toLowerCase();
    return list
      .filter(
        (r) =>
          clanTag === ALL_CLANS ||
          r.clans.length === 0 ||
          r.clans.some((c) => c.tag === clanTag),
      )
      .filter(
        (r) =>
          !q ||
          r.message.toLowerCase().includes(q) ||
          r.shortId.toLowerCase().includes(q) ||
          r.channelName?.toLowerCase().includes(q) ||
          r.clans.some((c) => c.name.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.duration - a.duration);
  }, [data, kind, clanTag, search]);

  const activeKind = KINDS.find((k) => k.id === kind)!;
  const filtering = clanTag !== ALL_CLANS || search.trim() !== "";

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-medium tracking-tight md:text-4xl">
          Reminders
        </h2>
        <p className="text-sm text-muted-foreground md:text-base">
          Pings ClashPerk sends before a war, raid weekend or clan games ends.
        </p>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          This page is read-only for now. Create, edit or delete reminders from
          Discord, then refresh here to see the changes.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div
          role="tablist"
          aria-label="Reminder type"
          className="flex shrink-0 rounded-full bg-muted p-1"
        >
          {KINDS.map(({ id, label, Icon }) => {
            const active = kind === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setKind(id)}
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex-none",
                  active && "bg-background text-foreground shadow-sm",
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
                {data && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      active ? "bg-brand-soft text-brand" : "bg-background/60",
                    )}
                  >
                    {data[id].length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 gap-2 lg:justify-end">
          <Select value={clanTag} onValueChange={setClanTag}>
            <SelectTrigger className="w-full rounded-full sm:w-52">
              <SelectValue placeholder="All clans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CLANS}>All clans</SelectItem>
              {clans.map(([tag, name]) => (
                <SelectItem key={tag} value={tag}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search message, channel or ID"
              className="rounded-full pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        {loading ? (
          <SkeletonCards />
        ) : error ? (
          <Card className="items-center gap-3 py-10 text-center shadow-none">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={load}>
              <RotateCw />
              Try again
            </Button>
          </Card>
        ) : reminders.length === 0 ? (
          <Card className="items-center gap-3 border-dashed py-12 text-center shadow-none">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <BellOff className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">
                {filtering
                  ? "No reminders match these filters"
                  : `No ${activeKind.label.toLowerCase()} reminders yet`}
              </p>
              <p className="text-sm text-muted-foreground">
                {filtering
                  ? "Try another clan or clear the search."
                  : `Set one up from Discord to ping members before the ${activeKind.event} ends.`}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3">
            {reminders.map((reminder) => (
              <ReminderCard key={reminder.id} kind={kind} reminder={reminder} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
