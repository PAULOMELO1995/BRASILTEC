import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Menu, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { getMyNotificationsData } from "@/lib/auth-server";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DashboardNavigation } from "./DashboardNavigation";
import { getDashboardPageLabel, isDashboardPath } from "./dashboard-navigation";

const nav = [
  { to: "/como-funciona", label: "Como funciona" },
  { to: "/planos", label: "Planos" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/suporte", label: "Suporte" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [notificationsError, setNotificationsError] = useState(false);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isDashboardArea = isDashboardPath(pathname);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const query = window.matchMedia(
      isDashboardArea ? "(min-width: 768px)" : "(min-width: 1024px)",
    );
    const closeOnDesktop = () => {
      if (query.matches) setOpen(false);
    };
    query.addEventListener("change", closeOnDesktop);
    return () => query.removeEventListener("change", closeOnDesktop);
  }, [isDashboardArea]);

  useEffect(() => {
    let active = true;
    setUnreadCount(null);
    setNotificationsError(false);
    if (isDashboardArea) {
      getMyNotificationsData()
        .then((items) => {
          if (active)
            setUnreadCount(items.filter((item) => !item.readAt).length);
        })
        .catch((err: unknown) => {
          if (active) {
            console.error("Falha ao carregar notificações do menu", err);
            setNotificationsError(true);
          }
        });
    }
    return () => {
      active = false;
    };
  }, [isDashboardArea, pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-2 sm:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            aria-label="Brasiltec — página inicial"
            className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              className="grid size-9 place-items-center rounded-xl font-display text-base font-bold text-primary-foreground"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              B
            </span>
            <span
              className={cn(
                "font-display text-lg font-semibold tracking-tight",
                isDashboardArea && "hidden sm:inline",
              )}
            >
              Brasiltec
            </span>
          </Link>
          {isDashboardArea ? (
            <div className="min-w-0 border-l border-border pl-3">
              <p className="hidden text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
                Área de trabalho
              </p>
              <p className="truncate text-sm font-semibold">
                {getDashboardPageLabel(pathname)}
              </p>
            </div>
          ) : null}
        </div>

        {!isDashboardArea ? (
          <nav
            aria-label="Navegação do site"
            className="hidden items-center gap-1 lg:flex"
          >
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
        ) : null}

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {isDashboardArea ? (
            <>
              <Link
                to="/notificacoes"
                aria-label={
                  notificationsError
                    ? "Notificações — contagem indisponível"
                    : unreadCount
                      ? `Notificações — ${unreadCount} não lidas`
                      : "Notificações"
                }
                title={
                  notificationsError
                    ? "Não foi possível carregar a contagem. Abra as notificações para consultar."
                    : "Notificações"
                }
                className="relative grid size-11 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                activeProps={{ className: "bg-primary/10 text-primary" }}
              >
                <Bell size={20} aria-hidden="true" />
                {unreadCount && unreadCount > 0 ? (
                  <span
                    aria-hidden="true"
                    className="absolute right-0 top-0 rounded-full bg-primary px-1.5 text-[10px] font-bold leading-4 text-primary-foreground"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
                {notificationsError ? (
                  <span
                    aria-hidden="true"
                    className="absolute right-1 top-1 size-2 rounded-full bg-warning"
                  />
                ) : null}
              </Link>
              <Link
                to="/produtos/novo"
                className="btn-base btn-primary hidden gap-2 sm:inline-flex"
              >
                <Plus size={17} aria-hidden="true" />
                Criar produto
              </Link>
            </>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link to="/login" className="btn-base btn-ghost">
                Entrar
              </Link>
              <Link to="/cadastro" className="btn-base btn-primary">
                Criar conta
              </Link>
            </div>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={
                  isDashboardArea ? "Abrir menu do painel" : "Abrir menu"
                }
                className={cn(
                  "grid size-11 place-items-center rounded-xl text-muted-foreground hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isDashboardArea ? "md:hidden" : "lg:hidden",
                )}
              >
                <Menu size={22} aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              closeLabel="Fechar menu"
              className="flex w-[min(20rem,90vw)] flex-col overflow-y-auto p-5"
            >
              <SheetHeader className="text-left">
                <SheetTitle>Brasiltec</SheetTitle>
                <SheetDescription>
                  {isDashboardArea
                    ? "Sua área de trabalho"
                    : "Explore a plataforma"}
                </SheetDescription>
              </SheetHeader>
              {isDashboardArea ? (
                <>
                  <Link
                    to="/produtos/novo"
                    onClick={() => setOpen(false)}
                    className="btn-base btn-primary mt-5 w-full gap-2"
                  >
                    <Plus size={17} aria-hidden="true" />
                    Criar produto
                  </Link>
                  <div className="mt-6">
                    <DashboardNavigation onNavigate={() => setOpen(false)} />
                  </div>
                </>
              ) : (
                <nav aria-label="Navegação do site" className="mt-6 grid gap-2">
                  {nav.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-3 py-3 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                      activeProps={{
                        className: "bg-surface-2 text-foreground",
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="mt-4 grid gap-3 border-t border-border pt-5">
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="btn-base btn-ghost"
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/cadastro"
                      onClick={() => setOpen(false)}
                      className="btn-base btn-primary"
                    >
                      Criar conta
                    </Link>
                  </div>
                </nav>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
