import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { DashboardNavigation } from "./DashboardNavigation";
import { isDashboardPath } from "./dashboard-navigation";

export function PageShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isDashboardArea = isDashboardPath(pathname);

  return (
    <div className="page-shell flex min-h-dvh flex-col">
      <SiteHeader />

      {isDashboardArea ? (
        <main className="container-page flex w-full flex-1 gap-6 py-6 lg:gap-8 lg:py-8">
          <aside
            aria-label="Menu lateral"
            className="sticky top-20 hidden max-h-[calc(100dvh-6rem)] w-56 shrink-0 overflow-y-auto rounded-2xl border border-border/60 bg-background/80 p-3 shadow-soft md:block lg:w-60"
          >
            <div className="mb-5 border-b border-border/60 px-3 pb-4 pt-2">
              <p className="font-display text-sm font-semibold">
                Área de trabalho
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Sua operação em um só lugar
              </p>
            </div>
            <DashboardNavigation />
          </aside>

          <div className="min-w-0 flex-1">{children}</div>
        </main>
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
      <h1 className="mt-4 max-w-3xl text-4xl leading-[1.05] md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
        {description}
      </p>
      {actions ? (
        <div className="mt-7 flex flex-wrap gap-3">{actions}</div>
      ) : null}
    </section>
  );
}
