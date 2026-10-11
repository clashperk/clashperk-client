"use client";

import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/user-avatar";
import { api } from "@/hooks/api/axios";
import { LinksDto } from "@/hooks/api/generated";
import { useAuth } from "@/hooks/use-auth";
import { encodeTag, normalizeTag } from "@/lib/tags";
import { AccountStats } from "./account-stats";
import { useMyClans } from "@/components/my-clans-provider";
import {
  BadgeCheck,
  Loader2,
  MoreHorizontal,
  Plus,
  RotateCw,
  ShieldCheck,
  Star,
  Unlink,
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

const VERIFY_STEPS = [
  "Open Clash of Clans and tap Settings.",
  "Go to More Settings and copy your API Token.",
  "Tap Verify on the account here and paste the token.",
];

function AccountCard({
  player,
  isDefault,
  showDefaultLabel,
  onVerify,
  onMakeDefault,
  onUnlink,
}: {
  player: LinksDto;
  isDefault: boolean;
  /** The label only means something when there's more than one account. */
  showDefaultLabel: boolean;
  onVerify: () => void;
  onMakeDefault: () => void;
  onUnlink: () => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border bg-card p-3 pr-2 shadow-[0_1px_2px_rgba(13,15,13,.04)]">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-foreground/70">
        {player.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-medium tracking-tight">
          <span className="truncate">{player.name}</span>
          {isDefault && showDefaultLabel && (
            <span
              title="Shown in the sidebar and used by the bot when no account is named"
              className="shrink-0 rounded-full bg-foreground/[0.07] px-2 py-0.5 text-xs font-normal text-muted-foreground"
            >
              Default
            </span>
          )}
        </p>
        <p className="font-mono text-xs text-muted-foreground">{player.tag}</p>
      </div>

      {player.verified ? (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs text-emerald-700 dark:text-emerald-300">
          <BadgeCheck className="size-3.5" />
          Verified
        </span>
      ) : (
        <Button variant="outline" size="sm" onClick={onVerify}>
          <ShieldCheck />
          Verify
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground"
            aria-label={`More actions for ${player.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          {!isDefault && (
            <DropdownMenuItem onClick={onMakeDefault}>
              <Star />
              Make default
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={onUnlink}
            className="text-destructive focus:text-destructive [&_svg]:text-destructive"
          >
            <Unlink />
            Unlink account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

function VerifyGuide() {
  return (
    <Card className="gap-4 p-5">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-foreground/[0.06] text-foreground/70">
          <ShieldCheck className="size-4" />
        </div>
        <h3 className="font-medium tracking-tight">How to verify</h3>
      </div>
      <ol className="space-y-3">
        {VERIFY_STEPS.map((step, i) => (
          <li key={step} className="flex gap-3 text-sm">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums">
              {i + 1}
            </span>
            <span className="pt-0.5 text-muted-foreground">{step}</span>
          </li>
        ))}
      </ol>
      <div className="space-y-1.5 border-t pt-4 text-sm">
        <p className="font-medium">Why verify?</p>
        <p className="text-muted-foreground">
          Only you can unlink a verified account. Unverified ones can also be
          unlinked by whoever linked them, or by a verified Leader or Co-Leader
          of their clan.
        </p>
      </div>
    </Card>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const userId = user.id;

  const [players, setPlayers] = useState<LinksDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<LinksDto | null>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<LinksDto | null>(null);
  const [defaultError, setDefaultError] = useState<string | null>(null);

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
  // The sidebar and Home read linked accounts from the shared provider.
  const myClans = useMyClans();
  // The API lists links default-first, so the new default moves to the top right away.
  const makeDefault = async (player: LinksDto) => {
    const previous = players;
    setDefaultError(null);
    setPlayers([player, ...players.filter((p) => p.tag !== player.tag)]);
    try {
      await api.links.setDefaultLink({ playerTag: encodeTag(player.tag) });
      myClans.reload();
    } catch (err) {
      setPlayers(previous);
      setDefaultError(
        `Couldn't make ${player.name} your default: ${(err as Error).message}`,
      );
    }
  };

  const onLinksChanged = () => {
    loadLinks();
    myClans.reload();
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <UserAvatar
          className="size-14 shrink-0 rounded-full ring-1 ring-border"
          src={user.avatarUrl}
          alt={user.displayName.charAt(0)}
        />
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="truncate text-2xl font-medium tracking-tight md:text-4xl">
            {user.displayName}
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            @{user.username}
            {!loading &&
              !loadError &&
              ` · ${players.length} ${players.length === 1 ? "account" : "accounts"} linked, ${verifiedCount} verified`}
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

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section className="min-w-0 space-y-4">
          <h3 className="text-lg font-medium tracking-tight">
            Clash of Clans accounts
          </h3>

          {loading ? (
            <ul
              className="space-y-2.5"
              aria-busy="true"
              aria-label="Loading accounts"
            >
              {[0, 1].map((i) => (
                <li
                  key={i}
                  className="h-[4.25rem] animate-pulse rounded-2xl bg-muted"
                />
              ))}
            </ul>
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
              <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground/[0.06] text-foreground/70">
                <UserRound className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">No accounts linked yet</p>
                <p className="text-sm text-muted-foreground">
                  Link your player tag so ClashPerk knows which Discord account
                  is yours.
                </p>
              </div>
              <Button size="sm" onClick={() => setIsLinkOpen(true)}>
                <Plus />
                Link account
              </Button>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {defaultError && (
                <p role="alert" className="text-sm text-destructive">
                  {defaultError}
                </p>
              )}
              <ul className="space-y-2.5">
                {players.map((player, i) => (
                  <AccountCard
                    key={player.tag}
                    player={player}
                    isDefault={i === 0}
                    showDefaultLabel={players.length > 1}
                    onVerify={() => setVerifyTarget(player)}
                    onMakeDefault={() => makeDefault(player)}
                    onUnlink={() => setUnlinkTarget(player)}
                  />
                ))}
              </ul>
            </div>
          )}
        </section>

        <aside className="min-w-0">
          <VerifyGuide />
        </aside>
      </div>

      {!loading && !loadError && players.length > 0 && (
        <AccountStats players={players} />
      )}

      <LinkModal
        open={isLinkOpen}
        userId={userId}
        onClose={() => setIsLinkOpen(false)}
        onDone={onLinksChanged}
      />
      <VerifyModal
        player={verifyTarget}
        userId={userId}
        onClose={() => setVerifyTarget(null)}
        onDone={onLinksChanged}
      />
      <UnlinkModal
        player={unlinkTarget}
        onClose={() => setUnlinkTarget(null)}
        onDone={onLinksChanged}
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
      onSubmit={submit}
      footer={
        <Button type="submit" disabled={saving || !tag.trim()}>
          {saving && <Loader2 className="animate-spin" />}
          Link account
        </Button>
      }
    >
      <div className="grid gap-4 py-2">
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
      </div>
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
      description="Enter this account's in-game API token to prove it's yours. Verified accounts can only be unlinked by you."
      onSubmit={submit}
      footer={
        <Button type="submit" disabled={saving || !token.trim()}>
          {saving && <Loader2 className="animate-spin" />}
          Verify
        </Button>
      }
    >
      <div className="grid gap-4 py-2">
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
      </div>
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
      description={`${player?.tag ?? ""} will be removed from your profile. You can link it again later, unless someone else links it first.`}
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
