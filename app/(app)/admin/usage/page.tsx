"use client";

import { StickyBar } from "@/components/sticky-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { httpClient } from "@/hooks/api/axios";
import { cn } from "@/lib/utils";
import {
  Activity,
  Braces,
  Check,
  ChevronDown,
  Copy,
  Info,
  Loader2,
  RotateCw,
  Search,
  Server,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/** A row of ClickHouse `bot_command_logs`, as written by the bot's AnalyticsManager. */
type CommandLog = {
  commandId: string;
  applicationCommandName: string | null;
  userId: string;
  username: string;
  displayName: string;
  guildId: string;
  guildName: string;
  isUserInstalled: boolean;
  interactionType: string;
  args: string;
  createdAt: string;
};

type Period = "1d" | "7d" | "30d";

const PAGE_SIZE = 100;
const DAY = 24 * 60 * 60 * 1000;

const PERIODS: { id: Period; label: string; ms: number }[] = [
  { id: "1d", label: "24h", ms: DAY },
  { id: "7d", label: "7 days", ms: 7 * DAY },
  { id: "30d", label: "30 days", ms: 30 * DAY },
];

const relativeFormat = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
});

function formatRelative(target: number, now: number) {
  const minutes = Math.round((target - now) / 60_000);
  if (Math.abs(minutes) < 60) return relativeFormat.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 48) return relativeFormat.format(hours, "hour");
  return relativeFormat.format(Math.round(hours / 24), "day");
}

/** ClickHouse returns `DateTime` as "YYYY-MM-DD HH:MM:SS" in UTC. */
const parseTime = (value: string) =>
  new Date(`${value.replace(" ", "T")}Z`).getTime();

/** The bot writes "_dm" outside servers and "_unknown" when the guild isn't cached. */
function serverName(log: CommandLog) {
  if (log.guildName === "_dm" || log.guildId === "0") return "Direct message";
  if (log.guildName === "_unknown") return "Unknown server";
  return log.guildName;
}

function parseArgs(raw: string): [string, string][] {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return [];
    return Object.entries(parsed as Record<string, unknown>)
      .filter(
        ([key, value]) =>
          key !== "commandName" && value !== null && value !== "",
      )
      .map(([key, value]) => [key, String(value)]);
  } catch {
    return [];
  }
}

/** The whole row as the API returned it, with `args` (a JSON string) expanded. */
function formatLog(log: CommandLog) {
  let args: unknown = log.args;
  try {
    args = JSON.parse(log.args);
  } catch {}
  return JSON.stringify({ ...log, args }, null, 2);
}

function LogJson({ log }: { log: CommandLog }) {
  const [copied, setCopied] = useState(false);
  const json = formatLog(log);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="relative">
      <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-foreground/[0.04] p-3 pr-12 font-mono text-xs leading-relaxed">
        {json}
      </pre>
      <Button
        variant="ghost"
        size="icon"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy JSON"}
        className="absolute right-1.5 top-1.5 size-8"
      >
        {copied ? <Check className="text-emerald-600" /> : <Copy />}
      </Button>
    </div>
  );
}

// The endpoint pastes these into its SQL, so only send what can't break the query.
const cleanSearch = (value: string) => value.trim().replace(/['\\%_]/g, "");
const isSnowflake = (value: string) => /^\d{17,20}$/.test(value);

const rowKey = (log: CommandLog, index: number) =>
  `${log.createdAt}-${log.userId}-${index}`;

function LogRow({
  log,
  now,
  open,
  onToggle,
  onUser,
  onServer,
}: {
  log: CommandLog;
  now: number;
  open: boolean;
  onToggle: () => void;
  onUser: (userId: string) => void;
  onServer: (guildId: string) => void;
}) {
  const args = parseArgs(log.args);
  const time = parseTime(log.createdAt);
  const server = serverName(log);

  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:px-5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate font-medium">{log.commandId}</span>
        <span
          className="shrink-0 text-xs tabular-nums text-muted-foreground"
          title={new Date(time).toLocaleString()}
        >
          {formatRelative(time, now)}
        </span>
      </div>

      {args.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {args.map(([key, value]) => (
            <span
              key={key}
              className="max-w-full truncate rounded-md bg-foreground/[0.06] px-1.5 py-0.5 text-xs"
            >
              <span className="text-muted-foreground">{key}:</span> {value}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <button
          type="button"
          onClick={() => onUser(log.userId)}
          className="flex min-w-0 cursor-pointer items-center gap-1.5 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title="Show only this user"
        >
          <User className="size-3.5 shrink-0" />
          <span className="truncate">
            {log.displayName || log.username}
            {log.username && log.displayName !== log.username && (
              <span className="text-muted-foreground/70"> @{log.username}</span>
            )}
          </span>
        </button>
        {log.guildId !== "0" ? (
          <button
            type="button"
            onClick={() => onServer(log.guildId)}
            className="flex min-w-0 cursor-pointer items-center gap-1.5 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Show only this server"
          >
            <Server className="size-3.5 shrink-0" />
            <span className="truncate">{server}</span>
          </button>
        ) : (
          <span className="flex items-center gap-1.5">
            <Server className="size-3.5 shrink-0" />
            {server}
          </span>
        )}
        {log.isUserInstalled && (
          <span className="rounded-full bg-muted px-2 text-xs">User app</span>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="ml-auto flex cursor-pointer items-center gap-1 rounded-sm text-xs hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Braces className="size-3.5" />
          JSON
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
      </div>

      {open && <LogJson log={log} />}
    </li>
  );
}

function SkeletonRows() {
  return (
    <Card
      className="gap-0 divide-y p-0"
      aria-busy="true"
      aria-label="Loading command usage"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col gap-2 px-4 py-3 sm:px-5">
          <div className="flex justify-between gap-3">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-4 w-56 max-w-full animate-pulse rounded bg-muted" />
        </div>
      ))}
    </Card>
  );
}

function SearchInput({
  icon: Icon,
  label,
  value,
  onChange,
  invalid,
  numeric,
  className,
}: {
  icon: typeof Search;
  label: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  numeric?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={label}
        aria-label={label}
        inputMode={numeric ? "numeric" : "text"}
        className="px-9"
        value={value}
        aria-invalid={invalid}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={`Clear ${label.toLowerCase()}`}
          className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/[0.08] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export default function AdminUsagePage() {
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moreError, setMoreError] = useState<string | null>(null);

  const [period, setPeriod] = useState<Period>("1d");
  const [commandInput, setCommandInput] = useState("");
  const [userInput, setUserInput] = useState("");
  const [serverInput, setServerInput] = useState("");
  const [query, setQuery] = useState("");
  const [now, setNow] = useState(() => Date.now());
  // Rows flip against `allOpen`, so "Expand all" also covers rows from Load more.
  const [allOpen, setAllOpen] = useState(false);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => setQuery(cleanSearch(commandInput)), 300);
    return () => clearTimeout(timer);
  }, [commandInput]);

  // IDs only count once complete, so a half-typed ID doesn't empty the list.
  const userId = isSnowflake(userInput.trim()) ? userInput.trim() : "";
  const guildId = isSnowflake(serverInput.trim()) ? serverInput.trim() : "";
  const invalid = (value: string) =>
    value.trim() !== "" && !isSnowflake(value.trim());

  const fetchPage = useCallback(
    async (offset: number) => {
      const startedAt = Date.now();
      const { data } = await httpClient.request<{ items: CommandLog[] }>({
        path: "/metrics/commands-usage-logs",
        method: "GET",
        secure: true,
        format: "json",
        query: {
          limit: PAGE_SIZE,
          offset,
          startDate: startedAt - PERIODS.find((p) => p.id === period)!.ms,
          ...(query && { query }),
          ...(userId && { userId }),
          ...(guildId && { guildId }),
        },
      });
      setNow(startedAt);
      return data.items ?? [];
    },
    [period, query, userId, guildId],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMoreError(null);
    try {
      const items = await fetchPage(0);
      setLogs(items);
      setFlipped(new Set());
      setHasMore(items.length === PAGE_SIZE);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = async () => {
    setLoadingMore(true);
    setMoreError(null);
    try {
      const items = await fetchPage(logs.length);
      setLogs((current) => [...current, ...items]);
      setHasMore(items.length === PAGE_SIZE);
    } catch (err) {
      setMoreError((err as Error).message);
    } finally {
      setLoadingMore(false);
    }
  };

  const filtering = Boolean(query || userId || guildId);
  const periodLabel = PERIODS.find((p) => p.id === period)!.label;
  const allExpanded = allOpen && flipped.size === 0;
  const toggleRow = (key: string) =>
    setFlipped((current) => {
      const next = new Set(current);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-medium tracking-tight md:text-4xl">
          Command usage
        </h2>
        <p className="text-sm text-muted-foreground md:text-base">
          Every command run across all servers, newest first.
        </p>
        <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
          <Info className="size-3.5 shrink-0" />
          Only ClashPerk admins can see this page.
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <StickyBar className="flex flex-col gap-3">
          <div className="@container">
            <div className="grid grid-cols-2 gap-2 @3xl:flex @3xl:items-center">
              <SearchInput
                icon={Search}
                label="Search command"
                value={commandInput}
                onChange={setCommandInput}
                className="col-span-2 @3xl:flex-1"
              />
              <SearchInput
                icon={User}
                label="User ID"
                value={userInput}
                onChange={setUserInput}
                invalid={invalid(userInput)}
                numeric
                className="@3xl:w-52"
              />
              <SearchInput
                icon={Server}
                label="Server ID"
                value={serverInput}
                onChange={setServerInput}
                invalid={invalid(serverInput)}
                numeric
                className="@3xl:w-52"
              />
              <div
                role="radiogroup"
                aria-label="Time period"
                className="col-span-2 flex h-10 shrink-0 items-center rounded-xl border bg-card p-1"
              >
                {PERIODS.map(({ id, label }) => {
                  const active = period === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setPeriod(id)}
                      className={cn(
                        "flex h-full flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "bg-foreground/[0.08] font-medium text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </StickyBar>

        {loading ? (
          <SkeletonRows />
        ) : error ? (
          <Card className="items-center gap-3 py-10 text-center shadow-none">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={load}>
              <RotateCw />
              Try again
            </Button>
          </Card>
        ) : logs.length === 0 ? (
          <Card className="items-center gap-3 border-dashed py-12 text-center shadow-none">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground/[0.06] text-foreground/70">
              <Activity className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">
                {filtering
                  ? "No commands match these filters"
                  : `No commands in the last ${periodLabel}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {filtering
                  ? "Try a longer period, or clear the search, user or server."
                  : "Try a longer period."}
              </p>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {logs.length.toLocaleString()}
                {hasMore ? "+" : ""}{" "}
                {logs.length === 1 && !hasMore ? "command" : "commands"} in the
                last {periodLabel}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => {
                  setAllOpen(!allExpanded);
                  setFlipped(new Set());
                }}
              >
                <Braces />
                {allExpanded ? "Collapse all" : "Expand all"}
                <span className="-ml-1 hidden sm:inline">JSON</span>
              </Button>
            </div>
            <Card className="gap-0 p-0">
              <ul className="divide-y">
                {logs.map((log, i) => (
                  <LogRow
                    key={rowKey(log, i)}
                    log={log}
                    now={now}
                    open={allOpen !== flipped.has(rowKey(log, i))}
                    onToggle={() => toggleRow(rowKey(log, i))}
                    onUser={setUserInput}
                    onServer={setServerInput}
                  />
                ))}
              </ul>
            </Card>
            {moreError && (
              <p className="text-center text-sm text-destructive">
                {moreError}
              </p>
            )}
            {hasMore && (
              <Button
                variant="outline"
                className="self-center"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <Loader2 className="animate-spin" />
                ) : moreError ? (
                  <RotateCw />
                ) : (
                  <ChevronDown />
                )}
                {moreError ? "Try again" : "Load more"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
