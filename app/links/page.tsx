"use client";

import { Modal } from "@/components/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/hooks/api/axios";
import {
  ClanLinkedMemberDto,
  ClanLinksDto,
  GuildClanDto,
  ListMemberDto,
} from "@/hooks/api/generated";
import { useAuth } from "@/hooks/use-auth";
import { encodeTag, normalizeTag } from "@/lib/tags";
import { BadgeCheck, Link2, Loader2, Search, Unlink } from "lucide-react";
import { useSearchParams } from "next/navigation";
import * as React from "react";

const ROLE_NAMES: Record<string, string> = {
  leader: "Leader",
  coLeader: "Co-Leader",
  admin: "Elder",
  member: "Member",
};

export default function LinksPage() {
  return (
    <React.Suspense>
      <LinksManager />
    </React.Suspense>
  );
}

function LinksManager() {
  const session = useAuth();
  const guildId = session.user.guild.id;
  const searchParams = useSearchParams();

  const [clans, setClans] = React.useState<GuildClanDto[]>([]);
  const [clanTag, setClanTag] = React.useState<string>("");
  const [clan, setClan] = React.useState<ClanLinksDto | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

  const [linkTarget, setLinkTarget] = React.useState<ClanLinkedMemberDto | null>(null);
  const [unlinkTarget, setUnlinkTarget] = React.useState<ClanLinkedMemberDto | null>(null);

  React.useEffect(() => {
    const loadClans = async () => {
      try {
        const { data } = await api.guilds.getGuildClans({ guildId });
        const guildClans = data.categories.flatMap((category) => category.clans);
        setClans(guildClans);

        const requested = normalizeTag(searchParams.get("tag") ?? "");
        const initial = guildClans.find((c) => c.tag === requested) ?? guildClans[0];
        if (initial) setClanTag(initial.tag);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    loadClans();
  }, [guildId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadLinks = React.useCallback(async () => {
    if (!clanTag) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.clans.getClanLinks({ clanTag: encodeTag(clanTag) });
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

  const members = React.useMemo(() => {
    const list = clan?.memberList ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.tag.toLowerCase().includes(q) ||
        m.username?.toLowerCase().includes(q) ||
        m.displayName?.toLowerCase().includes(q),
    );
  }, [clan, search]);

  const linkedCount = clan?.memberList.filter((m) => m.userId).length ?? 0;

  return (
    <div className="flex flex-col gap-4 p-4 md:px-6 md:pt-6 pb-10">
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm md:flex-row md:items-center">
        <div className="flex-1">
          <h1 className="text-lg font-bold leading-tight">Discord Links</h1>
          <p className="text-xs font-medium text-muted-foreground">
            {clan
              ? `${linkedCount}/${clan.memberList.length} members linked`
              : "Link clan members to their Discord accounts"}
          </p>
        </div>

        <Select value={clanTag} onValueChange={setClanTag}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue placeholder="Select a clan" />
          </SelectTrigger>
          <SelectContent>
            {clans.map((c) => (
              <SelectItem key={c._id} value={c.tag}>
                {c.name} ({c.tag})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="h-9 pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-lg border bg-card">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : !clans.length && !error ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No clans have been added to this server.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-right">TH</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead>Discord</TableHead>
                <TableHead className="w-24 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.tag}>
                  <TableCell className="text-right font-semibold text-orange-400">
                    {member.townHallLevel}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{member.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {member.tag}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {ROLE_NAMES[member.role] ?? member.role}
                  </TableCell>
                  <TableCell>
                    {member.userId ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">
                          {member.displayName || member.username}
                        </span>
                        {member.verified && (
                          <BadgeCheck
                            className="size-4 text-sky-400"
                            aria-label="Verified"
                          />
                        )}
                        {member.username && member.displayName !== member.username && (
                          <span className="hidden text-xs text-muted-foreground md:inline">
                            @{member.username}
                          </span>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Not linked
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.userId ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        disabled={!member.deletable}
                        title={
                          member.deletable
                            ? "Unlink"
                            : member.verified
                              ? "Verified links can only be removed by their owner"
                              : "Only verified Leaders/Co-Leaders of this clan can unlink"
                        }
                        onClick={() => setUnlinkTarget(member)}
                      >
                        <Unlink className="size-4" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => setLinkTarget(member)}>
                        <Link2 className="mr-1 size-4" /> Link
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {clan && members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

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
      await api.links.link({ playerTag: member.tag, userId: selected.id, apiToken: null });
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
          Link Account
        </Button>
      }
    >
      <div className="space-y-3 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Username or display name..."
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
                className={
                  selected?.id === user.id
                    ? "w-full rounded-md border border-primary/50 bg-primary/10 px-3 py-2 text-left text-sm"
                    : "w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-accent"
                }
              >
                <span className="font-medium">{user.displayName}</span>{" "}
                <span className="text-muted-foreground">@{user.username}</span>
              </button>
            ))}
          {!searching && query.trim().length >= 2 && results.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No members found.</p>
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
          <p className="rounded-md border border-orange-500/40 bg-orange-500/10 p-3 text-orange-400">
            This is your own account. You will lose access to features that depend on it.
          </p>
        )}
        {error && <p className="text-destructive">{error}</p>}
      </div>
    </Modal>
  );
}
