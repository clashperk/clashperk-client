"use client";

import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { safeRedirect } from "@/lib/redirect";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function HandoffPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("handoff_token");
  const redirect = safeRedirect(searchParams.get("redirect"));

  useEffect(() => {
    // A rejected token comes back as /login?error=CredentialsSignin.
    if (token) signIn("credentials", { token, redirectTo: redirect });
  }, [token, redirect]);

  return (
    <PublicShell showLogin={false}>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {token ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="size-7 animate-spin text-muted-foreground" />
            <h1 className="font-medium">Signing you in</h1>
            <p className="text-sm text-muted-foreground">
              Hang on, this only takes a moment.
            </p>
          </div>
        ) : (
          <div className="flex max-w-sm flex-col items-center gap-3 text-center">
            <h1 className="text-xl font-medium tracking-tight">
              This sign-in link doesn&apos;t work
            </h1>
            <p className="text-sm text-muted-foreground">
              It may be incomplete or already used. Ask the bot for a new link,
              or sign in with Discord.
            </p>
            <Button asChild className="mt-2">
              <Link href={`/login?redirect=${encodeURIComponent(redirect)}`}>
                Sign in with Discord
              </Link>
            </Button>
          </div>
        )}
      </main>
    </PublicShell>
  );
}
