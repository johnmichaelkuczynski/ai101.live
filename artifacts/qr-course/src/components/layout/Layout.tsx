import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, PenTool, BarChart3, Activity, RotateCcw, Sparkles, ClipboardCheck, LogOut, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

function AuthFooter() {
  const { isLoading, isAuthenticated, user, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    try {
      await logout();
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 border-t border-border">
        <div className="h-9 rounded-md bg-secondary animate-pulse" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const label = user.displayName || user.username;
    return (
      <div className="p-4 border-t border-border flex flex-col gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
            {label.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{label}</div>
            {user.email && (
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium border border-border hover:bg-secondary disabled:opacity-50"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          {busy ? "Signing out…" : "Sign out"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border">
      <a
        href="/api/auth/google"
        className="inline-flex w-full items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90"
        data-testid="link-login-google"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C39.999 35.245 44 30.028 44 24c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
        Sign in with Google
      </a>
    </div>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { isAdmin } = useAuth();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/assignments", label: "Assignments", icon: PenTool },
    { href: "/assessments", label: "Assessments", icon: ClipboardCheck },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    ...(isAdmin
      ? [{ href: "/administrative", label: "Administrative", icon: ShieldCheck }]
      : []),
  ];

  return (
    <div className="w-64 border-r bg-sidebar flex flex-col h-full h-screen sticky top-0">
      <div className="p-6 border-b border-border">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-serif font-bold text-sm">
              AI
            </div>
            <span className="font-serif font-semibold text-lg tracking-tight">Teach Yourself AI</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-2 px-4">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <AuthFooter />
    </div>
  );
}

function TopBar() {
  const [location, setLocation] = useLocation();
  const active = location.startsWith("/diagnostics");
  const qc = useQueryClient();
  const [resetting, setResetting] = useState(false);
  const [expanding, setExpanding] = useState(false);

  async function handleExpandLectures() {
    if (
      !confirm(
        "Generate Medium and Long versions of every lecture? This runs the tutor over all 28 lectures twice (medium, then long). Takes a few minutes.",
      )
    )
      return;
    setExpanding(true);
    try {
      const mRes = await fetch("/api/diagnostics/expand-lectures?level=medium", { method: "POST" });
      if (!mRes.ok) throw new Error(`Medium expansion failed: HTTP ${mRes.status}`);
      const mData = (await mRes.json()) as { updated?: number; failed?: number; total?: number };
      const lRes = await fetch("/api/diagnostics/expand-lectures?level=long", { method: "POST" });
      if (!lRes.ok) throw new Error(`Long expansion failed: HTTP ${lRes.status}`);
      const lData = (await lRes.json()) as { updated?: number; failed?: number; total?: number };
      await qc.invalidateQueries();
      alert(
        `Medium: ${mData.updated ?? 0}/${mData.total ?? 0} (${mData.failed ?? 0} failed)\n` +
          `Long:   ${lData.updated ?? 0}/${lData.total ?? 0} (${lData.failed ?? 0} failed)`,
      );
    } catch (e) {
      alert(`Lecture rewrite failed: ${(e as Error).message}`);
    } finally {
      setExpanding(false);
    }
  }

  async function handleReset() {
    if (
      !confirm(
        "Reset the course? This deletes every assignment attempt, answer, and practice session, but keeps lectures and assignments.",
      )
    )
      return;
    setResetting(true);
    try {
      const res = await fetch("/api/diagnostics/reset", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await qc.invalidateQueries();
      setLocation("/");
    } catch (e) {
      alert(`Reset failed: ${(e as Error).message}`);
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="sticky top-0 z-10 flex items-center justify-end gap-2 px-6 py-3 border-b border-border bg-background/80 backdrop-blur">
      <button
        onClick={handleExpandLectures}
        disabled={expanding}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-border hover:bg-secondary disabled:opacity-50"
        data-testid="button-expand-lectures"
        title="Rewrite every lecture with worked examples after each point"
      >
        <Sparkles className={`w-4 h-4 ${expanding ? "animate-pulse" : ""}`} />
        {expanding ? "Rewriting…" : "Generate medium + long lectures"}
      </button>
      <button
        onClick={handleReset}
        disabled={resetting}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-border hover:bg-secondary disabled:opacity-50"
        data-testid="button-reset"
        title="Wipe all student progress (keeps lectures and assignments)"
      >
        <RotateCcw className={`w-4 h-4 ${resetting ? "animate-spin" : ""}`} />
        {resetting ? "Resetting…" : "Reset course"}
      </button>
      <Link href="/diagnostics">
        <button
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            active
              ? "bg-primary text-primary-foreground"
              : "border border-border hover:bg-secondary"
          }`}
          data-testid="button-diagnostic"
        >
          <Activity className="w-4 h-4" />
          Diagnostic
        </button>
      </Link>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <TopBar />
        {children}
      </main>
    </div>
  );
}
