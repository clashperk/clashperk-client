"use client";

import { useMyClans } from "@/components/my-clans-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import type { ServerOption } from "@/lib/discord-servers";
import { NO_GUILD_ID } from "@/lib/guild";
import { inviteUrl } from "@/lib/invite";
import { isServerRoute } from "@/lib/routelist";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  RotateCw,
  Server,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { UserAvatar } from "../user-avatar";
import { ServerSummary } from "./server-summary";

type ServersLoad =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; servers: ServerOption[]; needsDiscord: boolean };

const triggerClass =
  "group/server flex w-full cursor-pointer items-center gap-3 rounded-xl bg-sidebar-accent p-2 text-left transition-colors hover:bg-sidebar-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0";

function ThTile({ level }: { level: number }) {
  return (
    <span
      title={`Town Hall ${level}`}
      className="flex size-8 shrink-0 items-center justify-center rounded-[10px] border bg-background text-xs font-semibold tabular-nums"
    >
      {level}
    </span>
  );
}

/** What the switcher shows with no server open: the user's default player. */
function PlayerFace() {
  const { user } = useAuth();
  const { status, defaultAccount } = useMyClans();
  const player = defaultAccount?.player;

  if (status === "loading") {
    return (
      <>
        <span className="size-8 shrink-0 animate-pulse rounded-[10px] bg-muted-foreground/15" />
        <span className="grid flex-1 gap-1.5 group-data-[collapsible=icon]:hidden">
          <span className="h-3.5 w-24 animate-pulse rounded-full bg-muted-foreground/15" />
          <span className="h-3 w-32 animate-pulse rounded-full bg-muted-foreground/15" />
        </span>
      </>
    );
  }

  if (!defaultAccount) {
    return (
      <>
        <UserAvatar
          src={user.avatarUrl}
          alt={user.displayName.charAt(0)}
          className="size-8 shrink-0 rounded-[10px]"
        />
        <span className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
          <span className="truncate text-sm font-medium tracking-tight text-foreground">
            {user.displayName}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            No linked accounts
          </span>
        </span>
      </>
    );
  }

  return (
    <>
      {player ? (
        <ThTile level={player.townHallLevel} />
      ) : (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] border bg-background text-xs font-semibold">
          {defaultAccount.link.name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate text-sm font-medium tracking-tight text-foreground">
          {player?.name ?? defaultAccount.link.name}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          <span className="font-mono">{defaultAccount.link.tag}</span>
          {player?.clan ? ` · ${player.clan.name}` : ""}
        </span>
      </span>
    </>
  );
}

export function ServerSwitcher() {
  const { user } = useAuth();
  const { update } = useSession();
  const { defaultAccount } = useMyClans();
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const guild = user.guild.id === NO_GUILD_ID ? null : user.guild;

  const [load, setLoad] = useState<ServersLoad>({ status: "idle" });
  const [switching, setSwitching] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const loadServers = async () => {
    setLoad({ status: "loading" });
    try {
      const res = await fetch("/api/servers");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? `Error ${res.status}`);
      setLoad({
        status: "ready",
        servers: (data.servers as ServerOption[])
          .filter((s) => s.hasBot)
          .sort((a, b) => b.clanCount - a.clanCount),
        needsDiscord: data.needsDiscord,
      });
    } catch (err) {
      setLoad({ status: "error", message: (err as Error).message });
    }
  };

  // A full load so server-rendered parts and the API token pick up the change.
  const switchTo = async (guildId: string, label: string) => {
    setSwitching(guildId);
    setSwitchError(null);
    const session = await update({ guildId });
    if (session?.user.guild.id === guildId) {
      const stay = guildId !== NO_GUILD_ID || !isServerRoute(pathname);
      window.location.assign(stay ? pathname : "/dashboard");
      return;
    }
    setSwitching(null);
    setSwitchError(`Couldn't switch to ${label}. Try again.`);
  };

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open && load.status !== "ready") loadServers();
        if (!open) setSwitchError(null);
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={triggerClass}
          aria-label={
            guild
              ? `${guild.name}. Switch or leave server`
              : "Your default player. Open a server"
          }
        >
          {guild ? (
            <>
              <UserAvatar
                src={guild.iconUrl || ""}
                alt={guild.name.charAt(0)}
                className="size-8 shrink-0 rounded-[10px]"
              />
              <span className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-medium tracking-tight text-foreground">
                  {guild.name}
                </span>
                <ServerSummary guildId={guild.id} />
              </span>
            </>
          ) : (
            <PlayerFace />
          )}
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side={isMobile ? "bottom" : "right"}
        // Only the server list scrolls, so the actions below it stay on screen
        // when the menu has little room (e.g. opened from the phone sheet).
        className="flex w-72 flex-col overflow-y-hidden rounded-xl p-1"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-normal text-muted-foreground">
          Your servers with ClashPerk
        </DropdownMenuLabel>

        {load.status === "loading" || load.status === "idle" ? (
          <div className="space-y-1 p-1" aria-busy="true">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-2 px-1 py-1.5">
                <span className="size-7 animate-pulse rounded-lg bg-muted" />
                <span className="h-3.5 w-32 animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>
        ) : load.status === "error" ? (
          <div className="flex items-center gap-2 px-2 py-2 text-sm">
            <span className="flex-1 text-destructive">
              Couldn&apos;t load your servers.
            </span>
            <button
              type="button"
              onClick={loadServers}
              className="flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCw className="size-3" />
              Try again
            </button>
          </div>
        ) : load.needsDiscord ? (
          <p className="px-2 py-2 text-sm text-muted-foreground">
            Sign in with Discord again to see the servers you manage.
          </p>
        ) : load.servers.length === 0 ? (
          <p className="px-2 py-2 text-sm text-muted-foreground">
            None of the servers you manage have ClashPerk yet.
          </p>
        ) : (
          <div className="max-h-72 min-h-14 shrink overflow-y-auto">
            {load.servers.map((server) => {
              const current = server.id === guild?.id;
              return (
                <DropdownMenuItem
                  key={server.id}
                  disabled={switching !== null}
                  onSelect={(e) => {
                    e.preventDefault();
                    if (current) return;
                    switchTo(server.id, server.name);
                  }}
                  className="gap-2 rounded-lg"
                >
                  <UserAvatar
                    src={server.iconUrl || ""}
                    alt={server.name.charAt(0)}
                    className="size-7 shrink-0 rounded-lg"
                  />
                  <span className="grid min-w-0 flex-1 leading-tight">
                    <span className="truncate">{server.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {server.clanCount.toLocaleString()}{" "}
                      {server.clanCount === 1 ? "clan" : "clans"}
                    </span>
                  </span>
                  {switching === server.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    current && <Check className="size-3.5" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}

        <DropdownMenuItem asChild className="gap-2 rounded-lg">
          <a href={inviteUrl()} target="_blank" rel="noreferrer">
            <span className="flex size-7 items-center justify-center rounded-lg border">
              <Plus className="size-3.5" />
            </span>
            Add ClashPerk to a server
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2 rounded-lg">
          <Link
            href="/servers"
            onClick={() => isMobile && setOpenMobile(false)}
          >
            <span className="flex size-7 items-center justify-center rounded-lg border">
              <Server className="size-3.5" />
            </span>
            See all servers
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={switching !== null}
          onSelect={(e) => {
            e.preventDefault();
            if (guild) switchTo(NO_GUILD_ID, "your accounts");
          }}
          className="gap-2 rounded-lg"
        >
          {defaultAccount?.player ? (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold tabular-nums">
              {defaultAccount.player.townHallLevel}
            </span>
          ) : (
            <UserAvatar
              src={user.avatarUrl}
              alt={user.displayName.charAt(0)}
              className="size-7 shrink-0 rounded-lg"
            />
          )}
          <span className="grid min-w-0 flex-1 leading-tight">
            <span>Use without a server</span>
            <span className="truncate text-xs text-muted-foreground">
              {defaultAccount
                ? `Shows ${defaultAccount.player?.name ?? defaultAccount.link.name}`
                : "Your own accounts and clans"}
            </span>
          </span>
          {switching === NO_GUILD_ID ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Check className={cn("size-3.5", guild && "invisible")} />
          )}
        </DropdownMenuItem>

        {switchError && (
          <p role="alert" className="px-2 py-1.5 text-xs text-destructive">
            {switchError}
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
