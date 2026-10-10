"use client";

import { ClanPicker } from "@/components/clan-picker";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/user-avatar";
import { api } from "@/hooks/api/axios";
import {
  CategoryDto,
  ClanLinkedMemberDto,
  ClanLinksDto,
  ListMemberDto,
} from "@/hooks/api/generated";
import { useAuth } from "@/hooks/use-auth";
import { encodeTag, normalizeTag } from "@/lib/tags";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  Check,
  Link2,
  Loader2,
  Lock,
  RotateCw,
  Search,
  Unlink,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";

const ROLE_NAMES: Record<string, string> = {
  leader: "Leader",
  coLeader: "Co-Leader",
  admin: "Elder",
  member: "Member",
};

const ROLE_RANK: Record<string, number> = {
  leader: 0,
  coLeader: 1,
  admin: 2,
  member: 3,
};

type Filter = "all" | "linked" | "unlinked";
type SortKey = "role" | "th" | "name";
type Sort = { key: SortKey; desc: boolean };

const DEFAULT_SORT: Sort = { key: "role", desc: false };

function compareMembers(
  a: ClanLinkedMemberDto,
  b: ClanLinkedMemberDto,
  sort: Sort,
) {
  const dir = sort.desc ? -1 : 1;
  const byRole = (ROLE_RANK[a.role] ?? 9) - (ROLE_RANK[b.role] ?? 9);
  const byTh = b.townHallLevel - a.townHallLevel;
  const byName = a.name.localeCompare(b.name);
  if (sort.key === "role") return dir * byRole || byTh || byName;
  if (sort.key === "th") return dir * byTh || byRole || byName;
  return dir * byName;
}

const discordName = (member: ClanLinkedMemberDto) =>
  member.displayName || member.username || "Unknown";

const unlinkHint = (member: ClanLinkedMemberDto) =>
  member.verified
    ? "Verified links can only be removed by their owner"
    : "Only verified Leaders and Co-Leaders of this clan can unlink";

export default function LinksPage() {
  return (
    <React.Suspense>
      <LinksManager />
    </React.Suspense>
  );
}

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  sort: Sort;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = sort.key === sortKey;
  const Arrow = sort.desc ? ArrowDown : ArrowUp;
  return (
    <th
      className={cn("h-10 px-3 text-left align-middle font-medium", className)}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1 text-xs transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        {active && <Arrow className="size-3" />}
      </button>
    </th>
  );
}

function DiscordCell({
  member,
  ownedCount,
  onOwner,
}: {
  member: ClanLinkedMemberDto;
  ownedCount: number;
  onOwner: () => void;
}) {
  if (!member.userId) {
    return (
      <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
        Not linked
      </span>
    );
  }
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="truncate font-medium">{discordName(member)}</span>
      {member.verified && (
        <BadgeCheck
          className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
          aria-label="Verified"
        />
      )}
      {ownedCount > 1 && (
        <button
          type="button"
          onClick={onOwner}
          title={`Show all ${ownedCount} accounts linked to ${discordName(member)}`}
          className="shrink-0 cursor-pointer rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
        >
          ×{ownedCount}
        </button>
      )}
      {member.username && member.displayName !== member.username && (
        <span className="hidden truncate text-xs text-muted-foreground lg:inline">
          @{member.username}
        </span>
      )}
    </div>
  );
}

function MemberAction({
  member,
  onLink,
  onUnlink,
}: {
  member: ClanLinkedMemberDto;
  onLink: () => void;
  onUnlink: () => void;
}) {
  if (!member.userId) {
    return (
      <Button size="sm" variant="secondary" onClick={onLink}>
        <Link2 /> Link
      </Button>
    );
  }
  if (!member.deletable) {
    return (
      <span
        title={unlinkHint(member)}
        aria-label={unlinkHint(member)}
        className="inline-flex size-8 items-center justify-center text-muted-foreground/60"
      >
        <Lock className="size-3.5" />
      </span>
    );
  }
  return (
    <Button
      size="icon"
      variant="ghost"
      className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      title="Unlink"
      aria-label={`Unlink ${member.name}`}
      onClick={onUnlink}
    >
      <Unlink className="size-4" />
    </Button>
  );
}

function PlayerName({ member }: { member: ClanLinkedMemberDto }) {
  return (
    <div className="min-w-0">
      <Link
        href={`/web/players/${encodeTag(member.tag)}/wars`}
        target="_blank"
        className="block truncate font-medium hover:underline hover:underline-offset-2"
      >
        {member.name}
      </Link>
      <div className="font-mono text-xs text-muted-foreground">
        {member.tag}
      </div>
    </div>
  );
}

function ThChip({ level }: { level: number }) {
  return (
    <span
      title={`Town Hall ${level}`}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold tabular-nums"
    >
      {level}
    </span>
  );
}

function LinksManager() {
  const session = useAuth();
  const guildId = session.user.guild.id;
  const searchParams = useSearchParams();

  const [categories, setCategories] = React.useState<CategoryDto[]>([]);
  const [clansLoaded, setClansLoaded] = React.useState(false);
  const [clanTag, setClanTag] = React.useState<string>("");
  const [clan, setClan] = React.useState<ClanLinksDto | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("all");
  const [owner, setOwner] = React.useState<ClanLinkedMemberDto | null>(null);
  const [sort, setSort] = React.useState<Sort>(DEFAULT_SORT);

  const [linkTarget, setLinkTarget] =
    React.useState<ClanLinkedMemberDto | null>(null);
  const [unlinkTarget, setUnlinkTarget] =
    React.useState<ClanLinkedMemberDto | null>(null);

  React.useEffect(() => {
    const loadClans = async () => {
      try {
        const { data } = await api.guilds.getGuildClans({ guildId });
        const withClans = data.categories.filter((c) => c.clans.length > 0);
        setCategories(withClans);

        const all = withClans.flatMap((category) => category.clans);
        const requested = normalizeTag(searchParams.get("tag") ?? "");
        const initial = all.find((c) => c.tag === requested) ?? all[0];
        if (initial) setClanTag(initial.tag);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setClansLoaded(true);
      }
    };
    loadClans();
  }, [guildId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadLinks = React.useCallback(async () => {
    if (!clanTag) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.clans.getClanLinks({
        clanTag: encodeTag(clanTag),
      });
      setClan(data);
    } catch (err) {
      setClan(null);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [clanTag]);

  React.useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const selectClan = (tag: string) => {
    setClanTag(tag);
    setOwner(null);
    setFilter("all");
  };

  const toggleSort = (key: SortKey) =>
    setSort((prev) =>
      prev.key === key ? { key, desc: !prev.desc } : { key, desc: false },
    );

  const memberList = React.useMemo(() => clan?.memberList ?? [], [clan]);
  const ownedCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of memberList) {
      if (m.userId) counts.set(m.userId, (counts.get(m.userId) ?? 0) + 1);
    }
    return counts;
  }, [memberList]);

  const linkedCount = memberList.filter((m) => m.userId).length;
  const counts: Record<Filter, number> = {
    all: memberList.length,
    linked: linkedCount,
    unlinked: memberList.length - linkedCount,
  };

  const members = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return memberList
      .filter((m) => !owner || m.userId === owner.userId)
      .filter(
        (m) => filter === "all" || (filter === "linked") === Boolean(m.userId),
      )
      .filter(
        (m) =>
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.tag.toLowerCase().includes(q) ||
          m.username?.toLowerCase().includes(q) ||
          m.displayName?.toLowerCase().includes(q),
      )
      .sort((a, b) => compareMembers(a, b, sort));
  }, [memberList, owner, filter, search, sort]);

  const progress = memberList.length ? linkedCount / memberList.length : 0;
  const rowProps = (member: ClanLinkedMemberDto) => ({
    ownedCount: member.userId ? (ownedCounts.get(member.userId) ?? 0) : 0,
    onOwner: () => setOwner(member),
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
        <div className="flex-1 space-y-1">
          <h2 className="text-2xl font-medium tracking-tight md:text-4xl">
            Discord links
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Match clan members to their Discord accounts.
          </p>
        </div>
        <ClanPicker
          categories={categories}
          value={clanTag}
          onChange={selectClan}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
        >
          <span className="flex-1">{error}</span>
          {clanTag && (
            <Button variant="ghost" size="sm" onClick={loadLinks}>
              <RotateCw /> Retry
            </Button>
          )}
        </div>
      )}

      {clansLoaded && !categories.length && !error ? (
        <div className="rounded-2xl border border-dashed py-14 text-center text-sm text-muted-foreground">
          No clans have been added to this server.
        </div>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-[0_1px_2px_rgba(13,15,13,.04)] lg:flex-row lg:items-center lg:gap-6">
            <div className="min-w-0 lg:w-64">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">
                  {clan ? `${linkedCount} of ${memberList.length} linked` : "—"}
                </span>
                {clan && (
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {Math.round(progress * 100)}%
                  </span>
                )}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width]"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>

            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
              {(
                [
                  ["all", "All"],
                  ["linked", "Linked"],
                  ["unlinked", "Not linked"],
                ] as const
              ).map(([key, label]) => {
                const active = filter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(key)}
                    className={cn(
                      "flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "bg-card hover:bg-accent",
                    )}
                  >
                    {label}
                    <span
                      className={
                        active ? "text-background/60" : "text-muted-foreground"
                      }
                    >
                      {counts[key]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative min-w-0 lg:ml-auto lg:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search players or Discord"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {owner && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Accounts linked to</span>
              <span className="flex items-center gap-1.5 rounded-full bg-muted py-1 pl-3 pr-1.5 font-medium">
                {discordName(owner)}
                <button
                  type="button"
                  aria-label="Clear"
                  onClick={() => setOwner(null)}
                  className="cursor-pointer rounded-full p-0.5 hover:bg-foreground/10"
                >
                  <X className="size-3.5" />
                </button>
              </span>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border bg-card shadow-[0_1px_2px_rgba(13,15,13,.04),0_12px_32px_-16px_rgba(13,15,13,.12)]">
            {loading || !clansLoaded ? (
              <ul className="divide-y">
                {Array.from({ length: 8 }, (_, i) => (
                  <li key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="size-7 animate-pulse rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : members.length === 0 ? (
              <p className="py-14 text-center text-sm text-muted-foreground">
                {filter === "unlinked" && !search && !owner
                  ? "Everyone in this clan is linked."
                  : "No members match."}
              </p>
            ) : (
              <>
                <table className="hidden w-full text-sm md:table">
                  <thead className="border-b">
                    <tr>
                      <SortHeader
                        label="TH"
                        sortKey="th"
                        sort={sort}
                        onSort={toggleSort}
                        className="w-14 pl-4"
                      />
                      <SortHeader
                        label="Player"
                        sortKey="name"
                        sort={sort}
                        onSort={toggleSort}
                      />
                      <SortHeader
                        label="Role"
                        sortKey="role"
                        sort={sort}
                        onSort={toggleSort}
                        className="w-32"
                      />
                      <th className="h-10 px-3 text-left text-xs font-medium text-muted-foreground">
                        Discord
                      </th>
                      <th className="w-24" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {members.map((member) => (
                      <tr
                        key={member.tag}
                        className="transition-colors hover:bg-accent/40"
                      >
                        <td className="py-2.5 pl-4 pr-3">
                          <ThChip level={member.townHallLevel} />
                        </td>
                        <td className="max-w-0 px-3 py-2.5">
                          <PlayerName member={member} />
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {ROLE_NAMES[member.role] ?? member.role}
                        </td>
                        <td className="max-w-0 px-3 py-2.5">
                          <DiscordCell member={member} {...rowProps(member)} />
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <MemberAction
                            member={member}
                            onLink={() => setLinkTarget(member)}
                            onUnlink={() => setUnlinkTarget(member)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <ul className="divide-y md:hidden">
                  {members.map((member) => (
                    <li
                      key={member.tag}
                      className="flex items-start gap-3 p-3.5"
                    >
                      <ThChip level={member.townHallLevel} />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <PlayerName member={member} />
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {ROLE_NAMES[member.role] ?? member.role}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <DiscordCell member={member} {...rowProps(member)} />
                          <MemberAction
                            member={member}
                            onLink={() => setLinkTarget(member)}
                            onUnlink={() => setUnlinkTarget(member)}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      )}

      <LinkMemberModal
        guildId={guildId}
        member={linkTarget}
        onClose={() => setLinkTarget(null)}
        onLinked={loadLinks}
      />
      <UnlinkMemberModal
        member={unlinkTarget}
        isSelf={unlinkTarget?.userId === session.user.id}
        onClose={() => setUnlinkTarget(null)}
        onUnlinked={loadLinks}
      />
    </div>
  );
}

function LinkMemberModal({
  guildId,
  member,
  onClose,
  onLinked,
}: {
  guildId: string;
  member: ClanLinkedMemberDto | null;
  onClose: () => void;
  onLinked: () => void;
}) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<ListMemberDto[]>([]);
  const [selected, setSelected] = React.useState<ListMemberDto | null>(null);
  const [searching, setSearching] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!member) {
      setQuery("");
      setResults([]);
      setSelected(null);
      setError(null);
    }
  }, [member]);

  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const { data } = await api.guilds.listMembers({ guildId, query: q });
        setResults(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [guildId, query]);

  const link = async () => {
    if (!member || !selected) return;
    setSaving(true);
    setError(null);
    try {
      await api.links.link({
        playerTag: member.tag,
        userId: selected.id,
        apiToken: null,
      });
      onLinked();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!member}
      onOpenChange={(open) => !open && onClose()}
      title={member ? `Link ${member.name} (${member.tag})` : "Link"}
      description="Search for the Discord member of this server to link this player to."
      footer={
        <Button onClick={link} disabled={!selected || saving}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Link account
        </Button>
      }
    >
      <div className="space-y-3 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search username or display name"
            className="pl-8"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
          />
        </div>

        <div className="max-h-60 space-y-1 overflow-y-auto">
          {searching && (
            <div className="flex justify-center py-4 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
          )}
          {!searching &&
            results.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelected(user)}
                aria-pressed={selected?.id === user.id}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                  selected?.id === user.id
                    ? "border-foreground/40 bg-foreground/[0.06]"
                    : "hover:bg-accent",
                )}
              >
                <UserAvatar
                  src={user.avatarUrl}
                  alt={user.displayName.charAt(0)}
                  className="size-8 shrink-0 rounded-full"
                />
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-medium">{user.displayName}</span>{" "}
                  <span className="text-muted-foreground">
                    @{user.username}
                  </span>
                </span>
                {selected?.id === user.id && (
                  <Check className="size-4 shrink-0" />
                )}
              </button>
            ))}
          {!searching && query.trim().length >= 2 && results.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No members found.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </Modal>
  );
}

function UnlinkMemberModal({
  member,
  isSelf,
  onClose,
  onUnlinked,
}: {
  member: ClanLinkedMemberDto | null;
  isSelf: boolean;
  onClose: () => void;
  onUnlinked: () => void;
}) {
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!member) setError(null);
  }, [member]);

  const unlink = async () => {
    if (!member) return;
    setSaving(true);
    setError(null);
    try {
      await api.links.unlink({ playerTag: encodeTag(member.tag) });
      onUnlinked();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!member}
      onOpenChange={(open) => !open && onClose()}
      title={member ? `Unlink ${member.name} (${member.tag})?` : "Unlink"}
      description={
        member
          ? `This removes the link to ${member.displayName || member.username}.`
          : undefined
      }
      footer={
        <Button variant="destructive" onClick={unlink} disabled={saving}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Unlink
        </Button>
      }
    >
      <div className="space-y-2 py-2 text-sm">
        {isSelf && (
          <p className="rounded-md border border-orange-500/40 bg-orange-500/10 p-3 text-orange-600 dark:text-orange-400">
            This is your own account. You will lose access to features that
            depend on it.
          </p>
        )}
        {error && <p className="text-destructive">{error}</p>}
      </div>
    </Modal>
  );
}
