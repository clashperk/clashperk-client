"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import type { ServerOption } from "@/lib/discord-servers";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  Loader2,
  Plus,
  RotateCw,
  Server,
} from "lucide-react";
import { setCookie } from "cookies-next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SiDiscord } from "react-icons/si";

const CLIENT_ID = "526971716711350273";

const inviteUrl = (guildId: string) =>
  `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&guild_id=${guildId}&disable_guild_select=true`;

type Load =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "needsDiscord" }
  | { status: "ready"; servers: ServerOption[] };

function ServerIcon({
  server,
  className,
}: {
  server: ServerOption;
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

  const select = async (server: ServerOption) => {
    setSelecting(server.id);
    setSelectError(null);
    const session = await update({ guildId: server.id });
    if (session?.user.guild.id === server.id) {
      // Full load so every server-rendered part picks up the new server and API token.
      setCookie("x-access-token", session.accessToken);
      window.location.assign("/dashboard");
      return;
    }
    setSelecting(null);
    setSelectError(
      `Couldn't switch to ${server.name}. Check that you still manage it and try again.`,
    );
  };

  const withBot =
    load.status === "ready" ? load.servers.filter((s) => s.hasBot) : [];
  const withoutBot =
    load.status === "ready" ? load.servers.filter((s) => !s.hasBot) : [];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-medium tracking-tight md:text-4xl">
          Choose a server
        </h2>
        <p className="text-sm text-muted-foreground md:text-base">
          Servers where you have Manage Server on Discord.
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
        <Card className="max-w-lg items-center gap-4 px-6 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#5865f2]/10 text-[#5865f2]">
            <SiDiscord className="size-6" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">
              Sign in with Discord to see your servers
            </p>
            <p className="text-sm text-muted-foreground">
              We need Discord to tell us which servers you manage.
            </p>
          </div>
          <Button onClick={() => signIn("discord", { redirectTo: "/servers" })}>
            <SiDiscord />
            Continue with Discord
          </Button>
        </Card>
      ) : load.servers.length === 0 ? (
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
        <div className="space-y-8">
          {withBot.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                ClashPerk is here · {withBot.length}
              </h3>
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {withBot.map((server) => {
                  const current = server.id === user.guild.id;
                  const busy = selecting === server.id;
                  return (
                    <li key={server.id}>
                      <button
                        type="button"
                        disabled={selecting !== null}
                        onClick={() =>
                          current ? router.push("/dashboard") : select(server)
                        }
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
                          {current && (
                            <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
                              <Check className="size-3" />
                              Current server
                            </span>
                          )}
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
              <h3 className="text-sm font-medium text-muted-foreground">
                Add ClashPerk · {withoutBot.length}
              </h3>
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {withoutBot.map((server) => (
                  <li
                    key={server.id}
                    className="flex items-center gap-3 rounded-2xl border border-dashed p-3"
                  >
                    <ServerIcon server={server} className="opacity-70" />
                    <span className="min-w-0 flex-1 truncate font-medium tracking-tight text-foreground/80">
                      {server.name}
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
