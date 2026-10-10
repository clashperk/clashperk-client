"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = [
  "#266ef7", "#c63304", "#ffc107", "#50c878", "#ffac75",
  "#4dc1fa", "#cb5aff", "#808000", "#c9cbcf", "#ff6384",
  "#3a87ad", "#f79256", "#8dc2e9", "#d1aed2", "#62c370",
  "#e36f8a", "#a4bf96", "#f0d96b", "#4f576c", "#b94c4c",
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

export function ActivityChart({ title, unit, offset = 0, labels, datasets }: ChartData) {
  const series = datasets.slice(0, MAX_DATASETS);
  const rows = labels.map((label, i) => ({
    // Shift into the requested timezone, then always format as UTC.
    time: new Date(label).getTime() + offset,
    ...Object.fromEntries(series.map((dataset) => [dataset.name, dataset.data[i] ?? null])),
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

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[720px] rounded-lg border bg-card p-4">
        <h1 className="mb-2 text-center text-sm font-semibold">{title}</h1>
        <ResponsiveContainer width="100%" height={520}>
          <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="time"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={formatTick}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip
              labelFormatter={(time) => formatLabel(Number(time))}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {series.map((dataset, i) => (
              <Line
                key={dataset.name}
                dataKey={dataset.name}
                type="monotone"
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2.5}
                dot={false}
                connectNulls={unit === "hour"}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
