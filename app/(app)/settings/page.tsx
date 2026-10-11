"use client";

import { ServerSummary } from "@/components/sidebar/server-summary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/hooks/use-auth";
import { useMounted } from "@/hooks/use-mounted";
import { NO_GUILD_ID } from "@/lib/guild";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  FileText,
  LogOut,
  Server,
  Shield,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { SiDiscord } from "react-icons/si";

const THEMES = [
  { value: "system", label: "System", hint: "Match your device" },
  { value: "light", label: "Light", hint: "Always light" },
  { value: "dark", label: "Dark", hint: "Always dark" },
] as const;

const ABOUT_LINKS = [
  {
    href: "https://docs.clashperk.com/overview/getting-set-up",
    label: "Getting started guide",
    Icon: BookOpen,
    external: true,
  },
  {
    href: "https://discord.gg/ppuppun",
    label: "Support Discord",
    Icon: SiDiscord,
    external: true,
  },
  {
    href: "/terms",
    label: "Terms of Service",
    Icon: FileText,
    external: false,
  },
  { href: "/privacy", label: "Privacy Policy", Icon: Shield, external: false },
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

const SWATCH: Record<(typeof THEMES)[number]["value"], string> = {
  light: "bg-[#f6f6f4]",
  dark: "bg-[#141414]",
  system: "bg-[linear-gradient(135deg,#f6f6f4_50%,#141414_50%)]",
};

function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="grid grid-cols-1 gap-2 sm:grid-cols-3"
    >
      {THEMES.map(({ value, label, hint }) => {
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
              active &&
                "border-foreground/40 bg-foreground/[0.06] hover:bg-foreground/[0.06]",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-9 shrink-0 rounded-lg ring-1 ring-black/10 dark:ring-white/15",
                SWATCH[value],
              )}
            />
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
  const hasServer = user.guild.id !== NO_GUILD_ID;

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
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Manage linked accounts
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                <LogOut />
                Log out
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t p-4">
              {hasServer ? (
                <>
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
                </>
              ) : (
                <>
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                    <Server className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1 basis-48 leading-tight">
                    <p className="font-medium tracking-tight">No server open</p>
                    <p className="text-sm text-muted-foreground">
                      The dashboard works without one. Open a server to manage
                      its clans, rosters and reminders.
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/servers">Choose a server</Link>
                  </Button>
                </>
              )}
            </div>
          </Card>
        </Section>

        <div className="h-px bg-border" />

        <Section title="Appearance" description="Saved in this browser.">
          <ThemePicker />
        </Section>

        <div className="h-px bg-border" />

        <Section title="About" description="Help, community and policies.">
          <Card className="gap-0 py-0">
            <ul className="divide-y">
              {ABOUT_LINKS.map(({ href, label, Icon, external }) => (
                <li key={href}>
                  <Link
                    href={href}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent/50"
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="flex-1">{label}</span>
                    {external ? (
                      <ArrowUpRight className="size-4 text-muted-foreground" />
                    ) : (
                      <ArrowRight className="size-4 text-muted-foreground" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      </div>
    </div>
  );
}
