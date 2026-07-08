import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Bucket {
  label: string;
  count: number;
}

interface AdminAnalytics {
  stats: {
    day: number;
    week: number;
    month: number;
    year: number;
    allTime: number;
  };
  series: {
    day: Bucket[];
    week: Bucket[];
    month: Bucket[];
    year: Bucket[];
    allTime: Bucket[];
  };
  recentLogins: { email: string | null; at: string }[];
}

type RangeKey = "day" | "week" | "month" | "year" | "allTime";

const RANGES: { key: RangeKey; label: string; caption: string }[] = [
  { key: "day", label: "Last day", caption: "Last 24 hours" },
  { key: "week", label: "Last week", caption: "Last 7 days" },
  { key: "month", label: "Last month", caption: "Last 30 days" },
  { key: "year", label: "Last year", caption: "Last 12 months" },
  { key: "allTime", label: "All time", caption: "By month" },
];

async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
  const res = await fetch("/api/admin/analytics", { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as AdminAnalytics;
}

export default function Administrative() {
  const [range, setRange] = useState<RangeKey>("week");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: fetchAdminAnalytics,
    refetchOnWindowFocus: false,
  });

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto w-full flex flex-col gap-8 pb-24">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">
            Administrative
          </h1>
          <p className="text-muted-foreground">
            Google sign-ins over time and a log of who accessed the site.
          </p>
        </div>

        {isError && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="py-4 text-sm text-destructive">
              Failed to load analytics. You may not have administrative access.
            </CardContent>
          </Card>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {RANGES.map((r) => (
            <Card key={r.key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {r.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading || !data ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div
                    className="text-3xl font-bold"
                    data-testid={`stat-${r.key}`}
                  >
                    {data.stats[r.key]}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">logins</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Graph */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Google logins</CardTitle>
              <div className="flex flex-wrap gap-1">
                {RANGES.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setRange(r.key)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      range === r.key
                        ? "bg-primary text-primary-foreground"
                        : "border border-border hover:bg-secondary"
                    }`}
                    data-testid={`range-${r.key}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.series[range]}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Logins"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Login log */}
        <Card>
          <CardHeader>
            <CardTitle>Who has logged in</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data.recentLogins.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                No logins recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Gmail</th>
                      <th className="py-2 font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentLogins.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-border/60"
                        data-testid={`login-row-${i}`}
                      >
                        <td className="py-2.5 pr-4 font-medium">
                          {row.email ?? "—"}
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {new Date(row.at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
