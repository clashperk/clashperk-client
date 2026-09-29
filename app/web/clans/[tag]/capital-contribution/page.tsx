import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { dataOrNull, serverApi } from "@/lib/server-api";
import { encodeTag, normalizeTag } from "@/lib/tags";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WebEmpty, WebPage } from "../../../components/web-page";

type Props = { params: Promise<{ tag: string }> };

export const metadata: Metadata = { title: "Capital Contribution Logs | ClashPerk" };

const timeAgo = (date: string) => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60_000));
  const parts = [
    [Math.floor(minutes / 1440), "d"],
    [Math.floor((minutes % 1440) / 60), "h"],
    [minutes % 60, "m"],
  ] as const;
  const label = parts
    .filter(([value]) => value > 0)
    .map(([value, unit]) => `${value}${unit}`)
    .join(" ");
  return label ? `${label} ago` : "just now";
};

export default async function CapitalContributionPage({ params }: Props) {
  const tag = normalizeTag((await params).tag);
  if (!tag) notFound();

  const result = await dataOrNull(
    serverApi.clans.getCapitalContribution({ clanTag: encodeTag(tag) }),
  );
  const logs = result?.items ?? [];
  if (!logs.length) return <WebEmpty message="No capital contributions in the last 10 days." />;

  const clan = logs[0].clan;

  return (
    <WebPage
      title={`${clan.name} (${clan.tag})`}
      subtitle="Capital contribution logs (last 10 days)"
    >
      <Table>
        <TableBody>
          {logs.map((log, i) => (
            <TableRow key={`${log.tag}-${i}`}>
              <TableCell className="max-w-0 w-full">
                <div className="truncate font-semibold">{log.name}</div>
                <div className="text-xs text-muted-foreground">{timeAgo(log.createdAt)}</div>
              </TableCell>
              <TableCell className="text-right font-bold text-sky-400">
                {(log.current - log.initial).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </WebPage>
  );
}
