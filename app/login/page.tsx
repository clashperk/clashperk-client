"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { Command, LayoutDashboard, LogOut } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

const Login = () => {
  const { data: session, status } = useSession();

  const handleLogin = () => {
    signIn("discord", { redirectTo: "/dashboard" });
  };

  const handleLogout = () => {
    signOut();
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-muted"></div>
          <div className="h-8 w-48 rounded bg-muted"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 animate-in fade-in zoom-in duration-300">
      <Card className="w-full max-w-sm shadow-xl border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <CardHeader className="text-center flex flex-col items-center pb-2">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <Command className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {session ? "Welcome back" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-balance">
            {session
              ? `You are currently signed in as @${session.user?.username || session.user?.displayName}`
              : "Login with your Discord account to continue."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {session ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative">
                <UserAvatar
                  src={session.user.avatarUrl}
                  alt={session.user.displayName}
                  className="h-20 w-20 border-4 border-background shadow-md rounded-full"
                />
                <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-background"></div>
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-lg">
                  {session.user?.displayName}
                </p>
                {Array.isArray(session.user?.roles) &&
                  session.user.roles.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                      {session.user.roles.map((role: string) => (
                        <span
                          key={role}
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none border-transparent bg-secondary text-secondary-foreground"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          ) : (
            <div className="grid gap-2 pt-2">
              <Button
                className="w-full bg-[#5865F2] hover:bg-[#5865F2]/90 text-white font-medium h-10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleLogin}
              >
                Sign in with Discord
              </Button>
            </div>
          )}
        </CardContent>
        {session && (
          <CardFooter className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
            <div className="relative flex py-1 items-center w-full">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-2 text-xs text-muted-foreground">
                or
              </span>
              <div className="flex-grow border-t border-border"></div>
            </div>
            <Button
              variant="outline"
              className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default Login;
