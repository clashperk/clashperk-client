"use client";

import { PickerCategory } from "@/components/clan-picker";
import { fetchClan, useMyClans } from "@/components/my-clans-provider";
import { api } from "@/hooks/api/axios";
import { CategoryDto } from "@/hooks/api/generated";
import { useAuth } from "@/hooks/use-auth";
import { NO_GUILD_ID } from "@/lib/guild";
import { normalizeTag } from "@/lib/tags";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type Status = "loading" | "error" | "ready";

/**
 * Clans for the clan picker: the user's own and saved clans first, then the open
 * server's categories. Works with or without a server.
 */
export function useClanOptions() {
  const { user } = useAuth();
  const guild = user.guild.id === NO_GUILD_ID ? null : user.guild;
  const mine = useMyClans();

  const [serverCategories, setServerCategories] = useState<CategoryDto[]>([]);
  const [serverStatus, setServerStatus] = useState<Status>(
    guild ? "loading" : "ready",
  );
  const [serverError, setServerError] = useState<string | null>(null);

  const loadServer = useCallback(async () => {
    if (!guild) return;
    setServerStatus("loading");
    setServerError(null);
    try {
      const { data } = await api.guilds.getGuildClans({ guildId: guild.id });
      setServerCategories(data.categories.filter((c) => c.clans.length > 0));
      setServerStatus("ready");
    } catch (err) {
      setServerError((err as Error).message);
      setServerStatus("error");
    }
  }, [guild?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadServer();
  }, [loadServer]);

  const categories = useMemo(() => {
    const result: PickerCategory[] = [];
    const yours = mine.clans.filter((c) => c.members.length > 0);
    const saved = mine.clans.filter((c) => c.members.length === 0);
    if (yours.length) {
      result.push({ _id: "yours", displayName: "Your clans", clans: yours });
    }
    if (saved.length) {
      result.push({ _id: "saved", displayName: "Saved clans", clans: saved });
    }
    for (const category of serverCategories) {
      result.push({
        _id: `server-${category._id}`,
        displayName: `${guild?.name} · ${category.displayName}`,
        clans: category.clans,
      });
    }
    return result;
  }, [mine.clans, serverCategories, guild?.name]);

  const status: Status =
    mine.status === "loading" || serverStatus === "loading"
      ? "loading"
      : mine.status === "error" && serverStatus === "error"
        ? "error"
        : "ready";

  return {
    categories,
    status,
    /** Only set when neither source loaded; one failing source still leaves the other usable. */
    error: status === "error" ? (serverError ?? mine.error) : null,
    reload: () => {
      mine.reload();
      loadServer();
    },
    serverOpen: guild !== null,
    saveClan: mine.saveClan,
  };
}

/**
 * The clan a page is showing. Starts from `?tag=` (any clan, listed or not), else the
 * first clan in the picker; `openTag` checks a pasted tag exists, saves it and selects it.
 */
export function useClanSelection(
  categories: PickerCategory[],
  ready: boolean,
  saveClan: (clan: { tag: string; name: string }) => void,
) {
  const searchParams = useSearchParams();
  const [clanTag, setClanTag] = useState("");
  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || clanTag) return;
    const requested = normalizeTag(searchParams.get("tag") ?? "");
    const first = categories[0]?.clans[0]?.tag ?? "";
    setClanTag(requested ?? first);
  }, [ready, categories]); // eslint-disable-line react-hooks/exhaustive-deps

  const openTag = async (tag: string) => {
    setOpening(true);
    setOpenError(null);
    try {
      const clan = await fetchClan(tag);
      if (!clan) {
        setOpenError(`No clan found with the tag ${tag}.`);
        return;
      }
      saveClan(clan);
      setClanTag(clan.tag);
    } catch {
      setOpenError(`Couldn't look up ${tag}. Try again.`);
    } finally {
      setOpening(false);
    }
  };

  return {
    clanTag,
    setClanTag: (tag: string) => {
      setOpenError(null);
      setClanTag(tag);
    },
    openTag,
    opening,
    openError,
  };
}
