"use client";

import {
  fetchClan,
  MyClan,
  ROLE_NAMES,
  useMyClans,
} from "@/components/my-clans-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { NO_GUILD_ID } from "@/lib/guild";
import { encodeTag, normalizeTag } from "@/lib/tags";
import { Loader2, Plus, RotateCw, Shield, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function PanelHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <div className="min-w-0 space-y-0.5">
        <h3 className="font-medium tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="divide-y border-t" aria-busy="true">
      {[0, 1].map((i) => (
        <li key={i} className="flex items-center gap-3 px-5 py-3">
          <span className="size-8 animate-pulse rounded-lg bg-muted" />
          <span className="flex-1 space-y-1.5">
            <span className="block h-4 w-32 animate-pulse rounded bg-muted" />
            <span className="block h-3 w-20 animate-pulse rounded bg-muted" />
          </span>
        </li>
      ))}
    </ul>
  );
}

function LoadError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 border-t px-5 py-8 text-center">
      <p className="text-sm text-destructive">{message}</p>
      <Button variant="outline" size="sm" onClick={retry}>
        <RotateCw />
        Try again
      </Button>
    </div>
  );
}

function AddClanForm({ onDone }: { onDone: () => void }) {
  const { saveClan, clans } = useMyClans();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tag = normalizeTag(value);
    if (!tag || tag.length < 4) {
      setError("Enter a clan tag, like #2PC9YQL0Q.");
      return;
    }
    if (clans.some((c) => c.tag === tag)) {
      setError(`${tag} is already in your clans.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const clan = await fetchClan(tag);
      if (!clan) {
        setError(`No clan found with the tag ${tag}.`);
        return;
      }
      saveClan(clan);
      onDone();
    } catch {
      setError(`Couldn't look up ${tag}. Try again.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2 border-t px-5 py-4">
      <div className="flex gap-2">
        <Input
          id="add-clan-tag"
          autoFocus
          placeholder="#2PC9YQL0Q"
          aria-label="Clan tag"
          className="font-mono"
          value={value}
          aria-invalid={error !== null}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
        />
        <Button type="submit" variant="outline" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />}
          Add
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}

function ClanRow({ clan }: { clan: MyClan }) {
  const { unsaveClan } = useMyClans();
  // Links needs a server's member list, so it only shows while one is open.
  const serverOpen = useAuth().user.guild.id !== NO_GUILD_ID;
  const query = `?tag=${encodeTag(clan.tag)}`;
  const roles = clan.members
    .map((m) => `${ROLE_NAMES[m.role ?? ""] ?? "Member"} · ${m.name}`)
    .join(", ");

  return (
    <li className="flex flex-wrap items-center gap-3 px-5 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.06] text-foreground/70">
        <Shield className="size-4" />
      </span>
      <div className="min-w-0 flex-1 basis-40">
        <p className="truncate font-medium">{clan.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          <span className="font-mono">{clan.tag}</span>
          {roles ? ` · ${roles}` : " · Saved"}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/activity${query}`}>Activity</Link>
        </Button>
        {serverOpen && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/links${query}`}>Links</Link>
          </Button>
        )}
        {clan.members.length === 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            aria-label={`Remove ${clan.name} from your clans`}
            title="Remove"
            onClick={() => unsaveClan(clan.tag)}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </li>
  );
}

export function YourClansPanel() {
  const { status, error, clans, reload } = useMyClans();
  const [adding, setAdding] = useState(false);

  return (
    <Card className="gap-0 p-0">
      <PanelHead
        title="Your clans"
        subtitle="Clans your linked accounts are in, plus clans you added"
        action={
          !adding && (
            <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
              <Plus />
              Add by tag
            </Button>
          )
        }
      />
      {adding && <AddClanForm onDone={() => setAdding(false)} />}
      {status === "loading" ? (
        <SkeletonList />
      ) : status === "error" && clans.length === 0 ? (
        <LoadError
          message={error ?? "Couldn't load your clans."}
          retry={reload}
        />
      ) : clans.length === 0 ? (
        <div className="m-4 mt-0 rounded-xl border border-dashed px-5 py-8 text-center">
          <p className="font-medium">No clans yet</p>
          <p className="text-sm text-muted-foreground">
            Link an account that&apos;s in a clan, or add any clan by its tag.
          </p>
        </div>
      ) : (
        <ul className="divide-y border-t">
          {clans.map((clan) => (
            <ClanRow key={clan.tag} clan={clan} />
          ))}
        </ul>
      )}
    </Card>
  );
}

export function YourAccountsPanel() {
  const { status, error, accounts, reload } = useMyClans();
  const verified = accounts.filter((a) => a.link.verified).length;

  return (
    <Card className="gap-0 p-0">
      <PanelHead
        title="Your accounts"
        subtitle={
          status === "ready"
            ? `${accounts.length} linked, ${verified} verified · stats on Profile`
            : "Your linked Clash of Clans accounts"
        }
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile">Manage</Link>
          </Button>
        }
      />
      {status === "loading" ? (
        <SkeletonList />
      ) : status === "error" ? (
        <LoadError
          message={error ?? "Couldn't load your accounts."}
          retry={reload}
        />
      ) : accounts.length === 0 ? (
        <div className="m-4 mt-0 flex flex-col items-center gap-3 rounded-xl border border-dashed px-5 py-8 text-center">
          <span className="flex size-10 items-center justify-center rounded-xl bg-foreground/[0.06] text-foreground/70">
            <UserRound className="size-5" />
          </span>
          <div className="space-y-1">
            <p className="font-medium">No accounts linked yet</p>
            <p className="text-sm text-muted-foreground">
              Link your player tag to see your clans and war stats.
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href="/profile">Link account</Link>
          </Button>
        </div>
      ) : (
        <ul className="divide-y border-t">
          {accounts.map(({ link, player }) => (
            <li key={link.tag} className="flex items-center gap-3 px-5 py-3">
              <span
                title={player ? `Town Hall ${player.townHallLevel}` : undefined}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold tabular-nums"
              >
                {player?.townHallLevel ?? link.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {player?.name ?? link.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  <span className="font-mono">{link.tag}</span>
                  {" · "}
                  {player?.clan
                    ? player.clan.name
                    : player
                      ? "Not in a clan"
                      : "Details unavailable"}
                </p>
              </div>
              {link.verified && (
                <span className="shrink-0 rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                  Verified
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function PersonalHome() {
  const { user } = useAuth();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-medium tracking-tight md:text-4xl">
          Your home
        </h2>
        <p className="text-sm text-muted-foreground md:text-base">
          Welcome back, {user.displayName}. Your accounts and clans, with or
          without a server.
        </p>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
        <YourClansPanel />
        <YourAccountsPanel />
      </div>
    </div>
  );
}
