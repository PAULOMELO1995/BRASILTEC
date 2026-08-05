import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { getMyProducts, publishProductById } from "@/lib/auth-server";

export const Route = createFileRoute("/produtos")({
  component: ProdutosPage,
});

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  status: "draft" | "published";
  createdAt: string;
  publishedAt: string | null;
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function ProdutosPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [items, setItems] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      const products = await getMyProducts();
      setItems(products as Product[]);
    } catch {
      window.location.assign("/login");
    }
  }

  useEffect(() => {
    load().catch(() => {
      setError("Não foi possível carregar seus produtos.");
    });
  }, []);

  async function handlePublish(productId: string) {
    setBusyId(productId);
    setError(null);
    try {
      await publishProductById({ data: { productId } });
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível publicar este produto.");
    } finally {
      setBusyId(null);
    }
  }

  if (pathname !== "/produtos") {
    return <Outlet />;
  }

  return (
    <PageShell>
      <section className="container-page py-14">
        <div className="panel-elevated p-7 md:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="eyebrow">Produtos</span>
              <h1 className="mt-2 text-3xl">Meus produtos</h1>
            </div>
            <Link to="/produtos/novo" className="btn-base btn-primary">
              Criar produto
            </Link>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
          ) : null}

          <div className="mt-6 grid gap-4">
            {items.length === 0 ? (
              <article className="rounded-2xl border border-border/60 bg-background/70 p-5 text-sm text-muted-foreground">
                Você ainda não criou produtos. Comece agora para publicar no marketplace.
              </article>
            ) : null}

            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-border/60 bg-background/70 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold">{formatCurrency(item.priceCents)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Status: {item.status === "published" ? "Publicado" : "Rascunho"}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {item.status === "draft" ? (
                    <button
                      type="button"
                      className="btn-base btn-primary"
                      disabled={busyId === item.id}
                      onClick={() => handlePublish(item.id)}
                    >
                      {busyId === item.id ? "Publicando..." : "Publicar"}
                    </button>
                  ) : null}
                  <a className="btn-base btn-ghost" href={`/checkout?productId=${item.id}`}>
                    Ver checkout
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
