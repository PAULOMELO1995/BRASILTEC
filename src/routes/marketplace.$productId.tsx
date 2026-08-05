import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { getMarketplaceProductDetails } from "@/lib/auth-server";

type Product = {
  id: string;
  category: string;
  name: string;
  description: string;
  priceCents: number;
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export const Route = createFileRoute("/marketplace/$productId")({
  component: MarketplaceProductPage,
});

function MarketplaceProductPage() {
  const { productId } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    getMarketplaceProductDetails({ data: { productId } })
      .then((item) => setProduct((item as Product | null) ?? null))
      .catch(() => setProduct(null));
  }, [productId]);

  return (
    <PageShell>
      <section className="container-page py-14">
        <div className="panel-elevated mx-auto max-w-3xl p-7 md:p-9">
          {!product ? (
            <>
              <span className="eyebrow">Produto</span>
              <h1 className="mt-2 text-3xl">Produto não encontrado</h1>
              <p className="mt-3 text-sm text-muted-foreground">Volte ao marketplace para escolher outro item disponível.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/marketplace" className="btn-base btn-ghost">
                  Voltar ao marketplace
                </Link>
              </div>
            </>
          ) : (
            <>
              <span className="eyebrow">Página do produto</span>
              <h1 className="mt-2 text-3xl">{product.name}</h1>
              <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">{product.category || "Geral"}</p>

              <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-5">
                <h2 className="text-lg font-semibold">Descrição</h2>
                <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <article className="rounded-xl border border-border/50 bg-background/80 p-3">
                    <p className="text-xs text-muted-foreground">Preço</p>
                    <p className="mt-1 text-xl font-semibold">{formatCurrency(product.priceCents)}</p>
                  </article>
                  <article className="rounded-xl border border-border/50 bg-background/80 p-3">
                    <p className="text-xs text-muted-foreground">Garantia</p>
                    <p className="mt-1 text-sm font-medium">7 dias de garantia</p>
                  </article>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href={`/checkout?productId=${product.id}`} className="btn-base btn-primary">
                  Comprar agora
                </a>
                <Link to="/marketplace" className="btn-base btn-ghost">
                  Voltar ao marketplace
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
