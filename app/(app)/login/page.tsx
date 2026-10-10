"use client";

import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { safeRedirect } from "@/lib/redirect";
import { AlertCircle, ArrowRight, Loader2, LogOut } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { SiDiscord } from "react-icons/si";

const ERRORS: Record<string, string> = {
  AccessDenied:
    "Discord sign-in was cancelled or not allowed. Try again when you're ready.",
  CredentialsSignin:
    "This sign-in link is invalid or has expired. Continue with Discord instead.",
  Configuration:
    "Sign-in isn't working right now. Please try again in a few minutes.",
};
const DEFAULT_ERROR =
  "Something went wrong while signing you in. Please try again.";

export default function LoginPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);

  const target = safeRedirect(searchParams.get("redirect"));
  const errorCode = searchParams.get("error");
  const error = errorCode ? (ERRORS[errorCode] ?? DEFAULT_ERROR) : null;

  const continueWithDiscord = () => {
    setPending(true);
    signIn("discord", { redirectTo: target });
  };

  return (
    <PublicShell showLogin={false}>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            {session ? (
              <UserAvatar
                src={session.user.avatarUrl}
                alt={session.user.displayName}
                className="size-16 rounded-2xl"
              />
            ) : (
              <Image
                src="/icons/icon.svg"
                alt=""
                width={56}
                height={56}
                unoptimized
              />
            )}
            <div className="space-y-1">
              <h1 className="text-2xl font-medium tracking-tight">
                {session
                  ? `Hi, ${session.user.displayName}`
                  : "Sign in to ClashPerk"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {session
                  ? `Signed in with Discord as @${session.user.username}.`
                  : "Manage your server's clans, rosters, links and reminders."}
              </p>
            </div>
          </div>

          {error && !session && (
            <div
              role="alert"
              className="flex gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="rounded-2xl border bg-card p-4 shadow-[0_1px_2px_rgba(13,15,13,.04),0_12px_32px_-16px_rgba(13,15,13,.12)]">
            {session ? (
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href={target}>
                    Continue
                    <ArrowRight />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => signOut({ redirectTo: "/login" })}
                >
                  <LogOut />
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  className="h-11 w-full bg-[#5865F2] text-white hover:bg-[#5865F2]/90"
                  onClick={continueWithDiscord}
                  disabled={pending}
                >
                  {pending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <SiDiscord />
                  )}
                  Continue with Discord
                </Button>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] text-xs font-medium text-foreground">
                      1
                    </span>
                    Discord shares your name, avatar and server list with
                    ClashPerk.
                  </li>
                  <li className="flex gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] text-xs font-medium text-foreground">
                      2
                    </span>
                    Pick a server where you have Manage Server or Administrator.
                  </li>
                </ol>
              </div>
            )}
          </div>

          {!session && (
            <p className="text-center text-xs text-muted-foreground">
              By continuing you agree to the{" "}
              <Link
                href="/terms"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Privacy Policy
              </Link>
              .
            </p>
          )}
        </div>
      </main>
    </PublicShell>
  );
}
