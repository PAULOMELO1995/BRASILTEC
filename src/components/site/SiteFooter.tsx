import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 py-10">
      <div className="container-page flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span
            className="grid size-8 place-items-center rounded-lg font-display text-sm font-bold text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            B
          </span>
          <p className="text-sm text-muted-foreground">
            Brasiltec &copy; 2026. Plataforma de vendas digitais para creators e negócios.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link to="/planos" className="text-muted-foreground transition-colors hover:text-primary">
            Planos
          </Link>
          <Link to="/marketplace" className="text-muted-foreground transition-colors hover:text-primary">
            Marketplace
          </Link>
          <Link to="/suporte" className="text-muted-foreground transition-colors hover:text-primary">
            Suporte
          </Link>
          <Link to="/como-funciona" className="text-muted-foreground transition-colors hover:text-primary">
            Como funciona
          </Link>
        </nav>
      </div>
    </footer>
  );
}
