"use client";

import { Modal } from "@/components/modal";
import { Badge } from "@/components/ui/badge";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  ChevronRight,
  FolderInput,
  Loader2,
  Lock,
  Menu,
  Search,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import * as React from "react";

const DEFAULT_MAX_MEMBERS = 50;
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

  const [dialog, setDialog] = React.useState<"move" | "group" | "remove" | null>(null);
  const [results, setResults] = React.useState<TransferResult>([]);

  const loadRosters = React.useCallback(async () => {
    try {
      const { data } = await api.rosters.getRosters({ guildId });
      setRosters(data.rosters);
      setGroups(data.categories);
      setActiveRosterId((current) => {
        if (current && data.rosters.some((r) => r._id === current)) return current;
        const requested = searchParams.get("roster");
        return data.rosters.find((r) => r._id === requested)?._id ?? data.rosters[0]?._id ?? "";
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
      const key = member.categoryId && groupNames.has(member.categoryId) ? member.categoryId : NO_GROUP;
      grouped.set(key, [...(grouped.get(key) ?? []), member]);
    }

    return [...grouped.entries()]
      .map(([id, list]) => ({
        id,
        name: id === NO_GROUP ? "No Group" : groupNames.get(id)!,
        members: list.sort((a, b) => b.townHallLevel - a.townHallLevel),
      }))
      .sort((a, b) => (a.id === NO_GROUP ? 1 : b.id === NO_GROUP ? -1 : a.name.localeCompare(b.name)));
  }, [activeRoster, groupNames, search]);

  const visibleTags = memberGroups.flatMap((g) => g.members.map((m) => m.tag));
  const allSelected = visibleTags.length > 0 && visibleTags.every((tag) => selected.has(tag));

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

  const sidebar = (
    <RosterSidebar
      rosters={rosters}
      activeRosterId={activeRosterId}
      onSelect={selectRoster}
    />
  );

  return (
    <div className="h-[calc(100vh)] flex flex-col md:flex-row gap-6 p-4 md:px-6 md:pt-6 pb-10">
      <aside className="hidden md:flex w-72 shrink-0 flex-col gap-4">{sidebar}</aside>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden absolute top-4 right-4 z-50">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="p-0 w-80">
          <div className="h-full p-4 pt-12 flex flex-col gap-4">{sidebar}</div>
        </SheetContent>
      </Sheet>

      <main className="flex-1 flex flex-col min-h-0 gap-4">
        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : !activeRoster ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Shield className="size-16 mb-4 opacity-10" />
            <h3 className="text-lg font-medium">
              {rosters.length ? "Select a Roster" : "No rosters in this server"}
            </h3>
            {!rosters.length && (
              <p className="text-sm">Create one with the /roster create command.</p>
            )}
          </div>
        ) : (
          <>
            <RosterHeader roster={activeRoster} />

            <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2 shadow-sm">
              <label className="flex items-center gap-2 px-2 text-sm">
                <Checkbox
                  checked={allSelected}
                  disabled={!visibleTags.length}
                  onCheckedChange={(checked) => toggle(visibleTags, checked === true)}
                />
                {selected.size ? `${selected.size} selected` : "Select all"}
              </label>

              <div className="ml-auto flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!selected.size || rosters.length < 2}
                  onClick={() => setDialog("move")}
                >
                  <ArrowRightCircle className="mr-1.5 size-4" /> Change Roster
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!selected.size || !groups.length}
                  onClick={() => setDialog("group")}
                >
                  <FolderInput className="mr-1.5 size-4" /> Change Group
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="hover:bg-destructive/10 hover:text-destructive"
                  disabled={!selected.size}
                  onClick={() => setDialog("remove")}
                >
                  <Trash2 className="mr-1.5 size-4" /> Remove
                </Button>
              </div>

              <div className="relative w-full md:w-56">
                <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  className="h-8 pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {results.length > 0 && (
              <div className="rounded-lg border border-orange-500/40 bg-orange-500/10 p-3 text-sm">
                <div className="mb-1 flex items-center justify-between font-medium text-orange-400">
                  Some players could not be moved
                  <Button size="icon" variant="ghost" className="size-6" onClick={() => setResults([])}>
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

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
              {memberGroups.map((group) => {
                const tags = group.members.map((m) => m.tag);
                return (
                  <section key={group.id} className="rounded-lg border bg-card">
                    <header className="flex items-center gap-2 border-b px-3 py-2">
                      <Checkbox
                        checked={tags.every((tag) => selected.has(tag))}
                        onCheckedChange={(checked) => toggle(tags, checked === true)}
                      />
                      <span className="text-sm font-semibold">{group.name}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {group.members.length}
                      </Badge>
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
                <div className="flex h-48 flex-col items-center justify-center text-muted-foreground opacity-60">
                  <Users className="size-10 mb-2 opacity-20" />
                  <p className="text-sm">{search ? "No members found." : "This roster is empty."}</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

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
    <>
      <div className="flex items-center p-4 bg-card border rounded-lg shadow-sm h-[72px] shrink-0">
        <div>
          <h2 className="text-lg font-bold leading-none">Your Rosters</h2>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">
            {rosters.length} Total &middot; {rosters.filter((r) => r.closed).length} Closed
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3">
        {rosters.map((roster) => {
          const isActive = roster._id === activeRosterId;
          return (
            <button
              key={roster._id}
              onClick={() => onSelect(roster._id)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between overflow-hidden",
                isActive
                  ? "bg-primary/10 border-primary/50 ring-1 ring-primary/20"
                  : "bg-card border-border hover:border-primary/20",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn("font-semibold truncate", isActive && "text-primary")}>
                    {roster.name}
                  </span>
                  {roster.closed && <Lock className="size-3 text-muted-foreground shrink-0" />}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                    {roster.members.length}/{roster.maxMembers ?? DEFAULT_MAX_MEMBERS}
                  </Badge>
                  <span className="truncate">{roster.clan.name}</span>
                </div>
              </div>
              {isActive && <ChevronRight className="size-4 text-primary opacity-50 shrink-0" />}
            </button>
          );
        })}
      </div>
    </>
  );
}

function RosterHeader({ roster }: { roster: RostersEntity }) {
  const stats = [
    ["Members", `${roster.members.length}/${roster.maxMembers ?? DEFAULT_MAX_MEMBERS}`],
    roster.minTownHall || roster.maxTownHall
      ? ["Town Hall", `${roster.minTownHall ?? 1} - ${roster.maxTownHall ?? "max"}`]
      : null,
    roster.minHeroLevels ? ["Min. Hero Levels", `${roster.minHeroLevels}`] : null,
  ].filter((stat): stat is string[] => !!stat);

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="p-2 bg-primary/10 rounded-lg text-primary">
        {roster.closed ? <Lock className="size-5" /> : <Shield className="size-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-bold leading-tight flex items-center gap-2">
          {roster.name}
          {roster.closed && (
            <Badge variant="destructive" className="text-[10px] h-5">
              Closed
            </Badge>
          )}
        </h1>
        <p className="text-xs text-muted-foreground font-medium">
          {roster.clan.name} ({roster.clan.tag})
        </p>
      </div>
      <div className="flex gap-6">
        {stats.map(([label, value]) => (
          <div key={label} className="text-right">
            <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
            <div className="font-semibold">{value}</div>
          </div>
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
        "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-accent/50",
        selected && "bg-primary/5",
      )}
    >
      <Checkbox checked={selected} onCheckedChange={(checked) => onToggle(checked === true)} />
      <span className="w-7 text-right font-semibold text-orange-400">{member.townHallLevel}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{member.name}</div>
        <div className="font-mono text-[11px] text-muted-foreground">{member.tag}</div>
      </div>
      <div className="hidden min-w-0 text-right md:block">
        <div className="truncate text-xs">{member.clan?.name ?? "No Clan"}</div>
        <div className="text-[11px] text-muted-foreground">{member.role ?? ""}</div>
      </div>
      <div className="w-32 truncate text-right text-xs text-muted-foreground">
        {member.username ?? "Unlinked"}
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
}: ActionModalProps & { rosters: RostersEntity[]; groups: RosterGroupsEntity[] }) {
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
                    {r.name} · {r.clan.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        {groups.length > 0 && (
          <div className="space-y-2">
            <Label>Group (optional)</Label>
            <GroupSelect groups={groups} value={groupId} onChange={setGroupId} allowNone />
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
      await api.rosters.deleteRosterMembers({ guildId, rosterId: roster._id }, { playerTags });
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
