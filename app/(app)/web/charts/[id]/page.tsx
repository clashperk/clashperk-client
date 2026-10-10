import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      <ActivityChart {...data} />
    </div>
  );
}
