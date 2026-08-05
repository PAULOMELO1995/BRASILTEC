import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { getMarketplaceProducts } from "@/lib/auth-server";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace | Brasiltec" },
      {
        name: "description",
        content: "Descubra produtos digitais dos criadores da Brasiltec: cursos, mentorias e materiais com garantia.",
      },
      { property: "og:title", content: "Marketplace Brasiltec" },
      { property: "og:description", content: "Produtos digitais disponíveis dos nossos criadores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Marketplace,
});

type Product = {
  id: string;
  category: string;
  name: string;
  description: string;
  priceCents: number;
  publishedAt?: string | null;
};

const methods = ["PIX", "Cartão", "Transferência"];

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function Marketplace() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isMarketplaceIndex = pathname === "/marketplace";
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [sortBy, setSortBy] = useState("recentes");

  useEffect(() => {
    if (!isMarketplaceIndex) return;

    getMarketplaceProducts()
      .then((items) => {
        setProducts((items as Product[]).map((item) => ({ ...item, category: item.category || "Geral" })));
      })
      .catch(() => {
        setProducts([]);
      });
  }, [isMarketplaceIndex]);

  const categories = useMemo(() => {
    const set = new Set(products.map((item) => item.category));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = products.filter((item) => {
      const matchesCategory = categoryFilter === "todas" || item.category === categoryFilter;
      const matchesQuery =
        !normalizedQuery ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });

    return filtered.sort((left, right) => {
      if (sortBy === "menor") return left.priceCents - right.priceCents;
      if (sortBy === "maior") return right.priceCents - left.priceCents;
      if (sortBy === "nome") return left.name.localeCompare(right.name);

      const leftTime = left.publishedAt ? new Date(left.publishedAt).getTime() : 0;
      const rightTime = right.publishedAt ? new Date(right.publishedAt).getTime() : 0;
      return rightTime - leftTime;
    });
  }, [categoryFilter, products, query, sortBy]);

    return isMarketplaceIndex ? (
      <PageShell>
      <PageHeader
        eyebrow="Marketplace"
        title="Produtos digitais disponíveis"
        description="Escolha entre os melhores produtos dos nossos criadores, com PIX, cartão e garantia de 7 dias."
      />

      <section className="container-page">
        <div className="panel flex flex-wrap items-center gap-4 p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Produtos na vitrine
            <span className="rounded-full bg-surface-2 px-2.5 py-1 font-display text-xs font-semibold text-foreground">
              {filteredProducts.length}
            </span>
          </div>
          <div className="divider-line hidden flex-1 md:block" />
          <div className="flex flex-wrap gap-2">
            <input
              className="field-input w-56"
              aria-label="Buscar produto"
              placeholder="Buscar por nome ou descrição"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select className="field-input w-auto" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Categoria">
              <option value="todas">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select className="field-input w-auto" value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Ordenar">
              <option value="recentes">Mais recentes</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
              <option value="nome">Nome</option>
            </select>
          </div>
        </div>
      </section>

      <section className="container-page mt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <article key={product.id} className="panel card-hover flex flex-col p-6">
              <div
                className="mb-5 h-32 rounded-xl border border-border"
                style={{ backgroundImage: "var(--gradient-hero)" }}
                aria-hidden
              />
              <span className="eyebrow">{product.category}</span>
              <h2 className="mt-2 text-lg leading-snug">{product.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

              <p className="mt-4 text-sm text-muted-foreground">Conteúdo liberado automaticamente após compra aprovada.</p>

              <p className="mt-3 text-sm text-primary">✓ Garantia de 7 dias</p>

              <ul className="mt-3 flex flex-wrap gap-1.5">
                {methods.map((m) => (
                  <li
                    key={m}
                    className="rounded-full border border-border bg-background/40 px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {m}
                  </li>
                ))}
              </ul>

              <div className="divider-line my-5" />
              <div className="mt-auto flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Valor</p>
                  <p className="font-display text-xl font-semibold">{formatCurrency(product.priceCents)}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Link to="/marketplace/$productId" params={{ productId: product.id }} className="btn-base btn-ghost text-center">
                    Ver produto
                  </Link>
                  <a href={`/checkout?productId=${product.id}`} className="btn-base btn-primary text-center">
                    Comprar
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <article className="panel mt-4 p-5 text-sm text-muted-foreground">
            Nenhum produto encontrado com os filtros atuais.
          </article>
        ) : null}
      </section>
    </PageShell>
    ) : (
      <Outlet />
    );
}
