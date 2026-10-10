import { dataOrNull, serverApi } from "@/lib/server-api";
import { encodeTag, normalizeTag } from "@/lib/tags";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  StatGrid,
  WebCard,
  WebEmpty,
  WebPage,
} from "../../../components/web-page";

type Props = { params: Promise<{ tag: string }> };

export const metadata: Metadata = {
  title: "Capital Contribution Logs | ClashPerk",
};

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const timeAgo = (date: string) => {
  const minutes = Math.round((Date.now() - new Date(date).getTime()) / 60_000);
  if (minutes < 60) return relativeFormat.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return relativeFormat.format(-hours, "hour");
  return relativeFormat.format(-Math.round(hours / 24), "day");
};

export default async function CapitalContributionPage({ params }: Props) {
  const tag = normalizeTag((await params).tag);
  if (!tag) notFound();

  const result = await dataOrNull(
    serverApi.clans.getCapitalContribution({ clanTag: encodeTag(tag) }),
  );
  const logs = (result?.items ?? []).map((log) => ({
    ...log,
    amount: log.current - log.initial,
  }));
  if (!logs.length) {
    return (
      <WebEmpty
        title="No capital contributions"
        message={`Nobody in ${tag} has contributed capital gold in the last 10 days.`}
      />
    );
  }

  const clan = logs[0].clan;
  const total = logs.reduce((sum, log) => sum + log.amount, 0);
  const byPlayer = new Map<
    string,
    { name: string; amount: number; count: number }
  >();
  for (const log of logs) {
    const entry = byPlayer.get(log.tag) ?? {
      name: log.name,
      amount: 0,
      count: 0,
    };
    entry.amount += log.amount;
    entry.count += 1;
    byPlayer.set(log.tag, entry);
  }
  const top = [...byPlayer]
    .map(([tag, entry]) => ({ tag, ...entry }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <WebPage
      title={clan.name}
      subtitle={`${clan.tag} · Capital gold contributed in the last 10 days`}
    >
      <StatGrid
        stats={[
          { label: "Capital gold", value: total.toLocaleString() },
          { label: "Contributors", value: byPlayer.size },
          { label: "Contributions", value: logs.length },
          {
            label: "Per contributor",
            value: Math.round(total / byPlayer.size).toLocaleString(),
          },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <WebCard title="By player">
          <ol className="divide-y">
            {top.map((player, i) => (
              <li
                key={player.tag}
                className="flex items-center gap-3 px-4 py-2.5 text-sm"
              >
                <span className="w-5 shrink-0 text-right tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {player.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {player.count === 1 ? "1 time" : `${player.count} times`}
                </span>
                <span className="w-16 text-right tabular-nums">
                  {player.amount.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        </WebCard>

        <WebCard title="Recent">
          <ul className="divide-y">
            {logs.map((log, i) => (
              <li
                key={`${log.tag}-${i}`}
                className="flex items-center gap-3 px-4 py-2.5 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{log.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {timeAgo(log.createdAt)}
                  </p>
                </div>
                <span className="tabular-nums">
                  {log.amount.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </WebCard>
      </div>
    </WebPage>
  );
}
