// ---------------------------------------------------------------------------
// ALL login-related frontend code lives in this single file:
//   - useAuth(): who is signed in, admin status, logout
//   - LoginScreen: the "Sign in with Google" page shown when logged out
//   - AuthGate: blocks the whole app until the user is signed in
//   - Administrative: owner-only page (login analytics + who logged in)
// No other file in this app contains login logic; they only import from here.
// ---------------------------------------------------------------------------
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

// ===========================================================================
// 1. useAuth — session state hook
// ===========================================================================

export interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  displayName: string | null;
  isAdmin: boolean;
}

interface AuthResponse {
  authenticated: boolean;
  user: AuthUser | null;
}

async function fetchAuth(): Promise<AuthResponse> {
  const res = await fetch("/api/auth/user", { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as AuthResponse;
}

export function useAuth() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["auth", "user"],
    queryFn: fetchAuth,
    staleTime: 60_000,
  });

  async function logout() {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Logout failed: HTTP ${res.status}`);
    await qc.invalidateQueries();
  }

  return {
    isLoading: query.isLoading,
    isAuthenticated: query.data?.authenticated ?? false,
    user: query.data?.user ?? null,
    isAdmin: query.data?.user?.isAdmin ?? false,
    logout,
  };
}

// ===========================================================================
// 2. LoginScreen — shown to logged-out visitors
// ===========================================================================

export function LoginScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="w-full max-w-md text-center flex flex-col items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-serif font-bold">
            AI
          </div>
          <span className="font-serif font-semibold text-2xl tracking-tight">
            Teach Yourself AI
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-serif font-semibold">
            Sign in to continue
          </h1>
          <p className="text-sm text-muted-foreground">
            This course is private. Sign in with your Google account to access
            the lectures, practice, and assessments.
          </p>
        </div>

        <a
          href="/api/auth/google"
          className="inline-flex w-full items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90"
          data-testid="link-login-google"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            />
            <path
              fill="#FF3D00"
              d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C39.999 35.245 44 30.028 44 24c0-1.341-.138-2.65-.389-3.917z"
            />
          </svg>
          Sign in with Google
        </a>
      </div>
    </div>
  );
}

// ===========================================================================
// 3. AuthGate — no login, no site
// ===========================================================================

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        <div className="h-8 w-8 rounded-full border-2 border-border border-t-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}

// ===========================================================================
// 4. Administrative — owner-only login analytics page
// ===========================================================================

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

export function Administrative() {
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
