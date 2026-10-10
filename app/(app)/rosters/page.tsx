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
import { cn } from "@/lib/utils";
import {
  ArrowRightCircle,
  FolderInput,
  ListChecks,
  Loader2,
  Lock,
  Search,
  Trash2,
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
  };

  const activeRoster = rosters.find((r) => r._id === activeRosterId);
  const groupNames = React.useMemo(
    () => new Map(groups.map((g) => [g._id, g.displayName])),
    [groups],
  );

  const memberGroups = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const members = (activeRoster?.members ?? []).filter(
      (m) =>
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.tag.toLowerCase().includes(q) ||
        m.username?.toLowerCase().includes(q),
    );

    const grouped = new Map<string, RosterMemberOfRostersEntity[]>();
    for (const member of members) {
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
        members: list.sort((a, b) => b.townHallLevel - a.townHallLevel),
      }))
      .sort((a, b) =>
        a.id === NO_GROUP
          ? 1
          : b.id === NO_GROUP
            ? -1
            : a.name.localeCompare(b.name),
      );
  }, [activeRoster, groupNames, search]);

  const visibleTags = memberGroups.flatMap((g) => g.members.map((m) => m.tag));
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
        <div className="grid gap-6 md:grid-cols-[17rem_minmax(0,1fr)]">
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
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[17rem_minmax(0,1fr)] md:items-start">
          <aside className="min-w-0 md:sticky md:top-6">
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
            <main className="min-w-0 space-y-4">
              <RosterHeader roster={activeRoster} />

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

                <div className="flex items-center gap-1">
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

                <div className="relative w-full min-w-0 xl:ml-auto xl:w-60">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search members"
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
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
                  {search
                    ? "No members match your search."
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
  return (
    <nav aria-label="Rosters" className="space-y-0.5">
      {rosters.map((roster) => {
        const isActive = roster._id === activeRosterId;
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
                {rosterClanName(roster)}
              </span>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {roster.members.length}/{roster.maxMembers ?? DEFAULT_MAX_MEMBERS}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function RosterHeader({ roster }: { roster: RostersEntity }) {
  const max = roster.maxMembers ?? DEFAULT_MAX_MEMBERS;
  const filled = Math.min(roster.members.length / max, 1);
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
          </p>
        </div>
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
        title="Town Hall"
      >
        {member.townHallLevel}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{member.name}</div>
        <div className="font-mono text-xs text-muted-foreground">
          {member.tag}
        </div>
      </div>
      <div className="hidden min-w-0 text-right md:block">
        <div className="truncate text-xs">{member.clan?.name ?? "No clan"}</div>
        <div className="text-xs text-muted-foreground">{member.role ?? ""}</div>
      </div>
      <div className="w-28 truncate text-right text-xs text-muted-foreground">
        {member.username ? `@${member.username}` : "Not linked"}
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
