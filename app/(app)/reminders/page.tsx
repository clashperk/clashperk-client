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
  ReminderScheduleDto,
} from "@/hooks/api/generated";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  BellOff,
  CalendarClock,
  ChevronDown,
  Clock,
  Hash,
  History,
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

const UNRESTRICTED = new Set(["Any", "Any role", "All members"]);

/** Only the filters that actually narrow who gets pinged. */
function factsFor(kind: Kind, reminder: AnyReminder) {
  const facts =
    kind === "clanWars"
      ? warFacts(reminder as ClanWarReminderDto)
      : kind === "capitalRaids"
        ? raidFacts(reminder as CapitalRaidReminderDto)
        : gamesFacts(reminder as ClanGamesReminderDto);
  return facts.filter((fact) => !UNRESTRICTED.has(fact.value));
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
        <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.07] px-2.5 py-1 text-xs font-medium text-foreground">
          <Clock className="size-3.5" />
          {formatDuration(reminder.duration)} before {event} ends
        </span>
        {badges.map((badge) => (
          <span
            key={badge.label}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              badge.tone === "warn"
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-300"
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
        <dl className="flex flex-wrap gap-1.5">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="flex max-w-full items-center gap-1.5 rounded-lg bg-muted/70 px-2.5 py-1 text-xs"
            >
              <dt className="text-muted-foreground">{fact.label}</dt>
              <dd className="truncate font-medium" title={fact.value}>
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

      <ReminderRuns schedules={reminder.schedules} />
    </Card>
  );
}

const OUTCOMES: Record<string, { label: string; tone: Tone }> = {
  reminder_sent_successfully: { label: "Sent", tone: "ok" },
  no_recipient: { label: "Skipped · nobody to ping", tone: "muted" },
  reminder_disabled: { label: "Skipped · reminder disabled", tone: "muted" },
  reminder_not_found: { label: "Skipped · reminder deleted", tone: "muted" },
  invalid_war_type: { label: "Skipped · war type not included", tone: "muted" },
  not_in_war: { label: "Skipped · clan not in war", tone: "muted" },
  war_ended: { label: "Skipped · war already ended", tone: "muted" },
  war_id_unmatched: { label: "Skipped · different war", tone: "muted" },
  too_late: { label: "Skipped · too late", tone: "muted" },
  channel_not_found: { label: "Failed · channel not found", tone: "error" },
  channel_missing_permissions: {
    label: "Failed · missing channel permissions",
    tone: "error",
  },
  guild_not_found: { label: "Failed · bot not in server", tone: "error" },
};

type Tone = "ok" | "muted" | "error" | "pending";

const TONE_DOT: Record<Tone, string> = {
  ok: "bg-emerald-500",
  muted: "bg-muted-foreground/40",
  error: "bg-destructive",
  pending: "bg-sky-500",
};

const WAR_TYPE_SHORT: Record<string, string> = {
  normal: "Regular",
  friendly: "Friendly",
  cwl: "CWL",
};

const relativeFormat = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
});

function formatRelative(target: number, now: number) {
  const minutes = Math.round((target - now) / 60_000);
  if (Math.abs(minutes) < 60) return relativeFormat.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 48) return relativeFormat.format(hours, "hour");
  return relativeFormat.format(Math.round(hours / 24), "day");
}

const formatWhen = (date: Date) =>
  date.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

function outcomeOf(schedule: ReminderScheduleDto, now: number) {
  if (!schedule.triggered) {
    const due = new Date(schedule.timestamp).getTime() <= now;
    return {
      label: due ? "Sending now" : "Scheduled",
      tone: "pending" as Tone,
    };
  }
  return (
    OUTCOMES[schedule.reason ?? ""] ?? {
      label: "Handled",
      tone: "muted" as Tone,
    }
  );
}

function ReminderRuns({ schedules }: { schedules: ReminderScheduleDto[] }) {
  const [open, setOpen] = useState(false);
  const now = Date.now();

  const upcoming = schedules.filter((s) => !s.triggered);
  const past = schedules.filter((s) => s.triggered);
  const next = upcoming[0];
  const last = past[past.length - 1];

  if (schedules.length === 0) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="size-4" />
          Nothing scheduled
        </span>
        <span className="inline-flex items-center gap-1.5">
          <History className="size-4" />
          No runs in the last 3 days
        </span>
      </div>
    );
  }

  // Upcoming soonest first, then history newest first.
  const rows = [...upcoming, ...[...past].reverse()];

  return (
    <div className="border-t pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 rounded-lg text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {next ? (
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-4 text-sky-600 dark:text-sky-400" />
            <span className="text-muted-foreground">Next</span>
            <span className="font-medium">
              {formatRelative(new Date(next.timestamp).getTime(), now)}
            </span>
            <span className="text-muted-foreground">· {next.clan.name}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <CalendarClock className="size-4" />
            Nothing scheduled
          </span>
        )}
        {last && (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <History className="size-4" />
            Last {outcomeOf(last, now).label.split(" · ")[0].toLowerCase()}{" "}
            {formatRelative(new Date(last.timestamp).getTime(), now)}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
          {open ? "Hide" : "Show"} {schedules.length} run
          {schedules.length === 1 ? "" : "s"}
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </span>
      </button>

      {open && (
        <ul className="mt-3 divide-y rounded-xl border">
          {rows.map((schedule) => {
            const outcome = outcomeOf(schedule, now);
            const when = new Date(schedule.timestamp);
            return (
              <li
                key={schedule.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm"
              >
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    TONE_DOT[outcome.tone],
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {schedule.clan.name}
                  {schedule.warType && (
                    <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[11px] font-normal text-muted-foreground">
                      {WAR_TYPE_SHORT[schedule.warType]}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    outcome.tone === "ok" &&
                      "text-emerald-600 dark:text-emerald-400",
                    outcome.tone === "error" && "text-destructive",
                    outcome.tone === "pending" &&
                      "text-sky-600 dark:text-sky-400",
                    outcome.tone === "muted" && "text-muted-foreground",
                  )}
                >
                  {outcome.label}
                </span>
                <time
                  dateTime={schedule.timestamp}
                  title={when.toLocaleString()}
                  className="w-full text-xs tabular-nums text-muted-foreground sm:w-auto sm:min-w-44 sm:text-right"
                >
                  {formatWhen(when)} · {formatRelative(when.getTime(), now)}
                </time>
              </li>
            );
          })}
        </ul>
      )}
    </div>
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
        <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
          <Info className="size-3.5 shrink-0" />
          Read-only. Manage reminders in Discord.
        </p>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
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
                  "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:flex-none",
                  active && "bg-background text-foreground shadow-sm",
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
                {data && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      active ? "bg-foreground/10" : "bg-background/60",
                    )}
                  >
                    {data[id].length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row xl:justify-end">
          <Select value={clanTag} onValueChange={setClanTag}>
            <SelectTrigger className="w-full shrink-0 rounded-full sm:w-52">
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
          <div className="relative min-w-0 flex-1 xl:w-64 xl:flex-none">
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
            <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground/[0.06] text-foreground/70">
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
