"use client";

import { api } from "@/hooks/api/axios";
import { NO_GUILD_ID } from "@/lib/guild";
import { useEffect, useState } from "react";

type Summary = { clans: number } | "loading" | "error";

const plural = (n: number, word: string) => `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;

export function ServerSummary({ guildId }: { guildId: string }) {
  const [summary, setSummary] = useState<Summary>("loading");

  useEffect(() => {
    if (guildId === NO_GUILD_ID) return;
    let cancelled = false;

    api.guilds
      .getGuildClans({ guildId })
      .then(({ data }) => {
        if (cancelled) return;
        // Per-clan member counts from this endpoint are placeholders, so only clans are counted.
        const clans = data.categories.flatMap((category) => category.clans);
        setSummary({ clans: clans.length });
      })
      .catch(() => !cancelled && setSummary("error"));

    return () => {
      cancelled = true;
    };
  }, [guildId]);

  const className = "truncate text-xs text-muted-foreground";

  if (guildId === NO_GUILD_ID) return <span className={className}>No server selected</span>;
  if (summary === "loading") {
    return <span className="mt-1 h-3 w-24 animate-pulse rounded-full bg-muted-foreground/15" />;
  }
  if (summary === "error") return <span className={className}>Discord server</span>;

  return (
    <span className={className}>
      {plural(summary.clans, "clan")}
    </span>
  );
}
