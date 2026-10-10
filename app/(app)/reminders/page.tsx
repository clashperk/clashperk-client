"use client";

import { ClanPicker, PickerCategory } from "@/components/clan-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  AlertCircle,
  BellOff,
  BellRing,
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

type Kind = "clanWars" | "capitalRaids" | "clanGames";
type AnyReminder =
  ClanWarReminderDto | CapitalRaidReminderDto | ClanGamesReminderDto;
type Fact = { label: string; value: string };
type Status = "all" | "scheduled" | "idle" | "failing";
type Tone = "ok" | "muted" | "error" | "pending";

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

const STATUSES: { id: Status; label: string }[] = [
  { id: "all", label: "All" },
  { id: "scheduled", label: "Scheduled" },
  { id: "idle", label: "Idle" },
  { id: "failing", label: "Failing" },
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

const isDisabled = (reminder: AnyReminder) =>
  "disabled" in reminder && reminder.disabled;

function badgesFor(kind: Kind, reminder: AnyReminder) {
  const badges: string[] = [];
  if (kind === "clanWars") {
    const war = reminder as ClanWarReminderDto;
    if (war.silent) badges.push("Message only");
    if (war.smartSkip) badges.push("Skips at 100%");
    if (war.randomLimit) badges.push(`${war.randomLimit} random`);
  }
  if (reminder.linkedOnly) badges.push("Linked only");
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

const TONE_DOT: Record<Tone, string> = {
  ok: "bg-emerald-500",
  muted: "bg-muted-foreground/40",
  error: "bg-destructive",
  pending: "bg-sky-500",
};

const TONE_TEXT: Record<Tone, string> = {
  ok: "text-emerald-600 dark:text-emerald-400",
  muted: "text-muted-foreground",
  error: "text-destructive",
  pending: "text-sky-600 dark:text-sky-400",
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

const time = (schedule: ReminderScheduleDto) =>
  new Date(schedule.timestamp).getTime();

function outcomeOf(schedule: ReminderScheduleDto, now: number) {
  if (!schedule.triggered) {
    return {
      label: time(schedule) <= now ? "Sending now" : "Scheduled",
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

function runsOf(reminder: AnyReminder) {
  const sorted = [...reminder.schedules].sort((a, b) => time(a) - time(b));
  const upcoming = sorted.filter((s) => !s.triggered);
  const past = sorted.filter((s) => s.triggered);
  return { upcoming, past, last: past[past.length - 1] };
}

function matchesStatus(reminder: AnyReminder, status: Status, now: number) {
  if (status === "all") return true;
  const { upcoming, last } = runsOf(reminder);
  if (status === "failing")
    return !!last && outcomeOf(last, now).tone === "error";
  if (status === "scheduled") return upcoming.length > 0;
  return upcoming.length === 0;
}

function ReminderRuns({ schedules }: { schedules: ReminderScheduleDto[] }) {
  const [open, setOpen] = useState(false);
  const now = Date.now();
  const { upcoming, past, last } = runsOf({ schedules } as AnyReminder);
  const next = upcoming[0];

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

  const lastOutcome = last && outcomeOf(last, now);
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
              {formatRelative(time(next), now)}
            </span>
            <span className="text-muted-foreground">· {next.clan.name}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <CalendarClock className="size-4" />
            Nothing scheduled
          </span>
        )}
        {last && lastOutcome && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              lastOutcome.tone === "error"
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            <History className="size-4" />
            Last {lastOutcome.label.split(" · ")[0].toLowerCase()}{" "}
            {formatRelative(time(last), now)}
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
                    <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                      {WAR_TYPE_NAMES[schedule.warType]}
                    </span>
                  )}
                </span>
                <span className={cn("text-xs", TONE_TEXT[outcome.tone])}>
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

function ReminderCard({
  kind,
  reminder,
  highlighted,
}: {
  kind: Kind;
  reminder: AnyReminder;
  highlighted: boolean;
}) {
  const badges = badgesFor(kind, reminder);
  const facts = factsFor(kind, reminder);
  const disabled = isDisabled(reminder);

  return (
    <Card
      id={`reminder-${reminder.id}`}
      className={cn(
        "scroll-mt-24 gap-3 p-4 transition-shadow sm:p-5",
        highlighted && "ring-2 ring-foreground/30",
      )}
    >
      <div className={cn("space-y-3", disabled && "opacity-60")}>
        <div className="flex items-start gap-3">
          <p className="line-clamp-3 min-w-0 flex-1 whitespace-pre-line text-sm font-medium leading-relaxed">
            {reminder.message || (
              <span className="font-normal text-muted-foreground">
                No message
              </span>
            )}
          </p>
          <span className="flex shrink-0 items-center gap-1.5">
            {disabled && (
              <span className="rounded-full bg-foreground/[0.07] px-2 py-0.5 text-xs font-medium">
                Disabled
              </span>
            )}
            <span
              className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
              title="Reminder ID shown by the bot in Discord"
            >
              {reminder.shortId}
            </span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-md bg-muted px-2 py-1 text-muted-foreground">
            <Hash className="size-3.5 shrink-0" />
            <span className="truncate">
              {reminder.channelName ?? reminder.channelId}
              {reminder.threadId && " · thread"}
            </span>
          </span>
          {reminder.clans.length === 0 ? (
            <span className="rounded-md border px-2 py-0.5">All clans</span>
          ) : (
            reminder.clans.map((clan) => (
              <span
                key={clan.tag}
                className="rounded-md border px-2 py-0.5"
                title={clan.tag}
              >
                {clan.name}
              </span>
            ))
          )}
          {facts.map((fact) => (
            <span
              key={fact.label}
              className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-muted/70 px-2 py-1"
            >
              <span className="text-muted-foreground">{fact.label}</span>
              <span className="truncate font-medium" title={fact.value}>
                {fact.value}
              </span>
            </span>
          ))}
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-md bg-muted/70 px-2 py-1 text-muted-foreground"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      <ReminderRuns schedules={reminder.schedules} />
    </Card>
  );
}

function SummaryCard({
  data,
  onFocus,
}: {
  data: GuildRemindersDto;
  onFocus: (kind: Kind, id: string) => void;
}) {
  const now = Date.now();
  const all = KINDS.flatMap((k) =>
    (data[k.id] as AnyReminder[]).map((reminder) => ({ kind: k, reminder })),
  );

  const next = all
    .flatMap(({ kind, reminder }) =>
      runsOf(reminder).upcoming.map((schedule) => ({ kind, schedule })),
    )
    .sort((a, b) => time(a.schedule) - time(b.schedule))[0];

  const tones = { ok: 0, muted: 0, error: 0 };
  for (const { reminder } of all) {
    for (const schedule of runsOf(reminder).past) {
      const tone = outcomeOf(schedule, now).tone;
      if (tone !== "pending") tones[tone]++;
    }
  }

  const failing = all.filter(({ reminder }) =>
    matchesStatus(reminder, "failing", now),
  );
  const channels = new Set(all.map(({ reminder }) => reminder.channelId)).size;
  const disabled = all.filter(({ reminder }) => isDisabled(reminder)).length;

  const cells = [
    {
      Icon: CalendarClock,
      label: "Next reminder",
      value: next ? formatRelative(time(next.schedule), now) : "Nothing yet",
      sub: next
        ? `${next.schedule.clan.name} · ${next.kind.label}`
        : "No reminder is scheduled",
    },
    {
      Icon: History,
      label: "Last 3 days",
      value: `${tones.ok} sent`,
      sub: (
        <>
          {tones.muted} skipped ·{" "}
          <span className={cn(tones.error > 0 && "text-destructive")}>
            {tones.error} failed
          </span>
        </>
      ),
    },
    {
      Icon: BellRing,
      label: "Reminders",
      value: `${all.length}`,
      sub: `${channels} channel${channels === 1 ? "" : "s"}${
        disabled ? ` · ${disabled} disabled` : ""
      }`,
    },
  ];

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="grid divide-y @lg:grid-cols-3 @lg:divide-x @lg:divide-y-0">
        {cells.map(({ Icon, label, value, sub }) => (
          <div key={label} className="flex items-start gap-3 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-foreground/[0.06] text-foreground/70">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-medium leading-tight">{value}</p>
              <p className="truncate text-sm text-muted-foreground">{sub}</p>
            </div>
          </div>
        ))}
      </div>
      {failing.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t p-4">
          <span className="inline-flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle className="size-4" />
            Needs attention
          </span>
          {failing.map(({ kind, reminder }) => {
            const last = runsOf(reminder).last!;
            return (
              <button
                key={reminder.id}
                type="button"
                onClick={() => onFocus(kind.id, reminder.id)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <kind.Icon className="size-3.5 text-muted-foreground" />
                <span className="font-mono">{reminder.shortId}</span>
                <span className="text-muted-foreground">
                  {outcomeOf(last, now).label.replace("Failed · ", "")}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function UpcomingCard({
  data,
  onFocus,
}: {
  data: GuildRemindersDto;
  onFocus: (kind: Kind, id: string) => void;
}) {
  const now = Date.now();
  const runs = KINDS.flatMap((kind) =>
    (data[kind.id] as AnyReminder[]).flatMap((reminder) =>
      runsOf(reminder).upcoming.map((schedule) => ({
        kind,
        reminder,
        schedule,
      })),
    ),
  )
    .sort((a, b) => time(a.schedule) - time(b.schedule))
    .slice(0, 6);

  return (
    <Card className="hidden gap-0 p-0 xl:flex">
      <p className="px-4 pt-4 pb-2 text-sm font-medium">Coming up</p>
      {runs.length === 0 ? (
        <p className="px-4 pb-4 text-sm text-muted-foreground">
          Nothing scheduled right now.
        </p>
      ) : (
        <ul className="divide-y px-2 pb-2">
          {runs.map(({ kind, reminder, schedule }) => (
            <li key={schedule.id}>
              <button
                type="button"
                onClick={() => onFocus(kind.id, reminder.id)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.06] text-foreground/70">
                  <kind.Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {schedule.clan.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {reminder.message || reminder.shortId}
                  </span>
                </span>
                <span
                  className="shrink-0 text-xs tabular-nums text-muted-foreground"
                  title={new Date(schedule.timestamp).toLocaleString()}
                >
                  {formatRelative(time(schedule), now)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function SkeletonCards() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Loading reminders">
      {[0, 1, 2].map((i) => (
        <Card key={i} className="gap-3 p-5">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-6 w-56 animate-pulse rounded-md bg-muted" />
          <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        </Card>
      ))}
    </div>
  );
}

export default function RemindersPage() {
  const session = useAuth();
  const guildId = session.user.guild.id;

  const [data, setData] = useState<GuildRemindersDto | null>(null);
  const [categories, setCategories] = useState<PickerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<Kind>("clanWars");
  const [status, setStatus] = useState<Status>("all");
  const [clanTag, setClanTag] = useState("");
  const [search, setSearch] = useState("");
  const [focusId, setFocusId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Clan categories only group the clan filter, so the page works without them.
      const [reminders, clans] = await Promise.all([
        api.guilds.getGuildReminders({ guildId }),
        api.guilds.getGuildClans({ guildId }).catch(() => null),
      ]);
      setData(reminders.data);
      setCategories(clans?.data.categories ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!focusId) return;
    document
      .getElementById(`reminder-${focusId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = setTimeout(() => setFocusId(null), 2000);
    return () => clearTimeout(timer);
  }, [focusId]);

  // Only clans that have a reminder, in the server's category order.
  const pickerCategories = useMemo(() => {
    const used = new Map<string, string>();
    for (const list of Object.values(data ?? {}) as AnyReminder[][]) {
      for (const reminder of list) {
        for (const clan of reminder.clans) used.set(clan.tag, clan.name);
      }
    }
    const grouped: PickerCategory[] = categories
      .map((category) => ({
        _id: category._id,
        displayName: category.displayName,
        clans: category.clans.filter((clan) => used.delete(clan.tag)),
      }))
      .filter((category) => category.clans.length > 0);
    if (used.size) {
      grouped.push({
        _id: "other",
        displayName: grouped.length ? "Other" : "Clans",
        clans: [...used]
          .map(([tag, name]) => ({ tag, name }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      });
    }
    return grouped;
  }, [data, categories]);

  const now = Date.now();
  const byClanAndSearch = useMemo(() => {
    const list: AnyReminder[] = data?.[kind] ?? [];
    const q = search.trim().toLowerCase();
    return list
      .filter(
        (r) =>
          !clanTag ||
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
      );
  }, [data, kind, clanTag, search]);

  const statusCounts = Object.fromEntries(
    STATUSES.map(({ id }) => [
      id,
      byClanAndSearch.filter((r) => matchesStatus(r, id, now)).length,
    ]),
  ) as Record<Status, number>;

  const groups = useMemo(() => {
    const byDuration = new Map<number, AnyReminder[]>();
    for (const reminder of byClanAndSearch) {
      if (!matchesStatus(reminder, status, Date.now())) continue;
      const list = byDuration.get(reminder.duration) ?? [];
      list.push(reminder);
      byDuration.set(reminder.duration, list);
    }
    return [...byDuration].sort((a, b) => b[0] - a[0]);
  }, [byClanAndSearch, status]);

  const activeKind = KINDS.find((k) => k.id === kind)!;
  const filtering = clanTag !== "" || search.trim() !== "" || status !== "all";

  const focus = (target: Kind, id: string) => {
    setKind(target);
    setStatus("all");
    setClanTag("");
    setSearch("");
    setFocusId(id);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-medium tracking-tight md:text-4xl">
          Reminders
        </h2>
        <p className="text-sm text-muted-foreground md:text-base">
          ClashPerk pings members before wars, raid weekends and clan games end.
          See what&apos;s set up and how each run went.
        </p>
        <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
          <Info className="size-3.5 shrink-0" />
          Read-only. Manage reminders in Discord.
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        {data && (
          <aside className="@container space-y-4 xl:sticky xl:top-4 xl:order-2">
            <SummaryCard data={data} onFocus={focus} />
            <UpcomingCard data={data} onFocus={focus} />
          </aside>
        )}

        <div className="flex min-w-0 flex-col gap-6 xl:order-1">
          <div className="@container flex flex-col gap-4 md:sticky md:top-0 md:z-10 md:-my-4 md:bg-background md:py-4">
            <div
              role="tablist"
              aria-label="Reminder type"
              className="flex gap-4 overflow-x-auto border-b @md:gap-5"
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
                      "-mb-px flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 pb-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "border-foreground font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="hidden size-4 @md:block" />
                    {label}
                    {data && (
                      <span className="text-xs font-normal tabular-nums text-muted-foreground">
                        {data[id].length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 @3xl:flex-row @3xl:items-center">
              <div className="relative min-w-0 @3xl:flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search message, channel or ID"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex min-w-0 flex-col gap-2 @xl:flex-row @xl:items-center">
                <div
                  role="radiogroup"
                  aria-label="Reminder status"
                  className="flex h-10 shrink-0 items-center rounded-xl border bg-card p-1"
                >
                  {STATUSES.map(({ id, label }) => {
                    const active = status === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setStatus(id)}
                        className={cn(
                          "flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "bg-foreground/[0.08] font-medium text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {label}
                        {data && (
                          <span
                            className={cn(
                              "text-xs font-normal tabular-nums",
                              id === "failing" && statusCounts.failing > 0
                                ? "text-destructive"
                                : "text-muted-foreground",
                            )}
                          >
                            {statusCounts[id]}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {pickerCategories.length > 0 && (
                  <div className="min-w-0 @xl:w-56 [&>button]:w-full">
                    <ClanPicker
                      categories={pickerCategories}
                      value={clanTag}
                      onChange={setClanTag}
                      allLabel="All clans"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

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
          ) : groups.length === 0 ? (
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
                    ? "Try another status or clan, or clear the search."
                    : `Set one up from Discord to ping members before the ${activeKind.event} ends.`}
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {groups.map(([duration, reminders]) => (
                <section key={duration} className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Clock className="size-4" />
                    {formatDuration(duration)} before the {activeKind.event}{" "}
                    ends
                    <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums">
                      {reminders.length}
                    </span>
                  </h3>
                  <div className="grid gap-3">
                    {reminders.map((reminder) => (
                      <ReminderCard
                        key={reminder.id}
                        kind={kind}
                        reminder={reminder}
                        highlighted={focusId === reminder.id}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
