"use client";

import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/hooks/api/axios";
import { LinksDto } from "@/hooks/api/generated";
import { useAuth } from "@/hooks/use-auth";
import { encodeTag, normalizeTag } from "@/lib/tags";
import {
  BadgeCheck,
  Loader2,
  Plus,
  RotateCw,
  ShieldAlert,
  Trash2,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// A password input makes browsers treat these dialogs as login forms and offer saved credentials.
const NO_AUTOFILL = {
  type: "text",
  autoComplete: "off",
  spellCheck: false,
  "data-1p-ignore": true,
  "data-lpignore": "true",
  "data-form-type": "other",
} as const;

const API_TOKEN_HINT =
  "In Clash of Clans: Settings → More Settings → API Token.";

function PlayerRow({
  player,
  onVerify,
  onUnlink,
}: {
  player: LinksDto;
  onVerify: () => void;
  onUnlink: () => void;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-sm font-semibold text-brand">
        {player.name.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-medium tracking-tight">
            {player.name}
          </span>
          {player.verified && (
            <BadgeCheck
              className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-label="Verified"
            />
          )}
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {player.tag}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {!player.verified && (
          <Button variant="outline" size="sm" onClick={onVerify}>
            <ShieldAlert />
            Verify
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={onUnlink}
          aria-label={`Unlink ${player.name}`}
          title="Unlink"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </li>
  );
}

function SkeletonRows() {
  return (
    <ul className="divide-y" aria-busy="true" aria-label="Loading accounts">
      {[0, 1].map((i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3 sm:px-5">
          <div className="size-10 animate-pulse rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ProfilePage() {
  const session = useAuth();
  const userId = session.user.id;

  const [players, setPlayers] = useState<LinksDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<LinksDto | null>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<LinksDto | null>(null);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data } = await api.links.getLinks({ userIds: [userId] });
      setPlayers(data);
    } catch (err) {
      setLoadError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const verifiedCount = players.filter((p) => p.verified).length;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-medium tracking-tight md:text-4xl">
            Profile
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Clash of Clans accounts linked to your Discord.
          </p>
        </div>
        <Button
          className="w-full md:w-auto"
          onClick={() => setIsLinkOpen(true)}
        >
          <Plus />
          Link account
        </Button>
      </div>

      <section className="max-w-3xl space-y-3">
        <div className="flex items-baseline justify-between">
          <h3 className="font-medium tracking-tight">Linked accounts</h3>
          {!loading && players.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {players.length} linked · {verifiedCount} verified
            </span>
          )}
        </div>

        {loading ? (
          <Card className="gap-0 py-0">
            <SkeletonRows />
          </Card>
        ) : loadError ? (
          <Card className="items-center gap-3 py-10 text-center shadow-none">
            <p className="text-sm text-destructive">{loadError}</p>
            <Button variant="outline" size="sm" onClick={loadLinks}>
              <RotateCw />
              Try again
            </Button>
          </Card>
        ) : players.length === 0 ? (
          <Card className="items-center gap-3 border-dashed py-12 text-center shadow-none">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <UserRound className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">No accounts linked yet</p>
              <p className="text-sm text-muted-foreground">
                Link your player tag to show up in clan stats and rosters.
              </p>
            </div>
            <Button size="sm" onClick={() => setIsLinkOpen(true)}>
              <Plus />
              Link account
            </Button>
          </Card>
        ) : (
          <Card className="gap-0 py-0">
            <ul className="divide-y">
              {players.map((player) => (
                <PlayerRow
                  key={player.tag}
                  player={player}
                  onVerify={() => setVerifyTarget(player)}
                  onUnlink={() => setUnlinkTarget(player)}
                />
              ))}
            </ul>
          </Card>
        )}

        <p className="text-xs text-muted-foreground">
          Verified accounts can only be unlinked by you. Verify with the
          in-game API token to prove you own an account.
        </p>
      </section>

      <LinkModal
        open={isLinkOpen}
        userId={userId}
        onClose={() => setIsLinkOpen(false)}
        onDone={loadLinks}
      />
      <VerifyModal
        player={verifyTarget}
        userId={userId}
        onClose={() => setVerifyTarget(null)}
        onDone={loadLinks}
      />
      <UnlinkModal
        player={unlinkTarget}
        onClose={() => setUnlinkTarget(null)}
        onDone={loadLinks}
      />
    </div>
  );
}

function LinkModal({
  open,
  userId,
  onClose,
  onDone,
}: {
  open: boolean;
  userId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [tag, setTag] = useState("");
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setTag("");
    setToken("");
    setError(null);
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const playerTag = normalizeTag(tag);
    if (!playerTag) {
      setError("Enter a player tag.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.links.link({
        playerTag,
        userId,
        apiToken: token.trim() || null,
      });
      onDone();
      close();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && close()}
      title="Link account"
      description="Add a Clash of Clans account to your profile."
    >
      <form onSubmit={submit} className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="link-tag">Player tag</Label>
          <Input
            id="link-tag"
            placeholder="#2PP"
            className="font-mono uppercase"
            {...NO_AUTOFILL}
            autoFocus
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="link-token">
            API token{" "}
            <span className="font-normal text-muted-foreground">
              (optional, verifies the account)
            </span>
          </Label>
          <Input
            id="link-token"
            {...NO_AUTOFILL}
            className="font-mono"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{API_TOKEN_HINT}</p>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving || !tag.trim()}>
            {saving && <Loader2 className="animate-spin" />}
            Link account
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function VerifyModal({
  player,
  userId,
  onClose,
  onDone,
}: {
  player: LinksDto | null;
  userId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setToken("");
    setError(null);
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) return;
    setSaving(true);
    setError(null);
    try {
      await api.links.link({
        playerTag: player.tag,
        userId,
        apiToken: token.trim(),
      });
      onDone();
      close();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={player !== null}
      onOpenChange={(next) => !next && close()}
      title={`Verify ${player?.name ?? "account"}`}
      description="Enter the account's API token to prove you own it."
    >
      <form onSubmit={submit} className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="verify-token">API token</Label>
          <Input
            id="verify-token"
            {...NO_AUTOFILL}
            autoFocus
            className="font-mono"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{API_TOKEN_HINT}</p>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving || !token.trim()}>
            {saving && <Loader2 className="animate-spin" />}
            Verify
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function UnlinkModal({
  player,
  onClose,
  onDone,
}: {
  player: LinksDto | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setError(null);
    onClose();
  };

  const unlink = async () => {
    if (!player) return;
    setSaving(true);
    setError(null);
    try {
      await api.links.unlink({ playerTag: encodeTag(player.tag) });
      onDone();
      close();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={player !== null}
      onOpenChange={(next) => !next && close()}
      title={`Unlink ${player?.name ?? "account"}?`}
      description={`${player?.tag ?? ""} will be removed from your profile. You can link it again later.`}
      footer={
        <>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={unlink} disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            Unlink
          </Button>
        </>
      }
    >
      {error && <p className="text-sm text-destructive">{error}</p>}
    </Modal>
  );
}
