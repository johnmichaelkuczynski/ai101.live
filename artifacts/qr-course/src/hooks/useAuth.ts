import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  displayName: string | null;
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
    logout,
  };
}
