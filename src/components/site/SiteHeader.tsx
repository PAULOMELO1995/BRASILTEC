import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { getMyNotificationsData, logoutUser } from "@/lib/auth-server";

const nav = [
  { to: "/como-funciona", label: "Como funciona" },
  { to: "/planos", label: "Planos" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/suporte", label: "Suporte" },
] as const;

const dashboardRoutes = ["/painel", "/admin", "/produtos", "/pedidos", "/membros", "/financeiro", "/afiliados", "/notificacoes", "/suporte"] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isDashboardArea = dashboardRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  useEffect(() => {
    if (!isDashboardArea) {
      setUnreadCount(0);
      return;
    }

    getMyNotificationsData()
      .then((items) => {
        const list = Array.isArray(items) ? items : [];
        setUnreadCount(list.filter((item) => !item.readAt).length);
      })
      .catch(() => {
        setUnreadCount(0);
      });
  }, [isDashboardArea, pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span
            className="grid size-9 place-items-center rounded-xl font-display text-base font-bold text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            B
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Brasiltec</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
              activeProps={{ className: "text-foreground bg-surface-2" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isDashboardArea ? (
            <>
              <Link to="/notificacoes" className="btn-base btn-ghost">
                Notificações{unreadCount > 0 ? ` (${unreadCount})` : ""}
              </Link>
              <Link to="/painel" className="btn-base btn-ghost">
                Painel
              </Link>
              <Link to="/produtos/novo" className="btn-base btn-primary">
                Criar produto
              </Link>
              <button
                type="button"
                onClick={() => logoutUser().then(() => window.location.assign("/login"))}
                className="btn-base btn-ghost"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-base btn-ghost">
                Entrar
              </Link>
              <Link to="/cadastro" className="btn-base btn-primary">
                Criar conta
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="btn-base btn-ghost px-3 py-2 md:hidden"
        >
          <span className="flex flex-col gap-1">
            <span className="block h-0.5 w-4 rounded bg-current" />
            <span className="block h-0.5 w-4 rounded bg-current" />
          </span>
        </button>
      </div>

      {open ? (
        <div className="border-t border-border md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {isDashboardArea ? (
                <>
                  <Link to="/notificacoes" onClick={() => setOpen(false)} className="btn-base btn-ghost flex-1">
                    Notificações{unreadCount > 0 ? ` (${unreadCount})` : ""}
                  </Link>
                  <Link to="/painel" onClick={() => setOpen(false)} className="btn-base btn-ghost flex-1">
                    Painel
                  </Link>
                  <Link to="/produtos/novo" onClick={() => setOpen(false)} className="btn-base btn-primary flex-1">
                    Criar produto
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      logoutUser().then(() => window.location.assign("/login"));
                    }}
                    className="btn-base btn-ghost flex-1"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-base btn-ghost flex-1">
                    Entrar
                  </Link>
                  <Link to="/cadastro" onClick={() => setOpen(false)} className="btn-base btn-primary flex-1">
                    Criar conta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
