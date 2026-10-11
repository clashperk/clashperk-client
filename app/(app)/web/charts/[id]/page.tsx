import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { previewMetadata } from "../../components/link-preview";
import { WebCard, WebPage } from "../../components/web-page";
import { ActivityChart, type ChartData } from "./activity-chart";

type Props = { params: Promise<{ id: string }> };

const TITLE = "Activity Chart | ClashPerk";
const CHART_HOST = "https://chart.clashperk.com";

const getChart = async (id: string) => {
  if (!/^[\w-]+$/.test(id)) return null;
  const res = await fetch(`${CHART_HOST}/${id}/json`, {
    next: { revalidate: 3600 },
  });
  return res.ok ? ((await res.json()) as ChartData) : null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getChart(id);
  if (!data) return { title: TITLE };

  const clans = Math.min(data.datasets.length, 20);
  return previewMetadata({
    title: TITLE,
    previewTitle: data.title,
    description: `Activity of ${clans} ${clans === 1 ? "clan" : "clans"} on ClashPerk.`,
    // The chart service renders the same chart as an image at the bare id.
    image: { url: `${CHART_HOST}/${id}`, large: true },
  });
}

export default async function ChartPage({ params }: Props) {
  const { id } = await params;
  const data = await getChart(id);
  if (!data) notFound();

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
