"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = [
  "#266ef7",
  "#c63304",
  "#ffc107",
  "#50c878",
  "#ffac75",
  "#4dc1fa",
  "#cb5aff",
  "#808000",
  "#c9cbcf",
  "#ff6384",
  "#3a87ad",
  "#f79256",
  "#8dc2e9",
  "#d1aed2",
  "#62c370",
  "#e36f8a",
  "#a4bf96",
  "#f0d96b",
  "#4f576c",
  "#b94c4c",
];

const MAX_DATASETS = 20;

export interface ChartData {
  title: string;
  unit: "hour" | "day";
  /** Timezone offset in milliseconds. */
  offset?: number;
  labels: string[];
  datasets: { name: string; data: (number | null)[] }[];
}

export function ActivityChart({
  unit,
  offset = 0,
  labels,
  datasets,
}: ChartData) {
  const series = datasets.slice(0, MAX_DATASETS);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const rows = labels.map((label, i) => ({
    // Shift into the requested timezone, then always format as UTC.
    time: new Date(label).getTime() + offset,
    ...Object.fromEntries(
      series.map((dataset) => [dataset.name, dataset.data[i] ?? null]),
    ),
  }));

  const formatTick = (time: number) =>
    new Date(time).toLocaleString("en-GB", {
      timeZone: "UTC",
      ...(unit === "hour"
        ? { hour: "2-digit", minute: "2-digit" }
        : { day: "numeric", month: "short" }),
    });

  const formatLabel = (time: number) =>
    new Date(time).toLocaleString("en-GB", {
      timeZone: "UTC",
      day: "numeric",
      month: "short",
      ...(unit === "hour" ? { hour: "2-digit", minute: "2-digit" } : {}),
    });

  const toggle = (name: string) =>
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <div className="space-y-4 p-2 pt-4 sm:p-4">
      <div className="h-72 sm:h-[28rem]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={rows}
            margin={{ top: 4, right: 12, bottom: 0, left: -16 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={formatTick}
              tick={{ fontSize: 11 }}
              minTickGap={24}
              className="text-muted-foreground"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
            />
            <Tooltip
              labelFormatter={(time) => formatLabel(Number(time))}
              itemSorter={(item) => -Number(item.value ?? 0)}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            {series.map((dataset, i) => (
              <Line
                key={dataset.name}
                dataKey={dataset.name}
                type="monotone"
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
                hide={hidden.has(dataset.name)}
                connectNulls={unit === "hour"}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-1.5 px-2">
        {series.map((dataset, i) => {
          const off = hidden.has(dataset.name);
          return (
            <button
              key={dataset.name}
              type="button"
              aria-pressed={!off}
              onClick={() => toggle(dataset.name)}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                off && "text-muted-foreground line-through opacity-60",
              )}
            >
              <span
                className="size-2 rounded-full"
                style={{ background: COLORS[i % COLORS.length] }}
                aria-hidden
              />
              {dataset.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
