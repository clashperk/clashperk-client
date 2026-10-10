"use client";

import { Modal } from "@/components/modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/hooks/api/axios";
import {
  RosterGroupsEntity,
  RosterMemberOfRostersEntity,
  RostersEntity,
  TransferRosterMembersDto,
} from "@/hooks/api/generated";
import { useAuth } from "@/hooks/use-auth";
import { categoryTheme } from "@/lib/clan-categories";
import { cn } from "@/lib/utils";
import {
  ArrowRightCircle,
  ArrowUpDown,
  CalendarClock,
  Download,
  FolderInput,
  ListChecks,
  Loader2,
  Lock,
  Search,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import * as React from "react";

const DEFAULT_MAX_MEMBERS = 50;

/** Rosters can be detached from a clan (`/roster edit detach_clan`); the bot calls those "All Clans". */
const rosterClanName = (roster: RostersEntity) =>
  roster.clan?.name ?? "All Clans";
const NO_GROUP = "none";

type TransferResult = TransferRosterMembersDto["result"];
type RosterFilter = "all" | "open" | "closed";
type WarFilter = "all" | "in" | "out";
type MemberSort = "th" | "heroes" | "recent" | "name";

const ROLE_NAMES: Record<string, string> = {
  leader: "Leader",
  coLeader: "Co-Leader",
  admin: "Elder",
  member: "Member",
};

const MEMBER_SORTS: Record<MemberSort, string> = {
  th: "Town Hall",
  heroes: "Hero levels",
  recent: "Newest sign-ups",
  name: "Name (A–Z)",
};

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const heroTotal = (member: RosterMemberOfRostersEntity) =>
  Object.values(member.heroes as Record<string, number>).reduce(
    (total, level) => total + level,
    0,
  );

const heroSummary = (member: RosterMemberOfRostersEntity) =>
  Object.entries(member.heroes as Record<string, number>)
    .map(([hero, level]) => `${hero} ${level}`)
    .join(" · ");

const relativeFormat = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
});

function formatRelative(date: string) {
  const minutes = Math.round((Date.parse(date) - Date.now()) / 60_000);
  if (Math.abs(minutes) < 60) return relativeFormat.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 48) return relativeFormat.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) <= 30) return relativeFormat.format(days, "day");
  return `on ${new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

/** "Opens in 2 days" / "Closes in 5 hours" / "Ended 3 days ago", or null without a schedule. */
function scheduleHint(roster: RostersEntity) {
  const now = Date.now();
  if (roster.startTime && Date.parse(roster.startTime) > now) {
    return `Opens ${formatRelative(roster.startTime)}`;
  }
  if (roster.endTime) {
    return Date.parse(roster.endTime) > now
      ? `Closes ${formatRelative(roster.endTime)}`
      : `Ended ${formatRelative(roster.endTime)}`;
  }
  return null;
}

function compareMembers(
  a: RosterMemberOfRostersEntity,
  b: RosterMemberOfRostersEntity,
  sort: MemberSort,
) {
  if (sort === "name") return a.name.localeCompare(b.name);
  if (sort === "recent")
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  if (sort === "heroes")
    return heroTotal(b) - heroTotal(a) || b.townHallLevel - a.townHallLevel;
  return b.townHallLevel - a.townHallLevel || heroTotal(b) - heroTotal(a);
}

function csvCell(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(
  roster: RostersEntity,
  members: RosterMemberOfRostersEntity[],
  groupNames: Map<string, string>,
) {
  const header = [
    "Name",
    "Tag",
    "Town Hall",
    "Hero levels",
    "Trophies",
    "War preference",
    "Clan",
    "Role",
    "Discord",
    "Group",
    "Signed up",
  ];
  const rows = members.map((m) => [
    m.name,
    m.tag,
    m.townHallLevel,
    heroTotal(m),
    m.trophies,
    m.warPreference ?? "",
    m.clan?.name ?? "",
    m.role ? (ROLE_NAMES[m.role] ?? m.role) : "",
    m.username ?? "",
    (m.categoryId && groupNames.get(m.categoryId)) ?? "",
    m.createdAt,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${roster.name.replace(/[^\w\- ]+/g, "").trim() || "roster"}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function Pills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: [T, string, number?][];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {options.map(([key, label, count]) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(key)}
            className={cn(
              "flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-foreground bg-foreground text-background"
                : "bg-card hover:bg-accent",
            )}
          >
            {label}
            {count !== undefined && (
              <span
                className={
                  active ? "text-background/60" : "text-muted-foreground"
                }
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function RostersPage() {
  return (
    <React.Suspense>
      <RosterManager />
    </React.Suspense>
  );
}

function RosterManager() {
  const session = useAuth();
  const guildId = session.user.guild.id;
  const searchParams = useSearchParams();

  const [rosters, setRosters] = React.useState<RostersEntity[]>([]);
  const [groups, setGroups] = React.useState<RosterGroupsEntity[]>([]);
  const [activeRosterId, setActiveRosterId] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [warFilter, setWarFilter] = React.useState<WarFilter>("all");
  const [memberSort, setMemberSort] = React.useState<MemberSort>("th");

  const [dialog, setDialog] = React.useState<
    "move" | "group" | "remove" | null
  >(null);
  const [results, setResults] = React.useState<TransferResult>([]);

  const loadRosters = React.useCallback(async () => {
    try {
      const { data } = await api.rosters.getRosters({ guildId });
      setRosters(data.rosters);
      setGroups(data.categories);
      setActiveRosterId((current) => {
        if (current && data.rosters.some((r) => r._id === current))
          return current;
        const requested = searchParams.get("roster");
        return (
          data.rosters.find((r) => r._id === requested)?._id ??
          data.rosters[0]?._id ??
          ""
        );
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [guildId]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    loadRosters();
  }, [loadRosters]);

  const selectRoster = (rosterId: string) => {
    setActiveRosterId(rosterId);
    setSelected(new Set());
    setResults([]);
    setWarFilter("all");
  };

  const activeRoster = rosters.find((r) => r._id === activeRosterId);
  const groupNames = React.useMemo(
    () => new Map(groups.map((g) => [g._id, g.displayName])),
    [groups],
  );

  const rosterMembers = React.useMemo(
    () => activeRoster?.members ?? [],
    [activeRoster],
  );
  const warCounts: Record<WarFilter, number> = {
    all: rosterMembers.length,
    in: rosterMembers.filter((m) => m.warPreference === "in").length,
    out: rosterMembers.filter((m) => m.warPreference === "out").length,
  };

  const visibleMembers = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rosterMembers
      .filter((m) => warFilter === "all" || m.warPreference === warFilter)
      .filter(
        (m) =>
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.tag.toLowerCase().includes(q) ||
          m.username?.toLowerCase().includes(q),
      )
      .sort((a, b) => compareMembers(a, b, memberSort));
  }, [rosterMembers, warFilter, search, memberSort]);

  const memberGroups = React.useMemo(() => {
    const grouped = new Map<string, RosterMemberOfRostersEntity[]>();
    for (const member of visibleMembers) {
      const key =
        member.categoryId && groupNames.has(member.categoryId)
          ? member.categoryId
          : NO_GROUP;
      grouped.set(key, [...(grouped.get(key) ?? []), member]);
    }

    return [...grouped.entries()]
      .map(([id, list]) => ({
        id,
        name: id === NO_GROUP ? "No Group" : groupNames.get(id)!,
        members: list,
      }))
      .sort((a, b) =>
        a.id === NO_GROUP
          ? 1
          : b.id === NO_GROUP
            ? -1
            : a.name.localeCompare(b.name),
      );
  }, [visibleMembers, groupNames]);

  const visibleTags = visibleMembers.map((m) => m.tag);
  const allSelected =
    visibleTags.length > 0 && visibleTags.every((tag) => selected.has(tag));

  const toggle = (tags: string[], checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      tags.forEach((tag) => (checked ? next.add(tag) : next.delete(tag)));
      return next;
    });
  };

  const onActionDone = async (result: TransferResult = []) => {
    setDialog(null);
    setSelected(new Set());
    setResults(result.filter((r) => !r.success));
    await loadRosters();
  };

  const openCount = rosters.filter((r) => !r.closed).length;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-medium tracking-tight md:text-4xl">
          Rosters
        </h2>
        <p className="text-sm text-muted-foreground md:text-base">
          {loading
            ? "Sign-up lists for wars, CWL and events."
            : `${rosters.length} rosters, ${openCount} open for sign-ups.`}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-[18rem_minmax(0,1fr)]">
          <div className="hidden space-y-2 md:block">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-2xl bg-muted" />
            <div className="h-64 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      ) : !rosters.length ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-14 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground/[0.06] text-foreground/70">
            <ListChecks className="size-6" />
          </div>
          <p className="font-medium">No rosters in this server</p>
          <p className="text-sm text-muted-foreground">
            Create one in Discord with the bot.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[18rem_minmax(0,1fr)] md:items-start">
          <aside className="min-w-0 md:sticky md:top-4">
            <Select value={activeRosterId} onValueChange={selectRoster}>
              <SelectTrigger className="w-full md:hidden">
                <SelectValue placeholder="Select a roster" />
              </SelectTrigger>
              <SelectContent>
                {rosters.map((roster) => (
                  <SelectItem key={roster._id} value={roster._id}>
                    {roster.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="hidden md:block">
              <RosterSidebar
                rosters={rosters}
                activeRosterId={activeRosterId}
                onSelect={selectRoster}
              />
            </div>
          </aside>

          {activeRoster && (
            <main className="@container min-w-0 space-y-4">
              <RosterHeader roster={activeRoster} />

              <div className="space-y-2.5 md:sticky md:top-0 md:z-10 md:-my-4 md:bg-background md:py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex h-9 shrink-0 items-center gap-2 rounded-full border bg-card px-3.5 text-sm">
                    <Checkbox
                      checked={allSelected}
                      disabled={!visibleTags.length}
                      onCheckedChange={(checked) =>
                        toggle(visibleTags, checked === true)
                      }
                    />
                    {selected.size ? `${selected.size} selected` : "Select all"}
                  </label>

                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={!selected.size || rosters.length < 2}
                      onClick={() => setDialog("move")}
                    >
                      <ArrowRightCircle /> Change roster
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={!selected.size || !groups.length}
                      onClick={() => setDialog("group")}
                    >
                      <FolderInput /> Change group
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:bg-destructive/10 hover:text-destructive"
                      disabled={!selected.size}
                      onClick={() => setDialog("remove")}
                    >
                      <Trash2 /> Remove
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 @3xl:flex-row @3xl:items-center">
                  <div className="relative min-w-0 @3xl:min-w-48 @3xl:max-w-72 @3xl:flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search members"
                      className="pl-9"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 @3xl:ml-auto">
                    <div
                      role="radiogroup"
                      aria-label="War preference"
                      className="inline-flex h-10 shrink-0 items-center rounded-xl border bg-card p-1"
                    >
                      {(
                        [
                          ["all", "All"],
                          ["in", "In war"],
                          ["out", "Out"],
                        ] as const
                      ).map(([key, label]) => {
                        const active = warFilter === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setWarFilter(key)}
                            className={cn(
                              "flex h-full cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              active
                                ? "bg-foreground/[0.08] font-medium text-foreground"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {label}
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {warCounts[key]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <Select
                      value={memberSort}
                      onValueChange={(v) => setMemberSort(v as MemberSort)}
                    >
                      <SelectTrigger
                        className="ml-auto shrink-0 @md:ml-0 @md:min-w-0 @md:flex-1 @3xl:w-44 @3xl:flex-none"
                        aria-label="Sort members"
                        title="Sort members"
                      >
                        <ArrowUpDown className="size-4 text-muted-foreground" />
                        <span className="hidden min-w-0 truncate @md:block">
                          <SelectValue />
                        </span>
                      </SelectTrigger>
                      <SelectContent align="end">
                        {(Object.keys(MEMBER_SORTS) as MemberSort[]).map(
                          (key) => (
                            <SelectItem key={key} value={key}>
                              {MEMBER_SORTS[key]}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-10 shrink-0 rounded-xl"
                      title="Export shown members as CSV"
                      aria-label="Export shown members as CSV"
                      disabled={!visibleMembers.length}
                      onClick={() =>
                        downloadCsv(activeRoster, visibleMembers, groupNames)
                      }
                    >
                      <Download className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {results.length > 0 && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm"
                >
                  <div className="mb-1 flex items-center justify-between font-medium text-destructive">
                    Some players could not be moved
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6"
                      aria-label="Dismiss"
                      onClick={() => setResults([])}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                  <ul className="space-y-0.5 text-muted-foreground">
                    {results.map((r, i) => (
                      <li key={i}>
                        <span className="font-medium text-foreground">
                          {r.player.name} ({r.player.tag})
                        </span>
                        : {r.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {memberGroups.map((group) => {
                const tags = group.members.map((m) => m.tag);
                return (
                  <section
                    key={group.id}
                    className="overflow-hidden rounded-2xl border bg-card shadow-[0_1px_2px_rgba(13,15,13,.04)]"
                  >
                    <header className="flex items-center gap-2.5 border-b px-4 py-2.5">
                      <Checkbox
                        checked={tags.every((tag) => selected.has(tag))}
                        onCheckedChange={(checked) =>
                          toggle(tags, checked === true)
                        }
                      />
                      <span className="text-sm font-medium">{group.name}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                        {group.members.length}
                      </span>
                    </header>
                    <div className="divide-y">
                      {group.members.map((member) => (
                        <MemberRow
                          key={member.tag}
                          member={member}
                          selected={selected.has(member.tag)}
                          onToggle={(checked) => toggle([member.tag], checked)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
              {memberGroups.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">
                  <Users className="size-5" />
                  {search || warFilter !== "all"
                    ? "No members match these filters."
                    : "Nobody has signed up yet."}
                </div>
              )}
            </main>
          )}
        </div>
      )}

      {activeRoster && (
        <>
          <MoveMembersModal
            open={dialog === "move"}
            guildId={guildId}
            roster={activeRoster}
            rosters={rosters}
            groups={groups}
            playerTags={[...selected]}
            onClose={() => setDialog(null)}
            onDone={onActionDone}
          />
          <ChangeGroupModal
            open={dialog === "group"}
            guildId={guildId}
            roster={activeRoster}
            groups={groups}
            playerTags={[...selected]}
            onClose={() => setDialog(null)}
            onDone={onActionDone}
          />
          <RemoveMembersModal
            open={dialog === "remove"}
            guildId={guildId}
            roster={activeRoster}
            playerTags={[...selected]}
            onClose={() => setDialog(null)}
            onDone={onActionDone}
          />
        </>
      )}
    </div>
  );
}

function RosterBadge({
  roster,
  className,
}: {
  roster: RostersEntity;
  className?: string;
}) {
  return (
    <Avatar className={cn("shrink-0 rounded-lg", className)}>
      {roster.clan?.badgeUrl && (
        <AvatarImage src={roster.clan.badgeUrl} alt="" />
      )}
      <AvatarFallback className="rounded-lg bg-foreground/[0.06] text-foreground/70">
        <ListChecks className="size-4" />
      </AvatarFallback>
    </Avatar>
  );
}

function RosterSidebar({
  rosters,
  activeRosterId,
  onSelect,
}: {
  rosters: RostersEntity[];
  activeRosterId: string;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<RosterFilter>("all");
  const q = query.trim().toLowerCase();

  const counts: Record<RosterFilter, number> = {
    all: rosters.length,
    open: rosters.filter((r) => !r.closed).length,
    closed: rosters.filter((r) => r.closed).length,
  };

  const sections = React.useMemo(() => {
    const visible = rosters.filter(
      (r) =>
        (filter === "all" || (filter === "closed") === r.closed) &&
        (!q ||
          r.name.toLowerCase().includes(q) ||
          rosterClanName(r).toLowerCase().includes(q)),
    );
    const byCategory = new Map<string, RostersEntity[]>();
    for (const roster of visible) {
      const key = roster.category || "GENERAL";
      byCategory.set(key, [...(byCategory.get(key) ?? []), roster]);
    }
    return [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [rosters, filter, q]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search rosters"
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Pills
        value={filter}
        onChange={setFilter}
        options={[
          ["all", "All", counts.all],
          ["open", "Open", counts.open],
          ["closed", "Closed", counts.closed],
        ]}
      />
      <nav aria-label="Rosters" className="space-y-3">
        {sections.map(([category, list]) => {
          const theme = categoryTheme(category);
          return (
            <div key={category} className="space-y-0.5">
              <p className="flex items-center gap-1.5 px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <theme.Icon className="size-3.5" />
                {titleCase(category)}
              </p>
              {list.map((roster) => {
                const isActive = roster._id === activeRosterId;
                const hint = scheduleHint(roster);
                return (
                  <button
                    key={roster._id}
                    type="button"
                    onClick={() => onSelect(roster._id)}
                    aria-current={isActive}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition-colors",
                      isActive ? "bg-foreground/[0.07]" : "hover:bg-accent/60",
                    )}
                  >
                    <RosterBadge roster={roster} className="size-9" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "truncate text-sm",
                            isActive ? "font-medium" : "text-foreground/80",
                          )}
                        >
                          {roster.name}
                        </span>
                        {roster.closed && (
                          <Lock className="size-3 shrink-0 text-muted-foreground" />
                        )}
                      </div>
                      <span className="block truncate text-xs text-muted-foreground">
                        {hint ?? rosterClanName(roster)}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {roster.members.length}/
                      {roster.maxMembers ?? DEFAULT_MAX_MEMBERS}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
        {sections.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            No rosters match.
          </p>
        )}
      </nav>
    </div>
  );
}

function RosterHeader({ roster }: { roster: RostersEntity }) {
  const max = roster.maxMembers ?? DEFAULT_MAX_MEMBERS;
  const filled = Math.min(roster.members.length / max, 1);
  const hint = scheduleHint(roster);
  const facts = [
    roster.minTownHall || roster.maxTownHall
      ? [
          "Town Hall",
          `${roster.minTownHall ?? 1}–${roster.maxTownHall ?? "max"}`,
        ]
      : null,
    roster.minHeroLevels
      ? ["Min. hero levels", `${roster.minHeroLevels}`]
      : null,
  ].filter((fact): fact is string[] => !!fact);
  const rules = [
    roster.allowUnlinked ? "Unlinked players allowed" : "Linked players only",
    roster.allowMultiSignup ? "Can join other rosters too" : null,
    roster.allowCategorySelection ? "Players pick their group" : null,
  ].filter((rule): rule is string => !!rule);

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-[0_1px_2px_rgba(13,15,13,.04),0_12px_32px_-16px_rgba(13,15,13,.12)] md:p-5">
      <div className="flex items-center gap-3">
        <RosterBadge roster={roster} className="size-12 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-medium tracking-tight">
              {roster.name}
            </h3>
            <span
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs",
                roster.closed
                  ? "bg-muted text-muted-foreground"
                  : "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
              )}
            >
              {roster.closed ? (
                <Lock className="size-3" />
              ) : (
                <span className="size-1.5 rounded-full bg-emerald-500" />
              )}
              {roster.closed ? "Closed" : "Open"}
            </span>
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {roster.clan ? (
              <>
                {roster.clan.name}{" "}
                <span className="font-mono text-xs">{roster.clan.tag}</span>
              </>
            ) : (
              "All Clans"
            )}
            {" · "}
            {titleCase(roster.category || "GENERAL")}
          </p>
        </div>
        {hint && (
          <span className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <CalendarClock className="size-3.5" />
            {hint}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex min-w-48 flex-1 items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground/70"
              style={{ width: `${filled * 100}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">
            <span className="text-foreground">{roster.members.length}</span> /{" "}
            {max} signed up
          </span>
        </div>
        {facts.map(([label, value]) => (
          <span
            key={label}
            className="flex items-center gap-1.5 rounded-lg bg-muted/70 px-2.5 py-1 text-xs"
          >
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {rules.map((rule) => (
          <span
            key={rule}
            className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground"
          >
            {rule}
          </span>
        ))}
        {hint && (
          <span className="flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground sm:hidden">
            <CalendarClock className="size-3" />
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}

function MemberRow({
  member,
  selected,
  onToggle,
}: {
  member: RosterMemberOfRostersEntity;
  selected: boolean;
  onToggle: (checked: boolean) => void;
}) {
  const heroes = heroTotal(member);
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent/50",
        selected && "bg-foreground/[0.04]",
      )}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={(checked) => onToggle(checked === true)}
      />
      <span
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold tabular-nums"
        title={`Town Hall ${member.townHallLevel}`}
      >
        {member.townHallLevel}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{member.name}</span>
          {member.warPreference && (
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-px text-[11px]",
                member.warPreference === "in"
                  ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                  : "bg-muted text-muted-foreground",
              )}
            >
              War {member.warPreference}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{member.tag}</span>
          {heroes > 0 && (
            <span title={heroSummary(member)} className="tabular-nums">
              · Heroes {heroes}
            </span>
          )}
          {member.trophies > 0 && (
            <span className="hidden items-center gap-0.5 tabular-nums sm:flex">
              · <Trophy className="size-3" />
              {member.trophies.toLocaleString()}
            </span>
          )}
        </div>
      </div>
      <div className="hidden min-w-0 text-right md:block">
        <div className="truncate text-xs">{member.clan?.name ?? "No clan"}</div>
        <div className="text-xs text-muted-foreground">
          {member.role ? (ROLE_NAMES[member.role] ?? member.role) : ""}
        </div>
      </div>
      <div className="w-28 text-right text-xs">
        <div className="truncate text-muted-foreground">
          {member.username ? `@${member.username}` : "Not linked"}
        </div>
        <div
          className="text-muted-foreground/70"
          title={new Date(member.createdAt).toLocaleString()}
        >
          {formatRelative(member.createdAt).replace(/^on /, "")}
        </div>
      </div>
    </label>
  );
}

function GroupSelect({
  groups,
  value,
  onChange,
  allowNone,
}: {
  groups: RosterGroupsEntity[];
  value: string;
  onChange: (value: string) => void;
  allowNone?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a group" />
      </SelectTrigger>
      <SelectContent>
        {allowNone && <SelectItem value={NO_GROUP}>Keep no group</SelectItem>}
        {groups.map((group) => (
          <SelectItem key={group._id} value={group._id}>
            {group.displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface ActionModalProps {
  open: boolean;
  guildId: string;
  roster: RostersEntity;
  playerTags: string[];
  onClose: () => void;
  onDone: (result?: TransferResult) => Promise<void>;
}

function useAction() {
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const run = async (action: () => Promise<void>) => {
    setSaving(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return { saving, error, run, reset: () => setError(null) };
}

function MoveMembersModal({
  rosters,
  groups,
  ...props
}: ActionModalProps & {
  rosters: RostersEntity[];
  groups: RosterGroupsEntity[];
}) {
  const { open, guildId, roster, playerTags, onClose, onDone } = props;
  const [targetId, setTargetId] = React.useState("");
  const [groupId, setGroupId] = React.useState(NO_GROUP);
  const { saving, error, run, reset } = useAction();

  React.useEffect(() => {
    if (open) {
      setTargetId("");
      setGroupId(NO_GROUP);
      reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () =>
    run(async () => {
      const { data } = await api.rosters.transferRosterMembers(
        { guildId, rosterId: roster._id },
        {
          playerTags,
          newRosterId: targetId,
          newGroupId: groupId === NO_GROUP ? undefined : groupId,
        },
      );
      await onDone(data.result);
    });

  return (
    <Modal
      open={open}
      onOpenChange={(value) => !value && onClose()}
      title={`Move ${playerTags.length} player(s)`}
      description="Players are signed up to the new roster, subject to its requirements, and removed from this one."
      footer={
        <Button onClick={submit} disabled={!targetId || saving}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Move Players
        </Button>
      }
    >
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label>Roster</Label>
          <Select value={targetId} onValueChange={setTargetId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a roster" />
            </SelectTrigger>
            <SelectContent>
              {rosters
                .filter((r) => r._id !== roster._id)
                .map((r) => (
                  <SelectItem key={r._id} value={r._id}>
                    {r.name} · {rosterClanName(r)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        {groups.length > 0 && (
          <div className="space-y-2">
            <Label>Group (optional)</Label>
            <GroupSelect
              groups={groups}
              value={groupId}
              onChange={setGroupId}
              allowNone
            />
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </Modal>
  );
}

function ChangeGroupModal({
  groups,
  ...props
}: ActionModalProps & { groups: RosterGroupsEntity[] }) {
  const { open, guildId, roster, playerTags, onClose, onDone } = props;
  const [groupId, setGroupId] = React.useState("");
  const { saving, error, run, reset } = useAction();

  React.useEffect(() => {
    if (open) {
      setGroupId("");
      reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () =>
    run(async () => {
      await api.rosters.transferRosterMembers(
        { guildId, rosterId: roster._id },
        { playerTags, newGroupId: groupId },
      );
      await onDone();
    });

  return (
    <Modal
      open={open}
      onOpenChange={(value) => !value && onClose()}
      title={`Change group of ${playerTags.length} player(s)`}
      footer={
        <Button onClick={submit} disabled={!groupId || saving}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Change Group
        </Button>
      }
    >
      <div className="space-y-2 py-2">
        <GroupSelect groups={groups} value={groupId} onChange={setGroupId} />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </Modal>
  );
}

function RemoveMembersModal(props: ActionModalProps) {
  const { open, guildId, roster, playerTags, onClose, onDone } = props;
  const { saving, error, run, reset } = useAction();

  React.useEffect(() => {
    if (open) reset();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () =>
    run(async () => {
      await api.rosters.deleteRosterMembers(
        { guildId, rosterId: roster._id },
        { playerTags },
      );
      await onDone();
    });

  return (
    <Modal
      open={open}
      onOpenChange={(value) => !value && onClose()}
      title={`Remove ${playerTags.length} player(s)?`}
      description={`They will be removed from ${roster.name}.`}
      footer={
        <Button variant="destructive" onClick={submit} disabled={saving}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Remove
        </Button>
      }
    >
      {error && <p className="py-2 text-sm text-destructive">{error}</p>}
    </Modal>
  );
}
