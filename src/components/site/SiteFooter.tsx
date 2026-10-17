import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 py-10">
      <div className="container-page grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
        <div className="max-w-md">
          <div className="flex items-center gap-2.5">
            <span
              className="grid size-9 place-items-center rounded-xl font-display text-base font-bold text-primary-foreground"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              B
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              Brasiltec
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Plataforma de vendas digitais para creators e negócios.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a
              href="https://www.facebook.com/profile.php?id=61594998637520"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Brasiltec no Facebook (abre em nova aba)"
              className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5 fill-current"
              >
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 11.017 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.49 0-1.956.93-1.956 1.885v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.09 24 18.092 24 12.073Z" />
              </svg>
            </a>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Brasiltec &copy; 2026. Todos os direitos reservados.
          </p>
        </div>
        <nav aria-label="Links do rodapé" className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:pt-2">
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
