"use client";

import { ServerSummary } from "@/components/sidebar/server-summary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/hooks/use-auth";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";
import { Laptop, LogOut, Moon, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";

const THEMES = [
  { value: "system", label: "System", hint: "Match your device", Icon: Laptop },
  { value: "light", label: "Light", hint: "Always light", Icon: Sun },
  { value: "dark", label: "Dark", hint: "Always dark", Icon: Moon },
] as const;

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-[minmax(0,14rem)_1fr] md:gap-8">
      <div className="space-y-1">
        <h3 className="font-medium tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="grid grid-cols-1 gap-2 sm:grid-cols-3"
    >
      {THEMES.map(({ value, label, hint, Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active && "border-primary bg-brand-soft hover:bg-brand-soft",
            )}
          >
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
                active && "bg-primary text-primary-foreground",
              )}
            >
              <Icon className="size-4" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-medium tracking-tight md:text-4xl">
          Settings
        </h2>
        <p className="text-sm text-muted-foreground md:text-base">
          Your account and how the dashboard looks.
        </p>
      </div>

      <div className="max-w-4xl space-y-8">
        <Section title="Account" description="Signed in with Discord.">
          <Card className="gap-0 py-0">
            <div className="flex items-center gap-3 p-4">
              <UserAvatar
                className="size-11 rounded-full"
                src={user.avatarUrl}
                alt={user.displayName.charAt(0)}
              />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate font-medium tracking-tight">
                  {user.displayName}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  @{user.username}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                <LogOut />
                Log out
              </Button>
            </div>
            <div className="flex items-center gap-3 border-t p-4">
              <UserAvatar
                className="size-11 rounded-xl"
                src={user.guild.iconUrl || ""}
                alt={user.guild.name.charAt(0)}
              />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate font-medium tracking-tight">
                  {user.guild.name}
                </p>
                <ServerSummary guildId={user.guild.id} />
              </div>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Current server
              </span>
            </div>
          </Card>
        </Section>

        <div className="h-px bg-border" />

        <Section title="Appearance" description="Saved in this browser.">
          <ThemePicker />
        </Section>
      </div>
    </div>
  );
}
