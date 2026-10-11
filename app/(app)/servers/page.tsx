"use client";

import { StickyBar } from "@/components/sticky-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useAuth } from "@/hooks/use-auth";
import type { ServerOption } from "@/lib/discord-servers";
import { NO_GUILD_ID } from "@/lib/guild";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  Loader2,
  Plus,
  RotateCw,
  Search,
  Server,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SiDiscord } from "react-icons/si";

const CLIENT_ID = "526971716711350273";
const USAGE_KEY = "clashperk.serverUsage";
const SORT_KEY = "clashperk.serverSort";

const inviteUrl = (guildId: string) =>
  `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&guild_id=${guildId}&disable_guild_select=true`;

const SORTS = {
  recommended: "Recommended",
  recent: "Recently used",
  clans: "Most clans",
  members: "Most members",
  name: "Name (A–Z)",
} as const;
type Sort = keyof typeof SORTS;

const FILTERS = {
  all: "All",
  added: "ClashPerk is here",
  notAdded: "Not added",
} as const;
type Filter = keyof typeof FILTERS;

/** Per-browser record of when each server was last opened from the picker. */
type Usage = Record<string, number>;

function readUsage(): Usage {
  try {
    return JSON.parse(localStorage.getItem(USAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function recordUsage(guildId: string) {
  try {
    localStorage.setItem(
      USAGE_KEY,
      JSON.stringify({ ...readUsage(), [guildId]: Date.now() }),
    );
  } catch {}
}

function readSort(): Sort {
  try {
    const saved = localStorage.getItem(SORT_KEY);
    return saved && saved in SORTS ? (saved as Sort) : "recommended";
  } catch {
    return "recommended";
  }
}

const compareName = (a: ServerOption, b: ServerOption) =>
  a.name.localeCompare(b.name);
const compareClans = (a: ServerOption, b: ServerOption) =>
  b.clanCount - a.clanCount;
const compareMembers = (a: ServerOption, b: ServerOption) =>
  (b.memberCount ?? 0) - (a.memberCount ?? 0);

function sortServers(
  servers: ServerOption[],
  sort: Sort,
  usage: Usage,
  currentId: string,
) {
  const recent = (a: ServerOption, b: ServerOption) =>
    (usage[b.id] ?? 0) - (usage[a.id] ?? 0);
  const chains: Record<Sort, ((a: ServerOption, b: ServerOption) => number)[]> =
    {
      recommended: [
        (a, b) => Number(b.id === currentId) - Number(a.id === currentId),
        recent,
        compareClans,
        compareMembers,
        compareName,
      ],
      recent: [recent, compareName],
      clans: [compareClans, compareMembers, compareName],
      members: [compareMembers, compareName],
      name: [compareName],
    };
  return [...servers].sort((a, b) => {
    for (const compare of chains[sort]) {
      const result = compare(a, b);
      if (result) return result;
    }
    return 0;
  });
}

const plural = (n: number, word: string) =>
  `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;

function serverStats(server: ServerOption) {
  const parts: string[] = [];
  if (server.hasBot) {
    parts.push(plural(server.clanCount, "clan"));
  }
  if (server.memberCount !== null)
    parts.push(plural(server.memberCount, "member"));
  return parts.join(" · ");
}

type Load =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "needsDiscord" }
  | { status: "ready"; servers: ServerOption[] };

function ServerIcon({
  server,
  className,
}: {
  server: Pick<ServerOption, "name" | "iconUrl">;
  className?: string;
}) {
  return (
    <Avatar className={cn("size-12 shrink-0 rounded-2xl", className)}>
      {server.iconUrl && <AvatarImage src={server.iconUrl} alt="" />}
      <AvatarFallback className="rounded-2xl bg-foreground/[0.06] text-sm font-semibold text-foreground/70">
        {server.name
          .split(/\s+/)
          .map((word) => word.match(/[\p{L}\p{N}]/u)?.[0] ?? "")
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

export default function ServersPage() {
  const { user } = useAuth();
  const { update } = useSession();
  const router = useRouter();

  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [selecting, setSelecting] = useState<string | null>(null);
  const [selectError, setSelectError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("recommended");
  const [usage, setUsage] = useState<Usage>({});

  useEffect(() => {
    setSort(readSort());
    setUsage(readUsage());
  }, []);

  const changeSort = (next: Sort) => {
    setSort(next);
    try {
      localStorage.setItem(SORT_KEY, next);
    } catch {}
  };

  const fetchServers = useCallback(async () => {
    setLoad({ status: "loading" });
    try {
      const res = await fetch("/api/servers", { cache: "no-store" });
      const body = await res.json();
      if (!res.ok)
        throw new Error(body.message ?? `Request failed (${res.status})`);
      setLoad(
        body.needsDiscord
          ? { status: "needsDiscord" }
          : { status: "ready", servers: body.servers },
      );
    } catch (err) {
      setLoad({ status: "error", message: (err as Error).message });
    }
  }, []);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const open = async (server: ServerOption) => {
    recordUsage(server.id);
    if (server.id === user.guild.id) {
      router.push("/dashboard");
      return;
    }
    setSelecting(server.id);
    setSelectError(null);
    const session = await update({ guildId: server.id });
    if (session?.user.guild.id === server.id) {
      // Full load so every server-rendered part and the API token pick up the new server.
      window.location.assign("/dashboard");
      return;
    }
    setSelecting(null);
    setSelectError(
      `Couldn't switch to ${server.name}. Check that you still manage it and try again.`,
    );
  };

  const all = useMemo(
    () => (load.status === "ready" ? load.servers : []),
    [load],
  );
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matching = all.filter(
      (s) =>
        (!q || s.name.toLowerCase().includes(q)) &&
        (filter === "all" || (filter === "added") === s.hasBot),
    );
    return sortServers(matching, sort, usage, user.guild.id);
  }, [all, search, filter, sort, usage, user.guild.id]);

  const withBot = visible.filter((s) => s.hasBot);
  const withoutBot = visible.filter((s) => !s.hasBot);
  const counts: Record<Filter, number> = {
    all: all.length,
    added: all.filter((s) => s.hasBot).length,
    notAdded: all.filter((s) => !s.hasBot).length,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-medium tracking-tight md:text-4xl">
          Choose a server
        </h2>
        <p className="text-sm text-muted-foreground md:text-base">
          Pick the Discord server you want to manage.
        </p>
      </div>

      {selectError && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
        >
          {selectError}
        </div>
      )}

      {load.status === "loading" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="h-[4.75rem] animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      ) : load.status === "error" ? (
        <Card className="items-center gap-3 py-10 text-center shadow-none">
          <p className="text-sm text-destructive">{load.message}</p>
          <Button variant="outline" size="sm" onClick={fetchServers}>
            <RotateCw />
            Try again
          </Button>
        </Card>
      ) : load.status === "needsDiscord" ? (
        <div className="space-y-6">
          <Card className="flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-foreground/[0.06] text-foreground/70">
              <SiDiscord className="size-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium">Connect Discord to see your servers</p>
              <p className="text-sm text-muted-foreground">
                Your sign-in doesn&apos;t include your Discord server list.
                Continue with Discord and we&apos;ll show every server you
                manage.
              </p>
            </div>
            <Button
              className="shrink-0 self-start sm:self-auto"
              onClick={() => signIn("discord", { redirectTo: "/servers" })}
            >
              <SiDiscord />
              Continue with Discord
            </Button>
          </Card>

          {user.guild.id !== NO_GUILD_ID && (
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Current server
              </h3>
              <Card className="flex-row items-center gap-4 p-4">
                <ServerIcon server={user.guild} />
                <p className="min-w-0 flex-1 truncate font-medium">
                  {user.guild.name}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">
                    Open dashboard
                    <ArrowRight />
                  </Link>
                </Button>
              </Card>
            </section>
          )}
        </div>
      ) : all.length === 0 ? (
        <Card className="max-w-lg items-center gap-3 border-dashed px-6 py-12 text-center shadow-none">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground/[0.06] text-foreground/70">
            <Server className="size-6" />
          </div>
          <p className="font-medium">No servers you can manage</p>
          <p className="text-sm text-muted-foreground">
            You need Manage Server permission on a Discord server to set up
            ClashPerk there.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <StickyBar className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 lg:w-72">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search servers"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
              {(Object.keys(FILTERS) as Filter[]).map((key) => {
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
                    {FILTERS[key]}
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
            <Select value={sort} onValueChange={(v) => changeSort(v as Sort)}>
              <SelectTrigger
                className="w-full lg:ml-auto lg:w-48"
                aria-label="Sort servers"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {(Object.keys(SORTS) as Sort[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {SORTS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </StickyBar>

          {visible.length === 0 && (
            <Card className="items-center gap-1 border-dashed py-12 text-center shadow-none">
              <p className="font-medium">No servers match</p>
              <p className="text-sm text-muted-foreground">
                Try a different name or filter.
              </p>
            </Card>
          )}

          {withBot.length > 0 && (
            <section className="space-y-3">
              {filter === "all" && (
                <h3 className="text-sm font-medium text-muted-foreground">
                  ClashPerk is here · {withBot.length}
                </h3>
              )}
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {withBot.map((server) => {
                  const current = server.id === user.guild.id;
                  const busy = selecting === server.id;
                  return (
                    <li key={server.id}>
                      <button
                        type="button"
                        disabled={selecting !== null}
                        onClick={() => open(server)}
                        className={cn(
                          "group flex w-full cursor-pointer items-center gap-3 rounded-2xl border bg-card p-3 text-left shadow-[0_1px_2px_rgba(13,15,13,.04)] transition-all hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none",
                          current && "border-foreground/30",
                          selecting !== null && !busy && "opacity-50",
                        )}
                      >
                        <ServerIcon server={server} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium tracking-tight">
                            {server.name}
                          </span>
                          <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                            {current && (
                              <span className="flex shrink-0 items-center gap-1 text-emerald-700 dark:text-emerald-300">
                                <Check className="size-3" />
                                Current ·
                              </span>
                            )}
                            <span className="truncate">
                              {serverStats(server)}
                            </span>
                          </span>
                        </span>
                        {busy ? (
                          <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                        ) : (
                          <ArrowRight className="size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {withoutBot.length > 0 && (
            <section className="space-y-3">
              {filter === "all" && (
                <h3 className="text-sm font-medium text-muted-foreground">
                  Add ClashPerk · {withoutBot.length}
                </h3>
              )}
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {withoutBot.map((server) => (
                  <li
                    key={server.id}
                    className="flex items-center gap-3 rounded-2xl border border-dashed p-3"
                  >
                    <ServerIcon server={server} className="opacity-70" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium tracking-tight text-foreground/80">
                        {server.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {serverStats(server)}
                      </span>
                    </span>
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={inviteUrl(server.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Plus />
                        Invite
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                After inviting ClashPerk,{" "}
                <button
                  type="button"
                  onClick={fetchServers}
                  className="cursor-pointer underline underline-offset-2 hover:text-foreground"
                >
                  refresh this list
                </button>
                .
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
