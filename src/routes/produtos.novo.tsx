import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { createProductDraft } from "@/lib/auth-server";

export const Route = createFileRoute("/produtos/novo")({
  component: NovoProdutoPage,
});

function NovoProdutoPage() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const category = String(form.get("category") ?? "").trim();
    const price = Number(String(form.get("price") ?? "0").replace(",", "."));

    if (!name || !description || !category || !Number.isFinite(price) || price <= 0) {
      setError("Preencha nome, descrição, categoria e preço válidos.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createProductDraft({
        data: {
          name,
          description,
          category,
          priceCents: Math.round(price * 100),
        },
      });
      window.location.assign("/produtos");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível criar o produto.");
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <section className="container-page py-14">
        <form className="panel-elevated mx-auto max-w-2xl p-7 md:p-9" onSubmit={handleSubmit}>
          <span className="eyebrow">Criar Produto</span>
          <h1 className="mt-2 text-3xl">Novo produto</h1>
          <p className="mt-2 text-sm text-muted-foreground">Etapa inicial do fluxo: criar rascunho para depois publicar no marketplace.</p>

          <div className="mt-6 grid gap-4">
            <div>
              <label className="field-label" htmlFor="name">Nome</label>
              <input id="name" name="name" className="field-input" placeholder="Curso de Marketing" />
            </div>
            <div>
              <label className="field-label" htmlFor="description">Descrição</label>
              <textarea id="description" name="description" className="field-input min-h-28" placeholder="Descreva o que o aluno vai aprender" />
            </div>
            <div>
              <label className="field-label" htmlFor="category">Categoria</label>
              <input id="category" name="category" className="field-input" placeholder="Educação" />
            </div>
            <div>
              <label className="field-label" htmlFor="price">Preço (BRL)</label>
              <input id="price" name="price" type="number" min="1" step="0.01" className="field-input" placeholder="250.00" />
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" disabled={submitting} className="btn-base btn-primary disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? "Salvando..." : "Salvar rascunho"}
            </button>
            <Link to="/produtos" className="btn-base btn-ghost">
              Voltar
            </Link>
          </div>
        </form>
      </section>
    </PageShell>
  );
}
