import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout, useAuthUser, ADMIN_EMAIL } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Visit = { id: number; email: string | null; visitedAt: string };
type SeriesPoint = { label: string; count: number };
type VisitsResponse = {
  stats: {
    allTime: number;
    last24Hours: number;
    lastMonth: number;
    lastYear: number;
  };
  series: {
    last24Hours: SeriesPoint[];
    lastMonth: SeriesPoint[];
    lastYear: SeriesPoint[];
    allTime: SeriesPoint[];
  };
  visits: Visit[];
};

function useAdminVisits(enabled: boolean) {
  return useQuery<VisitsResponse>({
    queryKey: ["admin-visits"],
    enabled,
    queryFn: async () => {
      const res = await fetch("/api/admin/visits", { credentials: "include" });
      if (res.status === 403) throw new Error("forbidden");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });
}

/** Last-7-days count and daily series, computed from the visit list. */
function computeWeek(visits: Visit[]): { count: number; series: SeriesPoint[] } {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const start = now - 7 * DAY;
  const counts = new Array(7).fill(0);
  let count = 0;
  for (const v of visits) {
    const t = new Date(v.visitedAt).getTime();
    if (t >= start) {
      count++;
      const idx = Math.min(Math.floor((t - start) / DAY), 6);
      counts[idx]++;
    }
  }
  const series = counts.map((c, i) => ({
    label: new Date(start + i * DAY).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    count: c,
  }));
  return { count, series };
}

function StatCard({ title, value, loading }: { title: string; value?: number; loading: boolean }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1">
          {title}
        </div>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-3xl font-serif font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, "-")}`}>
            {value ?? 0}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LoginChart({ title, data, loading }: { title: string; data?: SeriesPoint[]; loading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data ?? []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Logins" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Administrative() {
  const { data: auth } = useAuthUser();
  const isAdmin =
    !!auth?.authenticated && auth.user?.email?.toLowerCase() === ADMIN_EMAIL;
  const { data, isLoading, error } = useAdminVisits(isAdmin);

  if (!isAdmin || (error as Error | null)?.message === "forbidden") {
    return (
      <Layout>
        <div className="p-8 max-w-6xl mx-auto w-full flex flex-col items-center gap-4 pt-24 text-center">
          <ShieldCheck className="w-10 h-10 text-muted-foreground" />
          <h1 className="text-2xl font-serif font-bold">Not authorized</h1>
          <p className="text-muted-foreground">
            This page is restricted to the site administrator.
          </p>
        </div>
      </Layout>
    );
  }

  const week = computeWeek(data?.visits ?? []);

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto w-full flex flex-col gap-8 pb-24">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">Administrative</h1>
          <p className="text-muted-foreground">
            Google login activity — who signed in and when.
          </p>
        </div>

        {error && (error as Error).message !== "forbidden" ? (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-destructive">
              Failed to load login data: {(error as Error).message}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard title="Last Day" value={data?.stats.last24Hours} loading={isLoading} />
          <StatCard title="Last Week" value={data ? week.count : undefined} loading={isLoading} />
          <StatCard title="Last Month" value={data?.stats.lastMonth} loading={isLoading} />
          <StatCard title="Last Year" value={data?.stats.lastYear} loading={isLoading} />
          <StatCard title="All Time" value={data?.stats.allTime} loading={isLoading} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoginChart title="Logins — Last 24 Hours" data={data?.series.last24Hours} loading={isLoading} />
          <LoginChart title="Logins — Last 7 Days" data={data ? week.series : undefined} loading={isLoading} />
          <LoginChart title="Logins — Last Month" data={data?.series.lastMonth} loading={isLoading} />
          <LoginChart title="Logins — Last Year" data={data?.series.lastYear} loading={isLoading} />
          <LoginChart title="Logins — All Time" data={data?.series.allTime} loading={isLoading} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login History</CardTitle>
            <div className="text-xs text-muted-foreground">
              Most recent 500 logins, newest first.
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (data?.visits.length ?? 0) === 0 ? (
              <div className="text-muted-foreground text-sm py-6 text-center">
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
                    {data!.visits.map((v) => (
                      <tr key={v.id} className="border-b border-border/50" data-testid={`row-visit-${v.id}`}>
                        <td className="py-2 pr-4">{v.email ?? "—"}</td>
                        <td className="py-2 text-muted-foreground">
                          {new Date(v.visitedAt).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
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
