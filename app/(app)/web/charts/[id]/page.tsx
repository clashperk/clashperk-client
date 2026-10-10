import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WebCard, WebPage } from "../../components/web-page";
import { ActivityChart, type ChartData } from "./activity-chart";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Activity Chart | ClashPerk" };

export default async function ChartPage({ params }: Props) {
  const { id } = await params;
  if (!/^[\w-]+$/.test(id)) notFound();

  const res = await fetch(`https://chart.clashperk.com/${id}/json`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) notFound();

  const data = (await res.json()) as ChartData;
  const clans = Math.min(data.datasets.length, 20);

  return (
    <WebPage
      title={data.title}
      subtitle={`${clans} clan${clans === 1 ? "" : "s"} · Tap a clan below to hide or show it`}
    >
      <WebCard>
        <ActivityChart {...data} />
      </WebCard>
    </WebPage>
  );
}
