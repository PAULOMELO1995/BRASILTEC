import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, LoaderCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { logoutUser } from "@/lib/auth-server";
import { cn } from "@/lib/utils";
import {
  dashboardNavGroups,
  isNavigationItemActive,
} from "./dashboard-navigation";

export function DashboardNavigation({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setError(null);
    try {
      await logoutUser();
      window.location.assign("/login");
    } catch (err) {
      console.error("Falha ao encerrar a sessão", err);
      setError("Não foi possível sair. Tente novamente.");
      setLoggingOut(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Navegação do painel" className="space-y-5">
        {dashboardNavGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map(({ to, label, icon: Icon }) => {
                const active = isNavigationItemActive(pathname, to);
                return (
                  <li key={to}>
                    <Link
                      to={to}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "border-primary/25 bg-primary/10 text-primary"
                          : "border-transparent text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                      )}
                    >
                      <Icon size={18} aria-hidden="true" className="shrink-0" />
                      <span>{label}</span>
                      {active ? (
                        <span
                          aria-hidden="true"
                          className="ml-auto size-1.5 rounded-full bg-primary"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="mt-6 border-t border-border/60 pt-3">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowUpRight size={18} aria-hidden="true" />
          Voltar ao site
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          {loggingOut ? (
            <LoaderCircle
              size={18}
              aria-hidden="true"
              className="animate-spin"
            />
          ) : (
            <LogOut size={18} aria-hidden="true" />
          )}
          {loggingOut ? "Saindo..." : "Sair"}
        </button>
        {error ? (
          <p role="alert" className="mt-2 px-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
