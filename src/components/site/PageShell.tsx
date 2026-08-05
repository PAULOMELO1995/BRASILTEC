import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { logoutUser } from "@/lib/auth-server";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

const dashboardRoutes = ["/painel", "/admin", "/produtos", "/pedidos", "/membros", "/financeiro", "/afiliados", "/notificacoes", "/suporte"] as const;

const dashboardNav = [
  { to: "/painel", label: "Painel" },
  { to: "/admin", label: "Admin" },
  { to: "/produtos", label: "Produtos" },
  { to: "/pedidos", label: "Pedidos" },
  { to: "/membros", label: "Membros" },
  { to: "/financeiro", label: "Financeiro" },
  { to: "/afiliados", label: "Afiliados" },
  { to: "/notificacoes", label: "Notificações" },
  { to: "/suporte", label: "Suporte" },
] as const;

export function PageShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isDashboardArea = dashboardRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  return (
    <div className="page-shell flex min-h-dvh flex-col">
      <SiteHeader />

      {isDashboardArea ? (
        <>
          <div className="border-b border-border/60 bg-background/70 md:hidden">
            <div className="container-page flex gap-2 overflow-x-auto py-3">
              {dashboardNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                  activeProps={{ className: "bg-surface-2 text-foreground" }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <main className="container-page flex w-full flex-1 gap-6 py-6 lg:gap-8 lg:py-8">
            <aside className="sticky top-20 hidden h-fit w-56 shrink-0 rounded-2xl border border-border/60 bg-background/70 p-3 md:block">
              <p className="px-2 pb-2 text-xs uppercase tracking-wide text-muted-foreground">Navegação</p>
              <nav className="grid gap-1">
                {dashboardNav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                    activeProps={{ className: "bg-surface-2 text-foreground" }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-3 border-t border-border/60 pt-3">
                <button
                  type="button"
                  onClick={() => logoutUser().then(() => window.location.assign("/login"))}
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  Sair
                </button>
              </div>
            </aside>

            <div className="min-w-0 flex-1">{children}</div>
          </main>
        </>
      ) : (
        <main className="flex-1">{children}</main>
      )}

      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="container-page pt-14 pb-10 md:pt-20">
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="mt-4 max-w-3xl text-4xl leading-[1.05] md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">{description}</p>
      {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}
