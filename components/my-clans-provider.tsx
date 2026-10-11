"use client";

import { api } from "@/hooks/api/axios";
import { LinksDto } from "@/hooks/api/generated";
import { useAuth } from "@/hooks/use-auth";
import { encodeTag } from "@/lib/tags";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/** The fields of a Clash of Clans player this dashboard reads. */
export type GamePlayer = {
  tag: string;
  name: string;
  townHallLevel: number;
  role?: "leader" | "coLeader" | "admin" | "member";
  clan?: { tag: string; name: string };
};

export type MyAccount = { link: LinksDto; player: GamePlayer | null };

export type MyClan = {
  tag: string;
  name: string;
  /** Linked accounts in this clan; empty for clans saved by tag. */
  members: { name: string; role: GamePlayer["role"] }[];
  saved: boolean;
};

type Status = "loading" | "error" | "ready";

type MyClansValue = {
  status: Status;
  error: string | null;
  accounts: MyAccount[];
  /** First linked account by link order; shown in the switcher when no server is open. */
  defaultAccount: MyAccount | null;
  clans: MyClan[];
  saveClan: (clan: { tag: string; name: string }) => void;
  unsaveClan: (tag: string) => void;
  reload: () => void;
};

const SAVED_KEY = "clashperk.savedClans";

export const ROLE_NAMES: Record<string, string> = {
  leader: "Leader",
  coLeader: "Co-Leader",
  admin: "Elder",
  member: "Member",
};

// Saved clans live in this browser until the API can store them per user.
const readSaved = (): { tag: string; name: string }[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeSaved = (clans: { tag: string; name: string }[]) => {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(clans));
  } catch {}
};

export async function fetchPlayer(tag: string): Promise<GamePlayer | null> {
  const res = await fetch(`/api/players/${encodeTag(tag)}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchClan(
  tag: string,
): Promise<{ tag: string; name: string } | null> {
  const res = await fetch(`/api/clans/${encodeTag(tag)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return { tag: data.tag, name: data.name };
}

const MyClansContext = createContext<MyClansValue | null>(null);

export function MyClansProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<MyAccount[]>([]);
  const [saved, setSaved] = useState<{ tag: string; name: string }[]>([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => setSaved(readSaved()), []);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);
    api.links
      .getLinks({ userIds: [user.id] })
      .then(async ({ data }) => {
        // The API returns links in the user's own order, so the first is their main account.
        const links = data;
        // A failed player lookup still keeps the account, just without game details.
        const players = await Promise.all(
          links.map((link) => fetchPlayer(link.tag).catch(() => null)),
        );
        if (cancelled) return;
        setAccounts(links.map((link, i) => ({ link, player: players[i] })));
        setStatus("ready");
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [user.id, attempt]);

  const clans = useMemo(() => {
    const byTag = new Map<string, MyClan>();
    for (const { player } of accounts) {
      if (!player?.clan) continue;
      const clan = byTag.get(player.clan.tag) ?? {
        tag: player.clan.tag,
        name: player.clan.name,
        members: [],
        saved: false,
      };
      clan.members.push({ name: player.name, role: player.role });
      byTag.set(clan.tag, clan);
    }
    for (const entry of saved) {
      const clan = byTag.get(entry.tag);
      if (clan) clan.saved = true;
      else byTag.set(entry.tag, { ...entry, members: [], saved: true });
    }
    return [...byTag.values()];
  }, [accounts, saved]);

  const saveClan = useCallback((clan: { tag: string; name: string }) => {
    setSaved((current) => {
      if (current.some((c) => c.tag === clan.tag)) return current;
      const next = [...current, clan];
      writeSaved(next);
      return next;
    });
  }, []);

  const unsaveClan = useCallback((tag: string) => {
    setSaved((current) => {
      const next = current.filter((c) => c.tag !== tag);
      writeSaved(next);
      return next;
    });
  }, []);

  const value = useMemo<MyClansValue>(
    () => ({
      status,
      error,
      accounts,
      defaultAccount: accounts[0] ?? null,
      clans,
      saveClan,
      unsaveClan,
      reload: () => setAttempt((n) => n + 1),
    }),
    [status, error, accounts, clans, saveClan, unsaveClan],
  );

  return (
    <MyClansContext.Provider value={value}>{children}</MyClansContext.Provider>
  );
}

export function useMyClans() {
  const value = useContext(MyClansContext);
  if (!value) throw new Error("useMyClans must be used inside MyClansProvider");
  return value;
}
