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
  UserPlus,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { SiDiscord } from "react-icons/si";

const INVITE_URL =
  "https://discord.com/oauth2/authorize?client_id=526971716711350273";

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

/** A tiny window drawn in the theme's colors, independent of the current theme. */
function ThemeSwatch({ mode }: { mode: "light" | "dark" }) {
  const dark = mode === "dark";
  return (
    <div
      className={cn(
        "flex h-full w-full gap-1.5 p-2",
        dark ? "bg-[#141414]" : "bg-[#f6f6f4]",
      )}
    >
      <div
        className={cn(
          "w-1/4 space-y-1 rounded-md p-1",
          dark ? "bg-[#1f1f1f]" : "bg-white",
        )}
      >
        <div
          className={cn(
            "h-1 rounded-full",
            dark ? "bg-white/25" : "bg-black/15",
          )}
        />
        <div
          className={cn(
            "h-1 w-2/3 rounded-full",
            dark ? "bg-white/15" : "bg-black/10",
          )}
        />
        <div
          className={cn(
            "h-1 w-3/4 rounded-full",
            dark ? "bg-white/15" : "bg-black/10",
          )}
        />
      </div>
      <div className="flex-1 space-y-1.5">
        <div
          className={cn(
            "h-1.5 w-1/2 rounded-full",
            dark ? "bg-white/40" : "bg-black/30",
          )}
        />
        <div
          className={cn(
            "h-6 rounded-md border",
            dark ? "border-white/10 bg-[#1f1f1f]" : "border-black/5 bg-white",
          )}
        />
        <div className="h-2 w-8 rounded-full bg-[#c44800]" />
      </div>
    </div>
  );
}

function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="grid grid-cols-3 gap-3"
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
            className="group cursor-pointer text-left focus-visible:outline-none"
          >
            <div
              className={cn(
                "aspect-[16/10] overflow-hidden rounded-xl border transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring",
                active &&
                  "ring-2 ring-foreground ring-offset-2 ring-offset-background",
              )}
            >
              {value === "system" ? (
                <div className="relative h-full">
                  <ThemeSwatch mode="light" />
                  <div className="absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]">
                    <ThemeSwatch mode="dark" />
                  </div>
                </div>
              ) : (
                <ThemeSwatch mode={value} />
              )}
            </div>
            <p
              className={cn(
                "mt-2 text-sm",
                active ? "font-medium" : "text-foreground/80",
              )}
            >
              {label}
            </p>
            <p className="text-xs text-muted-foreground">{hint}</p>
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

            <div className="flex items-center gap-3 border-t p-4">
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
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="font-medium tracking-tight">
                      No server selected
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Add ClashPerk to a server you manage, then sign in from
                      there.
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={INVITE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <UserPlus />
                      Invite
                    </a>
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
